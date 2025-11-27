// client/src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABjlv-bzhlBG6eNodCtNa25ZN_desL-gg",
  authDomain: "hyuu-c4343.firebaseapp.com",
  projectId: "hyuu-c4343",
  storageBucket: "hyuu-c4343.firebasestorage.app",
  messagingSenderId: "188778202454",
  appId: "1:188778202454:web:df5b9f443a6fd27ed542f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Disable email verification
auth.settings.appVerificationDisabledForTesting = true

export default app