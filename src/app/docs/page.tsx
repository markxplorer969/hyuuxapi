'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Book, Code, Zap, Download, Image, Bot, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Endpoint {
  name: string;
  desc: string;
  method: string;
  status: string;
  path: string;
}

interface EndpointsData {
  status: boolean;
  result: {
    openai: Endpoint[];
    downloader: Endpoint[];
    random: Endpoint[];
    tools: Endpoint[];
    api: Endpoint[];
  };
}

export default function Docs() {
  const [endpointsData, setEndpointsData] = useState<EndpointsData | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [endpointsResponse, metadataResponse] = await Promise.all([
          fetch('/api/endpoints'),
          fetch('/api/metadata')
        ]);

        if (!endpointsResponse.ok || !metadataResponse.ok) {
          throw new Error('Failed to fetch documentation data');
        }

        const endpointsResult = await endpointsResponse.json();
        const metadataResult = await metadataResponse.json();

        setEndpointsData(endpointsResult);
        setMetadata(metadataResult.result);
      } catch (error) {
        console.error('Error fetching documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(text);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-secondary text-secondary-foreground';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'openai':
        return <Bot className="w-5 h-5" aria-hidden="true" />;
      case 'downloader':
        return <Download className="w-5 h-5" aria-hidden="true" />;
      case 'random':
        return <Image className="w-5 h-5" aria-hidden="true" />;
      case 'tools':
        return <Sparkles className="w-5 h-5" aria-hidden="true" />;
      case 'api':
        return <Code className="w-5 h-5" aria-hidden="true" />;
      default:
        return <Zap className="w-5 h-5" aria-hidden="true" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documentation...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground pt-16 md:pt-20">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">API Documentation</h1>
                <p className="text-muted-foreground mt-1">Complete guide for {metadata?.apititle || 'API Service'}</p>
              </div>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>

          <div className="container mx-auto px-4 py-8">
            {/* API Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-6 h-6" />
                  API Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="bg-secondary px-3 py-2 rounded text-sm">
                      {baseUrl}
                    </code>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">API Version</h3>
                    <Badge variant="secondary">v2.1.0</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Creator</h3>
                    <span className="text-muted-foreground">{metadata?.creator || 'Unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Example */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Example Request</h3>
                    <div className="relative">
                      <pre className="bg-foreground text-background p-4 rounded-lg overflow-x-auto">
                        <code>{`// Get API metadata
fetch('${baseUrl}/api/metadata')
  .then(response => response.json())
  .then(data => console.log(data));

// Get random waifu image
fetch('${baseUrl}/api/random/waifu')
  .then(response => response.blob())
  .then(blob => {
    // Handle image blob
  });`}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(baseUrl)}
                      >
                        {copiedEndpoint === baseUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endpoints by Category */}
            <Tabs defaultValue="openai" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="openai" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI
                </TabsTrigger>
                <TabsTrigger value="downloader" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Downloader
                </TabsTrigger>
                <TabsTrigger value="random" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Random
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tools
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  API
                </TabsTrigger>
              </TabsList>

              {endpointsData?.result && Object.entries(endpointsData.result).map(([category, endpoints]) => (
                <TabsContent key={category} value={category}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        {getCategoryIcon(category)}
                        {category === 'openai' ? 'AI Services' : 
                         category === 'downloader' ? 'Media Downloaders' :
                         category === 'random' ? 'Random Content' :
                         category === 'tools' ? 'Tools' : 'API Endpoints'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {endpoints.map((endpoint, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Badge className={getMethodColor(endpoint.method)}>
                                  {endpoint.method}
                                </Badge>
                                <h3 className="font-semibold">{endpoint.name}</h3>
                                <Badge className={getStatusColor(endpoint.status)}>
                                  {endpoint.status}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`)}
                              >
                                {copiedEndpoint === `${baseUrl}${endpoint.path}` ? 
                                  <Check className="w-4 h-4" /> : 
                                  <Copy className="w-4 h-4" />
                                }
                              </Button>
                            </div>
                            <p className="text-muted-foreground mb-3">{endpoint.desc}</p>
                            <div className="bg-secondary p-3 rounded">
                              <code className="text-sm">{`${baseUrl}${endpoint.path}`}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Rate Limits */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Free Tier</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 30 requests per minute</li>
                      <li>• Standard response time</li>
                      <li>• All endpoints available</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Response Format</h3>
                    <div className="bg-secondary p-3 rounded">
                      <pre className="text-sm">{`{
  "status": true,
  "creator": "${metadata?.creator || 'API Creator'}",
  "result": "Response data here"
}`}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}