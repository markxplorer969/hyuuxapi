'use client';

import { useState } from 'react';
import { Check, X, Star, Users, Zap, Shield, Clock, ArrowRight, ChevronDown, ChevronUp, Headphones, MessageCircle, Rocket, Crown, Sparkles, Mail, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface PricingPlan {
  name: string;
  price: string;
  limit: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
  badge?: string;
  savings?: string;
  customApikey?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'FREE',
    price: '$0',
    limit: '20',
    description: 'Perfect for trying out our API and small projects',
    features: [
      '20 Requests per day',
      'Basic AI Models',
      'Community Support',
      'Standard Response Time',
      'Rate Limiting'
    ],
    cta: 'Get Started',
    popular: false,
    highlight: false,
    icon: <Users className="w-6 h-6" />,
    badge: 'Free Forever',
    savings: 'Great for testing',
    customApikey: false
  },
  {
    name: 'CHEAP',
    price: '$5',
    limit: '1k',
    description: 'Ideal for hobbyists and small personal projects',
    features: [
      '1,000 Requests per day',
      'Basic AI Models',
      'Email Support',
      'Fast Response Time < 200ms',
      'Relaxed Rate Limiting',
      'Custom API Key',
      'Basic Analytics'
    ],
    cta: 'Get Started',
    popular: false,
    highlight: false,
    icon: <Sparkles className="w-6 h-6" />,
    badge: 'Budget Friendly',
    savings: 'Save 20% annually',
    customApikey: true
  },
  {
    name: 'PREMIUM',
    price: '$15',
    limit: '2.5k',
    description: 'Most popular choice for developers and growing businesses',
    features: [
      '2,500 Requests per day',
      'Advanced AI Models (GPT-4, Gemini)',
      'Priority Email Support',
      'Fast Response Time < 100ms',
      'No Rate Limiting',
      'Custom API Key',
      'API Analytics Dashboard',
      'Custom Webhooks'
    ],
    cta: 'Get Started',
    popular: true,
    highlight: true,
    icon: <Rocket className="w-6 h-6" />,
    badge: 'Most Popular',
    savings: 'Save 20% annually',
    customApikey: true
  },
  {
    name: 'VIP',
    price: '$30',
    limit: '5k',
    description: 'For power users with demanding applications',
    features: [
      '5,000 Requests per day',
      'Advanced AI Models',
      'Priority Email Support',
      'Fast Response Time < 100ms',
      'No Rate Limiting',
      'Custom API Key',
      'Advanced Analytics',
      'Custom Webhooks',
      'Priority Queue Access'
    ],
    cta: 'Get Started',
    popular: false,
    highlight: false,
    icon: <Crown className="w-6 h-6" />,
    badge: 'Power User',
    savings: 'Save 20% annually',
    customApikey: true
  },
  {
    name: 'VVIP',
    price: '$50',
    limit: '10k',
    description: 'For professional teams and growing businesses',
    features: [
      '10,000 Requests per day',
      'Latest AI Models',
      'Priority Email Support',
      'Ultra Fast Response Time < 50ms',
      'No Rate Limiting',
      'Custom API Key',
      'Advanced Analytics',
      'Custom Webhooks',
      'Priority Queue Access',
      'Team Collaboration Tools'
    ],
    cta: 'Get Started',
    popular: false,
    highlight: false,
    icon: <Shield className="w-6 h-6" />,
    badge: 'Professional',
    savings: 'Save 20% annually',
    customApikey: true
  },
  {
    name: 'SUPREME',
    price: '$80',
    limit: '20k',
    description: 'For enterprises and mission-critical applications',
    features: [
      '20,000 Requests per day',
      'Exclusive Beta Features',
      '24/7 Dedicated Support',
      'Maximum Performance < 30ms',
      'No Rate Limiting',
      'Custom API Key',
      'Advanced Analytics',
      'Custom Webhooks',
      'Priority Queue Access',
      'Team Collaboration Tools',
      'SLA Guarantee 99.9%',
      'White-label Solutions'
    ],
    cta: 'Contact Sales',
    popular: false,
    highlight: false,
    icon: <Zap className="w-6 h-6" />,
    badge: 'Enterprise',
    savings: 'Best value',
    customApikey: true
  }
];

const FAQ_ITEMS = [
  {
    question: "What's included in the free trial?",
    answer: "14-day full access to all Premium features. No credit card required. After trial, you can choose to upgrade or continue with Free plan.",
    category: "Billing"
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
    category: "Account"
  },
  {
    question: "What is a custom API key?",
    answer: "Custom API keys allow you to create personalized authentication tokens with specific permissions and rate limits. They provide enhanced security and better tracking for your applications.",
    category: "Features"
  },
  {
    question: "Do you offer enterprise plans?",
    answer: "Yes! We offer custom enterprise solutions with dedicated support, custom SLAs, and flexible pricing. Contact our sales team for a personalized quote.",
    category: "Enterprise"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for enterprise customers.",
    category: "Billing"
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees for any plan. Start immediately with transparent pricing and no hidden charges.",
    category: "Billing"
  },
  {
    question: "What's your refund policy?",
    answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, get a full refund, no questions asked.",
    category: "Billing"
  },
  {
    question: "Do you provide API documentation?",
    answer: "Yes! Comprehensive API documentation with interactive testing, code examples, and real-time status monitoring is included with all plans.",
    category: "Support"
  },
  {
    question: "What kind of support do you offer?",
    answer: "Free: Community support via Discord. CHEAP to VVIP: Email support within 24 hours. SUPREME: 24/7 dedicated support with phone and video calls.",
    category: "Support"
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Full Stack Developer",
    company: "TechStart Inc.",
    avatar: "SC",
    content: "The API documentation is incredibly comprehensive. The interactive testing feature saved us hours of development time.",
    rating: 5,
    project: "E-commerce Platform"
  },
  {
    name: "Marcus Rodriguez",
    role: "Backend Engineer",
    company: "DataFlow Solutions",
    avatar: "MR",
    content: "Reliable performance and excellent response times. The analytics dashboard helps us optimize our API usage.",
    rating: 5,
    project: "Data Analytics Tool"
  },
  {
    name: "Emily Johnson",
    role: "Product Manager",
    company: "StartupHub",
    avatar: "EJ",
    content: "The tiered pricing approach is perfect for our growing needs. Started with Free, now on Premium plan.",
    rating: 5,
    project: "Mobile App Backend"
  }
];

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getYearlyPrice = (monthlyPrice: string) => {
    const price = parseInt(monthlyPrice.replace('$', ''));
    const yearlyPrice = Math.round(price * 10 * 0.8);
    return `$${yearlyPrice}`;
  };

  const getSavings = (monthlyPrice: string) => {
    const price = parseInt(monthlyPrice.replace('$', ''));
    const yearlyPrice = Math.round(price * 12);
    const savings = yearlyPrice - Math.round(price * 10 * 0.8);
    return `$${savings}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pt-24">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-full mb-6">
              <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300 font-medium text-sm">Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pricing Plans
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan for your needs. <span className="font-semibold text-blue-600 dark:text-blue-400">Save 20% with yearly billing</span>
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-4 py-2",
                  billingCycle === 'monthly' && "bg-blue-600 text-white"
                )}
              >
                Monthly
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-4 py-2 relative",
                  billingCycle === 'yearly' && "bg-blue-600 text-white"
                )}
              >
                Yearly
                {billingCycle === 'yearly' && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                    Save 20%
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {PRICING_PLANS.map((plan, index) => {
            const displayPrice = billingCycle === 'yearly' && plan.price !== '$0' ? getYearlyPrice(plan.price) : plan.price;
            const isPopular = plan.name === 'PREMIUM';
            
            return (
              <Card 
                key={plan.name}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
                  plan.highlight && "border-blue-500 shadow-2xl scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                      plan.highlight 
                        ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                        : "bg-gray-100 dark:bg-gray-700"
                    )}>
                      <div className={plan.highlight ? "text-white" : "text-gray-600 dark:text-gray-300"}>
                        {plan.icon}
                      </div>
                    </div>

                    <CardTitle className="text-2xl font-bold mb-2">
                      {plan.name}
                    </CardTitle>

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className={cn(
                        "text-4xl font-bold",
                        plan.highlight && "text-white"
                      )}>
                        {displayPrice}
                      </span>
                      {billingCycle === 'monthly' && plan.price !== '$0' && (
                        <span className="text-lg text-gray-500 dark:text-gray-400">/month</span>
                      )}
                      {billingCycle === 'yearly' && plan.price !== '$0' && (
                        <span className="text-lg text-gray-500 dark:text-gray-400">/year</span>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Badge variant="outline" className="text-sm">
                        {plan.limit} requests/day
                      </Badge>
                      {plan.customApikey && (
                        <Badge variant="outline" className="text-sm flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          Custom API Key
                        </Badge>
                      )}
                    </div>

                    {plan.savings && billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {plan.savings} savings
                      </div>
                    )}

                    <CardDescription className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          plan.highlight 
                            ? "bg-blue-100 dark:bg-blue-900/30" 
                            : "bg-green-100 dark:bg-green-900/30"
                        )}>
                          <Check className="w-3 h-3 text-green-600 dark:text-green-500" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button 
                    className={cn(
                      "w-full py-3 text-base font-semibold transition-all",
                      plan.highlight 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Comparison Features */}
      <div className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose Our API?
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for developers who demand reliability, performance, and exceptional support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">Response times under 100ms for premium plans</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">99.9% Uptime</h3>
              <p className="text-gray-600 dark:text-gray-300">Enterprise-grade reliability with SLA guarantee</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300">Dedicated support for VIP customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.question}
                      </h3>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "w-5 h-5 text-gray-400 transition-transform",
                        expandedFaq === index && "rotate-180"
                      )}
                    />
                  </div>
                </button>
                
                {expandedFaq === index && (
                  <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trusted by Developers
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of developers who trust our API for their critical applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {testimonial.avatar}
                    </span>
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
                    Project: {testimonial.project}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose your plan and start building amazing applications with our reliable API
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Rocket className="w-4 h-4" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => window.open('https://wa.me/6285123456', '_blank')}
            >
              <MessageCircle className="w-4 h-4" />
              Contact WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}