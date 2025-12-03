'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

import {
  Activity,
  RefreshCw,
  Zap,
  Clock,
  Server,
  Database,
  Cpu,
  HardDrive,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export default function StatusPage() {
  const [statusData, setStatusData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, healthRes] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/health'),
        ]);

        const status = await statusRes.json();
        const health = await healthRes.json();

        setStatusData(status);
        setHealthData(health);
        setLastUpdate(new Date());
      } catch (_) {}
      setLoading(false);
    }

    load();

    if (autoRefresh) {
      const id = setInterval(load, 30000);
      return () => clearInterval(id);
    }
  }, [autoRefresh]);

  const overall = healthData?.result?.overall || null;

  const statusColor = (s: string) => {
    s = s?.toLowerCase();
    if (s === 'healthy' || s === 'operational') return "text-green-600";
    if (s === 'warning' || s === 'degraded') return "text-yellow-600";
    if (s === 'error') return "text-red-600";
    return "text-gray-500";
  };

  const statusIcon = (s: string) => {
    s = s?.toLowerCase();
    if (s === 'healthy' || s === 'operational')
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (s === 'warning' || s === 'degraded')
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    if (s === 'error')
      return <XCircle className="w-6 h-6 text-red-500" />;
    return <Activity className="w-6 h-6 text-gray-400" />;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center text-center">
          <div>
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading system status...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        
        {/* Header / Hero */}
        <div className="w-full border-b bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-950 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              
              <div className="flex justify-center mb-4">
                {statusIcon(overall?.status || 'unknown')}
              </div>

              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                System Status
              </h1>

              <p className="text-muted-foreground text-lg capitalize mb-4">
                {overall?.status || 'Unknown'}
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(autoRefresh && "text-blue-600 dark:text-blue-400")}
                >
                  <RefreshCw className={cn("w-4 h-4", autoRefresh && "animate-spin")} />
                  Auto-refresh {autoRefresh ? "ON" : "OFF"}
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 space-y-10">

          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3">{statusIcon(overall?.status || '')}</div>
                <div className={cn("text-3xl font-bold capitalize", statusColor(overall?.status || ''))}>
                  {overall?.status}
                </div>
                <p className="text-sm text-muted-foreground">System Status</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 mx-auto text-blue-500 mb-3" />
                <div className="text-3xl font-bold">
                  {overall?.responseTime}ms
                </div>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto text-purple-500 mb-3" />
                <div className="text-3xl font-bold">
                  {overall?.uptime?.human}
                </div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Server className="w-8 h-8 mx-auto text-orange-500 mb-3" />
                <div className="text-3xl font-bold">
                  {statusData?.result?.api?.totalEndpoints}
                </div>
                <p className="text-sm text-muted-foreground">API Endpoints</p>
              </CardContent>
            </Card>

          </div>

          {/* Services Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" /> Services Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(healthData?.result?.services || {}).map(([key, service]: any) => (
                <div
                  key={key}
                  className="flex justify-between items-center p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(service.status)}
                    <div>
                      <p className="font-medium capitalize">{key}</p>
                      <p className="text-sm text-muted-foreground">
                        Response: {service.responseTime}ms
                      </p>
                    </div>
                  </div>

                  {key === "cache" && (
                    <p className="text-sm text-muted-foreground">
                      Hit Ratio: {Math.round((service.hitRatio || 0) * 100)}%
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Memory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" /> Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Heap Used</span>
                    <span className="font-medium">
                      {statusData?.result?.performance?.memory?.used} MB
                    </span>
                  </div>
                  <Progress value={30} />
                </div>

              </CardContent>
            </Card>

            {/* Cache */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-green-600">
                      {statusData?.result?.performance?.cache?.hits}
                    </p>
                    <p className="text-sm text-muted-foreground">Hits</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-red-600">
                      {statusData?.result?.performance?.cache?.misses}
                    </p>
                    <p className="text-sm text-muted-foreground">Misses</p>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
