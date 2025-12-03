import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

export async function GET() {
  try {
    const db = getFirestore();
    const apiKeysCollection = collection(db, 'api_keys');
    
    const snapshot = await getDocs(apiKeysCollection);
    const apiKeys = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch API keys'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, key } = await request.json();

    if (!userId || !key) {
      return NextResponse.json({
        success: false,
        error: 'User ID and key are required'
      }, { status: 400 });
    }

    // Verify user exists
    const auth = getAuth();
    const userRecord = await auth.getUser(userId);
    if (!userRecord) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const db = getFirestore();
    const apiKeysCollection = collection(db, 'api_keys');
    
    // Create new API key document
    const newApiKey = {
      userId,
      userEmail: userRecord.email,
      userName: userRecord.displayName || userRecord.email,
      key,
      createdAt: serverTimestamp(),
      lastUsed: null,
      usageCount: 0,
      isActive: true,
      plan: 'FREE'
    };

    const docRef = await addDoc(apiKeysCollection, newApiKey);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...newApiKey
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create API key'
    }, { status: 500 });
  }
}