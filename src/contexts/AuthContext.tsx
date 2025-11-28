'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  initializing: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Firebase and set up auth listener
    const initializeAuth = async () => {
      try {
        const firebaseModule = await import('@/lib/firebase');
        const { auth } = firebaseModule;
        
        // Import onAuthStateChanged directly from firebase/auth
        const { onAuthStateChanged } = await import('firebase/auth');
        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('Auth state changed:', firebaseUser?.email || 'No user');
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            });
          } else {
            setUser(null);
          }
          setInitializing(false);
          setError(null);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setInitializing(false);
        setError('Failed to initialize authentication');
      }
    };

    initializeAuth();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      const { signInWithGoogle } = await import('@/lib/firebase');
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      const { signInWithEmail } = await import('@/lib/firebase');
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('Sign in with email error:', error);
      throw error;
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string) => {
    try {
      const { signUpWithEmail } = await import('@/lib/firebase');
      await signUpWithEmail(email, password);
    } catch (error) {
      console.error('Sign up with email error:', error);
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const { resetPassword } = await import('@/lib/firebase');
      await resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('@/lib/firebase');
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    initializing,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    resetPassword: handleResetPassword,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {error ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-red-600">Authentication Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="w-full">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};