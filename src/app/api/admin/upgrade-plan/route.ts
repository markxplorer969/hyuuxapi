import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/db';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, plan } = body;

    if (!email || !plan) {
      return NextResponse.json(
        { error: 'Email and plan are required' },
        { status: 400 }
      );
    }

    // Find user by email in Firestore
    const usersQuery = query(
      collection(db, collections.users),
      where('email', '==', email)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Update user plan to ENTERPRISE (role remains unchanged)
    await updateDoc(doc(db, collections.users, userId), {
      plan: 'ENTERPRISE',
      updatedAt: serverTimestamp()
    });

    // Check for existing API key
    const apiKeysQuery = query(
      collection(db, collections.apiKeys),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const apiKeysSnapshot = await getDocs(apiKeysQuery);

    if (!apiKeysSnapshot.empty) {
      // Update existing API key
      const existingApiKeyDoc = apiKeysSnapshot.docs[0];
      await updateDoc(doc(db, collections.apiKeys, existingApiKeyDoc.id), {
        plan: 'ENTERPRISE',
        limit: 100000, // Enterprise unlimited
        usage: 0, // Reset usage
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new API key
      const newApiKeyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, collections.apiKeys, newApiKeyId), {
        userId: userId,
        key: newApiKeyId,
        name: 'Enterprise Key',
        plan: 'ENTERPRISE',
        limit: 100000,
        usage: 0,
        isActive: true,
        createdAt: serverTimestamp()
      });
    }

    // Check for existing subscription
    const subscriptionsQuery = query(
      collection(db, collections.subscriptions),
      where('userId', '==', userId)
    );
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);

    if (!subscriptionsSnapshot.empty) {
      // Update existing subscription
      const existingSubscriptionDoc = subscriptionsSnapshot.docs[0];
      await updateDoc(doc(db, collections.subscriptions, existingSubscriptionDoc.id), {
        plan: 'ENTERPRISE',
        status: 'active',
        startDate: serverTimestamp(),
        endDate: null, // Enterprise doesn't expire
        autoRenew: true,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new subscription
      const newSubscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, collections.subscriptions, newSubscriptionId), {
        userId: userId,
        plan: 'ENTERPRISE',
        status: 'active',
        startDate: serverTimestamp(),
        endDate: null, // Enterprise doesn't expire
        autoRenew: true,
        createdAt: serverTimestamp()
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded ${email} to Enterprise plan`,
      data: {
        user: {
          ...userData,
          plan: 'ENTERPRISE',
          updatedAt: serverTimestamp()
        },
        plan: 'ENTERPRISE',
        features: [
          'Unlimited API calls',
          'All AI Models + Exclusive Access',
          'Dedicated Account Manager',
          'Custom Analytics Dashboard',
          '99.99% Uptime Guarantee',
          'Custom API Key',
          'Advanced Webhooks',
          'Team Collaboration Tools',
          'White-label Solutions',
          'SLA Guarantee',
          'On-premise Deployment Option'
        ]
      }
    });
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}