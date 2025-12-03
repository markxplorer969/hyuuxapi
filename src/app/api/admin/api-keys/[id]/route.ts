import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';
import { sendToDiscord } from '@/lib/discord';

// GET - Get single API key
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await adminDb.collection(adminCollections.apiKeys).doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json({
        status: false,
        error: 'API key not found'
      }, { status: 404 });
    }

    const keyData = doc.data();

    // Get user information
    const userDoc = await adminDb.collection(adminCollections.users).doc(keyData.userId).get();
    const userData = userDoc.exists() ? userDoc.data() : null;

    return NextResponse.json({
      status: true,
      result: {
        id: doc.id,
        name: keyData.name || 'Default Key',
        key: keyData.key,
        keyId: keyData.keyId || '',
        userId: keyData.userId,
        userEmail: userData?.email || 'Unknown',
        userName: userData?.displayName || userData?.email || 'Unknown User',
        usage: keyData.usage || 0,
        limit: keyData.limit || 20,
        isActive: keyData.isActive !== false,
        createdAt: keyData.createdAt?.toDate() || new Date(),
        lastUsed: keyData.lastUsed?.toDate() || new Date(),
        permissions: keyData.permissions || [],
        plan: userData?.plan || 'FREE'
      }
    });

  } catch (error: any) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({
      status: false,
      error: error.message || 'Failed to fetch API key'
    }, { status: 500 });
  }
}

// PATCH - Update API key
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive, name, limit } = await request.json();
    
    const doc = await adminDb.collection(adminCollections.apiKeys).doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json({
        status: false,
        error: 'API key not found'
      }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (name) {
      updateData.name = name;
    }

    if (limit && typeof limit === 'number') {
      updateData.limit = limit;
    }

    await doc.ref.update(updateData);

    // Log to Discord
    const ip = request.headers.get("x-forwarded-for") || "Unknown";
    await sendToDiscord({
      ip,
      endpoint: `/api/admin/api-keys/${params.id}`,
      method: "PATCH",
      query: updateData,
      response: { success: true }
    });

    return NextResponse.json({
      status: true,
      result: {
        id: params.id,
        ...updateData,
        updatedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Error updating API key:', error);
    return NextResponse.json({
      status: false,
      error: error.message || 'Failed to update API key'
    }, { status: 500 });
  }
}

// DELETE - Delete API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await adminDb.collection(adminCollections.apiKeys).doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json({
        status: false,
        error: 'API key not found'
      }, { status: 404 });
    }

    const keyData = doc.data();
    await doc.ref.delete();

    // Log to Discord
    const ip = request.headers.get("x-forwarded-for") || "Unknown";
    await sendToDiscord({
      ip,
      endpoint: `/api/admin/api-keys/${params.id}`,
      method: "DELETE",
      query: { keyName: keyData.name },
      response: { success: true }
    });

    return NextResponse.json({
      status: true,
      result: {
        id: params.id,
        deleted: true
      }
    });

  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({
      status: false,
      error: error.message || 'Failed to delete API key'
    }, { status: 500 });
  }
}