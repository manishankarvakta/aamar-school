'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import {
  CalendarCheckIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
  EyeIcon,
  UserCheckIcon,
  UserXIcon,
} from 'lucide-react';
import {
  getAttendanceFilters,
  getAttendanceStats,
  getStudentsAttendanceList,
  getStaffAttendanceList,
  markStudentAttendance,
  markStaffAttendance,
  quickBulkMarkAttendance,
} from '@/app/actions/attendance';

export default function AttendancePage() {
  const [selectedTab, setSelectedTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic filter lists
  const [classesList, setClassesList] = useState<string[]>(['All Classes']);
  const [sectionsList, setSectionsList] = useState<string[]>(['All Sections']);

  // Dynamic data lists
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    averageAttendance: '100%',
  });

  // Bulk marking dialog states
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSection, setBulkSection] = useState('');

  const { toast } = useToast();

  // Load classes/sections filters once
  useEffect(() => {
    async function loadFilters() {
      const res = await getAttendanceFilters();
      if (res.success) {
        if (res.classes) setClassesList(res.classes);
        if (res.sections) setSectionsList(res.sections);
      }
    }
    loadFilters();
  }, []);

  // Load stats, students, and staff data when date changes
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, staffRes] = await Promise.all([
        getAttendanceStats(selectedDate),
        getStudentsAttendanceList(selectedDate),
        getStaffAttendanceList(selectedDate),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStatsData(statsRes.stats);
      }
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data);
      }
      if (staffRes.success && staffRes.data) {
        setStaff(staffRes.data);
      }
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load attendance records.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Statistics display cards mapping
  const stats = [
    { title: 'Present Today', value: statsData.presentToday.toString(), icon: CheckCircleIcon, color: 'green' },
    { title: 'Absent Today', value: statsData.absentToday.toString(), icon: XCircleIcon, color: 'red' },
    { title: 'Late Today', value: statsData.lateToday.toString(), icon: AlertCircleIcon, color: 'yellow' },
    { title: 'Average Attendance', value: statsData.averageAttendance, icon: TrendingUpIcon, color: 'blue' },
  ];

  // Filtering students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || student.class === selectedClass;
    const matchesSection = selectedSection === 'All Sections' || student.section === selectedSection;
    const matchesStatus = selectedStatus === 'All' || student.today === selectedStatus;
    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  // Filtering staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || member.today === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return CheckCircleIcon;
      case 'Absent': return XCircleIcon;
      case 'Late': return AlertCircleIcon;
      default: return ClockIcon;
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-blue-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Actions handler
  const handleMarkStudent = async (studentId: string, status: string) => {
    setLoading(true);
    const res = await markStudentAttendance(studentId, selectedDate, status);
    if (res.success) {
      toast({
        title: 'Attendance Updated',
        description: res.message,
      });
      await loadData();
    } else {
      toast({
        title: 'Error',
        description: res.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleMarkStaff = async (teacherId: string, status: string) => {
    setLoading(true);
    const res = await markStaffAttendance(teacherId, selectedDate, status);
    if (res.success) {
      toast({
        title: 'Attendance Updated',
        description: res.message,
      });
      await loadData();
    } else {
      toast({
        title: 'Error',
        description: res.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleQuickBulkMark = async (action: 'MARK_ALL_PRESENT' | 'MARK_SELECTED_ABSENT') => {
    if (!bulkClass) {
      toast({
        title: 'Selection Required',
        description: 'Please select a class first.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const res = await quickBulkMarkAttendance(
      bulkClass,
      bulkSection || 'All Sections',
      selectedDate,
      action
    );
    if (res.success) {
      toast({
        title: 'Bulk Action Completed',
        description: res.message,
      });
      setShowMarkDialog(false);
      await loadData();
    } else {
      toast({
        title: 'Error',
        description: res.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Dynamic stats calculation for analytics
  const distinctClasses = Array.from(new Set(students.map(s => s.class)));
  const classWiseStats = distinctClasses.map(clsName => {
    const clsStudents = students.filter(s => s.class === clsName);
    const totalPossible = clsStudents.length || 1;
    const presentCount = clsStudents.filter(s => s.today === 'Present' || s.today === 'Late').length;
    const percentage = Math.round((presentCount / totalPossible) * 100);
    return { name: clsName, percentage };
  });

  const lowAttendanceStudents = students
    .filter(s => s.thisMonth.percentage < 85)
    .sort((a, b) => a.thisMonth.percentage - b.thisMonth.percentage)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-[150px] p-4 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center min-h-[400px] rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage daily attendance for students and staff
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowMarkDialog(true)} className="gap-2">
            <UserCheckIcon className="h-4 w-4" />
            Quick Bulk Mark
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <DownloadIcon className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex gap-2 items-center">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={selectedTab === 'students' ? "Search students..." : "Search staff members..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {selectedTab === 'students' && (
              <>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesList.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionsList.map((section) => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Excused">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Students ({filteredStudents.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({filteredStaff.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Today's Status</TableHead>
                    <TableHead>This Week (P/A/L)</TableHead>
                    <TableHead>Monthly %</TableHead>
                    <TableHead>Last Absent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-6 text-muted-foreground">
                        No students found matching current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const StatusIcon = getStatusIcon(student.today);
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.photo} />
                                <AvatarFallback>{student.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.studentId} • Roll: {student.rollNo}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.class} - {student.section}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(student.today)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {student.today}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="text-green-600">P: {student.thisWeek.present}</span> • 
                              <span className="text-red-600 ml-1">A: {student.thisWeek.absent}</span> • 
                              <span className="text-yellow-600 ml-1">L: {student.thisWeek.late}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${getAttendanceColor(student.thisMonth.percentage)}`}>
                                {student.thisMonth.percentage}%
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    student.thisMonth.percentage >= 85 ? 'bg-green-500' : 
                                    student.thisMonth.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${student.thisMonth.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.lastAbsent ? (
                              <span className="text-sm text-muted-foreground">{student.lastAbsent}</span>
                            ) : (
                              <span className="text-sm text-green-600">Perfect</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleMarkStudent(student.id, 'Present')}>
                                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                                  Mark Present
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkStudent(student.id, 'Absent')}>
                                  <XCircleIcon className="h-4 w-4 mr-2 text-red-600" />
                                  Mark Absent
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkStudent(student.id, 'Late')}>
                                  <AlertCircleIcon className="h-4 w-4 mr-2 text-yellow-600" />
                                  Mark Late
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkStudent(student.id, 'Excused')}>
                                  <ClockIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  Mark Excused
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Department/Spec.</TableHead>
                    <TableHead>Today's Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Monthly %</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center p-6 text-muted-foreground">
                        No staff members found matching current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((member) => {
                      const StatusIcon = getStatusIcon(member.today);
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.photo} />
                                <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.employeeId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(member.today)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {member.today}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>In: {member.checkIn}</p>
                              <p className="text-xs text-muted-foreground">
                                Out: Not checked out
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${getAttendanceColor(member.thisMonth.percentage)}`}>
                                {member.thisMonth.percentage}%
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    member.thisMonth.percentage >= 95 ? 'bg-green-500' : 
                                    member.thisMonth.percentage >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${member.thisMonth.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleMarkStaff(member.id, 'Present')}>
                                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                                  Mark Present
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkStaff(member.id, 'Absent')}>
                                  <XCircleIcon className="h-4 w-4 mr-2 text-red-600" />
                                  Mark Absent
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkStaff(member.id, 'Late')}>
                                  <AlertCircleIcon className="h-4 w-4 mr-2 text-yellow-600" />
                                  Mark Late
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class-wise Today Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classWiseStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No class data loaded.</p>
                  ) : (
                    classWiseStats.map((cls) => (
                      <div key={cls.name} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{cls.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{cls.percentage}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${cls.percentage >= 85 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                              style={{ width: `${cls.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Students</span>
                    <span className="font-semibold">{students.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Present (Assumed / Marked)</span>
                    <span className="font-semibold text-green-600">{statsData.presentToday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Absent</span>
                    <span className="font-semibold text-red-600">{statsData.absentToday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Late</span>
                    <span className="font-semibold text-yellow-600">{statsData.lateToday}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 font-medium">
                    <span>Overall Attendance Rate</span>
                    <span className="font-semibold text-blue-600">{statsData.averageAttendance}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Attendance Alerts (Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowAttendanceStudents.length === 0 ? (
                    <p className="text-sm text-green-600 font-medium">All students maintain good attendance records (85%+).</p>
                  ) : (
                    lowAttendanceStudents.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.class} - {s.section}</p>
                        </div>
                        <span className="text-red-600 font-semibold text-sm">{s.thisMonth.percentage}%</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Week Attendance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/50 rounded-lg space-y-2">
                    <p className="text-sm text-blue-800 font-medium">Total Registered Enrolments</p>
                    <p className="text-2xl font-bold text-blue-900">{students.length} Students</p>
                  </div>
                  <div className="p-4 bg-green-50/50 rounded-lg space-y-2">
                    <p className="text-sm text-green-800 font-medium">Average Present Rate</p>
                    <p className="text-2xl font-bold text-green-900">{statsData.averageAttendance}</p>
                  </div>
                  <div className="p-4 bg-yellow-50/50 rounded-lg space-y-2">
                    <p className="text-sm text-yellow-800 font-medium">Monthly Late Rate</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {students.length > 0 
                        ? (Math.round((students.reduce((acc, s) => acc + s.thisMonth.late, 0) / (students.length * 20)) * 100) || 0)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Staff Engagement Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Total Staff Members</span>
                    <span className="font-semibold">{staff.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Present Staff Today</span>
                    <span className="font-semibold text-green-600">
                      {staff.filter(m => m.today === 'Present' || m.today === 'Late').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Absent Staff Today</span>
                    <span className="font-semibold text-red-600">
                      {staff.filter(m => m.today === 'Absent').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span>Staff Attendance Rate</span>
                    <span className="font-semibold text-blue-600">
                      {staff.length > 0 
                        ? `${Math.round((staff.filter(m => m.today === 'Present' || m.today === 'Late').length / staff.length) * 100)}%`
                        : '100%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <h3 className="text-lg font-bold">Quick Mark Attendance</h3>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={bulkClass} onValueChange={setBulkClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classesList.slice(1).map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={bulkSection} onValueChange={setBulkSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionsList.slice(1).map((section) => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Actions</Label>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => handleQuickBulkMark('MARK_ALL_PRESENT')} 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-green-700 hover:text-green-800 hover:bg-green-50"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Mark All Present
                </Button>
                <Button 
                  onClick={() => handleQuickBulkMark('MARK_SELECTED_ABSENT')} 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-red-700 hover:text-red-800 hover:bg-red-50"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Mark All Absent
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMarkDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
