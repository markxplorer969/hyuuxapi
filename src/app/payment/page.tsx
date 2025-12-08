"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionData {
  qr_image: string;
  qr_url: string;
  payment_url: string;
  planId: string;
  amount: number;
  status: string;
  method: string;
  created_at?: string;
  expired_at?: string;
  expired_time?: number;
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ref = searchParams.get("ref");
  const [loading, setLoading] = useState(true);
  const [trx, setTrx] = useState<TransactionData | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Calculate time left until expiration
  useEffect(() => {
    if (!trx?.expired_at) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(trx.expired_at!).getTime();
      const difference = expiresAt - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(hours * 3600 + minutes * 60 + seconds);
      } else {
        setTimeLeft(0);
        setStatus("EXPIRED");
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [trx?.expired_at]);

  // Format time left as HH:MM:SS
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Fetch transaction detail
  async function fetchStatus() {
    if (!ref) return;

    let data;
    try {
      const res = await fetch(`/api/payment/status?ref=${ref}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error('Real status failed');
      }
      data = await res.json();
    } catch (error) {
      console.log('Real status failed, trying mock...');
      const mockRes = await fetch(`/api/payment/mock-status?ref=${ref}`, {
        cache: "no-store",
      });
      data = await mockRes.json();
    }
    
    if (data.trx) {
      setTrx(data.trx);
      setStatus(data.trx.status);

      if (data.trx.status === "PAID") {
        setTimeout(() => router.push("/dashboard"), 1200);
      }
    }
    setLoading(false);
  }

  // Auto refresh every 3 seconds
  useEffect(() => {
    fetchStatus(); // first load
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [ref]);

  if (!ref) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg font-medium">Invalid payment reference</p>
        <Button className="mt-4" onClick={() => router.push("/pricing")}>
          Back to Pricing
        </Button>
      </div>
    );
  }

  if (loading || !trx) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <div className="border-b py-4 px-4 flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.push("/pricing")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl font-semibold">Payment</h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-6">

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold">Complete Your Payment</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {trx.method === 'QRIS' 
                ? 'Scan QRIS below to upgrade your plan.'
                : `Complete your payment using ${trx.method}.`
              }
            </p>
          </div>

          {/* Payment Section */}
          <div className="flex flex-col items-center">
            {trx.method === 'QRIS' ? (
              <>
                <Image
                  src={trx.qr_image}
                  width={260}
                  height={260}
                  alt="QRIS"
                  className="rounded-lg shadow"
                />

                <a
                  href={trx.qr_url}
                  target="_blank"
                  className="text-blue-500 hover:underline text-sm mt-3"
                >
                  Open QR in new tab
                </a>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-3xl">
                    {trx.method === 'DANA' ? '💰' : 
                     trx.method === 'OVO' ? '🟣' :
                     trx.method === 'SHOPEEPAY' ? '🟠' :
                     trx.method === 'GOPAY' ? '🟢' : '💳'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{trx.method} Payment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Click the button below to continue with {trx.method} payment
                  </p>
                </div>
                {trx.payment_url && (
                  <Button
                    onClick={() => window.open(trx.payment_url, '_blank')}
                    className="w-full max-w-xs"
                  >
                    Open {trx.method} Payment
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium">{trx.planId}</span>
            </p>

            <p className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium">{trx.method}</span>
            </p>

            <p className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold">Rp {trx.amount.toLocaleString("id-ID")}</span>
            </p>

            {/* Expiration Timer */}
            {trx.expired_at && (
              <>
                <p className="flex justify-between">
                  <span className="text-gray-500">Expires In</span>
                  <span className={`font-semibold ${timeLeft !== null && timeLeft <= 300 ? 'text-red-500' : 'text-green-500'}`}>
                    {timeLeft !== null ? formatTimeLeft(timeLeft) : '--:--'}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Valid Until</span>
                  <span className="font-medium">
                    {new Date(trx.expired_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
              </>
            )}

            <p className="flex justify-between">
              <span className="text-gray-500">Status</span>

              {status === "PENDING" && (
                <span className="flex items-center gap-1 text-yellow-500 font-medium">
                  <Clock className="w-4 h-4" /> Waiting for payment
                </span>
              )}

              {status === "PAID" && (
                <span className="flex items-center gap-1 text-green-500 font-medium">
                  <CheckCircle className="w-4 h-4" /> Paid
                </span>
              )}

              {status === "FAILED" && (
                <span className="flex items-center gap-1 text-red-500 font-medium">
                  <XCircle className="w-4 h-4" /> Failed
                </span>
              )}

              {status === "EXPIRED" && (
                <span className="flex items-center gap-1 text-red-500 font-medium">
                  <AlertTriangle className="w-4 h-4" /> Expired
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          {status === "PENDING" && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={async () => {
                  await fetch(`/api/payment/cancel?ref=${ref}`, { method: "POST" });
                  router.push("/pricing");
                }}
              >
                Cancel Payment
              </Button>
              {trx.payment_url && (
                <Button
                  className="flex-1"
                  onClick={() => window.open(trx.payment_url, '_blank')}
                >
                  Open Payment
                </Button>
              )}
            </div>
          )}

          {status === "EXPIRED" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/pricing")}
            >
              Create New Payment
            </Button>
          )}

          {status === "PAID" && (
            <Button
              className="w-full bg-green-600"
              onClick={() => router.push("/dashboard")}
            >
              Continue to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading payment...</p>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
