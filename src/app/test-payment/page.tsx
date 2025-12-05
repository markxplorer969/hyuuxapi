'use client';

import { useState } from 'react';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

// Simple test to verify the component renders without errors
export default function TestPage() {
  const [selectedMethod, setSelectedMethod] = useState('QRIS');

  const handleMethodChange = (method: string) => {
    console.log('Selected:', method);
    setSelectedMethod(method);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Payment Method Test</h1>
      <div className="mb-4">
        <p>Selected method: <strong>{selectedMethod}</strong></p>
      </div>
      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
      />
    </div>
  );
}