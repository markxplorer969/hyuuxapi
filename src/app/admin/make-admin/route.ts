import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, targetRole = 'admin' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email - query users collection
    const usersRef = collection(adminDb, adminCollections.users);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the first user document (assuming email is unique)
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Update user role to admin
    await updateDoc(doc(adminDb, adminCollections.users, userId), {
      role: targetRole,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${targetRole} successfully`,
      data: {
        userId: userId,
        email: email,
        newRole: targetRole,
        previousRole: userData.role,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}