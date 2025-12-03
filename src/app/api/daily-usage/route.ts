import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, FieldValue, Timestamp } from '@/lib/firebase-admin';

// Default limits by role
const ROLE_LIMITS: Record<string, number> = {
  FREE: 20,
  STARTER: 1000,
  PROFESSIONAL: 5000,
  BUSINESS: 20000,
  ENTERPRISE: 100000,
};

export async function POST(request: NextRequest) {
  try {
    const { userId, apiKeyId, usage = 1 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current date string for daily tracking
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get user document
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const lastUsageDate = userData?.lastUsageDate;

    // Check if it's a new day, reset usage if needed
    let wasReset = false;
    let userUpdateData: any = {
      lastUsageDate: today
    };

    if (!lastUsageDate || lastUsageDate !== today) {
      // New day, reset usage
      userUpdateData.apiKeyUsage = usage;
      userUpdateData.lastUsageReset = Timestamp.now();
      wasReset = true;
    } else {
      // Same day, increment usage
      userUpdateData.apiKeyUsage = FieldValue.increment(usage);
    }

    // Update user document
    await adminDb.collection(adminCollections.users).doc(userId).update(userUpdateData);

    // Update API key usage if apiKeyId is provided
    if (apiKeyId) {
      const apiKeyUpdateData: any = {
        lastUsed: Timestamp.now()
      };

      if (wasReset) {
        apiKeyUpdateData.usage = usage;
      } else {
        apiKeyUpdateData.usage = FieldValue.increment(usage);
      }

      await adminDb.collection(adminCollections.apiKeys).doc(apiKeyId).update(apiKeyUpdateData);
    }

    // Get updated user data
    const updatedUserDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    const updatedUserData = updatedUserDoc.data();

    const currentUsage = updatedUserData?.apiKeyUsage || 0;
    const userRole = updatedUserData?.role || 'FREE';
    const currentLimit = updatedUserData?.apiKeyLimit || ROLE_LIMITS[userRole] || ROLE_LIMITS.FREE;

    return NextResponse.json({
      success: true,
      data: {
        usage: currentUsage,
        limit: currentLimit,
        remaining: Math.max(0, currentLimit - currentUsage),
        date: today,
        wasReset: wasReset
      }
    });

  } catch (error) {
    console.error('Error updating daily usage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const today = new Date().toISOString().split('T')[0];

    // Get user document
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const lastUsageDate = userData?.lastUsageDate;

    // Check if usage needs to be reset (new day)
    let currentUsage = userData?.apiKeyUsage || 0;
    let wasReset = false;

    if (!lastUsageDate || lastUsageDate !== today) {
      // New day, reset usage to 0
      await adminDb.collection(adminCollections.users).doc(userId).update({
        apiKeyUsage: 0,
        lastUsageDate: today,
        lastUsageReset: Timestamp.now()
      });
      currentUsage = 0;
      wasReset = true;
    }

    const userRole = userData?.role || 'FREE';
    const currentLimit = userData?.apiKeyLimit || ROLE_LIMITS[userRole] || ROLE_LIMITS.FREE;

    return NextResponse.json({
      success: true,
      data: {
        usage: currentUsage,
        limit: currentLimit,
        remaining: Math.max(0, currentLimit - currentUsage),
        date: today,
        lastUsageDate: lastUsageDate,
        wasReset: wasReset
      }
    });

  } catch (error) {
    console.error('Error getting daily usage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}