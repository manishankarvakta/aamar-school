'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { StudentDashboardLayout } from './student-dashboard-layout';

interface StudentFeesClientProps {
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
    examResults: Array<any>;
    fees: Array<{
      id: string;
      title: string;
      feeType: string;
      amount: number;
      lateFee: number;
      dueDate: Date;
      status: string;
    }>;
    totalDue: number;
    announcements: Array<any>;
  };
}

export function StudentFeesClient({ data }: StudentFeesClientProps) {
  const { profile, fees, attendance, totalDue, examResults, announcements } = data;

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
            <FileText className="h-5 w-5 text-primary" />
            Fees & Dues Billing
          </CardTitle>
          <CardDescription>Academic fees and payments details</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {fees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              💰 No fee records found.
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/50 text-slate-600 font-semibold">
                  <th className="p-4">Fee Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Late Fee</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className="border-b hover:bg-slate-50/30 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{fee.title}</td>
                    <td className="p-4 font-medium text-slate-700 capitalize">{fee.feeType.toLowerCase()}</td>
                    <td className="p-4 font-bold text-slate-900">৳{fee.amount}</td>
                    <td className="p-4 text-red-500 font-medium">৳{fee.lateFee}</td>
                    <td className="p-4 font-medium text-slate-700">{formatDate(fee.dueDate)}</td>
                    <td className="p-4">
                      <Badge className={
                        fee.status === 'PAID' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : fee.status === 'PENDING' 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }>
                        {fee.status}
                      </Badge>
                    </td>
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
