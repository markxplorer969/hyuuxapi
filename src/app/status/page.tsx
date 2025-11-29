'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Cpu, HardDrive, Zap, Clock, Server, Database, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface StatusData {
  status: boolean;
  result: {
    server: {
      status: string;
      uptime: {
        seconds: number;
        human: string;
      };
      environment: string;
      port: number;
      version: string;
    };
    performance: {
      memory: {
        used: number;
        total: number;
        external: number;
        rss: number;
      };
      cache: {
        hits: number;
        misses: number;
        sets: number;
        deletes: number;
        keys: number;
        hits_ratio: number;
      };
    };
    api: {
      title: string;
      creator: string;
      totalEndpoints: number;
    };
  };
}

interface HealthData {
  status: boolean;
  result: {
    overall: {
      status: string;
      responseTime: number;
      timestamp: string;
      uptime: number;
    };
    system: {
      nodeVersion: string;
      platform: string;
      arch: string;
      environment: string;
      pid: number;
      uptime: {
        seconds: number;
        human: string;
      };
      memory: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
      };
      cpu: {
        user: number;
        system: number;
      };
    };
    services: {
      database: {
        status: string;
        responseTime: number;
      };
      api: {
        status: string;
        responseTime: number;
      };
      cache: {
        status: string;
        responseTime: number;
        keys: number;
        hitRatio: number;
      };
    };
  };
}

export default function Status() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusResponse, healthResponse] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/health')
        ]);

        if (!statusResponse.ok || !healthResponse.ok) {
          throw new Error('Failed to fetch status data');
        }

        const statusResult = await statusResponse.json();
        const healthResult = await healthResponse.json();

        setStatusData(statusResult);
        setHealthData(healthResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status.toLowerCase() === 'healthy' || status.toLowerCase() === 'online' 
      ? 'default' 
      : status.toLowerCase() === 'warning' || status.toLowerCase() === 'degraded'
      ? 'secondary'
      : 'destructive';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (loading) {
    return (
      <>
        <Navbar isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading status...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center pt-16">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">Error loading status</p>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-gray-100' : 'bg-gray-50 text-gray-900'} pt-16 md:pt-20`}>
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Status</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time monitoring and performance metrics</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData?.result.overall.status || 'unknown')}
                {getStatusBadge(healthData?.result.overall.status || 'Unknown')}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Overall Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-6 h-6" />
                Overall System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {healthData?.result.overall.status || 'Unknown'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">System Status</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {healthData?.result.overall.responseTime || 0}ms
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {healthData?.result.system.uptime.human || '0s'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {statusData?.result.api.totalEndpoints || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">API Endpoints</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Services Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthData?.result.services && Object.entries(healthData.result.services).map(([service, data]) => (
                  <div key={service} className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} rounded-lg`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(data.status)}
                      <span className="font-medium capitalize">{service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {data.responseTime}ms
                      </span>
                      {getStatusBadge(data.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-6 h-6" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Node.js Version</span>
                  <span className="font-medium">{healthData?.result.system.nodeVersion}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform</span>
                  <span className="font-medium">{healthData?.result.system.platform} {healthData?.result.system.arch}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Environment</span>
                  <span className="font-medium">{healthData?.result.system.environment}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Process ID</span>
                  <span className="font-medium">{healthData?.result.system.pid}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-6 h-6" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Heap Used</span>
                      <span className="text-sm font-medium">{statusData?.result.performance.memory.used} MB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${((statusData?.result.performance.memory.used || 0) / (statusData?.result.performance.memory.total || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Heap Total</span>
                      <span className="text-sm font-medium">{statusData?.result.performance.memory.total} MB</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">External</span>
                      <span className="text-sm font-medium">{statusData?.result.performance.memory.external} MB</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">RSS</span>
                      <span className="text-sm font-medium">{statusData?.result.performance.memory.rss} MB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`text-center p-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} rounded-lg`}>
                      <div className="text-2xl font-bold text-green-600">{statusData?.result.performance.cache.hits}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cache Hits</p>
                    </div>
                    <div className={`text-center p-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} rounded-lg`}>
                      <div className="text-2xl font-bold text-red-600">{statusData?.result.performance.cache.misses}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cache Misses</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hit Ratio</span>
                      <span className="text-sm font-medium">{Math.round((statusData?.result.performance.cache.hits_ratio || 0) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(statusData?.result.performance.cache.hits_ratio || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`text-center p-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} rounded-lg`}>
                      <div className="text-2xl font-bold text-blue-600">{statusData?.result.performance.cache.keys}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Keys Stored</p>
                    </div>
                    <div className={`text-center p-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} rounded-lg`}>
                      <div className="text-2xl font-bold text-purple-600">{statusData?.result.performance.cache.sets}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Last updated: {new Date(healthData?.result.overall.timestamp || Date.now()).toLocaleString()}</p>
            <p className="mt-1">Auto-refresh every 30 seconds</p>
          </div>
        </div>
      </div>
    </>
  );
}