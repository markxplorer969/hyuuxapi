'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Clock, 
  Server, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Wifi,
  WifiOff,
  Monitor,
  Shield,
  Timer
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

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
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'operational':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'error':
      case 'offline':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Activity className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'operational':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error':
      case 'offline':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeBadge = (time: number) => {
    if (time < 100) return { text: 'Fast', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    if (time < 300) return { text: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
    return { text: 'Slow', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-xl text-muted-foreground mb-2">Loading system status...</p>
            <p className="text-sm text-muted-foreground">Fetching real-time metrics</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-24">
          <div className="text-center max-w-md">
            <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Status</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const overallStatus = healthData?.result.overall.status || 'unknown';
  const isHealthy = overallStatus.toLowerCase() === 'healthy' || overallStatus.toLowerCase() === 'operational';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 pt-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              {/* Status Badge */}
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border-2 backdrop-blur-sm",
                isHealthy 
                  ? "bg-green-100/90 border-green-200 dark:bg-green-900/30 dark:border-green-700" 
                  : "bg-red-100/90 border-red-200 dark:bg-red-900/30 dark:border-red-700"
              )}>
                <div className="relative">
                  <Wifi className={cn("w-6 h-6", isHealthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")} />
                  <div className="absolute -top-1 -right-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      isHealthy ? "bg-green-500" : "bg-red-500"
                    )}></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    <span className={cn(
                      "bg-gradient-to-r bg-clip-text text-transparent",
                      isHealthy 
                        ? "from-green-600 to-emerald-600" 
                        : "from-red-600 to-orange-600"
                    )}>
                      System Status
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 capitalize">
                    {overallStatus === 'unknown' ? 'Checking...' : overallStatus}
                  </p>
                </div>
              </div>

              {/* Last Update */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(
                    "flex items-center gap-1",
                    autoRefresh && "text-blue-600 dark:text-blue-400"
                  )}
                >
                  <RefreshCw className={cn("w-4 h-4", autoRefresh && "animate-spin")} />
                  Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Overall Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* System Status */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {getStatusIcon(overallStatus)}
                </div>
                <div className="text-3xl font-bold mb-2 capitalize">{overallStatus}</div>
                <div className="text-sm text-muted-foreground">System Status</div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className={cn("text-3xl font-bold mb-2", getResponseTimeColor(healthData?.result.overall.responseTime || 0))}>
                  {healthData?.result.overall.responseTime || 0}ms
                </div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </CardContent>
            </Card>

            {/* Uptime */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {healthData?.result.system.uptime.human || '0s'}
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {statusData?.result.api.totalEndpoints || 0}
                </div>
                <div className="text-sm text-muted-foreground">API Endpoints</div>
              </CardContent>
            </Card>
          </div>

          {/* Services Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Services Status */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  Services Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthData?.result.services && Object.entries(healthData.result.services).map(([service, data]) => (
                  <div key={service} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        getStatusColor(data.status)
                      )}>
                        {getStatusIcon(data.status)}
                      </div>
                      <div>
                        <div className="font-semibold capitalize text-gray-900 dark:text-white">{service}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {service === 'database' ? 'Database Connection' : 
                           service === 'api' ? 'API Service' : 
                           service === 'cache' ? 'Cache Service' : service}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1">{data.responseTime}ms</div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                      {service === 'cache' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Hit Ratio: {Math.round((data.hitRatio || 0) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Node.js Version</span>
                    <span className="font-medium text-gray-900 dark:text-white">{healthData?.result.system.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Platform</span>
                    <span className="font-medium text-gray-900 dark:text-white">{healthData?.result.system.platform} {healthData?.result.system.arch}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Environment</span>
                    <span className="font-medium text-gray-900 dark:text-white">{healthData?.result.system.environment}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Process ID</span>
                    <span className="font-medium text-gray-900 dark:text-white">{healthData?.result.system.pid}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Memory Usage */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-white" />
                  </div>
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Heap Used</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBytes(statusData?.result.performance.memory.used || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={((statusData?.result.performance.memory.used || 0) / (statusData?.result.performance.memory.total || 1)) * 100} 
                    className="h-3 mb-4"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Heap Total</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBytes(statusData?.result.performance.memory.total || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">External</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBytes(statusData?.result.performance.memory.external || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">RSS</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBytes(statusData?.result.performance.memory.rss || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cache Performance */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">{statusData?.result.performance.cache.hits}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cache Hits</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 mb-1">{statusData?.result.performance.cache.misses}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cache Misses</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Hit Ratio</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round((statusData?.result.performance.cache.hits_ratio || 0) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(statusData?.result.performance.cache.hits_ratio || 0) * 100} 
                    className="h-3 mb-4"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{statusData?.result.performance.cache.keys}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Keys Stored</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{statusData?.result.performance.cache.sets}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Auto-refresh every 30 seconds
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}