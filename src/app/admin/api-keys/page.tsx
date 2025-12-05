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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ArrowLeft,
  Calendar,
  Activity,
  Shield,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  Filter,
  Download,
  Zap,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  keyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  usage: number;
  limit: number;
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
  permissions: string[];
  plan: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  plan: string;
  createdAt: Date;
}

export default function AdminApiKeysPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Form states for creating API key
  const [createForm, setCreateForm] = useState({
    userId: '',
    name: '',
    limit: 20,
    permissions: [] as string[],
    isActive: true
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

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

  // Fetch API keys and users
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  // Filter API keys
  useEffect(() => {
    let filtered = apiKeys;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(key => 
        key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.key.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter(key => key.plan === filterPlan);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(key => 
        filterStatus === 'active' ? key.isActive : !key.isActive
      );
    }

    setFilteredKeys(filtered);
  }, [apiKeys, searchTerm, filterPlan, filterStatus]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch API keys
      const keysResponse = await fetch('/api/admin/api-keys');
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setApiKeys(keysData.result || []);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!createForm.userId || !createForm.name) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        setMessage('API key created successfully!');
        setShowCreateDialog(false);
        setCreateForm({
          userId: '',
          name: '',
          limit: 20,
          permissions: [],
          isActive: true
        });
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create API key');
      }
    } catch (error) {
      setMessage('Failed to create API key');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('API key deleted successfully!');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to delete API key');
      }
    } catch (error) {
      setMessage('Failed to delete API key');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleToggleApiKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setMessage(`API key ${isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update API key');
      }
    } catch (error) {
      setMessage('Failed to update API key');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const copyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'CHEAP': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'VIP': return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
      case 'VVIP': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      case 'SUPREME': return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-800 dark:to-pink-800 dark:text-purple-200';
      case 'ADMIN': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getUsagePercentage = (usage: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.round((usage / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-600';
    if (percentage > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Show loading state
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Add padding-top to account for fixed navbar */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="default" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
            
            <Button variant="outline" onClick={() => fetchData()} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">API Keys Management</h1>
          <p className="text-muted-foreground">Manage all API keys and user access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all users
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.filter(k => k.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredKeys.length}</div>
              <p className="text-xs text-muted-foreground">
                After filters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or API key..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Plan Filter */}
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="CHEAP">Cheap</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="VVIP">VVIP</SelectItem>
                  <SelectItem value="SUPREME">Supreme</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Create API Key Button */}
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Create a new API key for a user
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">User</Label>
                      <Select value={createForm.userId} onValueChange={(value) => setCreateForm({...createForm, userId: value})} disabled={users.length === 0}>
                        <SelectTrigger>
                          <SelectValue placeholder={users.length === 0 ? "Loading users..." : "Select a user"} />
                        </SelectTrigger>
                        <SelectContent>
                          {users.length === 0 ? (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              No users available
                            </div>
                          ) : (
                            users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {user.displayName || user.email}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {user.email} • {user.plan}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">API Key Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Production API Key"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="limit">Daily Limit</Label>
                      <Input
                        id="limit"
                        type="number"
                        placeholder="20"
                        value={createForm.limit}
                        onChange={(e) => setCreateForm({...createForm, limit: parseInt(e.target.value) || 20})}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={createForm.isActive}
                        onCheckedChange={(checked) => setCreateForm({...createForm, isActive: checked as boolean})}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateApiKey}
                        disabled={isLoading || !createForm.userId || !createForm.name}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create API Key
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Table */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys ({filteredKeys.length})
            </CardTitle>
            <CardDescription>
              Complete list of all API keys with user information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No API keys found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterPlan !== 'all' || filterStatus !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Create your first API key to get started'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Key Name</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{apiKey.userName}</div>
                            <div className="text-sm text-gray-500">{apiKey.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                              {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 4)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyApiKey(apiKey.key)}
                              className="h-6 w-6 p-0"
                            >
                              {apiKeyCopied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPlanColor(apiKey.plan)}>
                            {apiKey.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">
                              {apiKey.usage} / {apiKey.limit}
                            </div>
                            <div className={cn("text-xs", getUsageColor(getUsagePercentage(apiKey.usage, apiKey.limit)))}>
                              {getUsagePercentage(apiKey.usage, apiKey.limit)}% used
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                            {apiKey.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(apiKey.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleApiKeyStatus(apiKey.id, !apiKey.isActive)}
                              disabled={isLoading}
                            >
                              {apiKey.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isLoading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the API key "{apiKey.name}"? 
                                    This action cannot be undone and will immediately revoke access.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteApiKey(apiKey.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}