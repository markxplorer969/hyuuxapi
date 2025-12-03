'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Plus, 
  Copy, 
  RefreshCw, 
  Search, 
  Shield, 
  Calendar,
  User,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Download,
  Filter,
  ArrowLeft
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  key: string;
  createdAt: any;
  lastUsed?: any;
  usageCount: number;
  isActive: boolean;
  plan: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
}

export default function AdminApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  // Check admin authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth-check');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        setAuthLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch API keys and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch API keys
        const keysResponse = await fetch('/api/admin/apikeys');
        if (keysResponse.ok) {
          const keysData = await keysResponse.json();
          setApiKeys(keysData.data || []);
        }
        
        // Fetch users for dropdown
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch API keys',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter API keys
  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = !searchTerm || 
      key.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || key.userId === filterUser;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && key.isActive) ||
      (filterStatus === 'inactive' && !key.isActive);
    
    return matchesSearch && matchesUser && matchesStatus;
  });

  // Generate new API key
  const handleGenerateKey = async () => {
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select a user first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Generate new key with sk-slowly- format
      const newKey = `sk-slowly-${crypto.randomUUID().replace(/-/g, '')}`;
      
      const response = await fetch('/api/admin/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          key: newKey,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add new key to local state
        setApiKeys(prev => [{
          id: result.data.id,
          userId: selectedUser.id,
          userEmail: selectedUser.email,
          userName: selectedUser.displayName,
          key: newKey,
          createdAt: new Date(),
          lastUsed: null,
          usageCount: 0,
          isActive: true,
          plan: 'FREE',
        }, ...prev]);

        toast({
          title: 'Success',
          description: `API key generated for ${selectedUser.displayName}`,
        });
        
        setSelectedUser(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate API key');
      }
    } catch (error) {
      console.error('Error generating key:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate API key',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy key to clipboard
  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      
      toast({
        title: 'Copied',
        description: 'API key copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  // Mask API key for display
  const maskApiKey = (key: string) => {
    if (key.startsWith('sk-slowly-')) {
      // New format: sk-slowly-xxxxxxxx
      return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
    } else {
      // Legacy format: any other format
      if (key.length <= 8) {
        return key.substring(0, 4) + '...';
      }
      return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Unknown';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get key type badge
  const getKeyTypeBadge = (key: string) => {
    if (key.startsWith('sk-slowly-')) {
      return { label: 'New', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Legacy', color: 'bg-amber-100 text-amber-800' };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
          <p className="text-lg font-medium">Checking authentication...</p>
          <p className="text-sm text-muted-foreground">Verifying admin access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">API Key Management</h1>
            <p className="text-muted-foreground">
              Generate and manage API keys for all users
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        {/* Generate Key Section */}
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Generate New API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                <Select value={selectedUser?.id || ''} onValueChange={(value) => {
                  const user = users.find(u => u.id === value) || null;
                  setSelectedUser(user);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{user.displayName} ({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Format</label>
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <code className="text-sm">sk-slowly-&lt;random&gt;</code>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateKey}
              disabled={!selectedUser || isGenerating}
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Generate Key
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or key..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">User Filter</label>
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Filter</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5" />
                API Keys ({filteredKeys.length})
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No API keys found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterUser !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Generate your first API key above'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{apiKey.userName}</div>
                              <div className="text-sm text-muted-foreground">{apiKey.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                              {showKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                            >
                              {showKey[apiKey.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getKeyTypeBadge(apiKey.key).color}>
                            {getKeyTypeBadge(apiKey.key).label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={apiKey.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}>
                            {apiKey.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            <div>{apiKey.usageCount} requests</div>
                            <div className="text-muted-foreground">Total usage</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(apiKey.createdAt)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key)}
                              className={copiedKey === apiKey.key ? 'bg-green-100 text-green-800' : ''}
                            >
                              {copiedKey === apiKey.key ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedKey(apiKey);
                                setShowKeyDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

        {/* Key Details Dialog */}
        <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Key className="h-5 w-5" />
                API Key Details
              </DialogTitle>
              <DialogDescription>
                Complete API key information for {selectedKey?.userName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedKey && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">User</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {selectedKey.userName}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {selectedKey.userEmail}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="p-3 bg-muted rounded-lg">
                      <Badge className={selectedKey.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}>
                        {selectedKey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <div className="p-3 bg-muted rounded-lg">
                      <Badge className={getKeyTypeBadge(selectedKey.key).color}>
                        {getKeyTypeBadge(selectedKey.key).label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <div className="relative">
                    <Input
                      value={selectedKey.key}
                      readOnly
                      className="font-mono pr-20"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedKey.key)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {copiedKey === selectedKey.key ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Usage Count</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {selectedKey.usageCount} requests
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {formatDate(selectedKey.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Last Used</label>
                  <div className="p-3 bg-muted rounded-lg">
                    {selectedKey.lastUsed ? formatDate(selectedKey.lastUsed) : 'Never'}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowKeyDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}