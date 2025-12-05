import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/cache';

export async function GET() {
  try {
    const cacheStats = getStats();
    
    return NextResponse.json({
      status: true,
      result: {
        cache: cacheStats,
        performance: {
          hitRatioPercentage: Math.round(cacheStats.hits_ratio * 100),
          totalRequests: cacheStats.hits + cacheStats.misses,
          efficiency: cacheStats.hits_ratio > 0.7 ? 'Good' : cacheStats.hits_ratio > 0.4 ? 'Fair' : 'Poor'
        },
        memory: {
          used: Math.round(cacheStats.memory.heapUsed / 1024 / 1024 * 100) / 100,
          total: Math.round(cacheStats.memory.heapTotal / 1024 / 1024 * 100) / 100,
          external: Math.round(cacheStats.memory.external / 1024 / 1024 * 100) / 100
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: false,
      error: 'Failed to fetch cache statistics'
    }, { status: 500 });
  }
}