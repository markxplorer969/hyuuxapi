'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const paymentMethods = ['QRIS', 'DANA', 'OVO', 'SHOPEEPAY', 'GOPAY'];
const statuses = ['PENDING', 'SUCCESS', 'FAILED'];

export default function DiscordTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const testSingleMethod = async (method: string, status: string) => {
    setLoading(`${method}-${status}`);
    try {
      const response = await fetch(`/api/test-discord-logging?method=${method}&status=${status}`);
      const data = await response.json();
      
      setResults(prev => [{
        method,
        status,
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10)); // Keep last 10 results
      
    } catch (error) {
      setResults(prev => [{
        method,
        status,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
    } finally {
      setLoading(null);
    }
  };

  const testAllMethods = async () => {
    setLoading('all');
    try {
      const response = await fetch('/api/test-discord-logging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      setResults(prev => [{
        method: 'ALL',
        status: 'MULTIPLE',
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      setResults(prev => [{
        method: 'ALL',
        status: 'MULTIPLE',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
    } finally {
      setLoading(null);
    }
  };

  const testPaymentCreation = async (method: string) => {
    setLoading(`payment-${method}`);
    try {
      const response = await fetch('/api/payment/mock-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `test-user-${method.toLowerCase()}`,
          planId: 'PREMIUM',
          name: `Test User ${method}`,
          email: `test${method.toLowerCase()}@example.com`,
          method
        })
      });
      const data = await response.json();
      
      setResults(prev => [{
        method,
        status: 'PAYMENT_CREATION',
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      setResults(prev => [{
        method,
        status: 'PAYMENT_CREATION',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discord Payment Logging Test</h1>
        <p className="text-muted-foreground">
          Test Discord logging for all payment methods and statuses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Individual Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Tests</CardTitle>
            <CardDescription>Test specific payment methods and statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map(method => (
              <div key={method} className="space-y-2">
                <h4 className="font-medium">{method}</h4>
                <div className="flex gap-2">
                  {statuses.map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      onClick={() => testSingleMethod(method, status)}
                      disabled={loading === `${method}-${status}`}
                    >
                      {loading === `${method}-${status}` ? 'Testing...' : status}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Creation Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Creation Tests</CardTitle>
            <CardDescription>Test full payment creation flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testAllMethods} 
              disabled={loading === 'all'}
              className="w-full"
            >
              {loading === 'all' ? 'Testing All...' : 'Test All Methods (PENDING + SUCCESS)'}
            </Button>
            
            <div className="space-y-2">
              <h4 className="font-medium">Individual Payment Creation</h4>
              {paymentMethods.map(method => (
                <Button
                  key={method}
                  size="sm"
                  variant="outline"
                  onClick={() => testPaymentCreation(method)}
                  disabled={loading === `payment-${method}`}
                  className="w-full"
                >
                  {loading === `payment-${method}` ? 'Creating...' : `Create ${method} Payment`}
                </Button>
              ))}
            </div>
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
                      {result.method} - {result.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {result.timestamp}
                    </span>
                  </div>
                  {result.success ? (
                    <div className="text-sm text-green-700">
                      ✅ Success
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      ❌ Error: {result.error}
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