import { getTeacherDashboardData } from '@/app/actions/teacherDashboard';
import { TeacherDashboardClient } from './_components/teacher-dashboard-client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export default async function TeacherDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== 'TEACHER') {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  const result = await getTeacherDashboardData();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="text-center space-y-3 border p-8 rounded-xl bg-card shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-red-600">Failed to Load Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {result.error || 'We could not fetch your teacher profile data. Please contact the administrator.'}
          </p>
        </div>
      </div>
    );
  }

  return <TeacherDashboardClient data={result.data as any} />;
}
