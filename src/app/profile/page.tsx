'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  CheckCircle,
  Key,
  RefreshCw,
  Crown,
  Sparkles,
  Package,
  Check,
  Copy,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Save,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLANS, getPlanById } from '@/lib/plans';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  
  // API Key states
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  
  // Custom API Key states
  const [customApiKey, setCustomApiKey] = useState('');
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const [keyValidationMessage, setKeyValidationMessage] = useState('');
  const [keyAvailable, setKeyAvailable] = useState<boolean | null>(null);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  
  const { user, logout, getDailyUsage, regenerateApiKey: regenerateApiKeyFromContext } = useAuth();
  const router = useRouter();

  // Create userStats object from user data
  const userStats = {
    status: user ? 'Active' : 'Inactive',
    joinDate: user ? new Date() : new Date(), // You might want to store this in user profile
    lastLogin: user ? new Date() : new Date() // You might want to track this in user profile
  };

  // Get plan information function
  const getPlanInfo = (planId: string) => {
    const plan = getPlanById(planId);
    if (!plan) {
      // Return default plan info if not found
      return {
        price: 0,
        features: ['Basic features']
      };
    }
    return {
      price: plan.price,
      features: plan.features
    };
  };

  // Fetch daily usage when user is loaded
  useEffect(() => {
    if (user && user.uid) {
      const fetchUsage = async () => {
        try {
          setUsageLoading(true);
          const usageData = await getDailyUsage();
          if (usageData) {
            console.log('Daily usage fetched:', usageData);
          }
        } catch (error) {
          console.error('Failed to fetch daily usage:', error);
          // Don't show error to user, just log it
        } finally {
          setUsageLoading(false);
        }
      };
      
      fetchUsage();
    }
  }, [user, getDailyUsage]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial online status
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
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v1m0 2v6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2-2h-6a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v3a6 6 0 00-6 6h6a6 6 0 006-6v-3" />
              </svg>
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

  // Show auth error state
  if (authError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v1m0 2v6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2-2h-6a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v3a6 6 0 00-6 6h6a6 6 0 006-6v-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h2>
            <p className="text-muted-foreground mb-6">
              {authError}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setAuthError(null)} variant="outline">
                Dismiss
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    try {
      setPasswordResetLoading(true);
      setMessage('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswords(false);
      setMessage('Password reset successfully!');
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleUpgradePlan = () => {
    router.push('/pricing');
  };

  const handleRefreshUsage = async () => {
    if (!user || !user.uid) return;
    
    try {
      setUsageLoading(true);
      const usageData = await getDailyUsage();
      if (usageData) {
        console.log('Daily usage refreshed:', usageData);
        setMessage('Usage data refreshed successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to refresh daily usage:', error);
      setMessage('Failed to refresh usage data.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUsageLoading(false);
    }
  };

  // API Key functions (moved from separate component)
  const copyApiKey = async () => {
    if (!user?.apiKey) return;
    
    try {
      await navigator.clipboard.writeText(user.apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRegenerateKey = async () => {
    if (!user) return;
    
    try {
      setRegenerating(true);
      setRegenerationError(null);
      await regenerateApiKeyFromContext();
      // Show success message
      setMessage('API key regenerated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh usage data after successful regeneration
      setTimeout(async () => {
        try {
          setUsageLoading(true);
          await getDailyUsage();
        } catch (error) {
          console.error('Failed to refresh usage after regeneration:', error);
        } finally {
          setUsageLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      setRegenerationError('Failed to regenerate API key. Please try again.');
      console.error('Error regenerating API key:', error);
    } finally {
      setRegenerating(false);
    }
  };

  // Custom API Key functions
  const checkApiKeyAvailability = async (key: string) => {
    if (!user || !user.uid) return;
    
    try {
      setIsCheckingKey(true);
      setKeyValidationMessage('');
      setKeyAvailable(null);
      
      const response = await fetch('/api/check-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          apiKey: key
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setKeyValidationMessage(data.error || 'Failed to check API key');
        setKeyAvailable(false);
        return;
      }

      if (data.isSameAsCurrent) {
        setKeyValidationMessage(data.message);
        setKeyAvailable(true);
      } else if (data.available) {
        setKeyValidationMessage(data.message);
        setKeyAvailable(true);
      } else {
        setKeyValidationMessage(data.message);
        setKeyAvailable(false);
      }
    } catch (error) {
      console.error('Error checking API key:', error);
      setKeyValidationMessage('Failed to check API key availability');
      setKeyAvailable(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleCustomApiKeyChange = (value: string) => {
    setCustomApiKey(value);
    setKeyValidationMessage('');
    setKeyAvailable(null);
  };

  const handleUpdateApiKey = async () => {
    if (!user || !user.uid || !customApiKey.trim()) return;
    
    try {
      setIsUpdatingKey(true);
      setKeyValidationMessage('');
      
      const response = await fetch('/api/update-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          apiKey: customApiKey.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setKeyValidationMessage(data.error || 'Failed to update API key');
        return;
      }

      // Update user state with new API key
      setUser(prev => prev ? {
        ...prev,
        apiKey: data.data.newKey
      } : null);
      
      // Show success message
      setMessage('API key updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Reset form
      setCustomApiKey('');
      setKeyValidationMessage('');
      setKeyAvailable(null);
      
    } catch (error) {
      console.error('Error updating API key:', error);
      setKeyValidationMessage('Failed to update API key. Please try again.');
    } finally {
      setIsUpdatingKey(false);
    }
  };

  const isPremiumUser = () => {
    const plan = user?.plan || 'FREE';
    return ['CHEAP', 'PREMIUM', 'VIP', 'VVIP', 'SUPREME'].includes(plan);
  };

  const getRoleColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'CHEAP': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'VIP': return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
      case 'VVIP': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      case 'SUPREME': return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-800 dark:to-pink-800 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getUsagePercentage = () => {
    const usage = user?.apiKeyUsage || 0;
    const limit = user?.apiKeyLimit || 20;
    if (limit === 0) return 0;
    return Math.round((usage / limit) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Add padding-top to account for fixed navbar */}
      <div className="pt-8">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Connection Status Indicator */}
        {!isOnline && (
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <AlertDescription className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v1m0 2v6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2-2h-6a2 2 0 01-2 2z" />
              </svg>
              <span>You appear to be offline. Some features may not work properly.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Header with adjusted top margin */}
        <div className="flex items-center justify-between mb-8 mt-6">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              My Plan
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
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
                  {user.email && (
                    <Badge variant="secondary" className="mt-2">
                      <Shield className="w-3 h-3 mr-1" />
                      Email Verified
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
                        <p className="font-medium">{user?.plan || 'FREE'}</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your account password for better security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={passwordResetLoading}
                    >
                      {passwordResetLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Active Sessions</p>
                        <p className="text-sm text-gray-500">Manage your active devices</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">API Keys</p>
                        <p className="text-sm text-gray-500">Manage your API keys</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Key Tab - Now directly included in this file */}
          <TabsContent value="api" className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  API Key
                  <Badge className={getRoleColor(user?.plan || 'FREE')}>
                    {user?.plan || 'FREE'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Your API key is used to authenticate requests to our API.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Key Display */}
                <div className="space-y-2">
                  <Label htmlFor="api-key">Your API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={apiKeyVisible ? "text" : "password"}
                      value={user.apiKey || ''}
                      readOnly
                      className="pr-20"
                    />
                    <div className="absolute right-0 top-0 h-full flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyApiKey}
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        {apiKeyCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  {user.apiKey && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Key ID: {user.apiKeyId || 'Unknown'}
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Usage</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {usageLoading ? (
                          <div className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          `${user.apiKeyUsage || 0} / ${user.apiKeyLimit || 20}`
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshUsage}
                        disabled={usageLoading}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className={`w-3 h-3 ${usageLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage() > 80 ? 'bg-red-600' : 
                        getUsagePercentage() > 60 ? 'bg-amber-600' : 'bg-blue-600'
                      }`} 
                      style={{ width: `${getUsagePercentage()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Math.max(0, (user.apiKeyLimit || 20) - (user.apiKeyUsage || 0))} remaining</span>
                    <span>{getUsagePercentage()}% used</span>
                  </div>
                </div>

                {/* Regeneration Error */}
                {regenerationError && (
                  <Alert variant="destructive">
                    <AlertDescription>{regenerationError}</AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegenerateKey}
                    disabled={regenerating}
                    className="flex-1"
                  >
                    {regenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Key
                      </>
                    )}
                  </Button>
                  
                  {(user?.plan || 'FREE') !== 'ENTERPRISE' && (
                    <Button variant="outline" asChild>
                      <a href="/pricing">Upgrade Plan</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom API Key Card - Premium Feature */}
            <Card className="w-full mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-500" />
                    Custom API Key
                  </div>
                  <Badge className={isPremiumUser() ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
                    {isPremiumUser() ? 'Premium' : 'FREE'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Set your own custom API key (Premium users only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPremiumUser() ? (
                  // Premium User - Show customization form
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-api-key">Custom API Key</Label>
                      <Input
                        id="custom-api-key"
                        type="text"
                        placeholder="e.g., my-secret-project-01"
                        value={customApiKey}
                        onChange={(e) => handleCustomApiKeyChange(e.target.value)}
                        disabled={isCheckingKey || isUpdatingKey}
                        className={keyAvailable === false ? 'border-red-500' : keyAvailable === true ? 'border-green-500' : ''}
                      />
                      <div className="text-xs text-gray-500">
                        6-32 characters, letters, numbers, and hyphens only
                      </div>
                    </div>

                    {/* Validation Message */}
                    {keyValidationMessage && (
                      <Alert className={keyAvailable === true ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
                        <AlertDescription className="flex items-center gap-2">
                          {keyAvailable === true ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          {keyValidationMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => checkApiKeyAvailability(customApiKey)}
                        disabled={
                          !customApiKey.trim() || 
                          customApiKey.trim().length < 6 || 
                          customApiKey.trim().length > 32 || 
                          isCheckingKey || 
                          isUpdatingKey
                        }
                        variant="outline"
                        className="flex-1"
                      >
                        {isCheckingKey ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Check Availability
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={handleUpdateApiKey}
                        disabled={
                          !customApiKey.trim() || 
                          customApiKey.trim().length < 6 || 
                          customApiKey.trim().length > 32 || 
                          keyAvailable !== true || 
                          isUpdatingKey
                        }
                        className="flex-1"
                      >
                        {isUpdatingKey ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Free or Inactive User - Show upgrade prompt with plan info
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {user?.plan === 'FREE' ? 'Custom API Key Required' : 'Plan Activation Needed'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                        {user?.plan === 'FREE' 
                          ? 'Your current plan is FREE. Upgrade to PREMIUM or higher to access custom API key feature.'
                          : `Your ${user?.plan} plan is not active. Please activate your plan to access custom API key feature.`
                        }
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                        <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                          <strong>Current Plan:</strong> {user?.plan || 'FREE'}
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Required Plan:</strong> PREMIUM or higher
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Button 
                          size="lg" 
                          onClick={() => router.push('/pricing')}
                          className="w-full"
                        >
                          <Crown className="w-5 h-5 mr-2" />
                          {user?.plan === 'FREE' ? 'Upgrade to Premium' : 'Activate Your Plan'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => router.push('/dashboard')}
                          className="w-full"
                        >
                          Back to Dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Plan Tab */}
          <TabsContent value="plan" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    Your current subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {user?.plan || 'FREE'}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {getPlanInfo(user?.plan || 'FREE').price}/month
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">API Calls Remaining</span>
                      <span className="font-medium">{Math.max(0, (user?.apiKeyLimit || 20) - (user?.apiKeyUsage || 0))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Plan Expires</span>
                      <span className="font-medium">Never</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Auto Renew</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium mb-3">Plan Features</h4>
                    <div className="space-y-2">
                      {getPlanInfo(user?.plan || 'FREE').features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={handleUpgradePlan}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Usage Statistics
                  </CardTitle>
                  <CardDescription>
                    Your API usage breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">API Usage This Month</span>
                        <span className="text-sm text-gray-500">12,456 / 100,000</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '12.456%' }}></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Storage Used</span>
                        <span className="text-sm text-gray-500">245 MB / 1 GB</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '24.5%' }}></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Bandwidth Used</span>
                        <span className="text-sm text-gray-500">1.2 GB / 10 GB</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}