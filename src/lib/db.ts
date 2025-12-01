// Database configuration using Firebase Firestore
import { db } from './firebase';

// Export Firestore database instance
export { db };

// Helper functions for common Firestore operations
export const collections = {
  users: 'users',
  apiKeys: 'apiKeys',
  posts: 'posts',
  cache: 'cache',
  analytics: 'analytics',
  subscriptions: 'subscriptions'
};

// Database is now fully managed through Firebase Firestore
// No Prisma client needed anymore