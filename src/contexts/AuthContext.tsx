'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from '@/lib/firebase';
import { createApiKey, regenerateApiKey as regenerateUserApiKey } from '@/lib/apiKeys';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  plan: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME';
  apiKey?: string;
  apiKeyId?: string;
  apiKeyLimit?: number;
  apiKeyUsage?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  regenerateApiKey: () => Promise<void>;
  updateDailyUsage: (usage?: number) => Promise<any>;
  getDailyUsage: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create user document in Firestore if it doesn't exist
  const createUserDocument = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create new user with default FREE plan and user role
      const newUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: 'user',
        plan: 'FREE',
        apiKeyUsage: 0,
        apiKeyLimit: 20,
        createdAt: serverTimestamp()
      };
      
      await setDoc(userRef, newUser);
      
      // Generate API key for new user
      const apiKey = await createApiKey(firebaseUser.uid, 'FREE');
      const apiKeyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Update user state with API key info
      setUser({
        ...newUser,
        apiKey,
        apiKeyId: apiKeyId,
        apiKeyLimit: 20,
        apiKeyUsage: 0,
        plan: 'FREE',
        role: 'user'
      });
    } else {
      // User exists, get their API key
      const userData = userSnap.data() as User;
      
      // Query apiKeys collection for keys belonging to this user
      const apiKeysRef = collection(db, 'apiKeys');
      const q = query(apiKeysRef, where('userId', '==', userData.uid), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const apiKeyDoc = querySnapshot.docs[0];
        const apiKeyData = apiKeyDoc.data();
        setUser({
          ...userData,
          apiKey: apiKeyData.key,
          apiKeyId: apiKeyDoc.id,
          apiKeyLimit: apiKeyData.limit,
          apiKeyUsage: apiKeyData.usage || 0,
          plan: userData.plan || 'FREE', // Default to FREE if not set
          role: userData.role || 'user' // Default to user if not set
        });
      } else {
        // Ensure user has default values even without API key
        setUser({
          ...userData,
          apiKeyUsage: userData.apiKeyUsage || 0,
          apiKeyLimit: userData.apiKeyLimit || 20,
          plan: userData.plan || 'FREE', // Default to FREE if not set
          role: userData.role || 'user' // Default to user if not set
        });
      }
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        await createUserDocument(result.user);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        await createUserDocument(result.user);
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        await createUserDocument(result.user);
      }
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Regenerate API key
  const regenerateApiKey = async () => {
    if (!user || !user.uid) {
      console.warn('regenerateApiKey: No user or user.uid available');
      return;
    }
    
    try {
      const response = await fetch('/api/regenerate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          keyId: user.apiKeyId || null // Pass null if no existing key
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('regenerateApiKey API error:', data.error);
        throw new Error(data.error || 'Failed to regenerate API key');
      }

      // Update user state with new API key
      setUser(prev => prev ? {
        ...prev,
        apiKey: data.data.apiKey,
        apiKeyId: data.data.keyId,
        apiKeyUsage: 0
      } : null);

    } catch (error) {
      console.error('Error regenerating API key:', error);
      throw error;
    }
  };

  // Update daily usage
  const updateDailyUsage = async (usage: number = 1) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/daily-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          apiKeyId: user.apiKeyId || '',
          usage: usage
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update daily usage');
      }

      // Update user state with new usage
      setUser(prev => prev ? {
        ...prev,
        apiKeyUsage: data.data.usage
      } : null);

      return data.data;

    } catch (error) {
      console.error('Error updating daily usage:', error);
      throw error;
    }
  };

  // Get daily usage
  const getDailyUsage = async () => {
    if (!user || !user.uid) {
      console.warn('getDailyUsage: No user or user.uid available');
      return null;
    }
    
    try {
      const response = await fetch(`/api/daily-usage?userId=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('getDailyUsage API error:', data.error);
        throw new Error(data.error || 'Failed to get daily usage');
      }

      // Update user state with current usage
      setUser(prev => prev ? {
        ...prev,
        apiKeyUsage: data.data.usage || 0
      } : null);

      return data.data;

    } catch (error) {
      console.error('Error getting daily usage:', error);
      // Don't throw the error, just return null to avoid breaking the UI
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        await createUserDocument(firebaseUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    regenerateApiKey,
    updateDailyUsage,
    getDailyUsage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};