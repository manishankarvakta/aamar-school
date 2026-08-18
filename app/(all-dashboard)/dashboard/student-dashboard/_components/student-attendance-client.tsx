'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { StudentDashboardLayout } from './student-dashboard-layout';

interface StudentAttendanceClientProps {
  data: {
    profile: {
      firstName: string;
      lastName: string;
      className: string;
      sectionName: string;
      rollNumber: string;
    };
    attendance: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      excusedDays: number;
      attendanceRate: number;
      records: Array<{
        id: string;
        date: Date;
        status: string;
        remarks?: string | null;
      }>;
    };
    examResults: Array<any>;
    fees: Array<any>;
    totalDue: number;
    announcements: Array<any>;
  };
}

export function StudentAttendanceClient({ data }: StudentAttendanceClientProps) {
  const { profile, attendance, examResults, totalDue, announcements } = data;

  // Format Date utility
  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const layoutStats = {
    attendanceRate: attendance.attendanceRate,
    presentDays: attendance.presentDays,
    totalDays: attendance.totalDays,
    totalDue: totalDue,
    examCount: examResults.length,
    announcementCount: announcements.length,
  };

  return (
    <StudentDashboardLayout profile={profile} stats={layoutStats}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Attendance Log History
          </CardTitle>
          <CardDescription>Daily school attendance logs</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {attendance.records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              📅 No attendance logs available.
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/50 text-slate-600 font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.records.map((rec) => (
                  <tr key={rec.id} className="border-b hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{formatDate(rec.date)}</td>
                    <td className="p-4">
                      <Badge className={
                        rec.status === 'PRESENT' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : rec.status === 'ABSENT' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : rec.status === 'LATE' 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }>
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{rec.remarks || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </StudentDashboardLayout>
  );
}
