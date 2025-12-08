import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/db';
import { collection, query, where, getDocs } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Query users dengan role Enterprise
    const usersQuery = query(
      collection(db, collections.users),
      where('role', '==', 'ENTERPRISE')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const enterpriseUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: {
        enterpriseUsers,
        count: enterpriseUsers.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking enterprise users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}