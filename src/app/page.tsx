'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Terminal, Rocket, Activity, ArrowRight, Zap, Shield, Database, Cpu, Image, Bot, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Slowly API
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              The all-in-one API platform for AI, media tools, search engine integration, 
              web automation, and developer utilities.  
              Built for developers who demand <span className="font-semibold text-primary">speed</span>, 
              <span className="font-semibold text-primary"> reliability</span>, and 
              <span className="font-semibold text-primary"> scalability</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => router.push('/docs')}
              >
                <Terminal className="w-4 h-4" />
                View Docs
              </Button>

              <Button
                size="lg"
                className="gap-2"
                variant="outline"
                onClick={() => router.push('/pricing')}
              >
                <Rocket className="w-4 h-4" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Features</h2>
          <p className="text-muted-foreground mb-10">
            Everything you need to build powerful applications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card className="hover:shadow-md transition">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI Models</CardTitle>
                <CardDescription>Access GPT, Gemini, OSS 120B, Qwen, and more.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Image Tools</CardTitle>
                <CardDescription>Generate images, analyze content, and more.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Scraping & Search</CardTitle>
                <CardDescription>Perplexed AI, TurboSeek, web search, and indexing.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>SSR screenshot, processing tools, automations.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Secure API Keys</CardTitle>
                <CardDescription>Unlimited regeneration & per-plan usage limits.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Worldwide CDN</CardTitle>
                <CardDescription>Optimized response time under 150ms.</CardDescription>
              </CardHeader>
            </Card>

          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 border-t bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Build your next project with Slowly API
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start for free, upgrade when you need more power.
          </p>

          <Button size="lg" className="gap-2" onClick={() => router.push('/pricing')}>
            Get Started <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

    </div>
  );
}
