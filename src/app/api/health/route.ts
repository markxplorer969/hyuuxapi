import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getStats } from '@/lib/cache';

export async function GET() {
  try {
    const startTime = Date.now();
    const cacheStats = getStats();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Database health check (if available)
    let dbHealth = { status: 'Not configured', responseTime: 0 };
    
    // External service checks (placeholder)
    const externalChecks = {
      api: { status: 'Healthy', responseTime: Date.now() - startTime },
      cache: { 
        status: cacheStats.keys > 0 ? 'Healthy' : 'Warning', 
        responseTime: 0,
        keys: cacheStats.keys,
        hitRatio: Math.round(cacheStats.hits_ratio * 100)
      }
    };
    
    const overallHealth = {
      status: 'Healthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime)
    };
    
    return NextResponse.json({
      status: true,
      result: {
        overall: overallHealth,
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          environment: config.nodeEnv,
          pid: process.pid,
          uptime: {
            seconds: Math.floor(uptime),
            human: formatUptime(uptime)
          },
          memory: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
            external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
            rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          }
        },
        services: {
          database: dbHealth,
          ...externalChecks
        },
        metrics: {
          cache: cacheStats,
          requests: {
            total: global.reqTotal || 0
          }
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
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