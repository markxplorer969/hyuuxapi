'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setInitializing(false);
  }, []);

  // Save user state to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const handleSignInWithGoogle = async () => {
    // Simulate successful Google sign in
    const mockUser: User = {
      uid: 'google-user-123',
      email: 'user@example.com',
      displayName: 'Demo User',
      photoURL: null,
      emailVerified: true
    };
    setUser(mockUser);
    console.log('Google sign in - Mock successful');
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    // Simulate successful email sign in
    const mockUser: User = {
      uid: 'email-user-456',
      email: email,
      displayName: email.split('@')[0],
      photoURL: null,
      emailVerified: true
    };
    setUser(mockUser);
    console.log('Email sign in - Mock successful for:', email);
  };

  const handleSignUpWithEmail = async (email: string, password: string) => {
    // Simulate successful sign up
    const mockUser: User = {
      uid: 'new-user-789',
      email: email,
      displayName: email.split('@')[0],
      photoURL: null,
      emailVerified: false
    };
    setUser(mockUser);
    console.log('Email sign up - Mock successful for:', email);
  };

  const handleResetPassword = async (email: string) => {
    console.log('Password reset - Mock for:', email);
  };

  const handleLogout = async () => {
    setUser(null);
    console.log('Logout - Mock successful');
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
      {children}
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