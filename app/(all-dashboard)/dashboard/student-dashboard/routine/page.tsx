import { getStudentDashboardData } from '@/app/actions/studentDashboard';
import { StudentRoutineClient } from '../_components/student-routine-client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export default async function StudentRoutinePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== 'STUDENT') {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  const result = await getStudentDashboardData();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="text-center space-y-3 border p-8 rounded-xl bg-card shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-red-600">Failed to Load Routine</h2>
          <p className="text-sm text-muted-foreground">
            {result.error || 'We could not fetch your routine details. Please contact the administrator.'}
          </p>
        </div>
      </div>
    );
  }

  return <StudentRoutineClient data={result.data as any} />;
}
