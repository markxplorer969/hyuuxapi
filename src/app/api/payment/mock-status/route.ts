// Mock payment status for testing
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  // Determine payment method from reference or default to QRIS
  const method = ref.includes('DANA') ? 'DANA' :
                 ref.includes('OVO') ? 'OVO' :
                 ref.includes('SHOPEEPAY') ? 'SHOPEEPAY' :
                 ref.includes('GOPAY') ? 'GOPAY' : 'QRIS';

  // Create timestamps
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000); // Add 60 minutes
  const isExpired = new Date() > expiresAt;

  // Mock transaction data
  const mockTrx = {
    merchant_ref: ref,
    userId: ref.includes('test') ? 'test-user-999' : 'unknown-user',
    planId: 'SUPREME',
    amount: 15000,
    status: isExpired ? "EXPIRED" : "PENDING",
    method,
    created_at: createdAt.toISOString(),
    expired_at: expiresAt.toISOString(),
    expired_time: 60,
    createdAt: new Date().toISOString(),
    qr_url: method === 'QRIS' ? 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com' : undefined,
    qr_image: method === 'QRIS' ? 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com&format=png' : undefined,
    payment_url: method !== 'QRIS' ? `https://example.com/checkout/${ref}` : undefined,
  };

  return NextResponse.json({ trx: mockTrx });
}