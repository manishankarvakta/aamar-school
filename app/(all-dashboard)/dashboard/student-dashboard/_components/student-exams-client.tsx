'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { StudentDashboardLayout } from './student-dashboard-layout';

interface StudentExamsClientProps {
  data: {
    profile: {
      firstName: string;
      lastName: string;
      className: string;
      sectionName: string;
      rollNumber: string;
    };
    attendance: {
      attendanceRate: number;
      presentDays: number;
      totalDays: number;
    };
    examResults: Array<{
      id: string;
      examName: string;
      subjectName: string;
      obtainedMarks: number;
      fullMarks: number;
      grade: string;
      remarks: string;
    }>;
    fees: Array<any>;
    totalDue: number;
    announcements: Array<any>;
  };
}

export function StudentExamsClient({ data }: StudentExamsClientProps) {
  const { profile, examResults, attendance, totalDue, announcements } = data;

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
            <GraduationCap className="h-5 w-5 text-primary" />
            Academic Exam Results
          </CardTitle>
          <CardDescription>Your subject grades and marks report</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {examResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              📝 No exam results have been published for you yet.
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/50 text-slate-600 font-semibold">
                  <th className="p-4">Exam Name</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Marks Obtained</th>
                  <th className="p-4">Passing Rate</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {examResults.map((result) => {
                  const percentage = Math.round((result.obtainedMarks / result.fullMarks) * 100);
                  const isPassed = percentage >= 33;

                  return (
                    <tr key={result.id} className="border-b hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{result.examName}</td>
                      <td className="p-4 font-medium text-slate-700">{result.subjectName}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">{result.obtainedMarks}</span> / <span className="text-muted-foreground">{result.fullMarks}</span>
                      </td>
                      <td className="p-4 font-medium">
                        <span className={isPassed ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          result.grade.startsWith('A') 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : result.grade === 'F' 
                            ? 'bg-red-100 text-red-800 border-red-200' 
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }>
                          {result.grade}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{result.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </StudentDashboardLayout>
  );
}
