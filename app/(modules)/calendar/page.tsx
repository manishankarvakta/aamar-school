import { Button } from '@/components/ui/button';

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <p className="mb-4">View and manage school events, holidays, and schedules here.</p>
      <Button>Add Event</Button>
    </div>
  );
} 