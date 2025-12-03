import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

// Generate a secure random API key
function generateApiKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, keyId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user document
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let newApiKey: string;
    let actualKeyId: string;

    if (keyId) {
      // Regenerate existing key
      const apiKeyDoc = await adminDb.collection(adminCollections.apiKeys).doc(keyId).get();
      
      if (!apiKeyDoc.exists) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }

      const apiKeyData = apiKeyDoc.data();
      
      if (apiKeyData.userId !== userId) {
        return NextResponse.json(
          { error: 'API key does not belong to this user' },
          { status: 403 }
        );
      }

      // Generate new key and update existing document
      newApiKey = generateApiKey();
      actualKeyId = keyId;

      await adminDb.collection(adminCollections.apiKeys).doc(keyId).update({
        key: newApiKey,
        usage: 0,
        lastUsed: null,
        lastRegenerated: Timestamp.now()
      });
    } else {
      // Create new API key
      newApiKey = generateApiKey();
      actualKeyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const userData = userDoc.data();
      const userRole = userData?.role || 'FREE';
      
      // Role-based limits
      const ROLE_LIMITS: Record<string, number> = {
        FREE: 20,
        STARTER: 1000,
        PROFESSIONAL: 5000,
        BUSINESS: 20000,
        ENTERPRISE: 100000,
      };

      await adminDb.collection(adminCollections.apiKeys).doc(actualKeyId).set({
        key: newApiKey,
        userId: userId,
        name: `${userRole} Key`,
        role: userRole,
        limit: ROLE_LIMITS[userRole] || ROLE_LIMITS.FREE,
        usage: 0,
        isActive: true,
        createdAt: Timestamp.now(),
        lastRegenerated: Timestamp.now()
      });
    }

    // Update user document with new API key info and reset usage
    await adminDb.collection(adminCollections.users).doc(userId).update({
      apiKey: newApiKey,
      apiKeyId: actualKeyId,
      apiKeyUsage: 0,
      lastApiKeyRegeneration: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      data: {
        apiKey: newApiKey,
        keyId: actualKeyId,
        message: 'API key regenerated successfully',
        regeneratedAt: Timestamp.now().toDate().toISOString()
      }
    });

  } catch (error) {
    console.error('Error regenerating API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}