import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, DecodedToken } from '@/lib/jwt';
import { Sidebar } from './_components/sidebar';
import { StudentSidebar } from './_components/student-sidebar';
import { ParentSidebar } from './_components/parent-sidebar';
import { TeacherSidebar } from './_components/teacher-sidebar';
import { SuperAdminSidebar } from './_components/super-admin-sidebar';
import { Header } from './_components/header';
import { BranchProvider } from '@/contexts/branch-context';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let user: DecodedToken | null = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch (error) {
      // Invalid token, treat as logged out
    }
  }

  if (!user) {
    redirect('/login');
  }

  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Enforce role routing security
  if (user.role === 'SUPER_ADMIN') {
    // Super Admin redirection
    if (pathname === '/dashboard') {
      redirect('/dashboard/super-admin');
    }
  } else {
    // Prevent non-super-admins from accessing super-admin pages
    if (pathname.startsWith('/dashboard/super-admin')) {
      if (user.role === 'STUDENT') {
        redirect('/dashboard/student-dashboard');
      } else if (user.role === 'PARENT') {
        redirect('/dashboard/parent-dashboard');
      } else if (user.role === 'TEACHER') {
        redirect('/dashboard/teacher-dashboard');
      } else {
        redirect('/dashboard');
      }
    }

    if (user.role === 'STUDENT') {
      if (!pathname.startsWith('/dashboard/student-dashboard')) {
        redirect('/dashboard/student-dashboard');
      }
    } else if (user.role === 'PARENT') {
      if (!pathname.startsWith('/dashboard/parent-dashboard')) {
        redirect('/dashboard/parent-dashboard');
      }
    } else if (user.role === 'TEACHER') {
      if (!pathname.startsWith('/dashboard/teacher-dashboard')) {
        redirect('/dashboard/teacher-dashboard');
      }
    } else if (user.role === 'ADMIN') {
      // Admin can browse admin routes. If they land on student or parent dashboard, it's allowed.
    } else {
      redirect('/login');
    }
  }

  const renderSidebar = () => {
    if (user.role === 'SUPER_ADMIN') {
      return <SuperAdminSidebar />;
    }
    if (user.role === 'STUDENT') {
      return <StudentSidebar />;
    }
    if (user.role === 'PARENT') {
      return <ParentSidebar />;
    }
    if (user.role === 'TEACHER') {
      return <TeacherSidebar />;
    }
    return <Sidebar />;
  };

  return (
    <BranchProvider>
      <div className="flex h-screen bg-background">
        {renderSidebar()}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background/90">
            {children}
          </main>
        </div>
      </div>
    </BranchProvider>
  );
}
