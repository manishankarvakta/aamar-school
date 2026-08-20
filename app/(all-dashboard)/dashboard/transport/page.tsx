import { getTransportData } from '@/app/actions/transport';
import { TransportClient } from '@/app/(all-dashboard)/dashboard/transport/_components/transport-client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export default async function TransportPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  const result = await getTransportData();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="text-center space-y-3 border p-8 rounded-xl bg-card shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-red-650">Failed to Load Transport Records</h2>
          <p className="text-sm text-muted-foreground">
            {result.error || 'We could not fetch the transport records. Please contact the administrator.'}
          </p>
        </div>
      </div>
    );
  }

  return <TransportClient initialData={result.data} />;
}
