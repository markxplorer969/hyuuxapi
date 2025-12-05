// Test endpoint for Discord logging
import { NextResponse } from "next/server";
import { logPlanPurchaseToDiscord } from "@/lib/discord";

export async function POST(req: Request) {
  try {
    const { method = 'QRIS' } = await req.json();
    
    const testMethods = ['QRIS', 'DANA', 'OVO', 'SHOPEEPAY', 'GOPAY'];
    const results = [];

    for (const paymentMethod of testMethods) {
      try {
        // Test PENDING status
        await logPlanPurchaseToDiscord({
          userId: `test-user-${paymentMethod.toLowerCase()}`,
          planId: 'PREMIUM',
          planName: 'Premium Plan',
          amount: 3000,
          customerName: `Test User ${paymentMethod}`,
          customerEmail: `test${paymentMethod.toLowerCase()}@example.com`,
          merchantRef: `TEST-${paymentMethod}-${Date.now()}`,
          status: "PENDING",
          ip: '127.0.0.1',
          method: paymentMethod,
        });

        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test SUCCESS status
        await logPlanPurchaseToDiscord({
          userId: `test-user-${paymentMethod.toLowerCase()}`,
          planId: 'PREMIUM',
          planName: 'Premium Plan',
          amount: 3000,
          customerName: `Test User ${paymentMethod}`,
          customerEmail: `test${paymentMethod.toLowerCase()}@example.com`,
          merchantRef: `TEST-${paymentMethod}-${Date.now()}`,
          status: "SUCCESS",
          ip: '127.0.0.1',
          method: paymentMethod,
        });

        results.push({
          method: paymentMethod,
          status: 'success',
          message: `Successfully logged PENDING and SUCCESS for ${paymentMethod}`
        });

        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.push({
          method: paymentMethod,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Discord logging test completed',
      results
    });

  } catch (error) {
    console.error('Test Discord logging error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Test individual method
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const method = searchParams.get('method') || 'QRIS';
  const status = searchParams.get('status') || 'PENDING';

  try {
    await logPlanPurchaseToDiscord({
      userId: `test-user-single`,
      planId: 'VIP',
      planName: 'VIP Plan',
      amount: 5000,
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      merchantRef: `TEST-SINGLE-${method}-${Date.now()}`,
      status: status as "PENDING" | "SUCCESS" | "FAILED",
      ip: '127.0.0.1',
      method,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully logged ${status} status for ${method} payment`
    });

  } catch (error) {
    console.error('Single test Discord logging error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}