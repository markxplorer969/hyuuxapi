import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Get all users
    const usersSnapshot = await adminDb.collection(adminCollections.users).get();
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || 'user', // Default to user if not set
        plan: userData.plan || 'FREE', // Show plan if exists, default to FREE
        hasRoleField: 'role' in userData,
        hasPlanField: 'plan' in userData
      });
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users
    });

  } catch (error) {
    console.error('Error checking users:', error);
    return NextResponse.json(
      { error: 'Failed to check users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, plan } = await request.json();

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'Missing userId or plan' },
        { status: 400 }
      );
    }

    // Validate plan type
    const validPlans = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Update user plan
    await adminDb.collection(adminCollections.users).doc(userId).update({
      plan: plan
    });

    return NextResponse.json({
      success: true,
      message: `User plan updated to ${plan}`,
      data: { userId, plan }
    });

  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: 'Failed to update user plan' },
      { status: 500 }
    );
  }
}