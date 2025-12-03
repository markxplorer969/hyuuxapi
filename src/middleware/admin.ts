import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    try {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
      }

      // Verify Firebase token
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);
      
      if (!decodedToken) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Check if user is admin in Firestore
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', decodedToken.uid));
      const userData = userDoc.data();

      if (!userData || userData.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      // Add user info to request headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', decodedToken.uid);
      response.headers.set('x-user-email', decodedToken.email || '');
      response.headers.set('x-user-role', userData.role || 'user');
      
      return response;
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  }

  return NextResponse.next();
}