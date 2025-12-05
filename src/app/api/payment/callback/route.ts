// app/api/payment/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";

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
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Callback Error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
