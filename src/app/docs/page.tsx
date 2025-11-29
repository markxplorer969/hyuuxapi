'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ExternalLink, Book, Code, Zap, Download, Image, Bot, Sparkles, Play, Loader2, AlertCircle, ChevronRight, Terminal, Rocket, Shield, Clock, ArrowRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

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
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [apiInputs, setApiInputs] = useState<Record<string, string>>({});
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({});
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

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

  const toggleEndpointExpanded = (endpointPath: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(endpointPath)) {
      newExpanded.delete(endpointPath);
    } else {
      newExpanded.add(endpointPath);
    }
    setExpandedEndpoints(newExpanded);
  };

  const executeApiCall = async (endpoint: Endpoint) => {
    const endpointKey = `${baseUrl}${endpoint.path}`;
    
    setApiLoading(prev => ({ ...prev, [endpointKey]: true }));
    setApiErrors(prev => ({ ...prev, [endpointKey]: '' }));
    setApiResponses(prev => ({ ...prev, [endpointKey]: null }));

    try {
      let url = endpointKey;
      
      // Handle parameter substitution for endpoints with query params
      if (endpoint.path.includes('=')) {
        const paramName = endpoint.path.split('=')[0].split('?')[1];
        const paramValue = apiInputs[endpointKey] || '';
        url = `${endpoint.path.split('=')[0]}${encodeURIComponent(paramValue)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setApiResponses(prev => ({ ...prev, [endpointKey]: data }));
    } catch (error) {
      setApiErrors(prev => ({ 
        ...prev, 
        [endpointKey]: error instanceof Error ? error.message : 'Failed to execute API call' 
      }));
    } finally {
      setApiLoading(prev => ({ ...prev, [endpointKey]: false }));
    }
  };

  const handleInputChange = (endpointPath: string, value: string) => {
    const endpointKey = `${baseUrl}${endpointPath}`;
    setApiInputs(prev => ({ ...prev, [endpointKey]: value }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'openai':
        return <Bot className="w-5 h-5" aria-hidden="true" />;
      case 'downloader':
        return <Download className="w-5 h-5" aria-hidden="true" />;
      case 'random':
        return <Image className="w-5 h-5" aria-hidden="true" alt="Random content icon" />;
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
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-24">
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
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pt-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full mb-6">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">Interactive API Documentation</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  API Documentation
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Complete interactive guide for <span className="font-semibold text-blue-600 dark:text-blue-400">{metadata?.apititle || 'API Service'}</span>
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{endpointsData?.result ? Object.values(endpointsData.result).reduce((acc, endpoints) => acc + endpoints.length, 0) : 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Endpoints</div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Rocket className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Real-time</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">API Testing</div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">v2.1.0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">API Version</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Back to Home
                </Button>
                <Button
                  onClick={() => {
                    const element = document.getElementById('endpoints-section');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  size="lg"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ChevronRight className="w-4 h-4" />
                  Explore Endpoints
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8" id="endpoints-section">
          {/* API Info */}
          <Card className="mb-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Book className="w-5 h-5 text-white" />
                </div>
                API Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Base URL
                  </h3>
                  <code className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700 block font-mono">
                    {baseUrl}
                  </code>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    API Version
                  </h3>
                  <Badge variant="secondary" className="text-base px-4 py-2">v2.1.0</Badge>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Creator
                  </h3>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">{metadata?.creator || 'Unknown'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Testing Guide */}
          <Card className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                Interactive API Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    How to Use
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: <Code className="w-4 h-4 text-blue-600" />, text: "Click code icon to expand endpoint details" },
                      { icon: <Terminal className="w-4 h-4 text-green-600" />, text: "Enter parameters in input fields" },
                      { icon: <Play className="w-4 h-4 text-purple-600" />, text: "Click 'Try It Out' to execute API" },
                      { icon: <Copy className="w-4 h-4 text-orange-600" />, text: "Copy responses with one click" }
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">{step.icon}</div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Quick Examples
                  </h3>
                  <div className="space-y-3">
                    {[
                      { 
                        title: "Get API Metadata", 
                        code: `GET /api/metadata`,
                        color: "from-blue-500 to-blue-600"
                      },
                      { 
                        title: "AI Chat", 
                        code: `GET /api/ai/oss?text=Hello`,
                        color: "from-purple-500 to-purple-600"
                      },
                      { 
                        title: "Random Waifu", 
                        code: `GET /api/random/waifu`,
                        color: "from-pink-500 to-pink-600"
                      }
                    ].map((example, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{example.title}</span>
                          <div className={`w-2 h-2 bg-gradient-to-r ${example.color} rounded-full`}></div>
                        </div>
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono block">
                          {example.code}
                        </code>
                      </div>
                    ))}
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
                <Image className="w-4 h-4" alt="Random content" />
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
                <Card className="shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 pb-6">
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {getCategoryIcon(category)}
                      {category === 'openai' ? 'AI Services' : 
                       category === 'downloader' ? 'Media Downloaders' :
                       category === 'random' ? 'Random Content' :
                       category === 'tools' ? 'Tools' : 'API Endpoints'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      {endpoints.map((endpoint, index) => {
                        const endpointKey = `${baseUrl}${endpoint.path}`;
                        const isExpanded = expandedEndpoints.has(endpoint.path);
                        const isLoading = apiLoading[endpointKey];
                        const response = apiResponses[endpointKey];
                        const error = apiErrors[endpointKey];
                        const inputValue = apiInputs[endpointKey] || '';
                        const hasParams = endpoint.path.includes('=');
                        
                        return (
                          <div key={index} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                            {/* Endpoint Header */}
                            <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Badge className={cn(getMethodColor(endpoint.method), "px-3 py-1 text-xs font-semibold")}>
                                    {endpoint.method}
                                  </Badge>
                                  <h3 className="font-bold text-lg">{endpoint.name}</h3>
                                  <Badge className={cn(getStatusColor(endpoint.status), "px-3 py-1 text-xs")}>
                                    {endpoint.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`)}
                                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                  >
                                    {copiedEndpoint === `${baseUrl}${endpoint.path}` ? 
                                      <Check className="w-4 h-4 text-green-600" /> : 
                                      <Copy className="w-4 h-4" />
                                    }
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleEndpointExpanded(endpoint.path)}
                                    className={cn(
                                      "h-8 w-8 p-0 transition-colors",
                                      isExpanded && "bg-blue-100 dark:bg-blue-900/30"
                                    )}
                                  >
                                    <Code className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-4">{endpoint.desc}</p>
                              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                                <code className="text-sm font-mono">{`${baseUrl}${endpoint.path}`}</code>
                              </div>
                            </div>

                            {/* Interactive Try It Out Section */}
                            {isExpanded && (
                              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900/20 p-6">
                                <div className="space-y-4">
                                  {/* Input Section */}
                                  {hasParams && (
                                    <div>
                                      <label className="text-sm font-semibold mb-2 block text-gray-900 dark:text-white">
                                        {endpoint.path.split('?')[1].split('=')[0].charAt(0).toUpperCase() + 
                                         endpoint.path.split('?')[1].split('=')[0].slice(1)} Parameter
                                      </label>
                                      <Input
                                        placeholder={`Enter ${endpoint.path.split('?')[1].split('=')[0]} value here...`}
                                        value={inputValue}
                                        onChange={(e) => handleInputChange(endpoint.path, e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                      />
                                    </div>
                                  )}

                                  {/* Execute Button */}
                                  <Button
                                    onClick={() => executeApiCall(endpoint)}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                                  >
                                    {isLoading ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Executing...
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4" />
                                        Try It Out
                                      </>
                                    )}
                                  </Button>

                                  {/* Response Section */}
                                  {(response || error) && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Response</h4>
                                        {response && (
                                          <Badge variant="secondary" className="text-xs">
                                            {response.status ? 'Success' : 'Error'}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {error ? (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-semibold">Error</span>
                                          </div>
                                          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                        </div>
                                      ) : response ? (
                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                            <span className="font-semibold text-gray-900 dark:text-white">JSON Response</span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                              <Copy className="w-4 h-4" />
                                            </Button>
                                          </div>
                                          <div className="p-4 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                                            <pre className="text-xs font-mono">
                                              <code>{JSON.stringify(response, null, 2)}</code>
                                            </pre>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Rate Limits */}
          <Card className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                Rate Limits & Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Free Tier
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>30 requests per minute</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span>Standard response time</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>All endpoints available</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Response Format
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <pre className="text-xs font-mono overflow-x-auto">
                      <code>{`{
  "status": true,
  "creator": "${metadata?.creator || 'API Creator'}",
  "result": "Response data here"
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}