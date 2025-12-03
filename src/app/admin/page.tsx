'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Zap,
  Server,
  Shield,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    newUsersThisMonth: 0,
    systemStatus: 'Healthy',
    totalApiUsage: 0,
    usagePercentage: 0,
    responseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    apiTraffic: [],
    planCounts: {
      FREE: 0,
      STARTER: 0,
      PROFESSIONAL: 0,
      BUSINESS: 0,
      ENTERPRISE: 0,
    },
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/dashboard-data');
        const json = await res.json();
        if (json.success) setStats(json.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="pt-4 space-y-10 animate-pulse">
        <div className="h-6 bg-muted rounded w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-28 bg-muted" />
          ))}
        </div>
        <Card className="h-80 bg-muted" />
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your API performance and user activity in real time.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Admin users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.adminCount}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.adminCount / stats.totalUsers * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">System status</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              {stats.systemStatus}
            </span>
            <p className="text-xs text-muted-foreground mt-2">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">API usage today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApiUsage}</div>
            <p className="text-xs text-muted-foreground">
              {stats.usagePercentage.toFixed(1)}% of limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TRAFFIC CHART */}
      <Card>
        <CardHeader>
          <CardTitle>API Traffic (Last 7 days)</CardTitle>
          <CardDescription>Daily API request activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.apiTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="requests" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SYSTEM HEALTH */}
      <Card>
        <CardHeader>
          <CardTitle>System health</CardTitle>
          <CardDescription>Live system performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Response time</span>
            <span className="font-medium">{stats.responseTime}ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Error rate</span>
            <span className="font-medium">{stats.errorRate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cache hit rate</span>
            <span className="font-medium">{stats.cacheHitRate}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
