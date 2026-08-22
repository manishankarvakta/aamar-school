import { requireAuth } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getSchoolsList } from '@/app/actions/super-admin';
import { SchoolsClient } from './schools-client';

export default async function SuperAdminSchoolsPage() {
  const session = await requireAuth();

  // Enforce Super Admin only access on server level
  if (session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const res = await getSchoolsList();
  const schools = res.success && res.data ? res.data : [];

  return <SchoolsClient initialSchools={schools as any} />;
}
