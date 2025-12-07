import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, FieldValue, Timestamp } from '@/lib/firebase-admin';

// GET - List all API keys
export async function GET() {
  try {
    const apiKeysSnapshot = await adminDb.collection(adminCollections.apiKeys).get();
    const apiKeys = [];

    for (const doc of apiKeysSnapshot.docs) {
      const apiKeyData = doc.data();
      const userId = apiKeyData.userId;
      
      // Get user information from users collection for role and plan
      const userDoc = await adminDb.collection(adminCollections.users).doc(userId).get();
      const userData = userDoc.data();
      
      apiKeys.push({
        id: doc.id,
        key: apiKeyData.key,
        userId: apiKeyData.userId,
        name: apiKeyData.name || 'Unnamed Key',
        role: userData.role || apiKeyData.role || 'FREE',
        limit: apiKeyData.limit || 20,
        usage: apiKeyData.usage || 0,
        lastUsed: apiKeyData.lastUsed ? apiKeyData.lastUsed.toDate() : null,
        lastUsageDate: apiKeyData.lastUsageDate || null,
        isActive: apiKeyData.isActive !== false,
        createdAt: apiKeyData.createdAt ? apiKeyData.createdAt.toDate() : null,
        custom: apiKeyData.custom || false
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
      data: apiKeys
    });

  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const { userId, name, role = 'FREE', custom = false } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Role limits
    const ROLE_LIMITS: Record<string, number> = {
      FREE: 20,
      CHEAP: 1000,
      PREMIUM: 2500,
      VIP: 5000,
      VVIP: 10000,
      SUPREME: 20000,
    };

    const apiKeyData = {
      key: apiKey,
      userId,
      name: name || `${role} Key`,
      role,
      limit: ROLE_LIMITS[role] || 20,
      usage: 0,
      isActive: true,
      custom,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastUsed: null,
      lastUsageDate: new Date().toISOString().split('T')[0] // Today's date
    };

    await adminDb.collection(adminCollections.apiKeys).doc(keyId).set(apiKeyData);

    return NextResponse.json({
      success: true,
      message: 'API key created successfully',
      data: {
        id: keyId,
        key: apiKey,
        name: apiKeyData.name,
        role,
        limit: apiKeyData.limit,
        userId
      }
    });

  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// PUT - Update API key
export async function PUT(request: NextRequest) {
  try {
    const { id, name, role, limit, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'API Key ID is required' },
        { status: 400 }
      );
    }

    const keyDoc = await adminDb.collection(adminCollections.apiKeys).doc(id).get();
    
    if (!keyDoc.exists) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) {
      updateData.role = role;
      // Update limit based on new role
      const ROLE_LIMITS: Record<string, number> = {
        FREE: 20,
        CHEAP: 1000,
        PREMIUM: 2500,
        VIP: 5000,
        VVIP: 10000,
        SUPREME: 20000,
      };
      updateData.limit = ROLE_LIMITS[role] || 20;
    }
    if (limit !== undefined) updateData.limit = limit;
    if (isActive !== undefined) updateData.isActive = isActive;

    await adminDb.collection(adminCollections.apiKeys).doc(id).update(updateData);

    const updatedKeyDoc = await adminDb.collection(adminCollections.apiKeys).doc(id).get();
    const updatedData = updatedKeyDoc.data();

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
      data: {
        id,
        ...updatedData
      }
    });

  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

// DELETE - Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'API Key ID is required' },
        { status: 400 }
      );
    }

    const keyDoc = await adminDb.collection(adminCollections.apiKeys).doc(id).get();
    
    if (!keyDoc.exists) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    const apiKeyData = keyDoc.data();

    // Soft delete by deactivating
    await adminDb.collection(adminCollections.apiKeys).doc(id).update({
      isActive: false,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
      data: {
        id,
        key: apiKeyData.key,
        name: apiKeyData.name
      }
    });

  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}