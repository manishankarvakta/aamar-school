'use client';

import { Sparkles, Clock, CheckCircle, AlertTriangle, GraduationCap, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
  profile: {
    firstName: string;
    lastName: string;
    className: string;
    sectionName: string;
    rollNumber: string;
  };
  stats: {
    attendanceRate: number;
    presentDays: number;
    totalDays: number;
    totalDue: number;
    examCount: number;
    announcementCount: number;
  };
}

export function StudentDashboardLayout({ children, profile, stats }: StudentDashboardLayoutProps) {
  // Format Date utility
  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/90 to-blue-600/90 text-primary-foreground p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Student Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile.firstName}!</h1>
          <p className="text-white/80 text-sm max-w-md">
            Class {profile.className} • Section {profile.sectionName} • Roll {profile.rollNumber}
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
        {/* Attendance */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Attendance</span>
              <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">{stats.presentDays} of {stats.totalDays} days present</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Due Fees */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Pending Fees</span>
              <p className="text-2xl font-bold text-red-600">৳{stats.totalDue}</p>
              <p className="text-xs text-muted-foreground">Overdue fees must be settled</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Exam Results */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Exam Reports</span>
              <p className="text-2xl font-bold">{stats.examCount}</p>
              <p className="text-xs text-muted-foreground">Subjects graded this term</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Announcements</span>
              <p className="text-2xl font-bold">{stats.announcementCount}</p>
              <p className="text-xs text-muted-foreground">Active updates from school</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Megaphone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unique Page Content */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
