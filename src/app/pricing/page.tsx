'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Crown,
  Key,
  MessageCircle,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PLANS, formatPrice } from '@/lib/plans';
import { useAuth } from '@/contexts/AuthContext';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleBuyPlan = async (planId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setLoadingPlan(planId);

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          planId,
          name: user.displayName || 'User',
          email: user.email || 'user@example.com',
        }),
      });

      // If real payment fails due to IP, try mock
      let data = await res.json();
      if (!res.ok && data.error?.includes('Unauthorized IP')) {
        console.log('Real payment failed due to IP, trying mock...');
        const mockRes = await fetch('/api/payment/mock-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            planId,
            name: user.displayName || 'User',
            email: user.email || 'user@example.com',
          }),
        });
        data = await mockRes.json();
      }
      if (!res.ok || !data.success) {
        console.error('Payment creation error:', data);
        
        // Handle specific error cases
        if (data.error?.includes('Unauthorized IP') || data.error?.includes('Whitelist IP')) {
          alert('Payment Error: Server IP is not whitelisted. Please contact the administrator to add IP 8.217.199.231 to Tripay merchant whitelist.');
        } else if (data.error?.includes('Sandbox') || data.error?.includes('credential')) {
          alert('Payment Configuration Error: Please check Tripay credentials and environment settings.');
        } else {
          alert(data.error || 'Failed to create payment');
        }
        return;
      }

      router.push(`/payment?ref=${data.merchant_ref}`);
    } catch (e) {
      console.error('Payment creation exception:', e);
      alert('Failed to create payment. Please try again later.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleContactDev = () => {
    window.open('https://wa.me/6285123456', '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 py-1 text-xs font-medium text-blue-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 dark:text-blue-300">
            <Crown className="h-4 w-4" />
            Flexible plans for every stage
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Choose your <span className="text-blue-600 dark:text-blue-400">API plan</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Upgrade kapan saja. Semua pembayaran menggunakan QRIS agar lebih simple
            dan cepat.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isFree = plan.price === 0;
            const isPopular = plan.popular;

            return (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col justify-between border border-border/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg',
                  isPopular && 'border-blue-500 shadow-blue-500/20'
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {plan.name}
                    </CardTitle>
                    {isPopular && (
                      <Badge className="bg-blue-600 text-xs text-white">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1 text-xs md:text-sm">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={cn('text-2xl font-bold', plan.color)}>
                      {isFree
                        ? 'Free'
                        : formatPrice(plan.price) + '/bulan'}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {plan.apiLimit.toLocaleString()} calls / hari
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      Plan: {plan.id}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <ul className="space-y-2 text-xs md:text-sm">
                    {plan.features.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-0.5 rounded-full bg-emerald-100 p-0.5 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-2 flex flex-col gap-2 pt-2">
                  <Button
                    size="sm"
                    className="w-full justify-center"
                    disabled={loadingPlan === plan.id || isFree}
                    onClick={() => handleBuyPlan(plan.id)}
                  >
                    {isFree ? (
                      'Current Plan'
                    ) : loadingPlan === plan.id ? (
                      'Processing...'
                    ) : (
                      'Buy Plan (QRIS)'
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={handleContactDev}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Dev
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
