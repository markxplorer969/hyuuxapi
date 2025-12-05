// Mock payment status for testing
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  // Mock transaction data
  const mockTrx = {
    merchant_ref: ref,
    userId: ref.includes('test') ? 'test-user-999' : 'unknown-user',
    planId: 'SUPREME',
    amount: 15000,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com',
    qr_image: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.com&format=png',
  };

  return NextResponse.json({ trx: mockTrx });
}