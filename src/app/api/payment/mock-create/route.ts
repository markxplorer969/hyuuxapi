// Mock payment for testing payment display
import { NextResponse } from "next/server";
import { getPlanById } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const { userId, planId, name, email, method = 'QRIS' } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Mock transaction for testing
    const mockMerchantRef = `MOCK-${userId}-${Date.now()}`;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000); // Add 60 minutes
    
    // Generate mock data based on payment method
    let mockData = {
      success: true,
      merchant_ref: mockMerchantRef,
      amount: plan.price,
      amountIDR: plan.price,
      method,
      created_at: createdAt.toISOString(),
      expired_at: expiresAt.toISOString(),
      expired_time: 60,
    };

    if (method === 'QRIS') {
      mockData = {
        ...mockData,
        qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com',
        qr_image: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com&format=png',
        redirect_url: 'https://tripay.co.id/checkout/TEST-MOCK-PAYMENT',
      };
    } else {
      // For e-wallet methods, provide checkout URL
      mockData = {
        ...mockData,
        payment_url: `https://example.com/checkout/${mockMerchantRef}`,
        redirect_url: 'https://tripay.co.id/checkout/TEST-MOCK-PAYMENT',
        instructions: `Silakan buka aplikasi ${method} dan selesaikan pembayaran`,
      };
    }
    
    return NextResponse.json(mockData);
  } catch (err: any) {
    console.error("Mock payment error", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error"
    }, { status: 500 });
  }
}