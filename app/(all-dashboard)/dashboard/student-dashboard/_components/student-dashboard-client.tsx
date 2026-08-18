'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Megaphone,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  Legend
} from 'recharts';
import { StudentDashboardLayout } from './student-dashboard-layout';

interface StudentDashboardClientProps {
  data: {
    profile: {
      id: string;
      rollNumber: string;
      admissionDate: Date;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      dateOfBirth?: Date | null;
      gender?: string | null;
      bloodGroup: string;
      nationality: string;
      religion: string;
      className: string;
      sectionName: string;
    };
    routine: {
      slots: Array<{
        id: string;
        day: string;
        startTime: string;
        endTime: string;
        classType: string;
        subjectName: string;
        teacherName: string;
      }>;
    } | null;
    examResults: Array<{
      id: string;
      examName: string;
      subjectName: string;
      obtainedMarks: number;
      fullMarks: number;
      grade: string;
      remarks: string;
    }>;
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
    announcements: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      createdAt: Date;
      author: string;
    }>;
  };
}

export function StudentDashboardClient({ data }: StudentDashboardClientProps) {
  const { profile, examResults, attendance, totalDue, announcements } = data;

  // Chart data for attendance
  const attendanceChartData = [
    { name: 'Present', value: attendance.presentDays, color: '#10B981' },
    { name: 'Absent', value: attendance.absentDays, color: '#EF4444' },
    { name: 'Late', value: attendance.lateDays, color: '#F59E0B' },
    { name: 'Excused', value: attendance.excusedDays, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  const hasAttendanceData = attendanceChartData.length > 0;
  const defaultAttendanceChartData = [
    { name: 'Present', value: 100, color: '#E2E8F0' }
  ];

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Profile Details & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">FULL NAME</span>
                    <span className="text-sm font-medium">{profile.firstName} {profile.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">EMAIL ADDRESS</span>
                    <span className="text-sm font-medium break-all">{profile.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">PHONE</span>
                    <span className="text-sm font-medium">{profile.phone}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">DATE OF BIRTH</span>
                    <span className="text-sm font-medium">{formatDate(profile.dateOfBirth)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">ADDRESS</span>
                    <span className="text-sm font-medium">{profile.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">BLOOD GROUP / GENDER</span>
                    <span className="text-sm font-medium">{profile.bloodGroup} / {profile.gender || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Latest School Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No active announcements from administration.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="border-l-4 border-primary bg-slate-50/50 p-4 rounded-r-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 text-sm">{ann.title}</h4>
                      <Badge variant={ann.type === 'URGENT' ? 'destructive' : 'secondary'} className="text-[10px] px-2 py-0.5">
                        {ann.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{ann.message}</p>
                    <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground font-medium">
                      <span>By {ann.author}</span>
                      <span>{formatDate(ann.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Attendance Breakdown */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Attendance Breakdown
              </CardTitle>
              <CardDescription>Visual summary of attendance records</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center pb-6">
              <div className="h-56 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hasAttendanceData ? attendanceChartData : defaultAttendanceChartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(hasAttendanceData ? attendanceChartData : defaultAttendanceChartData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center flex flex-col">
                  <span className="text-3xl font-extrabold text-slate-800">{attendance.attendanceRate}%</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Attendance Rate</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full text-center mt-4 border-t pt-4">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Present Days</span>
                  <span className="text-base font-bold text-green-600">{attendance.presentDays}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Absent Days</span>
                  <span className="text-base font-bold text-red-600">{attendance.absentDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
