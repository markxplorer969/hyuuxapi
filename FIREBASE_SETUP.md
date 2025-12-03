# Firebase Configuration Documentation

## 📋 Overview

Firebase telah berhasil dikonfigurasi untuk proyek Slowly API dengan setup berikut:

## 🔥 Firebase Configuration

### Client-side Firebase (`src/lib/firebase.ts`)
- **Project ID**: hyuu-c4343
- **Authentication**: Email/Password dan Google Sign-In
- **Firestore**: Database untuk menyimpan data user, API keys, dan subscriptions
- **Storage**: Untuk file storage (jika dibutuhkan)
- **Analytics**: Untuk tracking dan analytics

### Server-side Firebase Admin (`src/lib/firebase-admin.ts`)
- **Service Account**: Firebase Admin SDK untuk server-side operations
- **Admin Functions**: User management, API key generation, analytics
- **Server Timestamp**: Untuk konsistensi waktu

## 🗄️ Database Structure

### Collections
1. **users**: Data pengguna (email, role, plan, dll)
2. **apiKeys**: API keys untuk setiap user
3. **subscriptions**: Data subscription/pembayaran
4. **cache**: Cache untuk performance
5. **analytics**: Data analytics dan usage

### User Roles
- `user`: Role default untuk pengguna biasa
- `admin**: Role untuk administrator

### Subscription Plans
- `FREE`: 20 API calls/day
- `CHEAP`: 1,000 API calls/day
- `PREMIUM`: 2,500 API calls/day
- `VIP`: 5,000 API calls/day
- `VVIP`: 10,000 API calls/day
- `SUPREME`: 20,000 API calls/day

## 🔐 Security Rules

Firebase Firestore security rules telah dikonfigurasi di `firestore.rules`:

1. **Users**: Hanya bisa read/write data mereka sendiri
2. **API Keys**: Hanya bisa akses API keys milik mereka
3. **Admin Access**: Admin bisa akses semua data
4. **Public Access**: Cache collection bisa diakses publik

## 🚀 Setup Instructions

### 1. Environment Variables
Environment variables sudah diatur di `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hyuu-c4343
# ... dll
```

### 2. Deploy Security Rules
```bash
npm install -g firebase-tools
firebase deploy --only firestore:rules
```

### 3. Create Admin User
```bash
node make-admin.js
```

## 🧪 Testing

Firebase configuration telah diuji dengan:
- ✅ Basic initialization
- ✅ Authentication setup
- ✅ Firestore connection
- ✅ API endpoints functionality
- ✅ User management
- ✅ API key generation

## 📝 Usage Examples

### Authentication
```javascript
import { signInWithGoogle, signInWithEmail } from '@/lib/firebase';

// Google Sign-In
const user = await signInWithGoogle();

// Email Sign-In
const user = await signInWithEmail(email, password);
```

### Firestore Operations
```javascript
import { doc, getDoc, setDoc, collection, query, where } from '@/lib/firebase';

// Read user data
const userDoc = await getDoc(doc(db, 'users', userId));

// Query API keys
const q = query(collection(db, 'apiKeys'), where('userId', '==', userId));
```

## 🔧 Maintenance

### Regular Tasks
1. Monitor Firebase usage di console
2. Update security rules jika dibutuhkan
3. Backup data secara berkala
4. Monitor API usage dan performance

### Troubleshooting
- **Permission Denied**: Check security rules
- **Authentication Failed**: Verify API keys dan configuration
- **Firestore Connection**: Check network dan project settings

## 📊 Current Status

✅ **Firebase Configuration**: Complete and tested  
✅ **Authentication**: Working (Google + Email)  
✅ **Firestore**: Connected and operational  
✅ **Security Rules**: Configured  
✅ **API Endpoints**: All functional  
✅ **User Management**: Working  
✅ **API Key System**: Operational  

## 🎯 Next Steps

1. Deploy security rules ke production
2. Setup monitoring dan analytics
3. Configure backup strategy
4. Setup CI/CD untuk Firebase deployment
5. Add additional security measures jika dibutuhkan