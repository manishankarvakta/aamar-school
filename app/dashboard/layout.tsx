import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, DecodedToken } from '@/lib/jwt';
import { Sidebar } from './_components/sidebar';
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

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <BranchProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
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
