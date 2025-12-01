import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Get all users
    const usersSnapshot = await adminDb.collection(adminCollections.users).get();
    const users = [];
    
    let totalUsers = 0;
    let adminCount = 0;
    let planCounts = {
      FREE: 0,
      STARTER: 0,
      PROFESSIONAL: 0,
      BUSINESS: 0,
      ENTERPRISE: 0
    };

    let newUsersThisMonth = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      totalUsers++;
      
      // Count admins
      if (userData.role === 'admin') {
        adminCount++;
      }
      
      // Count plans
      const plan = userData.plan || 'FREE';
      if (planCounts[plan] !== undefined) {
        planCounts[plan]++;
      }
      
      // Count new users this month
      if (userData.createdAt) {
        const createdDate = userData.createdAt.toDate();
        if (createdDate > thirtyDaysAgo) {
          newUsersThisMonth++;
        }
      }
      
      // Add to recent users array (sorted by creation date)
      users.push({
        id: doc.id,
        displayName: userData.displayName || 'Unknown User',
        email: userData.email || 'unknown@example.com',
        role: userData.role || 'user',
        plan: userData.plan || 'FREE',
        createdAt: userData.createdAt,
        createdDate: userData.createdAt ? userData.createdAt.toDate() : new Date(),
        apiKeyUsage: userData.apiKeyUsage || 0,
        apiKeyLimit: userData.apiKeyLimit || 20
      });
    });

    // Sort users by creation date (most recent first)
    users.sort((a, b) => {
      const dateA = a.createdDate || new Date(0);
      const dateB = b.createdDate || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    // Get recent 5 users
    const recentUsers = users.slice(0, 5);

    // Get API keys for usage statistics
    const apiKeysSnapshot = await adminDb.collection(adminCollections.apiKeys).get();
    let totalApiUsage = 0;
    let totalApiLimit = 0;
    let activeApiKeys = 0;

    apiKeysSnapshot.forEach((doc) => {
      const apiKeyData = doc.data();
      if (apiKeyData.isActive) {
        activeApiKeys++;
        totalApiUsage += apiKeyData.usage || 0;
        totalApiLimit += apiKeyData.limit || 20;
      }
    });

    // Calculate usage percentage
    const usagePercentage = totalApiLimit > 0 ? (totalApiUsage / totalApiLimit) * 100 : 0;

    // Mock API traffic data (in production, this would come from analytics)
    // Generate realistic data based on current usage
    const today = new Date();
    const apiTrafficData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const baseRequests = 10000 + Math.random() * 20000;
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      apiTrafficData.push({
        name: dayName,
        requests: Math.floor(baseRequests)
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        adminCount,
        newUsersThisMonth,
        planCounts,
        activeApiKeys,
        totalApiUsage,
        totalApiLimit,
        usagePercentage,
        recentUsers,
        apiTrafficData,
        systemStatus: 'Healthy',
        responseTime: Math.floor(50 + Math.random() * 100), // Mock response time
        cacheHitRate: 92 + Math.random() * 7, // Mock cache hit rate
        errorRate: (Math.random() * 0.5).toFixed(2) // Mock error rate
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}