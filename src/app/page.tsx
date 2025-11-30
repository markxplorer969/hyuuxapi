'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodePreview } from '@/components/home/CodePreview';
import { 
  Bot, 
  Download, 
  Image, 
  Sparkles, 
  Zap, 
  Rocket, 
  Shield, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Activity,
  Terminal,
  Globe,
  Star,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'AI Integration',
    description: 'Access GPT-4, Gemini, and other advanced AI models through our unified API',
    icon: <Bot className="w-8 h-8" />,
    color: 'from-blue-500 to-purple-600',
    stats: { requests: '50M+', responseTime: '<100ms', uptime: '99.9%' }
  },
  {
    title: 'Media Processing',
    description: 'Extract, download, and process content from social platforms including TikTok, Instagram, and YouTube',
    icon: <Download className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-600',
    stats: { requests: '25M+', responseTime: '<200ms', uptime: '99.7%' }
  },
  {
    title: 'Random Content',
    description: 'Generate random anime images, waifu pictures, and creative content with a single API call',
    icon: <Image className="w-8 h-8" alt="Random content feature" />,
    color: 'from-purple-500 to-pink-600',
    stats: { requests: '10M+', responseTime: '<50ms', uptime: '99.8%' }
  },
  {
    title: 'Developer Tools',
    description: 'Comprehensive toolkit with analytics, caching, and monitoring capabilities',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-orange-500 to-red-600',
    stats: { requests: '5M+', responseTime: '<150ms', uptime: '99.6%' }
  },
  {
    title: 'Enterprise Ready',
    description: 'Built for scale with 99.9% uptime, 24/7 support, and custom SLA options',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-gray-500 to-gray-700',
    stats: { requests: '1M+', responseTime: '<300ms', uptime: '99.9%' }
  }
];

const techStack = [
  { name: 'Next.js 15', icon: '⚡' },
  { name: 'TypeScript 5', icon: '📘' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'Prisma ORM', icon: '🗄️' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Redis Cache', icon: '⚡' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Vercel', icon: '▲' }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Full Stack Developer',
    company: 'TechStart Inc.',
    content: 'The AI integration is incredible. It saved us months of development time and the response times are consistently under 100ms.',
    rating: 5,
    avatar: 'SC'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Backend Engineer',
    company: 'DataFlow Solutions',
    content: 'Reliable performance and excellent documentation. The API design is clean and intuitive.',
    rating: 5,
    avatar: 'MR'
  },
  {
    name: 'Emily Johnson',
    role: 'Product Manager',
    company: 'StartupHub',
    content: 'Perfect uptime and great support. The analytics dashboard helps us optimize our usage.',
    rating: 5,
    avatar: 'EJ'
  }
];

export default function Home() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        console.log('Stats:', data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full mb-6">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">🚀 v2.0 is now live</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Slowly API
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The all-in-one API solution for AI generation, media processing, and data tools.
              <span className="font-semibold text-blue-600 dark:text-blue-400">Built for developers who demand speed, reliability, and scalability.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-white/20 dark:border-gray-700 hover:bg-white hover:text-gray-900 text-gray-900 dark:text-white font-semibold py-4 px-8"
                onClick={() => window.location.href = '/docs'}
              >
                <Terminal className="w-5 h-5" />
                View Documentation
              </Button>
              <Button
                size="lg"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8"
                onClick={() => window.location.href = '/pricing'}
              >
                <Rocket className="w-5 h-5" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Code Preview */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Try It Yourself
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the power of Slowly API with our interactive code editor
            </p>
          </div>
          
          <CodePreview />
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to build amazing applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white dark:bg-gray-800">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center",
                          `bg-gradient-to-br ${feature.color}`
                        )}>
                          <div className="text-white">
                            {feature.icon}
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            {feature.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            <span>{feature.stats.requests}</span>
                            <Users className="w-4 h-4" />
                            <span>{feature.stats.responseTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trusted by Developers
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of developers who trust Slowly API
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {features.reduce((acc, f) => acc + parseInt(f.stats.requests), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">API Calls</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                99.9%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                &lt;100ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                10K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Developers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Built with Modern Technology
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powered by the latest tools and frameworks
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {techStack.map((tech, index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">{tech.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loved by Developers
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what our users are saying about Slowly API
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{testimonial.avatar}</span>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {testimonial.role} at {testimonial.company}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.project}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of developers building amazing applications with Slowly API
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8"
              onClick={() => window.location.href = '/docs'}
            >
              <Globe className="w-5 h-5" />
              View Documentation
            </Button>
            <Button
              size="lg"
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-700 hover:text-white font-semibold py-4 px-8"
              onClick={() => window.location.href = '/pricing'}
            >
              <Rocket className="w-5 h-5" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}