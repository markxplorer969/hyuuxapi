'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center max-w-md">
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you were looking for. Please check the URL or return to the homepage.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/docs">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Docs
                </Link>
              </Button>
              <Button asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}