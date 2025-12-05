// app/api/payment/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { logPlanPurchaseToDiscord } from "@/lib/discord";
import { getPlanById } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const sign = req.headers.get("x-callback-signature");
    const calculated = crypto
      .createHmac("sha256", process.env.TRIPAY_PRIVATE_KEY!)
      .update(JSON.stringify(body))
      .digest("hex");

    if (sign !== calculated) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const { reference, merchant_ref, status } = body;

    await adminDb.collection("payments_logs").add({
      body,
      receivedAt: new Date(),
    });

    const trxRef = adminDb.collection("transactions").doc(merchant_ref);
    const trxDoc = await trxRef.get();

    if (!trxDoc.exists) return NextResponse.json({ ok: true });

    const trx = trxDoc.data();

    if (status === "PAID") {
      // Get client IP for logging
      const clientIP = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'Unknown';

      // Get plan details for logging
      const plan = getPlanById(trx.planId);

      // Update user plan
      await adminDb.collection("users").doc(trx.userId).update({
        plan: trx.planId,
        updatedAt: new Date(),
      });

      // Update transaction status
      await trxRef.update({
        status: "PAID",
        paidAt: new Date(),
      });

      // Log successful payment to Discord
      if (plan) {
        await logPlanPurchaseToDiscord({
          userId: trx.userId,
          planId: trx.planId,
          planName: plan.name,
          amount: trx.amount,
          customerName: trx.customerName || 'User',
          customerEmail: trx.customerEmail || 'user@example.com',
          merchantRef: merchant_ref,
          status: "SUCCESS",
          ip: clientIP,
          method: trx.method || 'QRIS',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Callback Error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
