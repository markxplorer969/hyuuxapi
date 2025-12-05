"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface TransactionData {
  qr_image: string;
  qr_url: string;
  planId: string;
  amount: number;
  status: string;
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ref = searchParams.get("ref");
  const [loading, setLoading] = useState(true);
  const [trx, setTrx] = useState<TransactionData | null>(null);
  const [status, setStatus] = useState("PENDING");

  // Fetch transaction detail
  async function fetchStatus() {
    if (!ref) return;

    const res = await fetch(`/api/payment/status?ref=${ref}`, {
      cache: "no-store",
    });

    if (!res.ok) return;

    const data = await res.json();
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
              Scan QRIS below to upgrade your plan.
            </p>
          </div>

          {/* QR Section */}
          <div className="flex flex-col items-center">
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
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium">{trx.planId}</span>
            </p>

            <p className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold">Rp {trx.amount.toLocaleString("id-ID")}</span>
            </p>

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
            </p>
          </div>

          {/* Cancel Button */}
          {status === "PENDING" && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={async () => {
                await fetch(`/api/payment/cancel?ref=${ref}`, { method: "POST" });
                router.push("/pricing");
              }}
            >
              Cancel Payment
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
