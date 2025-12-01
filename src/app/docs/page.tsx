'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Zap, Bot, Download, Image, Sparkles, Code, ArrowRight, Terminal, Rocket, Shield, Book, Grid3X3, Layers, CheckCircle, Package, Github, MessageCircle } from 'lucide-react';
import Link from 'next/link';
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
  const totalEndpoints = endpointsData?.result ? Object.values(endpointsData.result).reduce((acc, endpoints) => acc + endpoints.length, 0) : 0;
  const totalCategories = endpointsData?.result ? Object.keys(endpointsData.result).length : 0;
  const activeEndpoints = endpointsData?.result ? Object.values(endpointsData.result).reduce((acc, endpoints) => 
    acc + endpoints.filter(e => e.status.toLowerCase() === 'active').length, 0) : 0;

  const categories = [
    { id: 'openai', name: 'AI Services', icon: <Bot className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', description: 'AI-powered endpoints for various tasks' },
    { id: 'downloader', name: 'Media Downloaders', icon: <Download className="w-5 h-5" />, color: 'from-green-500 to-green-600', description: 'Download media from various platforms' },
    { id: 'random', name: 'Random Content', icon: <Image className="w-5 h-5" />, color: 'from-purple-500 to-purple-600', description: 'Generate random content and images' },
    { id: 'tools', name: 'Tools', icon: <Sparkles className="w-5 h-5" />, color: 'from-pink-500 to-pink-600', description: 'Utility tools for various tasks' },
    { id: 'api', name: 'API Endpoints', icon: <Code className="w-5 h-5" />, color: 'from-orange-500 to-orange-600', description: 'Core API functionality endpoints' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Background Grid Pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
        
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pt-24">
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
                  About Slowly APIs
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Complete interactive guide for <span className="font-semibold text-blue-600 dark:text-blue-400">{metadata?.apititle || 'API Service'}</span>
              </p>

              {/* Connect Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  asChild
                >
                  <a href="https://wa.me/6285123456" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                    Connect on WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  asChild
                >
                  <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="container mx-auto px-4 py-12">
          <Card className="mb-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Book className="w-5 h-5 text-white" />
                </div>
                About Slowly APIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Welcome to the interactive API documentation for Slowly APIs. 
                  This API provides a comprehensive set of endpoints for various functionalities including AI services, 
                  media downloaders, random content generators, utility tools, and more.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our API is designed to be developer-friendly with clear documentation, consistent response formats, 
                  and interactive testing capabilities. You can explore different categories of endpoints and test them 
                  directly from this documentation interface.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Created by <span className="font-semibold">{metadata?.creator || 'API Creator'}</span>, 
                  this API service aims to provide reliable and efficient endpoints for your applications.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalEndpoints}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Endpoints</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalCategories}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{activeEndpoints}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">API Status</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">v2.1.0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Version</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                API Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const categoryEndpoints = endpointsData?.result[category.id as keyof typeof endpointsData.result] || [];
                  
                  return (
                    <Link href={`/docs/category/${category.id}`} key={category.id}>
                      <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0 bg-white dark:bg-gray-800">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}>
                              {category.icon}
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{categoryEndpoints.length} endpoints</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}