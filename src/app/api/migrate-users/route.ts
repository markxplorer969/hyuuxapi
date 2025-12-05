import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';

export async function POST() {
  try {
    // Get all users
    const usersSnapshot = await adminDb.collection(adminCollections.users).get();
    
    let updatedCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      // Prepare update object
      const updates: any = {};
      
      // Update role from old plan values to new role system
      if (userData.role === 'FREE' || userData.role === 'STARTER' || 
          userData.role === 'PROFESSIONAL' || userData.role === 'BUSINESS' || 
          userData.role === 'ENTERPRISE') {
        // This was an old plan value, convert to user role
        updates.role = 'user';
      }
      
      // Set plan field if it doesn't exist
      if (!userData.plan) {
        // Use the old role as plan, default to FREE
        updates.plan = userData.role || 'FREE';
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await adminDb.collection(adminCollections.users).doc(userId).update(updates);
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} users`,
      data: {
        totalUsers: usersSnapshot.size,
        updatedCount: updatedCount
      }
    });

  } catch (error) {
    console.error('Error migrating users:', error);
    return NextResponse.json(
      { error: 'Failed to migrate users' },
      { status: 500 }
    );
  }
}