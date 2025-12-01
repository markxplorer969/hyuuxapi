import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscriptions
    const subscriptions = await db.subscription.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' }
    });

    // Get API keys
    const apiKeys = await db.apiKey.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const currentSubscription = subscriptions[0];
    const currentApiKey = apiKeys[0];

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
        subscription: currentSubscription || null,
        apiKey: currentApiKey || null,
        subscriptions,
        apiKeys
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