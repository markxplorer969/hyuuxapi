// Mock Firebase for development - will be replaced with real Firebase later
export const app = null;
export const auth = null;
export const db = null;
export const storage = null;

// Mock auth functions
export const signInWithGoogle = async () => {
  throw new Error('Firebase not configured');
};

export const signInWithEmail = async (email: string, password: string) => {
  throw new Error('Firebase not configured');
};

export const signUpWithEmail = async (email: string, password: string) => {
  throw new Error('Firebase not configured');
};

export const resetPassword = async (email: string) => {
  throw new Error('Firebase not configured');
};

export const logoutUser = async () => {
  throw new Error('Firebase not configured');
};

// Mock Firestore functions
export const doc = () => null;
export const getDoc = async () => ({ exists: () => false });
export const setDoc = async () => null;
export const serverTimestamp = () => new Date();
export const collection = () => null;
export const query = () => null;
export const where = () => null;
export const getDocs = async () => ({ empty: true });
export const updateDoc = async () => null;
export const increment = (n: number) => n;
export const orderBy = () => null;

// Mock types
export type FirebaseUser = any;

// Mock other exports
export const googleProvider = null;
export const onAuthStateChanged = () => () => {};
export const GoogleAuthProvider = class {};
export const signInWithPopup = async () => ({ user: null });
export const signInWithEmailAndPassword = async () => ({ user: null });
export const createUserWithEmailAndPassword = async () => ({ user: null });
export const sendPasswordResetEmail = async () => null;
export const signOut = async () => null;