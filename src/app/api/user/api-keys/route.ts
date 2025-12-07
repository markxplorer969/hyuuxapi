import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';

// GET - Get all API keys for a user
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

    // Get user information from users collection (primary source)
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const userData = userDoc.data();

    // Get user's API keys
    const apiKeysSnapshot = await adminDb.collection(adminCollections.apiKeys)
      .where('userId', '==', userId)
      .get();

    const apiKeys = [];

    for (const doc of apiKeysSnapshot.docs) {
      const apiKeyData = doc.data();
      apiKeys.push({
        id: doc.id,
        key: apiKeyData.key,
        name: apiKeyData.name || 'Unnamed Key',
        role: apiKeyData.role || userData.role || 'FREE',
        limit: apiKeyData.limit || 20,
        usage: apiKeyData.usage || 0,
        lastUsed: apiKeyData.lastUsed ? apiKeyData.lastUsed.toDate() : null,
        lastUsageDate: apiKeyData.lastUsageDate,
        isActive: apiKeyData.isActive !== false,
        custom: apiKeyData.custom || false,
        createdAt: apiKeyData.createdAt ? apiKeyData.createdAt.toDate() : null
      });
    }

    // Sort by creation date (newest first)
    apiKeys.sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userDoc.id,
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          plan: userData.plan,
          createdAt: userData.createdAt
        },
        apiKeys: apiKeys
      }
    });

  } catch (error) {
    console.error('Error getting user API keys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}