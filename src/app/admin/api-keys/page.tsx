'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Search, RefreshCw, Check, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Mock data for now
    setApiKeys([
      {
        id: 'key1',
        key: 'test-api-key-123',
        userId: 'user1',
        usage: 15,
        limit: 1000,
        isActive: true,
        createdAt: new Date(),
        lastUsed: new Date()
      }
    ]);
    setLoading(false);
  }, []);

  const filteredApiKeys = apiKeys.filter(key => 
    key.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">API Keys Management</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Key
          </Button>
        </div>

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
                placeholder="Search by API key, user ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

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
                  <div key={apiKey.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-blue-500" />
                        <span className="font-mono text-sm">{apiKey.key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleting === apiKey.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      User ID: {apiKey.userId} | Usage: {apiKey.usage}/{apiKey.limit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}