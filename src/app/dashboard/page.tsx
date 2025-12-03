'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Activity, 
  Calendar, 
  Clock, 
  Globe, 
  Battery, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Users,
  Heart,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Shield,
  Smartphone,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [pageViews, setPageViews] = useState(0);
  const [todayRequests, setTodayRequests] = useState(0);
  const [todayRequired, setTodayRequired] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userIP, setUserIP] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [batteryCharging, setBatteryCharging] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [checkingApiKey, setCheckingApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { user, logout, getDailyUsage } = useAuth();
  const router = useRouter();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user IP
  useEffect(() => {
    const getUserIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        setUserIP('Unknown');
      }
    };
    getUserIP();
  }, []);

  // Get battery information
  useEffect(() => {
    const getBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          setBatteryCharging(battery.charging);
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
          
          battery.addEventListener('chargingchange', () => {
            setBatteryCharging(battery.charging);
          });
        } catch (error) {
          console.log('Battery API not available');
        }
      }
    };
    getBatteryInfo();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (user && user.uid) {
      const fetchDashboardData = async () => {
        try {
          setIsLoading(true);
          
          // Get daily usage
          const usageData = await getDailyUsage();
          if (usageData) {
            setTodayRequests(usageData.usage || 0);
            setTodayRequired(usageData.limit || 20);
          }

          // Simulate page views (in real app, this would come from analytics)
          setPageViews(Math.floor(Math.random() * 1000) + 100);
          
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDashboardData();
    }
  }, [user, getDailyUsage]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && isOnline) {
      router.push('/login');
    }
  }, [user, router, isOnline]);

  // Show loading state while checking auth
  if (!user && isOnline) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show offline state
  if (!isOnline) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Connection Error</h2>
            <p className="text-muted-foreground mb-6">
              You appear to be offline. Please check your internet connection and try again.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
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

  const handleCheckApiKey = async () => {
    if (!user?.apiKey) return;
    
    try {
      setCheckingApiKey(true);
      const response = await fetch(`/api/status?apikey=${user.apiKey}`);
      if (response.ok) {
        setApiKeyValid(true);
        setMessage('API key is valid!');
      } else {
        setApiKeyValid(false);
        setMessage('API key is invalid or expired');
      }
    } catch (error) {
      setApiKeyValid(false);
      setMessage('Failed to check API key');
    } finally {
      setCheckingApiKey(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getUsagePercentage = () => {
    if (todayRequired === 0) return 0;
    return Math.round((todayRequests / todayRequired) * 100);
  };

  const getBatteryColor = () => {
    if (batteryLevel > 60) return 'text-green-500';
    if (batteryLevel > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Thanks to contributors
  const contributors = [
    { name: 'Slowly API Team', role: 'Core Development' },
    { name: 'Open Source Community', role: 'Contributions' },
    { name: 'Firebase', role: 'Authentication Service' },
    { name: 'Next.js Team', role: 'Framework' },
    { name: 'shadcn/ui', role: 'UI Components' }
  ];

  // Plan information
  const getPlanInfo = (plan: string) => {
    const planInfo = {
      FREE: { name: 'Free', limit: 20, color: 'text-gray-600' },
      CHEAP: { name: 'Cheap', limit: 1000, color: 'text-blue-600' },
      PREMIUM: { name: 'Premium', limit: 2500, color: 'text-purple-600' },
      VIP: { name: 'VIP', limit: 5000, color: 'text-amber-600' },
      VVIP: { name: 'VVIP', limit: 10000, color: 'text-red-600' },
      SUPREME: { name: 'Supreme', limit: 20000, color: 'text-gradient-to-r from-purple-600 to-pink-600' }
    };
    return planInfo[plan as keyof typeof planInfo] || planInfo.FREE;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Add padding-top to account for fixed navbar */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
          
          <div className="flex items-center gap-4">
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-red-500")} />
              {isOnline ? "Online" : "Offline"}
            </Badge>
            
            <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4" />}
              Logout
            </Button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={cn("mb-6", apiKeyValid ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20")}>
            <AlertDescription className="flex items-center gap-2">
              {apiKeyValid ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.displayName || 'User'}!</h1>
          <p className="text-muted-foreground">Here's your dashboard overview</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Page Views */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          {/* Today's Requests */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayRequests}</div>
              <p className="text-xs text-muted-foreground">
                {getUsagePercentage()}% of daily limit
              </p>
              <Progress value={getUsagePercentage()} className="mt-2" />
            </CardContent>
          </Card>

          {/* Today's Required */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Limit</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayRequired}</div>
              <p className="text-xs text-muted-foreground">
                API calls per day
              </p>
            </CardContent>
          </Card>

          {/* Current Time */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
              <p className="text-xs text-muted-foreground">
                {currentTime.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Your IP */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Your IP Address
              </CardTitle>
              <CardDescription>
                Your current public IP address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                {userIP || 'Loading...'}
              </div>
            </CardContent>
          </Card>

          {/* Battery Status */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className={cn("w-5 h-5", getBatteryColor())} />
                Battery Status
              </CardTitle>
              <CardDescription>
                Your device battery information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Battery Level</span>
                  <span className={cn("font-bold", getBatteryColor())}>{batteryLevel}%</span>
                </div>
                <Progress value={batteryLevel} className="h-2" />
                <div className="flex items-center gap-2">
                  {batteryCharging ? (
                    <>
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Charging</span>
                    </>
                  ) : (
                    <>
                      <Battery className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">On Battery</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date & Time
              </CardTitle>
              <CardDescription>
                Current date and full time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-bold">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-2xl font-mono">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentTime.toLocaleTimeString('en-US', { 
                    timeZoneName: 'short' 
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Key Check & User Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Check API Key */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Check API Key
              </CardTitle>
              <CardDescription>
                Validate your current API key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-check">Your API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key-check"
                    type={showApiKey ? "text" : "password"}
                    value={user?.apiKey || ''}
                    readOnly
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckApiKey} 
                disabled={checkingApiKey || !user?.apiKey}
                className="w-full"
              >
                {checkingApiKey ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Check API Key
                  </>
                )}
              </Button>
              
              {apiKeyValid !== null && (
                <div className={cn(
                  "p-3 rounded-lg flex items-center gap-2",
                  apiKeyValid 
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200" 
                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                )}>
                  {apiKeyValid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {apiKeyValid ? 'API Key is Valid' : 'API Key is Invalid'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Contribution */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Contribution
              </CardTitle>
              <CardDescription>
                Your impact on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {todayRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">API Calls Today</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {pageViews}
                  </div>
                  <div className="text-sm text-muted-foreground">Page Views</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Account Type</span>
                  <Badge variant="secondary" className={getPlanInfo(user?.plan || 'FREE').color}>
                    {getPlanInfo(user?.plan || 'FREE').name}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Limit</span>
                  <span className="text-sm font-medium">
                    {getPlanInfo(user?.plan || 'FREE').limit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm font-medium">
                    {user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Email Status</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thanks To Section */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Thanks To
            </CardTitle>
            <CardDescription>
              Special thanks to everyone who made this platform possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {contributor.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{contributor.name}</div>
                    <div className="text-sm text-muted-foreground">{contributor.role}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="font-bold text-lg mb-1">Thank You!</h3>
                <p className="text-sm text-muted-foreground">
                  Your support and contributions help us keep this platform running and improving every day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      </div>
    </div>
  );
}