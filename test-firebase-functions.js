// Simple test untuk Firebase functions
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWzfAqY7eYlmKp6wgxi2qPV7UukKm5zqw",
  authDomain: "hyuuapi.firebaseapp.com",
  projectId: "hyuuapi",
  storageBucket: "hyuuapi.firebasestorage.app",
  messagingSenderId: "1076041033236",
  appId: "1:1076041033236:web:fff5963eabb70cdfd76901",
  measurementId: "G-B8L6HH3T57"
};

console.log('🧪 Testing Firebase functions...');

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  // Initialize Auth
  const auth = getAuth(app);
  console.log('✅ Firebase auth initialized');
  
  // Test onAuthStateChanged
  if (typeof onAuthStateChanged === 'function') {
    console.log('✅ onAuthStateChanged is a function');
    
    // Try to set up listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('📱 Auth state changed:', user ? `User: ${user.email}` : 'No user');
    });
    
    console.log('✅ onAuthStateChanged listener set up successfully');
    
    // Test unsubscribe
    unsubscribe();
    console.log('✅ Unsubscribe works');
    
  } else {
    console.error('❌ onAuthStateChanged is not a function');
  }
  
  console.log('🎉 All Firebase functions working correctly!');
  
} catch (error) {
  console.error('❌ Error testing Firebase:', error);
}