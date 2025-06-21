import { Button } from '@/components/ui/button';

export default function CommunicationPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Communication</h1>
      <p className="mb-4">Send messages, announcements, and notifications to students, teachers, and parents here.</p>
      <Button>Send Message</Button>
    </div>
  );
} 