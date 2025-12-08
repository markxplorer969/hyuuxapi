'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentErrorTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const testPaymentError = async (testName: string, payload: any) => {
    setLoading(testName);
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      setResults(prev => [{
        testName,
        success: response.ok && data.success,
        status: response.status,
        data,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      setResults(prev => [{
        testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
    } finally {
      setLoading(null);
    }
  };

  const testMockPayment = async (testName: string, payload: any) => {
    setLoading(testName);
    try {
      const response = await fetch('/api/payment/mock-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      setResults(prev => [{
        testName,
        success: response.ok && data.success,
        status: response.status,
        data,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      setResults(prev => [{
        testName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Error Test</h1>
        <p className="text-muted-foreground">
          Test payment error handling scenarios
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Error Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Error Scenarios</CardTitle>
            <CardDescription>Test various error conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => testPaymentError('Missing Fields', {
                planId: 'PREMIUM',
                name: 'Test User',
                email: 'test@example.com',
                method: 'QRIS'
              })}
              disabled={loading === 'Missing Fields'}
              variant="outline"
              className="w-full"
            >
              {loading === 'Missing Fields' ? 'Testing...' : 'Test Missing userId'}
            </Button>

            <Button
              onClick={() => testPaymentError('Invalid Plan', {
                userId: 'test-user',
                planId: 'INVALID_PLAN',
                name: 'Test User',
                email: 'test@example.com',
                method: 'QRIS'
              })}
              disabled={loading === 'Invalid Plan'}
              variant="outline"
              className="w-full"
            >
              {loading === 'Invalid Plan' ? 'Testing...' : 'Test Invalid Plan'}
            </Button>

            <Button
              onClick={() => testPaymentError('IP Error (Real)', {
                userId: 'test-user',
                planId: 'PREMIUM',
                name: 'Test User',
                email: 'test@example.com',
                method: 'QRIS'
              })}
              disabled={loading === 'IP Error (Real)'}
              variant="outline"
              className="w-full"
            >
              {loading === 'IP Error (Real)' ? 'Testing...' : 'Test Real Payment (IP Error)'}
            </Button>
          </CardContent>
        </Card>

        {/* Success Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Success Scenarios</CardTitle>
            <CardDescription>Test successful payment creation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => testMockPayment('QRIS Success', {
                userId: 'test-user',
                planId: 'PREMIUM',
                name: 'Test User',
                email: 'test@example.com',
                method: 'QRIS'
              })}
              disabled={loading === 'QRIS Success'}
              className="w-full"
            >
              {loading === 'QRIS Success' ? 'Testing...' : 'Test QRIS Payment'}
            </Button>

            <Button
              onClick={() => testMockPayment('DANA Success', {
                userId: 'test-user',
                planId: 'VIP',
                name: 'Test User',
                email: 'test@example.com',
                method: 'DANA'
              })}
              disabled={loading === 'DANA Success'}
              className="w-full"
            >
              {loading === 'DANA Success' ? 'Testing...' : 'Test DANA Payment'}
            </Button>

            <Button
              onClick={() => testMockPayment('GoPay Success', {
                userId: 'test-user',
                planId: 'SUPREME',
                name: 'Test User',
                email: 'test@example.com',
                method: 'GOPAY'
              })}
              disabled={loading === 'GoPay Success'}
              className="w-full"
            >
              {loading === 'GoPay Success' ? 'Testing...' : 'Test GoPay Payment'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Recent test results (last 10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {result.testName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {result.timestamp}
                    </span>
                  </div>
                  {result.success ? (
                    <div className="text-sm text-green-700">
                      ✅ Success (Status: {result.status})
                      {result.data?.merchant_ref && (
                        <div className="text-xs mt-1">Ref: {result.data.merchant_ref}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      ❌ Error: {result.error || result.data?.error}
                      {result.status && (
                        <div className="text-xs mt-1">Status: {result.status}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}