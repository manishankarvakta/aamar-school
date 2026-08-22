'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  SearchIcon,
  UsersIcon,
  BuildingIcon,
  ClockIcon,
  DollarSignIcon,
  TrashIcon,
  MoreVerticalIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldIcon,
  CopyIcon,
  CheckIcon,
  KeyIcon,
} from 'lucide-react';
import { addStaff, deleteStaff, submitLeaveRequest, updateLeaveStatus } from '@/app/actions/staff';
import { useToast } from '@/components/ui/use-toast';
import { useBranch } from '@/contexts/branch-context';

interface StaffItem {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  joinDate: string;
  phone: string;
  email: string;
  salary: number;
  status: string;
  workingHours: string;
  photo: string;
  branchId?: string | null;
}

interface AttendanceItem {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: string;
  date: string;
  branchId?: string | null;
}

interface LeaveItem {
  id: string;
  employeeId: string;
  name: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  appliedDate: string;
  branchId?: string | null;
}

interface StaffClientProps {
  initialData: {
    staff: StaffItem[];
    attendance: AttendanceItem[];
    leaves: LeaveItem[];
  };
}

export function StaffClient({ initialData }: StaffClientProps) {
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffItem[]>(initialData.staff);
  const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>(initialData.attendance);
  const [leavesList, setLeavesList] = useState<LeaveItem[]>(initialData.leaves);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('staff');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const { branches, selectedBranchId } = useBranch();

  // Dialog visibility states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  
  // Auto-generated credentials display state
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Add Staff form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Administration');
  const [salary, setSalary] = useState('25000');
  const [workingHours, setWorkingHours] = useState('Full Time');
  const [branchId, setBranchId] = useState('');

  // Auto-populate branch select when opening add dialog
  useEffect(() => {
    if (showAddDialog) {
      setBranchId(selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || ''));
    }
  }, [showAddDialog, selectedBranchId, branches]);

  // Submit Leave form states
  const [leaveStaffId, setLeaveStaffId] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const departments = ['All Departments', 'Administration', 'Maintenance', 'Library', 'Security', 'Transport', 'Canteen'];
  const statuses = ['All Status', 'Active', 'Inactive', 'On Leave'];

  // Calculate statistics based on selected branch
  const branchStaff = selectedBranchId === 'all'
    ? staffList
    : staffList.filter((s) => s.branchId === selectedBranchId);
  const branchAttendance = selectedBranchId === 'all'
    ? attendanceList
    : attendanceList.filter((a) => a.branchId === selectedBranchId);

  const activeStaffCount = branchStaff.filter((s) => s.status === 'Active').length;
  const leavesCount = branchStaff.filter((s) => s.status === 'On Leave').length;
  const distinctDeps = new Set(branchStaff.map((s) => s.department)).size;

  const stats = [
    { title: 'Total Staff', value: branchStaff.length.toString(), icon: UsersIcon, color: 'blue' },
    { title: 'Present Today', value: branchAttendance.filter((a) => a.status === 'Present').length.toString(), icon: CheckCircleIcon, color: 'green' },
    { title: 'On Leave', value: leavesCount.toString(), icon: CalendarIcon, color: 'yellow' },
    { title: 'Departments', value: distinctDeps.toString(), icon: BuildingIcon, color: 'purple' },
  ];

  // Filtering logic
  const filteredStaff = staffList.filter((st) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      st.name.toLowerCase().includes(searchLower) ||
      st.employeeId.toLowerCase().includes(searchLower) ||
      st.position.toLowerCase().includes(searchLower);

    const matchesDepartment = selectedDepartment === 'All Departments' || st.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'All Status' || st.status === selectedStatus;
    const matchesBranch = selectedBranchId === 'all' || st.branchId === selectedBranchId;

    return matchesSearch && matchesDepartment && matchesStatus && matchesBranch;
  });

  const filteredAttendance = attendanceList.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranchId === 'all' || a.branchId === selectedBranchId;
    return matchesSearch && matchesBranch;
  });

  const filteredLeaves = leavesList.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranchId === 'all' || l.branchId === selectedBranchId;
    return matchesSearch && matchesBranch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Present':
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'On Leave':
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'Inactive':
      case 'Absent':
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">N/A</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  // Actions
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !designation.trim()) {
      toast({
        title: 'Error',
        description: 'First Name, Last Name, Email, and Designation are required.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await addStaff({
        firstName,
        lastName,
        email,
        phone,
        designation,
        department,
        salary: parseFloat(salary) || 20000,
        workingHours,
        branchId: branchId || undefined,
      });

      if (res.success && res.data) {
        toast({
          title: 'Success',
          description: `Staff member "${firstName} ${lastName}" created successfully.`,
        });

        // Set credentials display to open copy dialog
        setCreatedCredentials({
          email: res.data.email,
          password: res.data.password,
        });

        // Push new staff locally
        const newStaff: StaffItem = {
          id: res.data.id,
          employeeId: email.split('@')[0].toUpperCase(),
          name: `${firstName} ${lastName}`,
          position: designation,
          department,
          joinDate: new Date().toISOString().split('T')[0],
          phone: phone || 'N/A',
          email,
          salary: parseFloat(salary) || 25000,
          status: 'Active',
          workingHours,
          photo: '',
          branchId: branchId || null,
        };

        setStaffList((prev) => [newStaff, ...prev]);
        setShowAddDialog(false);

        // Reset
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setDesignation('');
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to add staff member.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteStaff(id);
      if (res.success) {
        toast({
          title: 'Success',
          description: `Staff member "${name}" deleted.`,
        });
        setStaffList((prev) => prev.filter((s) => s.id !== id));
        setAttendanceList((prev) => prev.filter((a) => a.id !== id));
        setLeavesList((prev) => prev.filter((l) => l.id !== id));
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to delete staff member.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStaffId || !startDate || !endDate || !leaveReason.trim()) {
      toast({
        title: 'Error',
        description: 'All fields are required to apply for leave.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await submitLeaveRequest({
        staffId: leaveStaffId,
        leaveType,
        startDate,
        endDate,
        reason: leaveReason,
      });

      if (res.success && res.data) {
        const staff = staffList.find((s) => s.id === leaveStaffId);
        toast({
          title: 'Success',
          description: 'Leave request submitted successfully.',
        });

        // Add to local state
        const newLeave: LeaveItem = {
          id: res.data.id,
          employeeId: staff?.employeeId || '',
          name: staff?.name || 'Staff',
          leaveType,
          startDate,
          endDate,
          days: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
          reason: leaveReason,
          status: 'Pending',
          appliedDate: new Date().toISOString().split('T')[0],
        };

        setLeavesList((prev) => [newLeave, ...prev]);
        setShowLeaveDialog(false);

        // Reset
        setLeaveStaffId('');
        setStartDate('');
        setEndDate('');
        setLeaveReason('');
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to submit leave request.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUpdateLeave = async (leaveId: string, status: string) => {
    startTransition(async () => {
      const res = await updateLeaveStatus(leaveId, status);
      if (res.success) {
        toast({
          title: 'Success',
          description: `Leave request has been ${status.toLowerCase()}.`,
        });

        // Update local state
        setLeavesList((prev) =>
          prev.map((l) => (l.id === leaveId ? { ...l, status } : l))
        );

        if (status === 'Approved') {
          const leaveObj = leavesList.find((l) => l.id === leaveId);
          if (leaveObj) {
            setStaffList((prev) =>
              prev.map((s) => (s.name === leaveObj.name ? { ...s, status: 'On Leave' } : s))
            );
          }
        }
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to update leave request status.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6 pb-[150px] p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-650 bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Administer support staff members, track daily check-ins, and manage leave requests.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={() => setShowAddDialog(true)} className="gap-2 shadow-sm font-semibold">
            <PlusIcon className="h-4.5 w-4.5" />
            Add Staff Member
          </Button>
          <Button onClick={() => setShowLeaveDialog(true)} variant="outline" className="gap-2 shadow-sm font-semibold">
            <CalendarIcon className="h-4.5 w-4.5 text-primary" />
            Apply Leave
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border border-slate-100 hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1.5">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100/60`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter and search */}
      <Card className="shadow-sm border border-slate-100">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder="Search staff by name, designation, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background"
            />
          </div>
          {selectedTab === 'staff' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="staff">Directory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
        </TabsList>

        {/* Tab 1: Directory */}
        <TabsContent value="staff" className="space-y-4 pt-2">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Designation & Department</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Phone / Email</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                        👥 No staff members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.photo} />
                              <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                                {staff.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-800">{staff.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">ID: {staff.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-slate-750">{staff.position}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{staff.department}</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{staff.joinDate}</TableCell>
                        <TableCell className="text-xs text-slate-650">
                          <div>Phone: {staff.phone}</div>
                          <div className="mt-0.5">{staff.email}</div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-800">
                          {formatCurrency(staff.salary)}
                        </TableCell>
                        <TableCell>{getStatusBadge(staff.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/staff/${staff.id}/permissions`)}
                                className="cursor-pointer"
                              >
                                <ShieldIcon className="h-4 w-4 mr-2 text-indigo-600" />
                                Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-650 focus:text-red-755 cursor-pointer"
                                onClick={() => handleDeleteStaff(staff.id, staff.name)}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Attendance */}
        <TabsContent value="attendance" className="space-y-4 pt-2">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                        ⏱️ No check-in logs submitted for today.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((a) => (
                      <TableRow key={a.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-800">{a.name}</TableCell>
                        <TableCell className="text-sm text-slate-650">{a.department}</TableCell>
                        <TableCell className="text-sm text-slate-600 font-medium">{a.checkIn}</TableCell>
                        <TableCell className="text-sm text-slate-600">{a.checkOut}</TableCell>
                        <TableCell className="text-sm font-semibold text-slate-700">{a.hoursWorked} hrs</TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Leaves */}
        <TabsContent value="leaves" className="space-y-4 pt-2">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                        🌴 No leave requests filed.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((l) => (
                      <TableRow key={l.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-850">{l.name}</TableCell>
                        <TableCell className="text-sm font-medium text-slate-700">{l.leaveType}</TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {l.startDate} to {l.endDate}
                        </TableCell>
                        <TableCell className="text-sm font-bold text-slate-800">{l.days} days</TableCell>
                        <TableCell className="text-sm text-slate-600 max-w-[200px] truncate" title={l.reason}>
                          {l.reason}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{l.appliedDate}</TableCell>
                        <TableCell>{getStatusBadge(l.status)}</TableCell>
                        <TableCell className="text-right">
                          {l.status === 'Pending' && (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => handleUpdateLeave(l.id, 'Approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => handleUpdateLeave(l.id, 'Rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog 1: Add Staff */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Register Staff Member</DialogTitle>
            <DialogDescription>Input employee profile details, designation, and monthly salary.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  placeholder="e.g. Jennifer"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  placeholder="e.g. Davis"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. jennifer@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g. +88017000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="designation">Designation / Role</Label>
                <Input
                  id="designation"
                  placeholder="e.g. Librarian"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Library">Library</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Canteen">Canteen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="salary">Monthly Salary (BDT)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hours">Shift / Working Hours</Label>
                <Select value={workingHours} onValueChange={setWorkingHours}>
                  <SelectTrigger id="hours">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Time">Full Time Shift</SelectItem>
                    <SelectItem value="Part Time">Part Time Shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch">Assigned Branch</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Apply Leave */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Apply Leave Request</DialogTitle>
            <DialogDescription>Submit a formal leave application request for a staff member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitLeave} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="leave-staff">Select Staff Member</Label>
              <Select value={leaveStaffId} onValueChange={setLeaveStaffId}>
                <SelectTrigger id="leave-staff">
                  <SelectValue placeholder="Choose staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.position} • {s.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leave-type">Leave Category</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger id="leave-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason / Description</Label>
              <Input
                id="reason"
                placeholder="e.g. Medical reasons / Family events"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowLeaveDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Apply Leave'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Generated Credentials Display */}
      <Dialog open={createdCredentials !== null} onOpenChange={(open) => { if (!open) setCreatedCredentials(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-slate-100 bg-white shadow-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -z-10" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -z-10" />

          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 mb-2">
              <KeyIcon className="w-6 h-6 animate-pulse" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-800">Credentials Generated</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Below are the auto-generated login credentials for the new staff member. Please copy these credentials now.
            </DialogDescription>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-4 pt-3">
              <div className="space-y-3 bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Login Email</span>
                  <div className="font-semibold text-slate-700 select-all font-mono text-sm break-all">{createdCredentials.email}</div>
                </div>
                <div className="border-t border-slate-100/80 my-1" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Generated Password</span>
                  <div className="font-bold text-indigo-600 select-all font-mono text-sm tracking-wide">{createdCredentials.password}</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2.5">
                <div className="text-amber-600 text-sm font-semibold">⚠️</div>
                <div className="text-[11px] text-amber-800 leading-normal font-medium">
                  <strong>Important:</strong> For security, this temporary password is shown only once. Be sure to share it securely with the staff member.
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                    );
                    setCopiedCreds(true);
                    setTimeout(() => setCopiedCreds(false), 2000);
                  }}
                  className="flex-1 rounded-xl h-11 shadow-sm gap-2 font-semibold"
                >
                  {copiedCreds ? (
                    <>
                      <CheckIcon className="w-4.5 h-4.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4.5 h-4.5" />
                      Copy Credentials
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCreatedCredentials(null)}
                  className="rounded-xl h-11 px-6 font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

