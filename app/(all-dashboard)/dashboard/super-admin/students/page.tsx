import { requireAuth } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getAllStudentsAcrossSchools } from '@/app/actions/super-admin';
import { StudentsClient } from './students-client';

export default async function SuperAdminStudentsPage() {
  const session = await requireAuth();

  // Enforce Super Admin only access on the server level
  if (session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const res = await getAllStudentsAcrossSchools();
  const students = res.success && res.data ? res.data : [];

  return <StudentsClient initialStudents={students as any} />;
}
