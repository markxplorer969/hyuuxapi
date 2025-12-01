import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PLANS, getPlanById } from '@/lib/plans';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's current subscription
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' }
        },
        apiKeys: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentSubscription = user.subscriptions[0];
    const currentApiKey = user.apiKeys[0];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        },
        subscription: currentSubscription ? {
          id: currentSubscription.id,
          plan: currentSubscription.plan,
          status: currentSubscription.status,
          startDate: currentSubscription.startDate,
          endDate: currentSubscription.endDate,
          autoRenew: currentSubscription.autoRenew,
          planDetails: getPlanById(currentSubscription.plan)
        } : null,
        apiKey: currentApiKey ? {
          id: currentApiKey.id,
          name: currentApiKey.name,
          plan: currentApiKey.plan,
          limit: currentApiKey.limit,
          usage: currentApiKey.usage,
          isActive: currentApiKey.isActive,
          lastUsed: currentApiKey.lastUsed,
          createdAt: currentApiKey.createdAt
        } : null,
        availablePlans: PLANS
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}