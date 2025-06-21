import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      <p className="mb-4">Manage fee collection, payment records, and financial transactions here.</p>
      <Button>New Payment</Button>
    </div>
  );
} 