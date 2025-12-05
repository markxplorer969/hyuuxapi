import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/db';
import { doc, getDoc, collection, query, where, getDocs, orderBy as orderByFirestore } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, collections.users, userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Get subscriptions from Firestore
    const subscriptionsQuery = query(
      collection(db, collections.subscriptions),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderByFirestore('createdAt', 'desc')
    );
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get API keys from Firestore
    const apiKeysQuery = query(
      collection(db, collections.apiKeys),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderByFirestore('createdAt', 'desc')
    );
    const apiKeysSnapshot = await getDocs(apiKeysQuery);
    const apiKeys = apiKeysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const currentSubscription = subscriptions[0];
    const currentApiKey = apiKeys[0];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userData.uid,
          email: userData.email,
          name: userData.displayName,
          role: userData.role,
          createdAt: userData.createdAt
        },
        subscription: currentSubscription || null,
        apiKey: currentApiKey || null,
        subscriptions,
        apiKeys
      }
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}