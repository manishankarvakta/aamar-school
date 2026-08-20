'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, Users, Sparkles, CheckCircle } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface AttendanceRecord {
  id: string;
  date: Date;
  status: string;
  remarks?: string | null;
}

interface ChildData {
  profile: {
    id: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    className: string;
    sectionName: string;
    gender?: string | null;
    bloodGroup: string;
    phone: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendanceRate: number;
    records: AttendanceRecord[];
  };
}

interface ParentAttendanceClientProps {
  data: {
    parent: {
      firstName: string;
      lastName: string;
      email: string;
    };
    children: ChildData[];
  };
}

export function ParentAttendanceClient({ data }: ParentAttendanceClientProps) {
  const { parent, children } = data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedChildIndex = parseInt(searchParams.get('child') || '0', 10);
  const activeChild = children[selectedChildIndex] || children[0];

  const handleChildSelect = (val: string) => {
    router.push(`${pathname}?child=${val}`);
  };

  if (!activeChild) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">No Students Linked</h2>
        <p className="text-muted-foreground text-sm">
          There are currently no students associated with your parent account. Please contact the school administration.
        </p>
      </div>
    );
  }

  const attendanceChartData = [
    { name: 'Present', value: activeChild.attendance.presentDays, color: '#10B981' },
    { name: 'Absent', value: activeChild.attendance.absentDays, color: '#EF4444' },
    { name: 'Late', value: activeChild.attendance.lateDays, color: '#F59E0B' },
    { name: 'Excused', value: activeChild.attendance.excusedDays, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  const hasAttendanceData = attendanceChartData.length > 0;
  const defaultAttendanceChartData = [
    { name: 'Present', value: 100, color: '#E2E8F0' }
  ];

  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6 pb-20 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10" />
        <div className="space-y-2 relative z-10">
          <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1 w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Attendance Tracker
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Daily Attendance Summary</h1>
          <p className="text-indigo-200 text-sm max-w-md">
            Monitor and track classroom check-in rates and logs for your child.
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 ? (
          <div className="space-y-1.5 relative z-10 w-full md:w-60 bg-white/10 p-3 rounded-xl border border-white/20">
            <label className="text-xs text-indigo-150 font-bold uppercase tracking-wider block">SELECT CHILD</label>
            <Select value={selectedChildIndex.toString()} onValueChange={handleChildSelect}>
              <SelectTrigger className="bg-white text-slate-800 border-none h-10">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child, idx) => (
                  <SelectItem key={child.profile.id} value={idx.toString()}>
                    {child.profile.firstName} ({child.profile.className})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-3 rounded-xl text-sm flex items-center gap-3 relative z-10 shrink-0">
            <Users className="h-5 w-5" />
            <div className="text-left">
              <span className="text-xs text-indigo-200 block font-medium uppercase tracking-wider">CHILD</span>
              <span className="font-bold">{activeChild.profile.firstName} {activeChild.profile.lastName}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-700" />
                Attendance Log Details - {activeChild.profile.firstName}
              </CardTitle>
              <CardDescription>Historical attendance check-in records.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {activeChild.attendance.records.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  📅 No attendance logs available for this student.
                </div>
              ) : (
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50/50 text-slate-650 font-semibold">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-650">Date</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-650">Status</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-650">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChild.attendance.records.map((rec) => (
                      <tr key={rec.id} className="border-b hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-800">{formatDate(rec.date)}</td>
                        <td className="p-4">
                          <Badge className={
                            rec.status === 'PRESENT' 
                              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' 
                              : rec.status === 'ABSENT' 
                              ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100' 
                              : rec.status === 'LATE' 
                              ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100' 
                              : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100'
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
        </div>

        {/* Right col: pie chart */}
        <div className="space-y-6">
          <Card className="shadow-md border border-slate-100">
            <CardHeader>
              <CardTitle className="text-base font-bold">Attendance Share</CardTitle>
              <CardDescription>Visual stats representation.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
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
                  <span className="text-3xl font-extrabold text-slate-800">{activeChild.attendance.attendanceRate}%</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Attendance Rate</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full text-center mt-4 border-t pt-4">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Present Days</span>
                  <span className="text-base font-bold text-green-600">{activeChild.attendance.presentDays}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Absent Days</span>
                  <span className="text-base font-bold text-red-650">{activeChild.attendance.absentDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
