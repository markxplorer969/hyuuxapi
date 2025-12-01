import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        plans: PLANS,
        totalPlans: PLANS.length,
        categories: [
          {
            name: 'Individual',
            plans: PLANS.filter(plan => ['FREE', 'STARTER', 'PROFESSIONAL'].includes(plan.id))
          },
          {
            name: 'Business',
            plans: PLANS.filter(plan => ['BUSINESS', 'ENTERPRISE'].includes(plan.id))
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}