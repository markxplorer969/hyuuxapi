'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Activity,
  Clock,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      await logout();
      router.push('/');
    } catch (error: any) {
      setMessage(error.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Mock user statistics
  const userStats = {
    apiCalls: 1234,
    lastLogin: new Date(),
    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    plan: 'Free',
    status: 'Active'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/docs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {userStats.status}
            </Badge>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {user.displayName || 'Anonymous User'}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </CardDescription>
                {user.emailVerified && (
                  <Badge variant="secondary" className="mt-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member since</p>
                      <p className="font-medium">{formatDate(userStats.joinDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Last login</p>
                      <p className="font-medium">{formatDate(userStats.lastLogin)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Current Plan</p>
                      <p className="font-medium">{userStats.plan}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Statistics */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  API Usage Statistics
                </CardTitle>
                <CardDescription>
                  Your API usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {userStats.apiCalls.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total API Calls</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      99.9%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      45ms
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest API requests and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { endpoint: '/api/ai/oss', method: 'GET', status: 'success', time: '2 minutes ago' },
                    { endpoint: '/api/download/facebook', method: 'GET', status: 'success', time: '15 minutes ago' },
                    { endpoint: '/api/random/waifu', method: 'GET', status: 'success', time: '1 hour ago' },
                    { endpoint: '/api/status', method: 'GET', status: 'success', time: '2 hours ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{activity.endpoint}</p>
                          <p className="text-xs text-gray-500">{activity.method}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <User className="w-4 h-4 mr-2" />
                    View API Keys
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Usage Reports
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}