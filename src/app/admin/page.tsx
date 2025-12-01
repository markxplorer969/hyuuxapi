'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Zap, 
  Server,
  Calendar,
  Mail,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    newUsersThisMonth: 0,
    planCounts: {
      FREE: 0,
      STARTER: 0,
      PROFESSIONAL: 0,
      BUSINESS: 0,
      ENTERPRISE: 0
    },
    activeApiKeys: 0,
    totalApiUsage: 0,
    totalApiLimit: 0,
    usagePercentage: 0,
    systemStatus: 'Healthy',
    responseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    apiTrafficData: [],
    recentUsers: []
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/admin/dashboard-data');
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          console.error('Failed to fetch dashboard data:', result.error);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    
    // Handle different timestamp formats
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      // Firebase Timestamp format
      date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Unknown';
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateFromData = (user: any) => {
    if (!user) return 'Unknown';
    
    // Use createdDate if available, otherwise fall back to createdAt
    const timestamp = user.createdDate || user.createdAt;
    
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    
    // Handle different timestamp formats
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      // Firebase Timestamp format
      date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Unknown';
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'BUSINESS': return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
      case 'PROFESSIONAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'STARTER': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Dashboard Overview</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor your API performance and user activity in real-time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminCount}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.adminCount / stats.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                {stats.systemStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApiUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.usagePercentage.toFixed(1)}% of limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {parseFloat(stats.errorRate) < 0.2 ? 'Excellent' : 'Good'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>API Traffic (Last 7 Days)</CardTitle>
            <CardDescription>
              Daily API request volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.apiTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold">{`${payload[0].name}`}</p>
                          <p className="text-sm">{`${payload[0].requests.toLocaleString()} requests`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="requests" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Plan Distribution</CardTitle>
            <CardDescription>
              Distribution of users across subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.planCounts).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      plan === 'FREE' ? 'bg-gray-500' :
                      plan === 'STARTER' ? 'bg-green-500' :
                      plan === 'PROFESSIONAL' ? 'bg-blue-500' :
                      plan === 'BUSINESS' ? 'bg-amber-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-sm font-medium">{plan}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{count} users</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          plan === 'FREE' ? 'bg-gray-500' :
                          plan === 'STARTER' ? 'bg-green-500' :
                          plan === 'PROFESSIONAL' ? 'bg-blue-500' :
                          plan === 'BUSINESS' ? 'bg-amber-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Real-time system monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Server</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Online
                  </div>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Healthy
                  </div>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Hit Rate</span>
                <span className="text-sm font-medium">{stats.cacheHitRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm font-medium text-green-600">{stats.errorRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>
            Latest user registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-medium text-sm">User</th>
                  <th className="text-left p-3 font-medium text-sm">Email</th>
                  <th className="text-left p-3 font-medium text-sm">Plan</th>
                  <th className="text-left p-3 font-medium text-sm">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="font-medium text-sm">
                          {user.displayName || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getRoleBadgeColor(user.plan || 'FREE')}>
                        {user.plan || 'FREE'}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDateFromData(user)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}