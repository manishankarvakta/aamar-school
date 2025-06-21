import { Button } from '@/components/ui/button';

export default function AttendancePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>
      <p className="mb-4">Track and manage student attendance records here.</p>
      <Button>Mark Attendance</Button>
    </div>
  );
} 