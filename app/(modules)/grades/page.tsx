import { Button } from '@/components/ui/button';

export default function GradesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Grades</h1>
      <p className="mb-4">View and manage student grades and academic performance here.</p>
      <Button>View Report Card</Button>
    </div>
  );
} 