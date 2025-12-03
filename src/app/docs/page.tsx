'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Search, Bot, Download, Image, Sparkles, Code, ArrowRight, Filter } from 'lucide-react';
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

type Category = {
  id: keyof EndpointsData['result'] | 'openai' | 'downloader' | 'random' | 'tools' | 'api';
  name: string;
  icon: React.ReactNode;
  endpoints: Endpoint[];
};

export default function Docs() {
  const [endpointsData, setEndpointsData] = useState<EndpointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [endpointsResponse, metadataResponse] = await Promise.all([
          fetch('/api/endpoints'),
          fetch('/api/metadata'),
        ]);

        if (!endpointsResponse.ok || !metadataResponse.ok) {
          throw new Error('Failed to fetch documentation data');
        }

        const endpointsResult = await endpointsResponse.json();
        await metadataResponse.json(); // metadata belum dipakai

        setEndpointsData(endpointsResult);
      } catch (error) {
        console.error('Error fetching documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'PUT':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'active' || status.toLowerCase() === 'online'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
      : 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
  };

  const getCategories = (): Category[] => {
    if (!endpointsData?.result) return [];

    return [
      {
        id: 'openai',
        name: 'AI Services',
        icon: <Bot className="w-4 h-4" />,
        endpoints: endpointsData.result.openai || [],
      },
      {
        id: 'downloader',
        name: 'Media Downloaders',
        icon: <Download className="w-4 h-4" />,
        endpoints: endpointsData.result.downloader || [],
      },
      {
        id: 'random',
        name: 'Random Content',
        icon: <Image className="w-4 h-4" alt="Random content" />,
        endpoints: endpointsData.result.random || [],
      },
      {
        id: 'tools',
        name: 'Tools',
        icon: <Sparkles className="w-4 h-4" />,
        endpoints: endpointsData.result.tools || [],
      },
      {
        id: 'api',
        name: 'Core API',
        icon: <Code className="w-4 h-4" />,
        endpoints: endpointsData.result.api || [],
      },
    ];
  };

  const getParamLabel = (path: string) => {
    if (!path.includes('?')) return 'None';
    const query = path.split('?')[1];
    const names = query
      .split('&')
      .map((pair) => pair.split('=')[0])
      .filter(Boolean);
    return names.length ? names.join(', ') : 'None';
  };

  const categories = getCategories();

  const filteredCategories = categories
    .map((category) => {
      if (selectedCategory !== 'all' && selectedCategory !== category.id) return null;

      let endpoints = category.endpoints;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const categoryMatches =
          category.name.toLowerCase().includes(term) ||
          String(category.id).toLowerCase().includes(term);

        if (!categoryMatches) {
          endpoints = endpoints.filter(
            (endpoint) =>
              endpoint.name.toLowerCase().includes(term) ||
              endpoint.path.toLowerCase().includes(term),
          );
        }
      }

      if (!endpoints.length) return null;

      return { ...category, endpoints };
    })
    .filter(Boolean) as Category[];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading documentation…</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 pt-20 pb-10 space-y-8">
          {/* Page heading (diturunkan dengan pt-20 di main) */}
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">API Documentation</h1>
            <p className="text-sm text-muted-foreground">
              Browse all REST endpoints and quickly jump into the in-browser tester.
            </p>
          </header>

          {/* Search + category filter */}
          <section className="space-y-4">
            {/* Search bar */}
            <div className="w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category chips (horizontal scroll, mentok kanan) */}
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto pb-1 px-1">
              <Button
                type="button"
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  {category.icon}
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </section>

          {/* Endpoint sections */}
          <section className="space-y-10">
            {filteredCategories.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">No endpoints found</h2>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query or clearing the category filter.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="space-y-3">
                  {/* Category header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                        {category.icon}
                      </div>
                      <h2 className="text-base font-semibold">{category.name}</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.endpoints.length} endpoint
                      {category.endpoints.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead className="bg-muted/60">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            No
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Path
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Parameter
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Method
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Status
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Try
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.endpoints.map((endpoint, index) => (
                          <tr
                            key={`${category.id}-${endpoint.path}-${index}`}
                            className="border-t border-border/70 hover:bg-muted/40"
                          >
                            <td className="px-4 py-2 align-middle text-xs text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                                {endpoint.path}
                              </code>
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <span className="text-xs text-muted-foreground">
                                {getParamLabel(endpoint.path)}
                              </span>
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <Badge
                                className={cn(
                                  getMethodColor(endpoint.method),
                                  'text-[10px] font-semibold',
                                )}
                              >
                                {endpoint.method.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <Badge
                                className={cn(
                                  getStatusColor(endpoint.status),
                                  'text-[10px] font-semibold',
                                )}
                              >
                                {endpoint.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <div className="flex justify-end">
                                <Link
                                  href={`/docs/try?endpoint=${encodeURIComponent(
                                    endpoint.path,
                                  )}&name=${encodeURIComponent(
                                    endpoint.name,
                                  )}&method=${endpoint.method.toUpperCase()}`}
                                >
                                  <Button
                                    type="button"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
