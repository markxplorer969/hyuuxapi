'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Grid3X3, ChevronRight, Bot, Download, Image, Sparkles, Code } from 'lucide-react';
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

export default function CategoryPage() {
  const [endpointsData, setEndpointsData] = useState<EndpointsData | null>(null);
  const [loading, setLoading] = useState(true);

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
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'openai', name: 'AI Services', icon: <Bot className="w-5 h-5" />, description: 'AI-powered endpoints' },
    { id: 'downloader', name: 'Media Downloaders', icon: <Download className="w-5 h-5" />, description: 'Download media content' },
    { id: 'random', name: 'Random Content', icon: <Image className="w-5 h-5" />, description: 'Generate random content' },
    { id: 'tools', name: 'Tools', icon: <Sparkles className="w-5 h-5" />, description: 'Utility tools' },
    { id: 'api', name: 'API Endpoints', icon: <Code className="w-5 h-5" />, description: 'Core API functions' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
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
          <span className="text-foreground">All Categories</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-foreground mb-2">API Categories</h1>
          <p className="text-muted-foreground">Browse all available API categories</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryEndpoints = endpointsData?.result[category.id as keyof typeof endpointsData.result] || [];
            
            return (
              <Link key={category.id} href={`/docs/category/${category.id}`}>
                <Card className="group hover:shadow-md transition-all duration-200 border border-border/50 bg-card hover:border-border cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors">
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {category.icon}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {categoryEndpoints.length} endpoints
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}