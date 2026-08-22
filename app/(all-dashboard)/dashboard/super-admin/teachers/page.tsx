import { requireAuth } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getAllTeachersAcrossSchools } from '@/app/actions/super-admin';
import { TeachersClient } from './teachers-client';

export default async function SuperAdminTeachersPage() {
  const session = await requireAuth();

  // Enforce Super Admin only access on server level
  if (session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const res = await getAllTeachersAcrossSchools();
  const teachers = res.success && res.data ? res.data : [];

  return <TeachersClient initialTeachers={teachers as any} />;
}
