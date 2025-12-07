import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';

// GET - Get user by API key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Query API keys collection to get userId
    const apiKeysSnapshot = await adminDb.collection(adminCollections.apiKeys)
      .where('key', '==', apiKey)
      .where('isActive', '==', true)
      .get();

    if (apiKeysSnapshot.empty) {
      return NextResponse.json(
        { error: 'API key not found or inactive' },
        { status: 404 }
      );
    }

    const apiKeyDoc = apiKeysSnapshot.docs[0];
    const apiKeyData = apiKeyDoc.data();
    const userId = apiKeyData.userId;

    // Get user information from users collection (primary source)
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

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
        apiKey: {
          id: apiKeyDoc.id,
          key: apiKeyData.key,
          name: apiKeyData.name,
          role: apiKeyData.role,
          limit: apiKeyData.limit,
          usage: apiKeyData.usage || 0,
          lastUsed: apiKeyData.lastUsed ? apiKeyData.lastUsed.toDate() : null,
          lastUsageDate: apiKeyData.lastUsageDate,
          isActive: apiKeyData.isActive,
          custom: apiKeyData.custom || false,
          createdAt: apiKeyData.createdAt ? apiKeyData.createdAt.toDate() : null
        }
      }
    });

  } catch (error) {
    console.error('Error getting user by API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}