import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyByKey, incrementApiKeyUsage } from '@/lib/apiKeys';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';

// This middleware validates API keys and enforces rate limits
export async function apiKeyValidator(request: NextRequest) {
  // Get API key from headers
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 401 }
    );
  }
  
  try {
    // Validate API key
    const keyData = await getApiKeyByKey(apiKey);
    
    if (!keyData) {
      return NextResponse.json(
        { error: 'Invalid API Key' },
        { status: 401 }
      );
    }
    
    // Check if key is active
    if (!keyData.isActive) {
      return NextResponse.json(
        { error: 'API Key is disabled' },
        { status: 401 }
      );
    }
    
    // Check if user has exceeded daily limit
    if (keyData.usage >= keyData.limit) {
      return NextResponse.json(
        { error: 'API Key limit reached' },
        { status: 429 }
      );
    }
    
    // Increment usage count
    await incrementApiKeyUsage(keyData.id);
    
    // Add user info to request for use in API routes
    request.headers.set('x-user-id', keyData.userId);
    request.headers.set('x-user-role', keyData.role);
    
    return null; // Continue to the actual API route
  } catch (error) {
    console.error('API key validation error:', error);
    return NextResponse.json(
      { error: 'API key validation failed' },
      { status: 500 }
    );
  }
}

// Wrapper for API routes to use the validator
export function withApiKeyValidation(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const validationError = await apiKeyValidator(request);
    
    if (validationError) {
      return validationError;
    }
    
    // Call the original handler
    return handler(request, context);
  };
}

export async function validateApiKey(apikey: string) {
  const snap = await adminDb
    .collection(adminCollections.apiKeys)
    .where('key', '==', apikey)
    .limit(1)
    .get();

  if (snap.empty) return { valid: false };

  const doc = snap.docs[0];
  const data = doc.data();

  if (!data.isActive) return { valid: false };
  if (data.usage >= data.limit) return { valid: false, limit: true };

  return { valid: true, doc, data };
}

export async function increaseUsage(doc: any, current: number) {
  await doc.ref.update({
    usage: current + 1,
    lastUsed: Timestamp.now()
  });
}
