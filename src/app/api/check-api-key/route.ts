import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, apiKey } = await request.json();

    if (!userId || !apiKey) {
      return NextResponse.json(
        { error: 'User ID and API key are required' },
        { status: 400 }
      );
    }

    // Trim and validate format
    const requestedKey = apiKey.trim();
    
    // Basic validation
    if (requestedKey.length < 6 || requestedKey.length > 32) {
      return NextResponse.json(
        { error: 'API key must be between 6 and 32 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9-]+$/.test(requestedKey)) {
      return NextResponse.json(
        { error: 'API key can only contain letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Get user's current API key
    const userApiKeysQuery = await adminDb.collection(adminCollections.apiKeys)
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    if (userApiKeysQuery.empty) {
      return NextResponse.json(
        { error: 'No active API key found for this user' },
        { status: 404 }
      );
    }

    const currentApiKeyDoc = userApiKeysQuery.docs[0];
    const currentApiKeyData = currentApiKeyDoc.data();
    const currentKey = currentApiKeyData.key;

    // Check if it's the same as current key (no-op)
    if (requestedKey === currentKey) {
      return NextResponse.json({
        success: true,
        available: true,
        isSameAsCurrent: true,
        message: 'This is your current API key'
      });
    }

    // Check for uniqueness
    const keyQuery = await adminDb.collection(adminCollections.apiKeys)
      .where('key', '==', requestedKey)
      .get();

    if (!keyQuery.empty) {
      return NextResponse.json({
        success: true,
        available: false,
        message: 'This API key is already taken. Please try another one.'
      });
    }

    return NextResponse.json({
      success: true,
      available: true,
      message: 'API key is available'
    });

  } catch (error) {
    console.error('Error checking API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}