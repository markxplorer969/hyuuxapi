import PaymentMethodSelector from '@/components/PaymentMethodSelector';

// Simple test to verify the component renders without errors
export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Payment Method Test</h1>
      <PaymentMethodSelector
        selectedMethod="QRIS"
        onMethodChange={(method) => console.log('Selected:', method)}
      />
    </div>
  );
}