import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, DecodedToken } from '@/lib/jwt';
import { Sidebar } from './_components/sidebar';
import { StudentSidebar } from './_components/student-sidebar';
import { ParentSidebar } from './_components/parent-sidebar';
import { TeacherSidebar } from './_components/teacher-sidebar';
import { SuperAdminSidebar } from './_components/super-admin-sidebar';
import { Header } from './_components/header';
import { ImpersonationBanner } from './_components/impersonation-banner';
import { BranchProvider } from '@/contexts/branch-context';
import { UserProvider } from '@/contexts/user-context';
import { prisma } from '@/lib/prisma';
import { AccessDeniedPage } from '@/components/permission-guard';

const routePermissionKeys: Record<string, string> = {
  '/dashboard/admissions': 'admissions',
  '/dashboard/students': 'students',
  '/dashboard/parents': 'parents',
  '/dashboard/teachers': 'teachers',
  '/dashboard/classes': 'classes',
  '/dashboard/subjects': 'subjects',
  '/dashboard/class-routine': 'class-routine',
  '/dashboard/attendance': 'attendance',
  '/dashboard/exams': 'exams',
  '/dashboard/branches': 'branches',
  '/dashboard/announcements': 'announcements',
  '/dashboard/accounts': 'accounts',
  '/dashboard/library': 'library',
  '/dashboard/transport': 'transport',
  '/dashboard/staff': 'staff',
  '/dashboard/settings': 'settings',
};

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

  const impersonatedSchoolId = cookieStore.get('impersonated_school_id')?.value;

  // Enforce role routing security
  if (user.role === 'SUPER_ADMIN') {
    if (!impersonatedSchoolId) {
      // Super Admin redirection
      if (pathname === '/dashboard') {
        redirect('/dashboard/super-admin');
      }
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
    } else if (user.role === 'ADMIN' || user.role === 'STAFF') {
      // Admin/Staff can browse admin routes. Access is guarded by PermissionGuard on page level.
    } else {
      redirect('/login');
    }
  }

  let isAuthorized = true;

  if (user.role === 'STAFF') {
    const staff = await prisma.staff.findUnique({
      where: { userId: user.userId },
      select: { permissions: true },
    });

    const permissions = (staff?.permissions as Record<string, any>) || {};

    const matchedPath = Object.keys(routePermissionKeys).find((path) =>
      pathname === path || pathname.startsWith(path + '/')
    );
    if (matchedPath) {
      const permKey = routePermissionKeys[matchedPath];
      if (permissions[permKey]?.view !== true) {
        isAuthorized = false;
      }
    }
  }

  let impersonatedSchoolName = '';
  if (user.role === 'SUPER_ADMIN' && impersonatedSchoolId) {
    const school = await prisma.school.findUnique({
      where: { id: impersonatedSchoolId },
      select: { name: true }
    });
    if (school) {
      impersonatedSchoolName = school.name;
    }
  }

  const renderSidebar = () => {
    if (user.role === 'SUPER_ADMIN' && !impersonatedSchoolId) {
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
    <UserProvider>
      <BranchProvider>
        <div className="flex flex-col h-screen bg-background">
          {impersonatedSchoolName && (
            <ImpersonationBanner schoolName={impersonatedSchoolName} />
          )}
          <div className="flex-1 flex overflow-hidden">
            {renderSidebar()}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header user={user} />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background/90">
                {isAuthorized ? children : <AccessDeniedPage />}
              </main>
            </div>
          </div>
        </div>
      </BranchProvider>
    </UserProvider>
  );
}
