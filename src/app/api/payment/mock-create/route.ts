// Mock payment for testing QRIS display
import { NextResponse } from "next/server";
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

    // Mock transaction for testing
    const mockMerchantRef = `MOCK-${userId}-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com',
      qr_image: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com&format=png',
      merchant_ref: mockMerchantRef,
      amount: plan.price,
      amountIDR: plan.price,
    });
  } catch (err: any) {
    console.error("Mock payment error", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error"
    }, { status: 500 });
  }
}