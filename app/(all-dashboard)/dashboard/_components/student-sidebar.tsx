'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, BookOpen, GraduationCap, CalendarCheck, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StudentSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', href: '/dashboard/student-dashboard', icon: HomeIcon },
    { name: 'Routine', href: '/dashboard/student-dashboard/routine', icon: BookOpen },
    { name: 'Exams', href: '/dashboard/student-dashboard/exams', icon: GraduationCap },
    { name: 'Attendance', href: '/dashboard/student-dashboard/attendance', icon: CalendarCheck },
    { name: 'Fees & Dues', href: '/dashboard/student-dashboard/fees', icon: CreditCard },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen">
      {/* Fixed Header */}
      <div className="h-16 flex items-center px-6 border-b bg-card shrink-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AS</span>
          </div>
          <span className="text-primary">Aamar</span>
          <span className="text-foreground">School</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <h3 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Student Portal
        </h3>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
