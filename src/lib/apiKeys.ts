import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, increment, db } from './firebase';
import { randomBytes } from 'crypto';

// API Key data model
export interface ApiKey {
  key: string;
  userId: string;
  name?: string;
  role: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME';
  limit: number;
  usage: number;
  lastUsed?: Date;
  isActive: boolean;
  createdAt: Date;
  custom?: boolean; // True for manually created keys
}

// User role to limit mapping
export const ROLE_LIMITS: Record<string, number> = {
  FREE: 20,
  CHEAP: 1000,
  PREMIUM: 2500,
  VIP: 5000,
  VVIP: 10000,
  SUPREME: 20000,
};

// Generate a secure random API key
export function generateApiKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

// Create a new API key for a user
export async function createApiKey(
  userId: string, 
  role: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME' = 'FREE',
  custom: boolean = false,
  name?: string
): Promise<string> {
  const apiKey = generateApiKey();
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const apiKeyData: ApiKey = {
    key: apiKey,
    userId,
    name: name || `${role} Key`,
    role,
    limit: ROLE_LIMITS[role],
    usage: 0,
    isActive: true,
    createdAt: new Date(),
    custom,
  };
  
  // Save to Firestore
  await setDoc(doc(db, 'apiKeys', keyId), apiKeyData);
  
  return apiKey;
}

// Get API key by key value
export async function getApiKeyByKey(key: string): Promise<ApiKey | null> {
  const keysRef = collection(db, 'apiKeys');
  const q = query(keysRef, where('key', '==', key), where('isActive', '==', true));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return { ...doc.data() } as ApiKey;
}

// Update API key usage
export async function incrementApiKeyUsage(keyId: string): Promise<void> {
  const keyRef = doc(db, 'apiKeys', keyId);
  await updateDoc(keyRef, {
    usage: increment(1),
    lastUsed: serverTimestamp()
  });
}

// Regenerate API key for a user
export async function regenerateApiKey(userId: string, keyId: string): Promise<string> {
  const keyRef = doc(db, 'apiKeys', keyId);
  const keyDoc = await getDoc(keyRef);
  
  if (!keyDoc.exists()) {
    throw new Error('API key not found');
  }
  
  const keyData = keyDoc.data() as ApiKey;
  const newApiKey = generateApiKey();
  
  await updateDoc(keyRef, {
    key: newApiKey,
    usage: 0,
    lastUsed: null
  });
  
  return newApiKey;
}

// Deactivate API key
export async function deactivateApiKey(keyId: string): Promise<void> {
  const keyRef = doc(db, 'apiKeys', keyId);
  await updateDoc(keyRef, {
    isActive: false
  });
}