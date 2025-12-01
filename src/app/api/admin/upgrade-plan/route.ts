import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, plan } = body;

    if (!email || !plan) {
      return NextResponse.json(
        { error: 'Email and plan are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user role to ENTERPRISE
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { 
        role: 'ENTERPRISE',
        updatedAt: new Date()
      }
    });

    // Update existing API key limits or create new one
    const existingApiKey = await db.apiKey.findFirst({
      where: { userId: user.id, isActive: true }
    });

    if (existingApiKey) {
      await db.apiKey.update({
        where: { id: existingApiKey.id },
        data: {
          plan: 'ENTERPRISE',
          limit: 100000, // Enterprise unlimited
          usage: 0, // Reset usage
          updatedAt: new Date()
        }
      });
    } else {
      await db.apiKey.create({
        data: {
          userId: user.id,
          key: `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          plan: 'ENTERPRISE',
          limit: 100000,
          usage: 0,
          isActive: true
        }
      });
    }

    // Create or update subscription
    const existingSubscription = await db.subscription.findFirst({
      where: { userId: user.id }
    });

    if (existingSubscription) {
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan: 'ENTERPRISE',
          status: 'active',
          startDate: new Date(),
          endDate: null, // Enterprise doesn't expire
          autoRenew: true,
          updatedAt: new Date()
        }
      });
    } else {
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'ENTERPRISE',
          status: 'active',
          startDate: new Date(),
          endDate: null, // Enterprise doesn't expire
          autoRenew: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded ${email} to Enterprise plan`,
      data: {
        user: updatedUser,
        plan: 'ENTERPRISE',
        features: [
          'Unlimited API calls',
          'All AI Models + Exclusive Access',
          'Dedicated Account Manager',
          'Custom Analytics Dashboard',
          '99.99% Uptime Guarantee',
          'Custom API Key',
          'Advanced Webhooks',
          'Team Collaboration Tools',
          'White-label Solutions',
          'SLA Guarantee',
          'On-premise Deployment Option'
        ]
      }
    });
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}