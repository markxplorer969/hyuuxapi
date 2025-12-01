'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { createApiKey } from '@/lib/apiKeys';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME';
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
      // Create new user with default FREE role
      const newUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: 'FREE',
        createdAt: serverTimestamp()
      };
      
      await setDoc(userRef, newUser);
      
      // Generate API key for new user
      const apiKey = await createApiKey(firebaseUser.uid, 'FREE');
      
      // Update user state with API key info
      setUser({
        ...newUser,
        apiKey,
        apiKeyId: `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        apiKeyLimit: 20,
        apiKeyUsage: 0
      });
    } else {
      // User exists, get their API key
      const userData = userSnap.data() as User;
      const apiKeyRef = doc(db, 'apiKeys', userData.uid);
      const apiKeySnap = await getDoc(apiKeyRef);
      
      if (apiKeySnap.exists()) {
        const apiKeyData = apiKeySnap.data();
        setUser({
          ...userData,
          apiKey: apiKeyData.key,
          apiKeyId: apiKeyData.id,
          apiKeyLimit: apiKeyData.limit,
          apiKeyUsage: apiKeyData.usage
        });
      } else {
        setUser(userData);
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
    if (!user) return;
    
    try {
      const newApiKey = await regenerateApiKey(user.uid, user.apiKeyId || '');
      
      setUser(prev => prev ? {
        ...prev,
        apiKey: newApiKey,
        apiKeyUsage: 0
      } : null);
    } catch (error) {
      console.error('Error regenerating API key:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        createUserDocument(firebaseUser);
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
    regenerateApiKey
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};