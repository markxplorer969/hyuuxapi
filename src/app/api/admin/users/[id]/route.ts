import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, FieldValue } from '@/lib/firebase-admin';

interface Params {
  params: Promise<{ id: string }>;
}

// PUT - Update user
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { displayName, email, role, plan, apiKeyLimit, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userDoc = await adminDb.collection(adminCollections.users).doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    // Only update fields that are provided
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (plan !== undefined) updateData.plan = plan;
    if (apiKeyLimit !== undefined) updateData.apiKeyLimit = apiKeyLimit;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user in Firestore
    await adminDb.collection(adminCollections.users).doc(id).update(updateData);

    // If plan changed, update API key limits
    if (plan !== undefined) {
      const apiKeysSnapshot = await adminDb
        .collection(adminCollections.apiKeys)
        .where('userId', '==', id)
        .where('isActive', '==', true)
        .get();

      const newLimit = getPlanLimit(plan);
      
      apiKeysSnapshot.forEach((apiKeyDoc) => {
        adminDb.collection(adminCollections.apiKeys).doc(apiKeyDoc.id).update({
          plan: plan,
          limit: newLimit,
          updatedAt: FieldValue.serverTimestamp()
        });
      });
    }

    // Get updated user data
    const updatedUserDoc = await adminDb.collection(adminCollections.users).doc(id).get();
    const updatedUser = updatedUserDoc.data();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userDoc = await adminDb.collection(adminCollections.users).doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Delete user's API keys
    const apiKeysSnapshot = await adminDb
      .collection(adminCollections.apiKeys)
      .where('userId', '==', id)
      .get();

    const batch = adminDb.batch();
    apiKeysSnapshot.forEach((apiKeyDoc) => {
      batch.delete(apiKeyDoc.ref);
    });

    // Delete user document
    batch.delete(userDoc.ref);

    // Commit batch delete
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        id,
        email: userData.email,
        displayName: userData.displayName
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// Helper function to get plan limits
function getPlanLimit(plan: string): number {
  const limits = {
    FREE: 20,
    STARTER: 1000,
    PROFESSIONAL: 5000,
    BUSINESS: 20000,
    ENTERPRISE: 100000
  };
  return limits[plan] || 20;
}