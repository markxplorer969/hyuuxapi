#!/bin/bash

# Deploy Firebase Security Rules
echo "🔥 Deploying Firebase Security Rules..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Deploy only security rules
firebase deploy --only firestore:rules

echo "✅ Firebase Security Rules deployed successfully!"