'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Megaphone,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  Legend
} from 'recharts';

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
    records: Array<{
      id: string;
      date: Date;
      status: string;
      remarks?: string | null;
    }>;
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
}

interface ParentDashboardClientProps {
  data: {
    parent: {
      firstName: string;
      lastName: string;
      email: string;
    };
    children: ChildData[];
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

export function ParentDashboardClient({ data }: ParentDashboardClientProps) {
  const { parent, children, announcements } = data;
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const activeChild = children[selectedChildIndex];

  // If parent has no linked children
  if (!activeChild) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">No Students Linked</h2>
        <p className="text-muted-foreground text-sm">
          There are currently no students associated with your parent account. Please contact the school administration to link your children.
        </p>
      </div>
    );
  }

  // Chart data for active child's attendance
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

  // Group routine by day
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const routineByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = activeChild.routine?.slots.filter(s => s.day.toLowerCase() === day.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
    return acc;
  }, {} as Record<string, any[]>);

  // Format Date utility
  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6 pb-20">
      
      {/* Welcome & Child Selector Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Parent Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Assalamu Alaikum, {parent.firstName}!</h1>
          <p className="text-indigo-200 text-sm max-w-md">
            Monitor and track your children's academic performance, class routines, and billing status.
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 ? (
          <div className="space-y-1.5 relative z-10 w-full md:w-60 bg-white/10 p-3 rounded-xl border border-white/20">
            <label className="text-xs text-indigo-150 font-bold uppercase tracking-wider block">SELECT CHILD</label>
            <Select 
              value={selectedChildIndex.toString()} 
              onValueChange={(val) => {
                setSelectedChildIndex(parseInt(val));
                setActiveTab('overview');
              }}
            >
              <SelectTrigger className="bg-white text-slate-800 border-none">
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

      {/* Child Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">{activeChild.profile.firstName}'s Attendance</span>
              <p className="text-2xl font-bold">{activeChild.attendance.attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">{activeChild.attendance.presentDays} of {activeChild.attendance.totalDays} days present</p>
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
              <p className="text-2xl font-bold text-red-600">৳{activeChild.totalDue}</p>
              <p className="text-xs text-muted-foreground">Fees due for {activeChild.profile.firstName}</p>
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
              <span className="text-sm font-medium text-muted-foreground">Graded Reports</span>
              <p className="text-2xl font-bold">{activeChild.examResults.length}</p>
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
              <p className="text-2xl font-bold">{announcements.length}</p>
              <p className="text-xs text-muted-foreground">Active updates from school</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Megaphone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Content Area */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border w-full md:w-auto overflow-x-auto h-auto p-1 grid grid-cols-5 md:flex gap-1 md:gap-2">
          <TabsTrigger value="overview" className="text-xs md:text-sm py-2 px-3">Overview</TabsTrigger>
          <TabsTrigger value="routine" className="text-xs md:text-sm py-2 px-3">Routine</TabsTrigger>
          <TabsTrigger value="exams" className="text-xs md:text-sm py-2 px-3">Exams</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs md:text-sm py-2 px-3">Attendance</TabsTrigger>
          <TabsTrigger value="fees" className="text-xs md:text-sm py-2 px-3">Fees & Dues</TabsTrigger>
        </TabsList>

        {/* ─── TAB: OVERVIEW ─── */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Child Profile Details & Announcements */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-700" />
                    Student Profile: {activeChild.profile.firstName} {activeChild.profile.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">CLASS / SECTION</span>
                        <span className="text-sm font-medium">Class {activeChild.profile.className} - {activeChild.profile.sectionName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">ROLL NUMBER</span>
                        <span className="text-sm font-medium">{activeChild.profile.rollNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">STUDENT EMAIL</span>
                        <span className="text-sm font-medium break-all">{activeChild.profile.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">BLOOD GROUP / GENDER</span>
                        <span className="text-sm font-medium">{activeChild.profile.bloodGroup} / {activeChild.profile.gender || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">STUDENT PHONE</span>
                        <span className="text-sm font-medium">{activeChild.profile.phone}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* School Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-indigo-700" />
                    Latest School Announcements for Parents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {announcements.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No active announcements from administration.
                    </div>
                  ) : (
                    announcements.map((ann) => (
                      <div key={ann.id} className="border-l-4 border-indigo-600 bg-slate-50/50 p-4 rounded-r-xl space-y-2">
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

            {/* Right Col: Attendance Pie Chart */}
            <div className="space-y-6">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-700" />
                    {activeChild.profile.firstName}'s Attendance
                  </CardTitle>
                  <CardDescription>Visual summary of attendance logs</CardDescription>
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
                      <span className="text-base font-bold text-red-600">{activeChild.attendance.absentDays}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB: CLASS ROUTINE ─── */}
        <TabsContent value="routine" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-700" />
                {activeChild.profile.firstName}'s Routine
              </CardTitle>
              <CardDescription>Weekly class routine schedule</CardDescription>
            </CardHeader>
            <CardContent>
              {!activeChild.routine || activeChild.routine.slots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  📚 No class routine has been set up for this class.
                </div>
              ) : (
                <div className="space-y-8">
                  {daysOfWeek.map((day) => {
                    const slots = routineByDay[day];
                    if (slots.length === 0) return null;

                    return (
                      <div key={day} className="space-y-3">
                        <h3 className="font-bold text-slate-800 border-b pb-1 border-slate-100 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          {day}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {slots.map((slot: any) => (
                            <div key={slot.id} className="border p-4 rounded-xl shadow-sm bg-card hover:border-slate-300 transition-colors space-y-2 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-slate-800">{slot.subjectName}</span>
                                <Badge variant="secondary" className="text-[10px] font-medium tracking-wide">
                                  {slot.classType}
                                </Badge>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <div className="text-xs font-semibold text-slate-700">
                                Teacher: {slot.teacherName}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: EXAM RESULTS ─── */}
        <TabsContent value="exams" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-700" />
                Academic Report Card
              </CardTitle>
              <CardDescription>Subject grades and marks report for {activeChild.profile.firstName}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {activeChild.examResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  📝 No exam results have been published yet.
                </div>
              ) : (
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50/50 text-slate-600 font-semibold">
                      <th className="p-4">Exam Name</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Marks Obtained</th>
                      <th className="p-4">Percentage</th>
                      <th className="p-4">Grade</th>
                      <th className="p-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChild.examResults.map((result) => {
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
        </TabsContent>

        {/* ─── TAB: ATTENDANCE ─── */}
        <TabsContent value="attendance" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-700" />
                Attendance Log Details
              </CardTitle>
              <CardDescription>Daily attendance logs for {activeChild.profile.firstName}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {activeChild.attendance.records.length === 0 ? (
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
                    {activeChild.attendance.records.map((rec) => (
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
        </TabsContent>

        {/* ─── TAB: FEES ─── */}
        <TabsContent value="fees" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-700" />
                School Fees & Dues
              </CardTitle>
              <CardDescription>Academic billing, dues, and payment records</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {activeChild.fees.length === 0 ? (
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
                    {activeChild.fees.map((fee) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
