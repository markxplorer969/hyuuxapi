import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get all users to debug
    const usersSnapshot = await adminDb.collection(adminCollections.users).get();
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || 'user',
        plan: userData.plan || 'FREE'
      });
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users,
      message: 'Current users in database'
    });

  } catch (error) {
    console.error('Error checking current users:', error);
    return NextResponse.json(
      { error: 'Failed to check users' },
      { status: 500 }
    );
  }
}