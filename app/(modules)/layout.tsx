'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const modules = [
  { name: 'Admissions', href: '/admissions' },
  { name: 'Attendance', href: '/attendance' },
  { name: 'Grades', href: '/grades' },
  { name: 'Communication', href: '/communication' },
  { name: 'Payments', href: '/payments' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'API', href: '/api' },
];

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Modules</h2>
          <nav className="space-y-1">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                  pathname === module.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {module.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 