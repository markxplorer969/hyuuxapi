'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Play, Loader2, AlertCircle, Code, ArrowLeft, Home, Grid3X3, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.category as string;
  
  const [endpointsData, setEndpointsData] = useState<EndpointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);
  const [apiInputs, setApiInputs] = useState<Record<string, string>>({});
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({});
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const [responseTypes, setResponseTypes] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpointsResponse = await fetch('/api/endpoints');

        if (!endpointsResponse.ok) {
          throw new Error('Failed to fetch documentation data');
        }

        const endpointsResult = await endpointsResponse.json();
        setEndpointsData(endpointsResult);
      } catch (error) {
        console.error('Error fetching documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading endpoints...</p>
        </div>
      </div>
    );
  }

  const getCategoryInfo = (id: string) => {
    switch (id) {
      case 'openai':
        return { name: 'AI Services', icon: <Code className="w-5 h-5" /> };
      case 'downloader':
        return { name: 'Media Downloaders', icon: <Code className="w-5 h-5" /> };
      case 'random':
        return { name: 'Random Content', icon: <Code className="w-5 h-5" /> };
      case 'tools':
        return { name: 'Tools', icon: <Code className="w-5 h-5" /> };
      case 'api':
        return { name: 'API Endpoints', icon: <Code className="w-5 h-5" /> };
      default:
        return { name: 'Unknown', icon: <Code className="w-5 h-5" /> };
    }
  };

  const categoryInfo = getCategoryInfo(categoryId);
  const allEndpoints = endpointsData?.result[categoryId as keyof typeof endpointsData.result] || [];
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'POST':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'DELETE':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'active' 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-muted text-muted-foreground';
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCurl(text);
      setTimeout(() => setCopiedCurl(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const extractParameters = (path: string) => {
    const params = [];
    const queryParamMatch = path.match(/\?([^=]+)=/);
    if (queryParamMatch) {
      params.push({
        name: queryParamMatch[1],
        required: true
      });
    }
    return params;
  };

  const generateCurlCommand = (endpoint: Endpoint) => {
    const params = extractParameters(endpoint.path);
    let curlCommand = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path.split('?')[0]}`;
    
    if (params.length > 0) {
      curlCommand += '?"';
      params.forEach(param => {
        const value = apiInputs[endpoint.path]?.[param.name] || '';
        curlCommand += `${param.name}=${encodeURIComponent(value)}`;
      });
      curlCommand += '"';
    } else {
      curlCommand += '"';
    }
    
    return curlCommand;
  };

  const clearTryItOut = (endpointPath: string) => {
    const endpointKey = `${baseUrl}${endpointPath}`;
    setApiInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[endpointPath];
      return newInputs;
    });
    setApiResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[endpointKey];
      return newResponses;
    });
    setApiErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[endpointKey];
      return newErrors;
    });
    setResponseTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[endpointKey];
      return newTypes;
    });
  };

  const executeApiCall = async (endpoint: Endpoint) => {
    const endpointKey = `${baseUrl}${endpoint.path}`;
    
    setApiLoading(prev => ({ ...prev, [endpointKey]: true }));
    setApiErrors(prev => ({ ...prev, [endpointKey]: '' }));
    setApiResponses(prev => ({ ...prev, [endpointKey]: null }));
    setResponseTypes(prev => ({ ...prev, [endpointKey]: '' }));

    try {
      let url = `${baseUrl}${endpoint.path}`;
      
      if (endpoint.path.includes('=')) {
        const params = extractParameters(endpoint.path);
        const baseUrlPath = endpoint.path.split('?')[0];
        const queryParams = new URLSearchParams();
        
        params.forEach(param => {
          const value = apiInputs[endpoint.path]?.[param.name] || '';
          if (value) {
            queryParams.append(param.name, value);
          }
        });
        
        const queryString = queryParams.toString();
        url = `${baseUrl}${baseUrlPath}${queryString ? '?' + queryString : ''}`;
      }

      const response = await fetch(url);
      
      const contentType = response.headers.get('content-type') || '';
      let responseType = 'json';
      let responseData;

      if (contentType.includes('application/json')) {
        responseData = await response.json();
        responseType = 'json';
      } else if (contentType.includes('image/')) {
        responseData = await response.blob();
        responseType = 'image';
      } else if (contentType.includes('text/html')) {
        responseData = await response.text();
        responseType = 'html';
      } else if (contentType.includes('text/')) {
        responseData = await response.text();
        responseType = 'text';
      } else {
        responseData = await response.text();
        responseType = 'raw';
      }
      
      setApiResponses(prev => ({ ...prev, [endpointKey]: responseData }));
      setResponseTypes(prev => ({ ...prev, [endpointKey]: responseType }));
    } catch (error) {
      setApiErrors(prev => ({ 
        ...prev, 
        [endpointKey]: error instanceof Error ? error.message : 'Failed to execute API call' 
      }));
    } finally {
      setApiLoading(prev => ({ ...prev, [endpointKey]: false }));
    }
  };

  const handleInputChange = (endpointPath: string, paramName: string, value: string) => {
    setApiInputs(prev => ({
      ...prev,
      [endpointPath]: {
        ...(prev[endpointPath] || {}),
        [paramName]: value
      }
    }));
  };

  const renderResponse = (response: any, responseType: string) => {
    if (responseType === 'image') {
      const imageUrl = URL.createObjectURL(response);
      return (
        <div className="bg-muted/50 rounded-lg p-4 flex justify-center">
          <img 
            src={imageUrl} 
            alt="API Response" 
            className="max-w-full h-auto rounded-lg max-h-64 object-contain"
          />
        </div>
      );
    }

    if (responseType === 'html' || responseType === 'text' || responseType === 'raw') {
      return (
        <div className="bg-muted/50 rounded-lg p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap break-all">
            {response}
          </pre>
        </div>
      );
    }

    // Default JSON response
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <pre className="text-xs font-mono overflow-x-auto">
          <code>{JSON.stringify(response, null, 2)}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm flex-wrap">
          <Link href="/docs" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/docs/category" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
            <Grid3X3 className="w-4 h-4" />
            Category
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground capitalize">{categoryId}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Link href="/docs/category">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <div className="text-muted-foreground">
                {categoryInfo.icon}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-light text-foreground mb-2 capitalize">{categoryId}</h1>
              <Badge variant="secondary" className="text-xs">{allEndpoints.length} endpoints</Badge>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Interactive documentation for {categoryInfo.name.toLowerCase()} endpoints.
          </p>
        </div>

        {/* Endpoints List */}
        <div className="space-y-3">
          {allEndpoints.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No endpoints found in this category.
                </p>
              </CardContent>
            </Card>
          ) : (
            allEndpoints.map((endpoint, index) => {
              const endpointKey = `${baseUrl}${endpoint.path}`;
              const isExpanded = expandedEndpoints.has(endpoint.path);
              const isLoading = apiLoading[endpointKey];
              const response = apiResponses[endpointKey];
              const error = apiErrors[endpointKey];
              const responseType = responseTypes[endpointKey];
              const params = extractParameters(endpoint.path);
              const curlCommand = generateCurlCommand(endpoint);
              
              return (
                <Card key={index} className="border-border/50 overflow-hidden">
                  {/* Endpoint Header */}
                  <div 
                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => toggleEndpointExpanded(endpoint.path)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn(getMethodColor(endpoint.method), "px-2 py-1 text-xs font-medium")}>
                          {endpoint.method}
                        </Badge>
                        <h3 className="font-medium text-foreground">{endpoint.name}</h3>
                        <Badge className={cn(getStatusColor(endpoint.status), "px-2 py-1 text-xs")}>
                          {endpoint.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(`${baseUrl}${endpoint.path}`);
                          }}
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          {copiedCurl === `${baseUrl}${endpoint.path}` ? 
                            <Check className="w-4 h-4 text-green-600" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEndpointExpanded(endpoint.path);
                          }}
                          className={cn(
                            "h-8 w-8 p-0 hover:bg-muted",
                            isExpanded && "bg-muted"
                          )}
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{endpoint.desc}</p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <code className="text-xs font-mono break-all">{`${baseUrl}${endpoint.path}`}</code>
                    </div>
                  </div>

                  {/* Try It Out Section */}
                  {isExpanded && (
                    <div className="border-t border-border/50 p-4 bg-muted/20">
                      <div className="space-y-4">
                        {/* Parameter Inputs */}
                        {params.length > 0 && (
                          <div className="space-y-3">
                            {params.map((param, paramIndex) => (
                              <div key={paramIndex} className="space-y-2">
                                <Label htmlFor={`${endpoint.path}-${param.name}`} className="text-sm font-medium">
                                  {param.name}
                                  <span className="text-destructive ml-1">*</span>
                                </Label>
                                <Input
                                  id={`${endpoint.path}-${param.name}`}
                                  placeholder={`Enter ${param.name}...`}
                                  value={apiInputs[endpoint.path]?.[param.name] || ''}
                                  onChange={(e) => handleInputChange(endpoint.path, param.name, e.target.value)}
                                  className="w-full"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => executeApiCall(endpoint)}
                            disabled={isLoading}
                            className="flex-1"
                            size="sm"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Executing...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Try It Out
                              </>
                            )}
                          </Button>
                          
                          {(response || error) && (
                            <Button
                              onClick={() => clearTryItOut(endpoint.path)}
                              variant="outline"
                              size="sm"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Response Section */}
                        {(response || error) && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm text-foreground">Response</h4>
                              {response && (
                                <Badge variant="secondary" className="text-xs">
                                  {responseType?.toUpperCase() || 'SUCCESS'}
                                </Badge>
                              )}
                            </div>
                            
                            {error ? (
                              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-destructive mb-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="font-medium text-sm">Error</span>
                                </div>
                                <p className="text-sm text-destructive">{error}</p>
                              </div>
                            ) : response ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">CURL Command</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(curlCommand)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {copiedCurl === curlCommand ? 
                                      <Check className="w-3 h-3 text-green-600" /> : 
                                      <Copy className="w-3 h-3" />
                                    }
                                  </Button>
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                  <pre className="text-xs font-mono break-all">
                                    <code>{curlCommand}</code>
                                  </pre>
                                </div>
                                
                                {renderResponse(response, responseType || 'json')}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}