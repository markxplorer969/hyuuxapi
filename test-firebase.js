// Test file untuk Firebase configuration
// Run dengan: node test-firebase.js

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Firebase configuration yang baru
const firebaseConfig = {
  apiKey: "AIzaSyDWzfAqY7eYlmKp6wgxi2qPV7UukKm5zqw",
  authDomain: "hyuuapi.firebaseapp.com",
  projectId: "hyuuapi",
  storageBucket: "hyuuapi.firebasestorage.app",
  messagingSenderId: "1076041033236",
  appId: "1:1076041033236:web:fff5963eabb70cdfd76901",
  measurementId: "G-B8L6HH3T57"
};

console.log('Testing Firebase Configuration...');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialized successfully');
  
  // Initialize Auth
  const auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
  
  console.log('🎉 Firebase configuration is valid!');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}