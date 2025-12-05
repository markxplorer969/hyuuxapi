import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email in Firestore
    const usersSnapshot = await adminDb.collection(adminCollections.users)
      .where('email', '==', email)
      .get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Update user role to admin
    await adminDb.collection(adminCollections.users).doc(userId).update({
      role: 'admin'
    });

    return NextResponse.json({
      success: true,
      message: `Successfully made ${email} an admin`,
      data: {
        user: {
          ...userData,
          role: 'admin'
        }
      }
    });

  } catch (error) {
    console.error('Error making admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Make user.lang@gmail.com admin by default for testing
    const email = 'user.lang@gmail.com';
    
    // Find user by email in Firestore
    const usersSnapshot = await adminDb.collection(adminCollections.users)
      .where('email', '==', email)
      .get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'User user.lang@gmail.com not found' },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Update user role to admin
    await adminDb.collection(adminCollections.users).doc(userId).update({
      role: 'admin'
    });

    return NextResponse.json({
      success: true,
      message: `Successfully made ${email} an admin`,
      data: {
        user: {
          ...userData,
          role: 'admin'
        }
      }
    });

  } catch (error) {
    console.error('Error making admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}