/**
 * /app/pricing/page.tsx
 * UPDATED VERSION — Already Tripay-Compatible
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Crown,
  MessageCircle,
  Zap,
  Wallet,
  ShieldCheck,
  BadgeCheck,
  ArrowRight
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import { PLANS, formatPrice } from '@/lib/plans';
import { useAuth } from '@/contexts/AuthContext';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('QRIS');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleBuyPlan = async (planId: string) => {
    if (!user) return router.push('/login');
    setSelectedPlan(planId);
    setPaymentDialogOpen(true);
  };

  const confirmPayment = async () => {
    if (!user || !selectedPlan) return;

    try {
      setLoadingPlan(selectedPlan);
      setPaymentDialogOpen(false);

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          planId: selectedPlan,
          name: user.displayName || 'User',
          email: user.email || 'user@example.com',
          method: selectedMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal membuat pembayaran.');
        return;
      }

      if (data.redirect_url) {
        return (window.location.href = data.redirect_url);
      }

      router.push(`/payment?ref=${data.merchant_ref}`);
    } catch (e: any) {
      alert(e?.message || 'Payment failed.');
    } finally {
      setLoadingPlan(null);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* HEADER */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
            <Crown className="h-4 w-4" />
            Official API Service Plans
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            Pilih <span className="text-blue-600 dark:text-blue-400">Paket API</span> Anda
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Semua paket menampilkan harga dalam mata uang Rupiah (IDR). Pembayaran aman menggunakan QRIS.
          </p>
        </div>

        {/* TRIPAY REQUIREMENTS */}
        <section className="mb-12 space-y-6">
          <Card className="border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Informasi Produk
              </CardTitle>
              <CardDescription>
                Berikut adalah layanan digital yang kami jual sebagai syarat verifikasi Tripay.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Slowly API menyediakan layanan REST API premium seperti AI text, downloader, tools web,
              dan layanan data lainnya. Pengguna akan mendapatkan batas penggunaan API harian sesuai paket yang dipilih.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Cara Kerja Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Pilih paket API sesuai kebutuhan Anda.</p>
              <p>2. Lakukan pembayaran menggunakan QRIS.</p>
              <p>3. Setelah pembayaran berhasil, sistem akan otomatis mengaktifkan paket Anda.</p>
            </CardContent>
          </Card>
        </section>

        {/* PLANS GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isFree = plan.price === 0;
            return (
              <Card
                key={plan.id}
                className={cn(
                  'flex flex-col justify-between shadow hover:shadow-lg transition-all border-border/50',
                  plan.popular && 'border-blue-500 shadow-blue-500/20'
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.popular && <Badge className="bg-blue-600">Popular</Badge>}
                  </CardTitle>

                  <CardDescription>{plan.description}</CardDescription>

                  <div className="mt-4">
                    <span className={cn("text-3xl font-bold", plan.color)}>
                      {isFree ? 'Free' : formatPrice(plan.price)}
                    </span>
                    {!isFree && (
                      <span className="ml-1 text-sm text-muted-foreground">/ bulan</span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {plan.apiLimit.toLocaleString()} calls / hari
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> ID: {plan.id}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                {/* FOOTER */}
                <CardFooter className="flex flex-col gap-2">
                  <Dialog open={paymentDialogOpen && selectedPlan === plan.id} onOpenChange={setPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={isFree || loadingPlan === plan.id}
                        onClick={() => handleBuyPlan(plan.id)}
                      >
                        {isFree ? 'Current Plan' : 'Beli Paket'}
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
                        <DialogDescription>
                          Paket: <b>{plan.name}</b>
                        </DialogDescription>
                      </DialogHeader>

                      <PaymentMethodSelector
                        selectedMethod={selectedMethod}
                        onMethodChange={setSelectedMethod}
                      />

                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setPaymentDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button className="flex-1" onClick={confirmPayment}>
                          Bayar {formatPrice(plan.price)}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://wa.me/6285123456', '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Developer
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