import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getStats } from '@/lib/cache';

export async function GET() {
  try {
    const cacheStats = getStats();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return NextResponse.json({
      status: true,
      result: {
        server: {
          status: 'Online',
          uptime: {
            seconds: Math.floor(uptime),
            human: formatUptime(uptime)
          },
          environment: config.nodeEnv,
          port: config.port,
          version: '2.1.0'
        },
        performance: {
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
            external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
            rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100
          },
          cache: cacheStats
        },
        api: {
          title: config.apiTitle,
          creator: config.creator,
          totalEndpoints: Object.values(config.endpoints).flat().length
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: false,
      error: 'Failed to fetch status'
    }, { status: 500 });
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}