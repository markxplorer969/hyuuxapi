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
  Download,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Crown,
  Package,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const router = useRouter();

  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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

  const handleDownloadDLL = async (platform: 'windows' | 'linux' | 'mac') => {
    try {
      setIsLoading(true);
      setMessage('');
      
      // Simulate DLL download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const downloadUrl = `/api/download/dll?platform=${platform}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `slowly-api-${platform}.dll`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage(`DLL for ${platform} downloaded successfully!`);
    } catch (error) {
      setMessage('Failed to download DLL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePlan = () => {
    router.push('/pricing');
  };

  // Mock user data
  const userStats = {
    apiCalls: 1234,
    lastLogin: new Date(),
    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    plan: {
      name: 'Pro',
      price: '$29',
      features: ['100K API calls/month', 'Priority support', 'Advanced features', 'Custom integrations'],
      status: 'Active',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    status: 'Active'
  };

  const recentActivity = [
    { endpoint: '/api/ai/oss', method: 'GET', status: 'success', time: '2 minutes ago', usage: 45 },
    { endpoint: '/api/download/facebook', method: 'GET', status: 'success', time: '15 minutes ago', usage: 120 },
    { endpoint: '/api/random/waifu', method: 'GET', status: 'success', time: '1 hour ago', usage: 78 },
    { endpoint: '/api/status', method: 'GET', status: 'success', time: '2 hours ago', usage: 12 },
    { endpoint: '/api/tools/unblur', method: 'POST', status: 'success', time: '3 hours ago', usage: 234 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              My Plan
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Downloads
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
                        <p className="font-medium">{userStats.plan.name}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentActivity.map((activity, index) => (
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
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          {activity.usage && (
                            <p className="text-xs text-blue-600">{activity.usage}ms</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Reset */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Reset Password
                  </CardTitle>
                  <CardDescription>
                    Change your account password for enhanced security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          required
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
                      {userStats.plan.name}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {userStats.plan.price}/month
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      {userStats.plan.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">API Calls Remaining</span>
                      <span className="font-medium">87,456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Plan Expires</span>
                      <span className="font-medium">{formatDate(userStats.plan.expires)}</span>
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
                      {userStats.plan.features.map((feature, index) => (
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

              {/* Billing History */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing History
                  </CardTitle>
                  <CardDescription>
                    Your recent transactions and payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: '2024-01-15', amount: '$29.00', status: 'Paid', plan: 'Pro Plan' },
                      { date: '2023-12-15', amount: '$29.00', status: 'Paid', plan: 'Pro Plan' },
                      { date: '2023-11-15', amount: '$29.00', status: 'Paid', plan: 'Pro Plan' },
                      { date: '2023-10-15', amount: '$29.00', status: 'Paid', plan: 'Pro Plan' }
                    ].map((bill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <p className="font-medium">{bill.date}</p>
                          <p className="text-sm text-gray-500">{bill.plan}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{bill.amount}</p>
                          <Badge variant={bill.status === 'Paid' ? 'default' : 'secondary'}>
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  DLL Downloads
                </CardTitle>
                <CardDescription>
                  Download Slowly API DLL files for different platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    DLL files are for advanced integration with native applications. Please ensure you download the correct version for your platform.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-3"
                    onClick={() => handleDownloadDLL('windows')}
                    disabled={isLoading}
                  >
                    <Monitor className="w-8 h-8" />
                    <div className="text-center">
                      <p className="font-medium">Windows DLL</p>
                      <p className="text-xs text-gray-500">x64 Architecture</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-3"
                    onClick={() => handleDownloadDLL('linux')}
                    disabled={isLoading}
                  >
                    <Package className="w-8 h-8" />
                    <div className="text-center">
                      <p className="font-medium">Linux Library</p>
                      <p className="text-xs text-gray-500">.so file</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-3"
                    onClick={() => handleDownloadDLL('mac')}
                    disabled={isLoading}
                  >
                    <FileText className="w-8 h-8" />
                    <div className="text-center">
                      <p className="font-medium">macOS Library</p>
                      <p className="text-xs text-gray-500">.dylib file</p>
                    </div>
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-medium">Installation Instructions</h4>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <p className="font-medium">1. Windows:</p>
                      <p>Extract the DLL file and place it in your application directory.</p>
                    </div>
                    <div>
                      <p className="font-medium">2. Linux:</p>
                      <p>Copy the .so file to /usr/local/lib/ and run ldconfig.</p>
                    </div>
                    <div>
                      <p className="font-medium">3. macOS:</p>
                      <p>Place the .dylib file in your project's Frameworks directory.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Need Help?</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Check our documentation for detailed integration guides and API references.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/docs')}
                  >
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}