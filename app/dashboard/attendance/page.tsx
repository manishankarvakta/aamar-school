'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

// Sample data
const attendanceData = [
  {
    id: 1,
    studentId: 'STD2024001',
    name: 'Alice Johnson',
    class: 'Grade 10',
    section: 'A',
    rollNo: 'A001',
    photo: '/api/placeholder/40/40',
    today: 'Present',
    thisWeek: { present: 4, absent: 1, late: 0 },
    thisMonth: { present: 18, absent: 2, late: 1, percentage: 90.5 },
    parentContact: '+1234567890',
    lastAbsent: '2024-01-15'
  },
  {
    id: 2,
    studentId: 'STD2024002',
    name: 'Michael Chen',
    class: 'Grade 10',
    section: 'A',
    rollNo: 'A002',
    photo: '/api/placeholder/40/40',
    today: 'Present',
    thisWeek: { present: 5, absent: 0, late: 0 },
    thisMonth: { present: 21, absent: 0, late: 0, percentage: 100 },
    parentContact: '+1234567891',
    lastAbsent: null
  },
  {
    id: 3,
    studentId: 'STD2024003',
    name: 'Emma Rodriguez',
    class: 'Grade 9',
    section: 'B',
    rollNo: 'B001',
    photo: '/api/placeholder/40/40',
    today: 'Absent',
    thisWeek: { present: 3, absent: 2, late: 0 },
    thisMonth: { present: 15, absent: 5, late: 1, percentage: 75.0 },
    parentContact: '+1234567892',
    lastAbsent: '2024-01-20'
  },
  {
    id: 4,
    studentId: 'STD2024004',
    name: 'James Wilson',
    class: 'Grade 9',
    section: 'B',
    rollNo: 'B002',
    photo: '/api/placeholder/40/40',
    today: 'Late',
    thisWeek: { present: 4, absent: 0, late: 1 },
    thisMonth: { present: 18, absent: 1, late: 2, percentage: 90.5 },
    parentContact: '+1234567893',
    lastAbsent: '2024-01-10'
  }
];

const staffAttendance = [
  {
    id: 1,
    employeeId: 'TCH2024001',
    name: 'Dr. Sarah Johnson',
    department: 'Mathematics',
    today: 'Present',
    checkIn: '08:30 AM',
    checkOut: null,
    thisMonth: { present: 20, absent: 1, late: 0, percentage: 95.2 },
    photo: '/api/placeholder/40/40'
  },
  {
    id: 2,
    employeeId: 'TCH2024002',
    name: 'Prof. Michael Chen',
    department: 'Physics',
    today: 'Present',
    checkIn: '08:25 AM',
    checkOut: null,
    thisMonth: { present: 21, absent: 0, late: 0, percentage: 100 },
    photo: '/api/placeholder/40/40'
  },
  {
    id: 3,
    employeeId: 'STF2024001',
    name: 'Ms. Jennifer Davis',
    department: 'Administration',
    today: 'Late',
    checkIn: '09:15 AM',
    checkOut: null,
    thisMonth: { present: 19, absent: 1, late: 1, percentage: 90.5 },
    photo: '/api/placeholder/40/40'
  }
];

const classes = ['All Classes', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const sections = ['All Sections', 'A', 'B', 'C', 'D'];
const attendanceStatus = ['All', 'Present', 'Absent', 'Late'];

export default function AttendancePage() {
  const [selectedTab, setSelectedTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMarkDialog, setShowMarkDialog] = useState(false);

  const stats = [
    { title: 'Present Today', value: '834', icon: CheckCircleIcon, color: 'green' },
    { title: 'Absent Today', value: '23', icon: XCircleIcon, color: 'red' },
    { title: 'Late Today', value: '8', icon: AlertCircleIcon, color: 'yellow' },
    { title: 'Average Attendance', value: '94.2%', icon: TrendingUpIcon, color: 'blue' },
  ];

  const filteredStudents = attendanceData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || student.class === selectedClass;
    const matchesSection = selectedSection === 'All Sections' || student.section === selectedSection;
    const matchesStatus = selectedStatus === 'All' || student.today === selectedStatus;
    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
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

  const markAttendance = (studentId: string, status: string) => {
    // In a real app, this would update the backend
    console.log(`Marking ${studentId} as ${status}`);
  };

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage daily attendance for students and staff
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowMarkDialog(true)} className="gap-2">
            <UserCheckIcon className="h-4 w-4" />
            Mark Attendance
          </Button>
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export Report
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
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              {/* <Label htmlFor="date">Date</Label> */}
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {attendanceStatus.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
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
                    <TableHead>This Week</TableHead>
                    <TableHead>Monthly %</TableHead>
                    <TableHead>Last Absent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const StatusIcon = getStatusIcon(student.today);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photo} />
                              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.studentId} • {student.rollNo}</p>
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
                              <DropdownMenuItem onClick={() => markAttendance(student.studentId, 'Present')}>
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                                Mark Present
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => markAttendance(student.studentId, 'Absent')}>
                                <XCircleIcon className="h-4 w-4 mr-2 text-red-600" />
                                Mark Absent
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => markAttendance(student.studentId, 'Late')}>
                                <AlertCircleIcon className="h-4 w-4 mr-2 text-yellow-600" />
                                Mark Late
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                    <TableHead>Department</TableHead>
                    <TableHead>Today's Status</TableHead>
                    <TableHead>Check In/Out</TableHead>
                    <TableHead>Monthly %</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffAttendance.map((staff) => {
                    const StatusIcon = getStatusIcon(staff.today);
                    return (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.photo} />
                              <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-sm text-muted-foreground">{staff.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(staff.today)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {staff.today}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>In: {staff.checkIn}</p>
                            <p className="text-muted-foreground">
                              Out: {staff.checkOut || 'Not checked out'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getAttendanceColor(staff.thisMonth.percentage)}`}>
                              {staff.thisMonth.percentage}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  staff.thisMonth.percentage >= 95 ? 'bg-green-500' : 
                                  staff.thisMonth.percentage >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${staff.thisMonth.percentage}%` }}
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
                              <DropdownMenuItem>
                                <ClockIcon className="h-4 w-4 mr-2" />
                                Manual Check-in
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ClockIcon className="h-4 w-4 mr-2" />
                                Manual Check-out
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Timesheet
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.slice(1, 6).map((cls) => (
                    <div key={cls} className="flex justify-between items-center">
                      <span>{cls}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{Math.floor(Math.random() * 10) + 85}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.floor(Math.random() * 20) + 80}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Students</span>
                    <span className="font-semibold">865</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Present</span>
                    <span className="font-semibold text-green-600">834</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absent</span>
                    <span className="font-semibold text-red-600">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late</span>
                    <span className="font-semibold text-yellow-600">8</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Attendance Rate</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Attendance Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Emma Rodriguez</p>
                      <p className="text-xs text-muted-foreground">Grade 9-B</p>
                    </div>
                    <span className="text-red-600 font-semibold text-sm">75%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">James Wilson</p>
                      <p className="text-xs text-muted-foreground">Grade 9-B</p>
                    </div>
                    <span className="text-yellow-600 font-semibold text-sm">82%</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                    <div key={day} className="flex justify-between items-center">
                      <span>{day}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{Math.floor(Math.random() * 10) + 90}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.floor(Math.random() * 15) + 85}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current Month</span>
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">94.2%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Previous Month</span>
                    <span className="font-semibold">92.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Same Month Last Year</span>
                    <span className="font-semibold">91.5%</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span>Improvement</span>
                    <span className="font-semibold text-green-600">+1.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quick Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="markClass">Class</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.slice(1).map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="markSection">Section</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.slice(1).map((section) => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <XCircleIcon className="h-4 w-4 text-red-600" />
                  Mark Selected Absent
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Import from CSV
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMarkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowMarkDialog(false)}>
              Save Attendance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
