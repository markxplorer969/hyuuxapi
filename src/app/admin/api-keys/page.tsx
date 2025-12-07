'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Key, 
  Search, 
  RefreshCw, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit,
  User,
  Calendar,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ApiKey {
  id: string;
  key: string;
  userId: string;
  name: string;
  role: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME';
  limit: number;
  usage: number;
  lastUsed: Date | null;
  lastUsageDate: string | null;
  isActive: boolean;
  createdAt: Date | null;
  custom: boolean;
}

interface CreateKeyForm {
  userId: string;
  name: string;
  role: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME';
}

export default function AdminApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const { user } = useAuth();

  const [createForm, setCreateForm] = useState<CreateKeyForm>({
    userId: '',
    name: '',
    role: 'FREE'
  });

  const [editForm, setEditForm] = useState<Partial<ApiKey>>({});
  const [userData, setUserData] = useState<any>(null);

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      
      if (data.success) {
        setApiKeys(data.data);
      } else {
        setMessage(data.error || 'Failed to fetch API keys');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to fetch API keys');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Create API key
  const createApiKey = async () => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('API key created successfully');
        setMessageType('success');
        setCreateDialogOpen(false);
        setCreateForm({ userId: '', name: '', role: 'FREE' });
        fetchApiKeys();
      } else {
        setMessage(data.error || 'Failed to create API key');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to create API key');
      setMessageType('error');
    }
  };

  // Update API key
  const updateApiKey = async () => {
    if (!editing) return;
    
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editing, ...editForm })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('API key updated successfully');
        setMessageType('success');
        setEditing(null);
        setEditForm({});
        fetchApiKeys();
      } else {
        setMessage(data.error || 'Failed to update API key');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to update API key');
      setMessageType('error');
    }
  };

  // Delete API key
  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    
    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/api-keys?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('API key deleted successfully');
        setMessageType('success');
        fetchApiKeys();
      } else {
        setMessage(data.error || 'Failed to delete API key');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to delete API key');
      setMessageType('error');
    } finally {
      setDeleting(null);
    }
  };

  // Get user info for create form
  useEffect(() => {
    if (user && user.uid) {
      setCreateForm(prev => ({ ...prev, userId: user.uid }));
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const filteredApiKeys = apiKeys.filter(key => 
    key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FREE': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'CHEAP': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'VIP': return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
      case 'VVIP': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      case 'SUPREME': return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-800 dark:to-pink-800 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getUsagePercentage = (usage: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.round((usage / limit) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">API Keys Management</h1>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key for a user with specific role and limits.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">User ID</Label>
                  <Input
                    id="userName"
                    value={createForm.userId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter user ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter key name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={createForm.role} onValueChange={(value) => setCreateForm(prev => ({ ...prev, role: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">FREE (20 requests/day)</SelectItem>
                      <SelectItem value="CHEAP">CHEAP (1,000 requests/day)</SelectItem>
                      <SelectItem value="PREMIUM">PREMIUM (2,500 requests/day)</SelectItem>
                      <SelectItem value="VIP">VIP (5,000 requests/day)</SelectItem>
                      <SelectItem value="VVIP">VVIP (10,000 requests/day)</SelectItem>
                      <SelectItem value="SUPREME">SUPREME (20,000 requests/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createApiKey}>
                    Create Key
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={messageType === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search API Keys
            </CardTitle>
            <CardDescription>
              Search and manage all API keys in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Search by API key, user ID, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys ({filteredApiKeys.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Loading API keys...</p>
              </div>
            ) : filteredApiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  No API keys found matching your search.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-mono text-sm font-mono">{apiKey.key}</div>
                          <div className="text-xs text-gray-500">{apiKey.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className={getRoleColor(apiKey.role)}>
                          {apiKey.role}
                        </Badge>
                        <Badge variant="outline">
                          {apiKey.custom ? 'Custom' : 'Auto-generated'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          User: <span className="font-medium">{apiKey.userId}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Created: {apiKey.createdAt ? (typeof apiKey.createdAt === 'string' ? new Date(apiKey.createdAt).toLocaleDateString() : apiKey.createdAt.toDate().toLocaleDateString()) : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Last Used: {apiKey.lastUsed ? (typeof apiKey.lastUsed === 'string' ? new Date(apiKey.lastUsed).toLocaleDateString() : apiKey.lastUsed.toDate().toLocaleDateString()) : 'Never'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Usage: </span>
                          <span className="font-medium">{apiKey.usage}</span>
                          <span className="text-gray-600 dark:text-gray-400"> / </span>
                          <span className="font-medium">{apiKey.limit}</span>
                        </div>
                        <div className="w-32">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getUsagePercentage(apiKey.usage, apiKey.limit)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-gray-500">
                        {apiKey.lastUsageDate && (
                          <span>Last reset: {(typeof apiKey.lastUsageDate === 'string' ? new Date(apiKey.lastUsageDate) : apiKey.lastUsageDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(apiKey.id);
                            setEditForm(apiKey);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleting === apiKey.id}
                          onClick={() => deleteApiKey(apiKey.id)}
                        >
                          {deleting === apiKey.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit API Key</DialogTitle>
              <DialogDescription>
                Modify the API key settings and limits.
              </DialogDescription>
            </DialogHeader>
            {editForm.id && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editKeyName">Key Name</Label>
                  <Input
                    id="editKeyName"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role</Label>
                  <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">FREE (20 requests/day)</SelectItem>
                      <SelectItem value="CHEAP">CHEAP (1,000 requests/day)</SelectItem>
                      <SelectItem value="PREMIUM">PREMIUM (2,500 requests/day)</SelectItem>
                      <SelectItem value="VIP">VIP (5,000 requests/day)</SelectItem>
                      <SelectItem value="VVIP">VVIP (10,000 requests/day)</SelectItem>
                      <SelectItem value="SUPREME">SUPREME (20,000 requests/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLimit">Custom Limit (Optional)</Label>
                  <Input
                    id="editLimit"
                    type="number"
                    value={editForm.limit || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, limit: parseInt(e.target.value) || undefined }))}
                    placeholder="Leave empty to use role default"
                  />
                </div>
                <div className="flex items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="editActive">Status</Label>
                    <Select value={editForm.isActive?.toString() || 'true'} onValueChange={(value) => setEditForm(prev => ({ ...prev, isActive: value === 'true' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button onClick={updateApiKey}>
                    Update Key
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}