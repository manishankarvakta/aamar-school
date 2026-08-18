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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  PlusIcon,
  SearchIcon,
  UsersIcon,
  BuildingIcon,
  ClockIcon,
  DollarSignIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  EyeIcon,
  DownloadIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
} from 'lucide-react';

// Sample data
const staffData = [
  {
    id: 1,
    employeeId: 'STF2024001',
    name: 'Jennifer Davis',
    position: 'Administrative Officer',
    department: 'Administration',
    joinDate: '2022-03-15',
    phone: '+1234567890',
    email: 'jennifer.davis@school.com',
    salary: 35000,
    status: 'Active',
    workingHours: 'Full Time',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 2,
    employeeId: 'STF2024002',
    name: 'Robert Wilson',
    position: 'Maintenance Supervisor',
    department: 'Maintenance',
    joinDate: '2021-08-10',
    phone: '+1234567891',
    email: 'robert.wilson@school.com',
    salary: 28000,
    status: 'Active',
    workingHours: 'Full Time',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 3,
    employeeId: 'STF2024003',
    name: 'Maria Garcia',
    position: 'Librarian',
    department: 'Library',
    joinDate: '2020-01-20',
    phone: '+1234567892',
    email: 'maria.garcia@school.com',
    salary: 32000,
    status: 'Active',
    workingHours: 'Full Time',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 4,
    employeeId: 'STF2024004',
    name: 'James Miller',
    position: 'Security Guard',
    department: 'Security',
    joinDate: '2023-06-01',
    phone: '+1234567893',
    email: 'james.miller@school.com',
    salary: 25000,
    status: 'Active',
    workingHours: 'Part Time',
    photo: '/api/placeholder/40/40'
  }
];

const attendanceData = [
  {
    id: 1,
    employeeId: 'STF2024001',
    name: 'Jennifer Davis',
    department: 'Administration',
    checkIn: '08:30 AM',
    checkOut: '05:30 PM',
    hoursWorked: 9,
    status: 'Present',
    date: '2024-02-20'
  },
  {
    id: 2,
    employeeId: 'STF2024002',
    name: 'Robert Wilson',
    department: 'Maintenance',
    checkIn: '07:00 AM',
    checkOut: '04:00 PM',
    hoursWorked: 9,
    status: 'Present',
    date: '2024-02-20'
  }
];

const leaveData = [
  {
    id: 1,
    employeeId: 'STF2024001',
    name: 'Jennifer Davis',
    leaveType: 'Annual Leave',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    days: 5,
    reason: 'Family vacation',
    status: 'Approved',
    appliedDate: '2024-02-15'
  },
  {
    id: 2,
    employeeId: 'STF2024003',
    name: 'Maria Garcia',
    leaveType: 'Sick Leave',
    startDate: '2024-02-25',
    endDate: '2024-02-25',
    days: 1,
    reason: 'Medical appointment',
    status: 'Pending',
    appliedDate: '2024-02-20'
  }
];

const departments = ['All Departments', 'Administration', 'Maintenance', 'Library', 'Security', 'Transport', 'Canteen'];
const statuses = ['All Status', 'Active', 'Inactive', 'On Leave'];

export default function StaffPage() {
  const [selectedTab, setSelectedTab] = useState('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const stats = [
    { title: 'Total Staff', value: '45', icon: UsersIcon, color: 'blue' },
    { title: 'Present Today', value: '42', icon: CheckCircleIcon, color: 'green' },
    { title: 'On Leave', value: '3', icon: CalendarIcon, color: 'yellow' },
    { title: 'Departments', value: '6', icon: BuildingIcon, color: 'purple' },
  ];

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All Departments' || staff.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'All Status' || staff.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage non-teaching staff, attendance, and HR operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Staff
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
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
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
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
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>{staff.joinDate}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{staff.phone}</p>
                          <p className="text-muted-foreground">{staff.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatCurrency(staff.salary)}</span>
                        <p className="text-sm text-muted-foreground">{staff.workingHours}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(staff.status)}>
                          {staff.status}
                        </Badge>
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
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowLeaveDialog(true)}>
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              Apply Leave
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Generate Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{attendance.name}</p>
                          <p className="text-sm text-muted-foreground">{attendance.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{attendance.department}</TableCell>
                      <TableCell>{attendance.checkIn}</TableCell>
                      <TableCell>{attendance.checkOut}</TableCell>
                      <TableCell>{attendance.hoursWorked} hours</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(attendance.status)}>
                          {attendance.status}
                        </Badge>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Leave Applications</h3>
            <Button onClick={() => setShowLeaveDialog(true)} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Apply Leave
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveData.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{leave.name}</p>
                          <p className="text-sm text-muted-foreground">{leave.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{leave.startDate} to {leave.endDate}</p>
                          <p className="text-muted-foreground">{leave.days} day(s)</p>
                        </div>
                      </TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>{leave.appliedDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status}
                        </Badge>
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
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertCircleIcon className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.slice(1, 5).map((dept) => (
                    <div key={dept} className="flex justify-between items-center">
                      <span>{dept}</span>
                      <span className="font-semibold">{Math.floor(Math.random() * 10) + 5}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Staff</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Present Today</span>
                    <span className="font-semibold text-green-600">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On Leave</span>
                    <span className="font-semibold text-yellow-600">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance Rate</span>
                    <span className="font-semibold">93.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export Staff List
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    Generate Payroll
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Leave Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input placeholder="Enter employee ID" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input placeholder="Enter position" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.slice(1).map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="Enter email address" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddDialog(false)}>Add Staff</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {staffData.map((staff) => (
                    <SelectItem key={staff.id} value={staff.employeeId}>
                      {staff.name} - {staff.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowLeaveDialog(false)}>Submit Application</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
