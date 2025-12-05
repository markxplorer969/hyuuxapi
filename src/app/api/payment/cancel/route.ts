import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Get transaction
    const trxRef = adminDb.collection("transactions").doc(ref);
    const trxSnap = await trxRef.get();

    if (!trxSnap.exists) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const data = trxSnap.data();

    // If already paid → cannot cancel
    if (data.status === "PAID") {
      return NextResponse.json(
        { error: "Payment already completed. Cannot cancel." },
        { status: 400 }
      );
    }

    // If already cancelled → ignore
    if (data.status === "CANCELLED") {
      return NextResponse.json(
        { success: true, message: "Already cancelled" }
      );
    }

    // Update Firestore → CANCELLED
    await trxRef.update({
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Payment cancelled",
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
