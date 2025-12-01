// Firebase Admin SDK configuration for server-side operations
import admin from 'firebase-admin';

// Service account configuration
const serviceAccount = {
  type: "service_account",
  project_id: "hyuu-c4343",
  private_key_id: "69eabf6d3a2d94dfef1f7685c32f5d7f84740432",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDhrR9+K5x/OeL5\nUrbvqbubRcz78EIpK8G/V/Lr1yz22eLDfvXYyRNFKz/p6Vb+kbxHPn9hFNZk2tOT\n+oIpH7n9zsHhmRk2LWbs6PUcCUHeLqkn2wCCRVMkuqEGiKYG8dc8BMVKKII2MlIb\n3HnhsVVXZEsQGaeG7HOi9SAl1GyiYUc+UC/JT8zF3+GYNJefBjw7yznJ5UmkQqvE\nvFmEfItBPGU4mDTu1xrG//LgwGk3gbIgFbmm+oLY8yQ522MUk0ybh/hbtx8kdtNj\npZiD4jlFxwD1kTYYlHvoty6wL8r5hS3WkXRQXZcWSFb44Rg7433c/+FarskfpOLa\nJ5lOvr0zAgMBAAECggEAUhmLVXlEK7zBZ/bBepsDF0/jbNxRFW1HxPaX91iGkR9f\nMcPkaINuMUG0tMIg1efq2PhRmt3byUEaq8D8zT0virhHLG1oEJ+fzBxL33E2tz++\nZjN0EfBqePg0UI4x6GDe7oTFyV7HUDQqTtx8srCy3WItNKRAoAMxZl1K3rhS9RdD\nzr2Scz+4SJzK3lkVsO1kRJtgzEYWRk6G66xLj45WFNwoV42wSjwbgdB85XxZ8/ur\nv2VK039hYl+O0bFQASKcIrFPHjMcrsAgWPD0DMWDC6qbHw8ec9+zjg4aO3GAhlda\nvdOvbjs73GjDQqCF4JyFu0oHknCwiiA/6s+1PVGpEQKBgQDzrj6eAft7oaVe+m6g\nh5FVHz4Y5DpAwGMqBZbkZc6BJJGIrLNhQaiNfosJvjp4zEdi9GtBbLOz0ruSNMlh\nDU0ueFKtBb5ELwUeumytK+Bqxlm3bzo7TojJCCgBtVQQAIG+77PpaOoU4E14nYDA\nf5FEyTrljRqolvq3hJlairvbXQKBgQDtFdzblBFBp5lpm4TafLhBkCHIZ1KpENUf\nEXegwg9+4OwWuXv9MBvfJTz7n/cNbXcV6FTee1I+yAQlqp4RuLv6j7nRFeka2PXD\nbJXUaWgBuUiUFqsv7bEq4WaFX+vQtPCcF+i3qIXu1XHHED0Y6PD7Vubnhp+VhPDt\nj8GRtiEBzwKBgCOLz2aNM3odYlowfeK8495e6FgJMtYvOkfu+Mvobe84vmIJj0Eo\nqsW5J98L+MuWQPOWY+7vRGd+3g291YJqxk95DdZfeBnKIh0RZLj+JYZt2LiBaSUt\nl5Z7shpNsS2EZWjM3pm1zC+vaJ2nnBh4g2BdWlIR+0mMfJY4qYYjprOhAoGAIl0H\n3P+yHJ0JPGhhMjXfkwksDFsFfSHGcjFa8H8QNeit74FE+mats4M3OpVt/pE+MHuz\nSWgAfL8K8tavAIyRGnkYiritR8nonUGw2c/JVm6fmW9Lsq+1/SwcavqDOIXxVf6V\nKYGQoBRp4Ft3L5Qb0aI/55D4snhJX3V1rgQC9rsCgYAPO0+ImPZM1sHcXm694L34\n1LSL1JMd7K2UvAINGaX223oAeRyKmpdHCZA8QysmOvssdjjyL2cdgA6+pQ+/+TQe\n1T0CxpSSrd2Z6G+EahXot1RvpzDWU+E2QhbHF/gKfangKqkVPKJIsaNP7qKSNpWU\npbOUOdhoJw3Bz9JQKy2BbQ==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@hyuu-c4343.iam.gserviceaccount.com",
  client_id: "114109803221208736600",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40hyuu-c4343.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "hyuu-c4343"
  });
}

// Export Firestore admin
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

// Export FieldValue for server-side operations
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

// Helper function to get adminDb with fieldValue
export const adminDbWithFieldValue = {
  ...admin.firestore(),
  fieldValue: admin.firestore.FieldValue,
  Timestamp: admin.firestore.Timestamp
};

// Collections names
export const adminCollections = {
  users: 'users',
  apiKeys: 'apiKeys',
  posts: 'posts',
  cache: 'cache',
  analytics: 'analytics',
  subscriptions: 'subscriptions'
};

export default admin;