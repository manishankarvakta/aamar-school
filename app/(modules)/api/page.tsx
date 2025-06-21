import { Button } from '@/components/ui/button';

export default function ApiPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API & Integrations</h1>
      <p className="mb-4">Access documentation, manage API keys, and integrate with third-party services here.</p>
      <Button>View Documentation</Button>
    </div>
  );
} 