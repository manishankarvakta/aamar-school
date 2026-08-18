'use client';

import { Sparkles, Clock, BookOpen, Users, Megaphone, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TeacherDashboardLayoutProps {
  children: React.ReactNode;
  profile: {
    firstName: string;
    lastName: string;
    qualification: string;
    branchName: string;
    employeeId: string;
  };
  stats: {
    classesCount: number;
    studentsCount: number;
    announcementCount: number;
    slotsCount: number;
  };
}

export function TeacherDashboardLayout({ children, profile, stats }: TeacherDashboardLayoutProps) {
  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Teacher Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Assalamu Alaikum, {profile.firstName}!</h1>
          <p className="text-emerald-100 text-sm max-w-md">
            {profile.qualification} • {profile.branchName} • ID: {profile.employeeId}
          </p>
        </div>
        <div className="flex gap-3 relative z-10 shrink-0">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-2 text-sm flex gap-2">
            <Clock className="h-4 w-4" />
            {formatDate(new Date())}
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Assigned Classes</span>
              <p className="text-2xl font-bold text-slate-800">{stats.classesCount}</p>
              <p className="text-xs text-muted-foreground">Classes assigned to you</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Unique Students */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Total Students</span>
              <p className="text-2xl font-bold text-slate-800">{stats.studentsCount}</p>
              <p className="text-xs text-muted-foreground">Students across your classes</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Slots */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Weekly Periods</span>
              <p className="text-2xl font-bold text-slate-800">{stats.slotsCount}</p>
              <p className="text-xs text-muted-foreground">Routine periods per week</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Announcements</span>
              <p className="text-2xl font-bold text-slate-800">{stats.announcementCount}</p>
              <p className="text-xs text-muted-foreground">Updates from school admin</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Megaphone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unique Content */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
