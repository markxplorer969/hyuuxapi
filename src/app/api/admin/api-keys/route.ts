import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';
import { sendToDiscord } from '@/lib/discord';

// Helper function to generate random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate key ID
function generateKeyId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET - Fetch all API keys with user information
export async function GET(request: NextRequest) {
  try {
    const apiKeySnapshot = await adminDb
      .collection(adminCollections.apiKeys)
      .orderBy('createdAt', 'desc')
      .get();

    const apiKeys = [];

    for (const doc of apiKeySnapshot.docs) {
      const keyData = doc.data();
      
      // Get user information
      let userDoc;
      try {
        userDoc = await adminDb.collection(adminCollections.users).doc(keyData.userId).get();
      } catch (error) {
        console.log('User not found for API key:', doc.id);
        continue;
      }

      if (!userDoc.exists) continue;

      const userData = userDoc.data();

      apiKeys.push({
        id: doc.id,
        name: keyData.name || 'Default Key',
        key: keyData.key,
        keyId: keyData.keyId || generateKeyId(),
        userId: keyData.userId,
        userEmail: userData.email || 'Unknown',
        userName: userData.displayName || userData.email || 'Unknown User',
        usage: keyData.usage || 0,
        limit: keyData.limit || 20,
        isActive: keyData.isActive !== false,
        createdAt: keyData.createdAt?.toDate() || new Date(),
        lastUsed: keyData.lastUsed?.toDate() || new Date(),
        permissions: keyData.permissions || [],
        plan: userData.plan || 'FREE'
      });
    }

    return NextResponse.json({
      status: true,
      result: apiKeys
    });

  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({
      status: false,
      error: error.message || 'Failed to fetch API keys'
    }, { status: 500 });
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const { userId, name, limit, permissions, isActive } = await request.json();

    if (!userId || !name) {
      return NextResponse.json({
        status: false,
        error: 'User ID and name are required'
      }, { status: 400 });
    }

    // Check if user exists
    const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({
        status: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Generate API key
    const apiKey = generateApiKey();
    const keyId = generateKeyId();

    // Create API key document
    const apiKeyData = {
      userId,
      name,
      key: apiKey,
      keyId,
      usage: 0,
      limit: limit || 20,
      permissions: permissions || [],
      isActive: isActive !== false,
      createdAt: Timestamp.now(),
      lastUsed: Timestamp.now()
    };

    const docRef = await adminDb.collection(adminCollections.apiKeys).add(apiKeyData);

    // Log to Discord
    const ip = request.headers.get("x-forwarded-for") || "Unknown";
    await sendToDiscord({
      ip,
      endpoint: "/api/admin/api-keys",
      method: "POST",
      query: { userId, name, limit },
      response: { success: true, keyId: docRef.id }
    });

    return NextResponse.json({
      status: true,
      result: {
        id: docRef.id,
        ...apiKeyData,
        createdAt: new Date(),
        lastUsed: new Date()
      }
    });

  } catch (error: any) {
    console.error('Error creating API key:', error);
    return NextResponse.json({
      status: false,
      error: error.message || 'Failed to create API key'
    }, { status: 500 });
  }
}