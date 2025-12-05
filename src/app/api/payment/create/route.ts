// app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import { Tripay } from "@/lib/tripay";
import { adminDb } from "@/lib/firebase-admin";
import { getPlanById } from "@/lib/plans";
import { logPlanPurchaseToDiscord } from "@/lib/discord";

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

    // Price is already in IDR, no conversion needed
    const amountInIDR = plan.price;

    const tripay = new Tripay();

    const trx = await tripay.createQris({
      userId,
      planId,
      amount: amountInIDR,
      customer_name: name,
      customer_email: email,
    });

    // Get client IP for logging
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'Unknown';

    // Log to Discord
    await logPlanPurchaseToDiscord({
      userId,
      planId,
      planName: plan.name,
      amount: amountInIDR,
      customerName: name,
      customerEmail: email,
      merchantRef: trx.merchant_ref,
      status: "PENDING",
      ip: clientIP,
    });

    await adminDb.collection("transactions").doc(trx.merchant_ref).set({
      merchant_ref: trx.merchant_ref,
      userId,
      planId,
      amount: amountInIDR,
      amountIDR: plan.price,
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
      amountIDR: plan.price,
    });
  } catch (err: any) {
    console.error("Payment error", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error",
      details: err.response?.data || null 
    }, { status: 500 });
  }
}
