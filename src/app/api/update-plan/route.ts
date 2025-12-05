import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, newPlan } = await request.json();

    if (!userId || !newPlan) {
      return NextResponse.json(
        { error: 'Missing userId or newPlan' },
        { status: 400 }
      );
    }

    // Validate plan type
    const validPlans = ['FREE', 'CHEAP', 'PREMIUM', 'VIP', 'VVIP', 'SUPREME'];
    if (!validPlans.includes(newPlan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's plan
    await userRef.update({
      plan: newPlan,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Plan updated successfully',
      data: {
        userId,
        newPlan
      }
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}