import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, FieldValue, Timestamp } from '@/lib/firebase-admin';

// Default limits by role
const ROLE_LIMITS: Record<string, number> = {
  FREE: 20,
  CHEAP: 1000,
  PREMIUM: 2500,
  VIP: 5000,
  VVIP: 10000,
  SUPREME: 20000,
};

export async function POST(request: NextRequest) {
  try {
    const { userId, apiKeyId, usage = 1 } = await request.json();

    if (!userId || !apiKeyId) {
      return NextResponse.json(
        { error: 'User ID and API Key ID are required' },
        { status: 400 }
      );
    }

    // Get current date string for daily tracking
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get API key document
    const apiKeyDoc = await adminDb.collection(adminCollections.apiKeys).doc(apiKeyId).get();
    
    if (!apiKeyDoc.exists) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    // Verify the API key belongs to the user
    const apiKeyData = apiKeyDoc.data();
    if (apiKeyData.userId !== userId) {
      return NextResponse.json(
        { error: 'API key does not belong to this user' },
        { status: 403 }
      );
    }

    const lastUsageDate = apiKeyData?.lastUsageDate;

    // Check if it's a new day, reset usage if needed
    let wasReset = false;
    let apiKeyUpdateData: any = {
      lastUsageDate: today,
      lastUsed: Timestamp.now()
    };

    if (!lastUsageDate || lastUsageDate !== today) {
      // New day, reset usage
      apiKeyUpdateData.usage = usage;
      wasReset = true;
    } else {
      // Same day, increment usage
      apiKeyUpdateData.usage = FieldValue.increment(usage);
    }

    // Update API key document
    await adminDb.collection(adminCollections.apiKeys).doc(apiKeyId).update(apiKeyUpdateData);

    // Get user document for role and limit information
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    const userData = userDoc.data();
    const userRole = userData?.role || 'FREE';
    const currentLimit = userData?.apiKeyLimit || ROLE_LIMITS[userRole] || ROLE_LIMITS.FREE;

    // Get updated API key data
    const updatedApiKeyDoc = await adminDb.collection(adminCollections.apiKeys).doc(apiKeyId).get();
    const updatedApiKeyData = updatedApiKeyDoc.data();
    const currentUsage = updatedApiKeyData?.usage || 0;

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

    // Get user's API keys
    const apiKeysQuery = await adminDb.collection(adminCollections.apiKeys)
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    if (apiKeysQuery.empty) {
      return NextResponse.json(
        { error: 'No active API keys found for this user' },
        { status: 404 }
      );
    }

    // Get the first active API key (or you could sum usage across all keys)
    const apiKeyDoc = apiKeysQuery.docs[0];
    const apiKeyData = apiKeyDoc.data();
    const apiKeyId = apiKeyDoc.id;

    const lastUsageDate = apiKeyData?.lastUsageDate;

    // Check if usage needs to be reset (new day)
    let currentUsage = apiKeyData?.usage || 0;
    let wasReset = false;

    if (!lastUsageDate || lastUsageDate !== today) {
      // New day, reset usage to 0
      await adminDb.collection(adminCollections.apiKeys).doc(apiId).update({
        usage: 0,
        lastUsageDate: today,
        lastUsageReset: Timestamp.now()
      });
      currentUsage = 0;
      wasReset = true;
    }

    // Get user document for role and limit information
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    const userData = userDoc.data();
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
        wasReset: wasReset,
        apiKeyId: apiKeyId
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