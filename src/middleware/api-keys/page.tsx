'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Plus, Trash2, Shield, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [customKeys, setCustomKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch custom API keys
  useEffect(() => {
    // This would be a function to fetch custom keys from Firestore
    // For now, using mock data
    setCustomKeys([
      {
        id: 'custom_1',
        name: 'Production Key',
        key: 'sk_prod_1234567890abcdefghijklmnopqrstuvwxyz',
        role: 'PREMIUM',
        limit: 2500,
        usage: 1250,
        isActive: true,
        createdAt: new Date('2023-01-15')
      }
    ]);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success feedback
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const createCustomKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    try {
      setCreatingKey(true);
      setError(null);
      
      // This would call a function to create a custom key
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNewKeyName('');
    } catch (error) {
      setError('Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  };

  const toggleKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      // This would call a function to update the key status
      console.log(`Toggling key ${keyId} to ${isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Failed to toggle key status:', error);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      // This would call a function to delete the key
      console.log(`Deleting key ${keyId}`);
    } catch (error) {
      console.error('Failed to delete key:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>
            You need to be logged in to view your API keys.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys and track usage across different applications.
        </p>
      </div>

      <Tabs defaultValue="default" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default">Default Key</TabsTrigger>
          <TabsTrigger value="custom">Custom Keys</TabsTrigger>
        </TabsList>
        
        {/* Default Key Tab */}
        <TabsContent value="default" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Default API Key
              </CardTitle>
              <CardDescription>
                This is your primary API key associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="default-key"
                    type="password"
                    value={user.apiKey || ''}
                    readOnly
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.apiKey || '')}
                    className="absolute right-0 top-0 h-full rounded-l-none"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Badge className="mt-1">{user.role}</Badge>
                </div>
                <div>
                  <Label>Daily Usage</Label>
                  <div className="text-sm">
                    {user.apiKeyUsage} / {user.apiKeyLimit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Custom Keys Tab */}
        <TabsContent value="custom" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Custom Key
              </CardTitle>
              <CardDescription>
                Create additional API keys for different applications or environments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production, Development, Testing"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              
              <Button
                onClick={createCustomKey}
                disabled={creatingKey || !newKeyName.trim()}
                className="w-full"
              >
                {creatingKey ? 'Creating...' : 'Create Key'}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Custom Keys
              </CardTitle>
              <CardDescription>
                Manage your custom API keys and their permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't created any custom keys yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {customKeys.map((key) => (
                    <div key={key.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{key.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={key.isActive ? 'default' : 'secondary'}>
                              {key.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{key.role}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyStatus(key.id, !key.isActive)}
                          >
                            {key.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Usage: {key.usage} / {key.limit}</div>
                        <div>Created: {key.createdAt ? key.createdAt.toDate().toLocaleDateString() : 'Unknown'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}