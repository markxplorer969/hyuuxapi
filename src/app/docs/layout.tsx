'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Bot, Download, Image, Sparkles, Code, Menu, X, ArrowLeft, Home, Grid3X3, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [endpointsData, setEndpointsData] = useState<EndpointsData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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
      }
    };

    fetchData();
  }, []);

  const categories = [
    { id: 'openai', name: 'AI Services', icon: <Bot className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
    { id: 'downloader', name: 'Media Downloaders', icon: <Download className="w-5 h-5" />, color: 'from-green-500 to-green-600' },
    { id: 'random', name: 'Random Content', icon: <Image className="w-5 h-5" />, color: 'from-purple-500 to-purple-600' },
    { id: 'tools', name: 'Tools', icon: <Sparkles className="w-5 h-5" />, color: 'from-pink-500 to-pink-600' },
    { id: 'api', name: 'API Endpoints', icon: <Code className="w-5 h-5" />, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Background Grid Pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
        
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <Link href="/docs" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg text-white">Slowly APIs</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Get Started</h3>
                <div className="space-y-1">
                  <Link href="/docs">
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      pathname === '/docs' ? "bg-blue-900/30 text-blue-400" : "text-gray-300 hover:bg-gray-800"
                    )}>
                      <Home className="w-4 h-4" />
                      <span className="font-medium">Introduction</span>
                    </div>
                  </Link>
                  <Link href="/docs/category">
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      pathname === '/docs/category' ? "bg-blue-900/30 text-blue-400" : "text-gray-300 hover:bg-gray-800"
                    )}>
                      <Grid3X3 className="w-4 h-4" />
                      <span className="font-medium">Categories</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Endpoints</h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const categoryEndpoints = endpointsData?.result[category.id as keyof typeof endpointsData.result] || [];
                    const isActive = pathname.includes(`/docs/category/${category.id}`);
                    
                    return (
                      <Link key={category.id} href={`/docs/category/${category.id}`}>
                        <div className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors",
                          isActive ? "bg-blue-900/30 text-blue-400" : "text-gray-300 hover:bg-gray-800"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                              {category.icon}
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-0">
          {/* Mobile Header */}
          <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}