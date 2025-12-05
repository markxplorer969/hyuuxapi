import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, FieldValue } from '@/lib/firebase-admin';

// Mapping old plans to new plans
const planMapping = {
  'FREE': 'FREE',        // FREE stays FREE
  'STARTER': 'CHEAP',    // STARTER -> CHEAP (1000/day)
  'PROFESSIONAL': 'PREMIUM', // PROFESSIONAL -> PREMIUM (2500/day)
  'BUSINESS': 'VIP',      // BUSINESS -> VIP (5000/day)
  'ENTERPRISE': 'VVIP',   // ENTERPRISE -> VVIP (10000/day)
  'CUSTOM': 'SUPREME'     // CUSTOM -> SUPREME (20000/day)
};

// New plan limits
const newPlanLimits = {
  'FREE': 20,
  'CHEAP': 1000,
  'PREMIUM': 2500,
  'VIP': 5000,
  'VVIP': 10000,
  'SUPREME': 20000
};

export async function POST(request: NextRequest) {
  try {
    console.log('Starting plan migration...');
    
    // Get all users
    const usersSnapshot = await adminDb.collection(adminCollections.users).get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No users found to migrate',
        data: {
          totalUsers: 0,
          migratedUsers: 0,
          skippedUsers: 0
        }
      });
    }

    let migratedUsers = 0;
    let skippedUsers = 0;
    const migrationDetails = [];

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const currentPlan = userData.plan || 'FREE';
      
      // Check if user already has a new plan
      if (Object.keys(newPlanLimits).includes(currentPlan)) {
        console.log(`User ${userId} already has new plan: ${currentPlan}`);
        skippedUsers++;
        continue;
      }

      // Map old plan to new plan
      const newPlan = planMapping[currentPlan] || 'FREE';
      const newLimit = newPlanLimits[newPlan];

      console.log(`Migrating user ${userId}: ${currentPlan} -> ${newPlan} (limit: ${newLimit})`);

      // Update user plan
      await adminDb.collection(adminCollections.users).doc(userId).update({
        plan: newPlan,
        apiKeyLimit: newLimit,
        updatedAt: FieldValue.serverTimestamp()
      });

      // Update user's API keys
      const apiKeysSnapshot = await adminDb
        .collection(adminCollections.apiKeys)
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      const batch = adminDb.batch();
      apiKeysSnapshot.forEach((apiKeyDoc) => {
        batch.update(apiKeyDoc.ref, {
          plan: newPlan,
          limit: newLimit,
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      if (!apiKeysSnapshot.empty) {
        await batch.commit();
      }

      migratedUsers++;
      migrationDetails.push({
        userId,
        email: userData.email,
        oldPlan: currentPlan,
        newPlan,
        newLimit,
        apiKeysUpdated: apiKeysSnapshot.size
      });
    }

    console.log(`Migration completed: ${migratedUsers} users migrated, ${skippedUsers} users skipped`);

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedUsers} users to new plan structure`,
      data: {
        totalUsers: usersSnapshot.size,
        migratedUsers,
        skippedUsers,
        migrationDetails
      }
    });

  } catch (error) {
    console.error('Error during plan migration:', error);
    return NextResponse.json(
      { 
        error: 'Failed to migrate user plans',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current plan distribution
    const usersSnapshot = await adminDb.collection(adminCollections.users).get();
    
    const planDistribution = {};
    let totalUsers = 0;

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const plan = userData.plan || 'FREE';
      planDistribution[plan] = (planDistribution[plan] || 0) + 1;
      totalUsers++;
    });

    return NextResponse.json({
      success: true,
      message: 'Current plan distribution',
      data: {
        totalUsers,
        planDistribution,
        newPlanLimits
      }
    });

  } catch (error) {
    console.error('Error getting plan distribution:', error);
    return NextResponse.json(
      { error: 'Failed to get plan distribution' },
      { status: 500 }
    );
  }
}