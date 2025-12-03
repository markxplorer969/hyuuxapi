import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, FieldValue } from '@/lib/firebase-admin';

// GET - List all users
export async function GET() {
  try {
    const usersSnapshot = await adminDb.collection(adminCollections.users).get();
    const users = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        displayName: userData.displayName || '',
        email: userData.email || '',
        role: userData.role || 'user',
        plan: userData.plan || 'FREE',
        apiKeyUsage: userData.apiKeyUsage || 0,
        apiKeyLimit: userData.apiKeyLimit || 20,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        isActive: userData.isActive !== false // Default to true
      });
    });

    // Sort by creation date (newest first)
    users.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const { displayName, email, password, role, plan } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserSnapshot = await adminDb
      .collection(adminCollections.users)
      .where('email', '==', email)
      .get();

    if (!existingUserSnapshot.empty) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user in Firestore
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newUser = {
      uid: newUserId,
      email,
      displayName: displayName || '',
      role: role || 'user',
      plan: plan || 'FREE',
      apiKeyUsage: 0,
      apiKeyLimit: getPlanLimit(plan || 'FREE'),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isActive: true
    };

    await adminDb.collection(adminCollections.users).doc(newUserId).set(newUser);

    // Generate API key for new user
    const apiKey = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const apiKeyData = {
      userId: newUserId,
      key: apiKey,
      name: `${plan || 'FREE'} Key`,
      plan: plan || 'FREE',
      limit: getPlanLimit(plan || 'FREE'),
      usage: 0,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await adminDb.collection(adminCollections.apiKeys).doc(apiKey).set(apiKeyData);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUserId,
        email,
        displayName,
        role,
        plan,
        apiKey
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const { id, displayName, email, role, plan, apiKeyLimit, isActive } = await request.json();

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
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
    CHEAP: 1000,
    PREMIUM: 2500,
    VIP: 5000,
    VVIP: 10000,
    SUPREME: 20000
  };
  return limits[plan] || 20;
}