// app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import { Tripay } from "@/lib/tripay";
import { adminDb } from "@/lib/firebase-admin";
import { getPlanById } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const { userId, planId, name, email } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Convert USD to IDR (assuming 1 USD = 15,000 IDR)
    const amountInIDR = plan.price * 15000;

    const tripay = new Tripay();

    const trx = await tripay.createQris({
      userId,
      planId,
      amount: amountInIDR,
      customer_name: name,
      customer_email: email,
    });

    await adminDb.collection("transactions").doc(trx.merchant_ref).set({
      merchant_ref: trx.merchant_ref,
      userId,
      planId,
      amount: amountInIDR,
      amountUSD: plan.price,
      status: "PENDING",
      createdAt: new Date(),
      qr_url: trx.data?.qr_url || '',
      qr_image: trx.data?.qr_image_url || '',
      response: trx,
    });

    return NextResponse.json({
      success: true,
      qr_url: trx.data?.qr_url || '',
      qr_image: trx.data?.qr_image_url || '',
      merchant_ref: trx.merchant_ref,
      amount: amountInIDR,
      amountUSD: plan.price,
    });
  } catch (err: any) {
    console.error("Payment error", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error",
      details: err.response?.data || null 
    }, { status: 500 });
  }
}
