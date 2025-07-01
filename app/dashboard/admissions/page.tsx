'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ClipboardIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
} from 'lucide-react';
import { AdmissionForm } from './components/admission-form';
import { 
  getAdmissionApplications, 
  getAdmissionStats,
  searchAdmissions,
  getStudentDetails,
  updateStudentAdmission,
  deleteStudentAdmission
} from '@/app/actions/admission';
import { useBranch } from '@/contexts/branch-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { AdmissionEditForm } from './components/admission-edit-form';

interface Application {
  id: string;
  applicationNo: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  branch: string;
  admissionDate: Date;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  studentEmail: string;
  studentPhone?: string;
  address?: string;
  status: string;
  dateOfBirth?: Date | null;
  gender?: string | null;
}

interface DashboardStats {
  totalStudents: number;
  thisMonthAdmissions: number;
  recentAdmissions: number;
  activeStudents: number;
  genderCounts?: Record<string, number>;
  branchCounts?: Record<string, number>;
  classCounts?: Record<string, number>;
}

interface StudentDetails {
  id: string;
  applicationNo: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  branch: string;
  school: string;
  admissionDate: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelation: string;
  studentEmail: string;
  studentPhone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  birthCertificateNo?: string;
  status: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
  };
  parent: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    relation?: string;
  };
}

// Add RELATIONS array for dropdown options
const RELATIONS = [
  'Father',
  'Mother', 
  'Guardian',
  'Grandfather',
  'Grandmother',
  'Uncle',
  'Aunt',
  'Brother',
  'Sister',
  'Other'
];

export default function AdmissionsPage() {
  const { selectedBranch } = useBranch();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Application | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [classData, setClassData] = useState<any[]>([]);
  const [branchData, setBranchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load applications and dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      
      // Load all data in parallel for better performance
      const [applicationsResult, statsResult] = await Promise.all([
        getAdmissionApplications(), // Get recent admissions
        getAdmissionStats(),
      ]);

      // getAdmissionApplications returns array directly
      setApplications(applicationsResult);

      if (statsResult.success && statsResult.data) {
        setDashboardStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadDashboardData();
      return;
    }

    try {
      setLoading(true);
      const searchResult = await searchAdmissions(query);
      // searchAdmissions returns array directly
      setApplications(searchResult);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic stats based on real data
  const stats = dashboardStats ? [
    { 
      title: 'Total Students', 
      value: dashboardStats.totalStudents.toString(), 
      icon: ClipboardIcon, 
      color: 'blue' 
    },
    { 
      title: 'This Month', 
      value: dashboardStats.thisMonthAdmissions.toString(), 
      icon: CalendarIcon, 
      color: 'green' 
    },
    { 
      title: 'Recent (30 days)', 
      value: dashboardStats.recentAdmissions.toString(), 
      icon: CheckCircleIcon, 
      color: 'purple' 
    },
    { 
      title: 'Active Students', 
      value: dashboardStats.activeStudents.toString(), 
      icon: UserIcon, 
      color: 'orange' 
    },
  ] : [
    { title: 'Total Students', value: '...', icon: ClipboardIcon, color: 'blue' },
    { title: 'This Month', value: '...', icon: CalendarIcon, color: 'green' },
    { title: 'Recent (30 days)', value: '...', icon: CheckCircleIcon, color: 'purple' },
    { title: 'Active Students', value: '...', icon: UserIcon, color: 'orange' },
  ];

  // Get unique classes from real data
  const classes = Array.from(new Set(applications.map(app => app.class)));
  const statuses = ['All', 'Approved', 'Pending', 'Rejected'];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || app.class === selectedClass;
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Interview': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return CheckCircleIcon;
      case 'Pending': return ClockIcon;
      case 'Interview': return UserIcon;
      case 'Rejected': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const handleAdmissionSuccess = () => {
    loadDashboardData(); // Reload all data after successful admission
  };

  const handleOpenDialog = () => {
    console.log('Opening admission dialog...');
    setShowAddDialog(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      loadDashboardData(); // Only reload when dialog is closed
    }
  };

  // Handle search input with debounce effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch(searchTerm);
      } else if (searchTerm.length === 0) {
        loadDashboardData();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Handle View Details
  const handleViewDetails = async (application: Application) => {
    setSelectedStudent(application);
    setDetailsLoading(true);
    setShowViewDialog(true);

    try {
      const result = await getStudentDetails(application.id);
      if (result.success) {
        setStudentDetails(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student details"
        });
      }
    } catch (error) {
      console.error('Error loading student details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while loading student details"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = async (application: Application) => {
    setSelectedStudent(application);
    setDetailsLoading(true);

    try {
      const result = await getStudentDetails(application.id);
      if (result.success) {
        setStudentDetails(result.data);
        setShowEditDialog(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student data for editing"
        });
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while loading student data"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = (application: Application) => {
    setSelectedStudent(application);
    setShowDeleteDialog(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    setDeleteLoading(true);
    try {
      const result = await deleteStudentAdmission(selectedStudent.id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        setShowDeleteDialog(false);
        setSelectedStudent(null);
        loadDashboardData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the student"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Edit Form Submission
  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedStudent) return;

    try {
      const result = await updateStudentAdmission(selectedStudent.id, formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        setShowEditDialog(false);
        setSelectedStudent(null);
        setStudentDetails(null);
        loadDashboardData(); // Refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the student"
      });
    }
  };

  // Debug logging
  console.log('Current showAddDialog state:', showAddDialog);
  console.log('Selected branch:', selectedBranch);

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admissions Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage student applications and admission process
            {dashboardStats && ` • ${dashboardStats.totalStudents} total students`}
            {selectedBranch && ` • ${selectedBranch.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadDashboardData} 
            variant="outline" 
            className="gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Loading...
              </>
            ) : (
              <>
                🔄 Refresh Data
              </>
            )}
          </Button>
          <Button onClick={() => setShowTestDialog(true)} variant="outline" className="gap-2">
            🧪 Test Dialog
          </Button>
          <Button onClick={handleOpenDialog} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New Admission
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
                  <p className="text-xl font-bold">
                    {statsLoading ? (
                      <span className="animate-pulse bg-gray-200 rounded w-8 h-6 inline-block"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="admitted">Admitted Students</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-40">
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

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading applications...</div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No applications found</h3>
                    <p className="text-muted-foreground">Get started by adding a new student admission.</p>
                    <Button onClick={handleOpenDialog} className="mt-4">
                      Add First Student
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Application No</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admission Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => {
                      const StatusIcon = getStatusIcon(app.status);
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {app.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{app.studentName}</div>
                                {/* <div className="text-sm text-muted-foreground">{app.studentEmail}</div> */}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{app.applicationNo}</TableCell>
                          <TableCell>{app.class}</TableCell>
                          <TableCell className="font-mono">{app.rollNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{app.parentName}</div>
                              <div className="text-sm text-muted-foreground">{app.parentPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(app.admissionDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(app)}>
                                  <EyeIcon className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(app)}>
                                  <EditIcon className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => handleDelete(app)}
                                >
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admitted" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class-wise Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Class-wise Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading class data...</div>
                ) : classData.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No class data available</div>
                ) : (
                  <div className="space-y-3">
                    {classData.slice(0, 8).map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{cls.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {cls.branchName} • {cls.teacherName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{cls.totalStudents}</div>
                          <div className="text-xs text-muted-foreground">
                            {cls.utilizationRate}% capacity
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branch-wise Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Branch-wise Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading branch data...</div>
                ) : branchData.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No branch data available</div>
                ) : (
                  <div className="space-y-3">
                    {branchData.map((branch) => (
                      <div key={branch.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{branch.name}</div>
                          <div className="font-bold text-lg">{branch.totalStudents}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {branch.totalClasses} classes • Avg: {branch.averageStudentsPerClass} students/class
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {branch.address}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Demographics Summary */}
          {dashboardStats && (
            <Card>
              <CardHeader>
                <CardTitle>Student Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gender Distribution */}
                  <div>
                    <h4 className="font-medium mb-3">Gender Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(dashboardStats.genderCounts || {}).map(([gender, count]) => (
                        <div key={gender} className="flex justify-between">
                          <span className="capitalize">{gender}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Branch Distribution */}
                  <div>
                    <h4 className="font-medium mb-3">Branch Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(dashboardStats.branchCounts || {}).map(([branch, count]) => (
                        <div key={branch} className="flex justify-between">
                          <span>{branch}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Classes */}
                  <div>
                    <h4 className="font-medium mb-3">Top Classes</h4>
                    <div className="space-y-2">
                      {Object.entries(dashboardStats.classCounts || {})
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([className, count]) => (
                        <div key={className} className="flex justify-between">
                          <span className="text-sm">{className}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Admissions Summary */}
          <Card>
            <CardHeader>
              <CardTitle>All Admitted Students ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Showing {applications.length} admitted students</h3>
                <p className="text-muted-foreground">
                  Data loaded from database with complete student information
                </p>
                {dashboardStats && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Total across all branches: {dashboardStats.totalStudents} students</p>
                    <p>Recent admissions (30 days): {dashboardStats.recentAdmissions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>This is a test dialog to verify Dialog component is working.</p>
            <p>showAddDialog state: {showAddDialog.toString()}</p>
            <p>selectedBranch: {selectedBranch?.name || 'None'}</p>
            <Button onClick={() => setShowTestDialog(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admission Form Dialog */}
      <AdmissionForm
        key={showAddDialog ? 'open' : 'closed'}
        open={showAddDialog}
        onOpenChange={handleCloseDialog}
      />

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Student Details
              {selectedStudent && ` - ${selectedStudent.studentName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                <span className="ml-2">Loading student details...</span>
              </div>
            ) : studentDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Student Info</h4>
                  <div><b>Name:</b> {studentDetails.studentName}</div>
                  <div><b>Email:</b> {studentDetails.studentEmail}</div>
                  <div><b>Phone:</b> {studentDetails.studentPhone}</div>
                  <div><b>Roll Number:</b> {studentDetails.rollNumber}</div>
                  <div><b>Class:</b> {studentDetails.class}</div>
                  <div><b>Section:</b> {studentDetails.section}</div>
                  <div><b>Branch:</b> {studentDetails.branch}</div>
                  <div><b>School:</b> {studentDetails.school}</div>
                  <div><b>Date of Birth:</b> {studentDetails.dateOfBirth}</div>
                  <div><b>Gender:</b> {studentDetails.gender}</div>
                  <div><b>Blood Group:</b> {studentDetails.bloodGroup}</div>
                  <div><b>Nationality:</b> {studentDetails.nationality}</div>
                  <div><b>Religion:</b> {studentDetails.religion}</div>
                  <div><b>Birth Certificate No:</b> {studentDetails.birthCertificateNo}</div>
                  <div><b>Status:</b> {studentDetails.status}</div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Parent Info</h4>
                  <div><b>Name:</b> {studentDetails.parentName}</div>
                  <div><b>Email:</b> {studentDetails.parentEmail}</div>
                  <div><b>Phone:</b> {studentDetails.parentPhone}</div>
                  <div><b>Relation:</b> {studentDetails.parentRelation}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Failed to load student details
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <AdmissionEditForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        id={selectedStudent?.id || ''}
        onSuccess={() => {
          setShowEditDialog(false);
          setSelectedStudent(null);
          loadDashboardData();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{selectedStudent?.studentName}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action will permanently remove the student and all related records including:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Student profile and academic records</li>
              <li>Attendance records</li>
              <li>Exam results</li>
              <li>Fee records</li>
              <li>Library borrowing records</li>
              <li>Parent information (if no other children)</li>
            </ul>
            <p className="text-sm font-medium text-red-600">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Student'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
