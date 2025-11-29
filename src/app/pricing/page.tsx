'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlight?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out our API',
    features: [
      '100 Requests/day',
      'Basic AI Models',
      'Community Support',
      'Standard Speed'
    ],
    cta: 'Get Started',
    popular: false,
    highlight: false
  },
  {
    name: 'Premium',
    price: '$9',
    description: 'Most popular choice for developers',
    features: [
      '5,000 Requests/day',
      'Advanced AI Models (GPT-4/Gemini)',
      'Priority Email Support',
      'Fast Processing Speed',
      'No Watermark'
    ],
    cta: 'Upgrade Now',
    popular: true,
    highlight: true
  },
  {
    name: 'VIP',
    price: '$29',
    description: 'For power users and enterprises',
    features: [
      'Unlimited Requests (Fair usage)',
      'Exclusive Beta Features',
      '24/7 Dedicated Support',
      'Max Processing Speed',
      'Custom API Solutions'
    ],
    cta: 'Contact Sales',
    popular: false,
    highlight: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your API needs.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, index) => (
              <Card 
                key={plan.name}
                className={`relative flex flex-col h-full ${
                  plan.highlight 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-border'
                } transition-all duration-200 hover:shadow-md`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button 
                    className={`w-full ${
                      plan.highlight 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'outline'
                    }`}
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I change my plan later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                question: "Do you offer enterprise plans?",
                answer: "Yes, we offer custom enterprise solutions with dedicated support and custom features. Contact our sales team for more information."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and wire transfers for enterprise customers."
              },
              {
                question: "Is there a free trial for Premium plans?",
                answer: "Yes, we offer a 14-day free trial for all paid plans. No credit card required to start."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">started?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers using Slowly API to build amazing applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}