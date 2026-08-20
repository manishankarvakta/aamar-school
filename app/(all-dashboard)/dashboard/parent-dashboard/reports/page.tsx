import { getParentReportsData } from '@/app/actions/reports';
import { ParentReportsClient } from './_components/parent-reports-client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export default async function ParentReportsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== 'PARENT') {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  const result = await getParentReportsData();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="text-center space-y-3 border p-8 rounded-xl bg-card shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-red-600">Failed to Load Reports</h2>
          <p className="text-sm text-muted-foreground">
            {result.error || 'We could not fetch the teacher reports. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ParentReportsClient initialData={result.data} />
    </div>
  );
}
