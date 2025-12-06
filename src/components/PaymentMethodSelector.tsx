'use client';

import { useState } from 'react';
import { Tripay } from '@/lib/tripay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
  code: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  const [paymentMethods] = useState<PaymentMethod[]>(
    new Tripay().getAvailablePaymentMethods()
  );

  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.category]) {
      acc[method.category] = [];
    }
    acc[method.category].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  const categoryTitles = {
    qris: 'QR Code',
    ewallet: 'E-Wallet'
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Pilih Metode Pembayaran</h3>
      </div>
      
      {Object.entries(groupedMethods).map(([category, methods]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {categoryTitles[category as keyof typeof categoryTitles] || category}
          </h4>
          <div className="grid gap-3">
            {methods.map((method) => (
              <Card
                key={method.code}
                className={`cursor-pointer transition-all border-2 ${
                  selectedMethod === method.code
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && onMethodChange(method.code)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedMethod === method.code && (
                        <Badge variant="default" className="bg-blue-600">
                          Dipilih
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}