// firebase.ts (SAFE for Next.js App Router)
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDWzfAqY7eYlmKp6wgxi2qPV7UukKm5zqw",
  authDomain: "hyuuapi.firebaseapp.com",
  projectId: "hyuuapi",
  storageBucket: "hyuuapi.firebasestorage.app",
  messagingSenderId: "1076041033236",
  appId: "1:1076041033236:web:fff5963eabb70cdfd76901",
  measurementId: "G-B8L6HH3T57"
};

// Initialize core Firebase services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// 🔥 SAFE ANALYTICS LOADER — DO NOT EXPORT THE VARIABLE
export async function loadAnalytics() {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getAnalytics(app);
}

// Auth functions
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
  return signOut(auth);
};

export { onAuthStateChanged };
export type { FirebaseUser };
