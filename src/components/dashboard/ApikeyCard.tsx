// src/components/dashboard/ApiKeyCard.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Explicitly export as default
export default function ApiKeyCard() {
  const { user, regenerateApiKey } = useAuth();
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);

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
      await regenerateApiKey();
    } catch (error) {
      setRegenerationError('Failed to regenerate API key. Please try again.');
      console.error('Error regenerating API key:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FREE': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'STARTER': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'PROFESSIONAL': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'BUSINESS': return 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200';
      case 'ENTERPRISE': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getUsagePercentage = () => {
    if (!user?.apiKeyLimit || !user?.apiKeyUsage) return 0;
    return Math.round((user.apiKeyUsage / user.apiKeyLimit) * 100);
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          You need to be logged in to view your API key.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Key
          <Badge className={getRoleColor(user.role || 'FREE')}>
            {user.role}
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
              type={apiKeyVisible ? 'text' : 'password'}
              value={user.apiKey || ''}
              readOnly
              className="pr-20"
            />
            <div className="absolute right-0 top-0 h-full flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                className="h-full rounded-l-none"
              >
                {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyApiKey}
                className="h-full rounded-l-none"
              >
                {apiKeyCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Usage</span>
            <span>{user.apiKeyUsage} / {user.apiKeyLimit}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getUsagePercentage()}%` }}></div>
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
          
          {user.role !== 'ENTERPRISE' && (
            <Button variant="outline" asChild>
              <a href="/pricing">Upgrade Plan</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}