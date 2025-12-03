// Temporary mock firebase configuration to get the app working
// This will be replaced with proper Firebase integration later

export const app = null;
export const auth = null;
export const db = null;
export const storage = null;
export const googleProvider = null;

// Mock functions
export const signInWithGoogle = async () => {
  throw new Error('Firebase not configured yet');
};

export const signInWithEmail = async (email: string, password: string) => {
  throw new Error('Firebase not configured yet');
};

export const signUpWithEmail = async (email: string, password: string) => {
  throw new Error('Firebase not configured yet');
};

export const resetPassword = async (email: string) => {
  throw new Error('Firebase not configured yet');
};

export const logoutUser = async () => {
  throw new Error('Firebase not configured yet');
};

export const onAuthStateChanged = () => {
  return () => {}; // Mock unsubscribe function
};

export const loadAnalytics = async () => {
  return null;
};

// Mock Firestore functions
export const doc = () => ({});
export const getDoc = async () => ({ exists: () => false });
export const setDoc = async () => ({});
export const serverTimestamp = () => new Date();
export const collection = () => ({});
export const query = () => ({});
export const where = () => ({});
export const getDocs = async () => ({ docs: [] });
export const updateDoc = async () => ({});
export const increment = (n: number) => n;
export const orderBy = () => ({});

// Mock Auth functions
export const signInWithPopup = async () => ({ user: null });
export const GoogleAuthProvider = class {};
export const signInWithEmailAndPassword = async () => ({ user: null });
export const createUserWithEmailAndPassword = async () => ({ user: null });
export const sendPasswordResetEmail = async () => ({});
export const signOut = async () => ({});

export type FirebaseUser = any;