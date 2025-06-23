'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  UserIcon,
  PlusIcon,
  SearchIcon,
  GraduationCapIcon,
  BookOpenIcon,
  CalendarIcon,
  EyeIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  Filter,
  User,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { 
  getTeachers, 
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  searchTeachers,
  getTeacherStats
} from '@/app/actions/teachers';

interface Teacher {
  id: string;
  teacherId: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  specialization: string;
  subjects: string[];
  branch: {
    id: string;
    name: string;
  };
  school: {
    name: string;
  };
  totalClasses: number;
  totalSubjects: number;
  status: string;
  joiningDate: Date;
}

export default function TeachersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [paginatedTeachers, setPaginatedTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Pagination state (like parents page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Additional filters
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Load teachers and stats
  useEffect(() => {
    loadTeachersData();
  }, []);

  // Search and filter effect - main filtering logic (like parents page)
  useEffect(() => {
    let filtered = teachers;

    // Apply search filter first if there's a search query
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply experience filter
    if (experienceFilter !== "all") {
      if (experienceFilter === "0-2") {
        filtered = filtered.filter(teacher => teacher.experience >= 0 && teacher.experience <= 2);
      } else if (experienceFilter === "3-5") {
        filtered = filtered.filter(teacher => teacher.experience >= 3 && teacher.experience <= 5);
      } else if (experienceFilter === "6-10") {
        filtered = filtered.filter(teacher => teacher.experience >= 6 && teacher.experience <= 10);
      } else if (experienceFilter === "10+") {
        filtered = filtered.filter(teacher => teacher.experience > 10);
      }
    }

    // Apply branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter(teacher => 
        teacher.branch.name.toLowerCase().includes(branchFilter.toLowerCase())
      );
    }

    setFilteredTeachers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [teachers, searchTerm, experienceFilter, branchFilter]);

  // Pagination effect - calculate paginated results (like parents page)
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredTeachers.slice(startIndex, endIndex);
    setPaginatedTeachers(paginated);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  // Calculate pagination info (like parents page)
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredTeachers.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle Edit Form Submission
  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedTeacher) return;

    try {
      const result = await updateTeacher(selectedTeacher.id, formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        setShowEditDialog(false);
        setSelectedTeacher(null);
        setTeacherDetails(null);
        loadTeachersData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the teacher"
      });
    }
  };

  const loadTeachersData = async () => {
    try {
      setLoading(true);
      
      // Get all teachers at once (no server-side pagination)
      const [teachersResult, statsResult] = await Promise.all([
        getTeachers(1, 100), // Get all teachers
        getTeacherStats()
      ]);

      if (teachersResult.success) {
        // Transform TeacherData to match Teacher interface
        const transformedTeachers = (teachersResult.data || []).map((teacher: any) => ({
          id: teacher.id,
          teacherId: teacher.teacherId,
          employeeId: teacher.employeeId,
          name: teacher.name,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone,
          qualification: teacher.qualification,
          experience: teacher.experience,
          specialization: teacher.specialization || '',
          subjects: [], // TODO: Get from teacher data
          branch: teacher.branch || { id: '', name: '' },
          school: { name: teacher.branch?.name || 'School' },
          totalClasses: teacher.totalClasses || 0,
          totalSubjects: 0, // TODO: Get from teacher data
          status: teacher.isActive ? 'Active' : 'Inactive',
          joiningDate: teacher.joiningDate || new Date(),
        }));
        
        setTeachers(transformedTeachers);
        setFilteredTeachers(transformedTeachers);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading teachers data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle View Details
  const handleViewDetails = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailsLoading(true);
    setShowViewDialog(true);

    try {
      const result = await getTeacherById(teacher.id);
      if (result.success) {
        setTeacherDetails(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teacher details"
        });
      }
    } catch (error) {
      console.error('Error loading teacher details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while loading teacher details"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailsLoading(true);

    try {
      const result = await getTeacherById(teacher.id);
      if (result.success) {
        setTeacherDetails(result.data);
        setShowEditDialog(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teacher data for editing"
        });
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while loading teacher data"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteDialog(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    setDeleteLoading(true);
    try {
      const result = await deleteTeacher(selectedTeacher.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        setShowDeleteDialog(false);
        setSelectedTeacher(null);
        loadTeachersData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the teacher"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Add Form Submission
  const handleAddSubmit = async (formData: FormData) => {
    try {
      const result = await createTeacher(formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        setShowAddDialog(false);
        loadTeachersData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating the teacher"
      });
    }
  };

  // Statistics cards
  const statsCards = stats ? [
    { 
      title: 'Total Teachers', 
      value: stats.totalTeachers.toString(), 
      icon: UserIcon, 
      color: 'blue' 
    },
    { 
      title: 'Active Teachers', 
      value: stats.activeTeachers.toString(), 
      icon: GraduationCapIcon, 
      color: 'green' 
    },
    { 
      title: 'New This Month', 
      value: stats.newThisMonth?.toString() || '0', 
      icon: CalendarIcon, 
      color: 'purple' 
    },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teachers Management</h1>
          <p className="text-muted-foreground">Manage teachers, qualifications, and assignments</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers by name, email, qualification, or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>

              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="main">Main Campus</SelectItem>
                  <SelectItem value="north">North Campus</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {(searchTerm || experienceFilter !== 'all' || branchFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setExperienceFilter('all');
                    setBranchFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Teachers ({loading ? '...' : `${endItem} of ${filteredTeachers.length} teachers`})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
              <span className="ml-2">Loading teachers...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {teacher.firstName[0]}{teacher.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {teacher.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {/* <div className="font-medium">{teacher.email}</div> */}
                        <div className="text-sm text-muted-foreground">{teacher.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{teacher.qualification}</div>
                        <div className="text-sm text-muted-foreground">
                          {teacher?.subjects && teacher?.subjects?.length > 0 
                            ? teacher.subjects.join(', ') 
                            : teacher.specialization || 'No subjects assigned'
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.experience} years</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {teacher.totalClasses} classes
                      </Badge>
                    </TableCell>
                    <TableCell>{teacher.branch.name}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {teacher.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(teacher)}>
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDelete(teacher)}
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {filteredTeachers?.length} results
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Teacher Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <form action={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input name="lastName" required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" />
              </div>
              <div className="space-y-2">
                <Label>Qualification *</Label>
                <Input name="qualification" required />
              </div>
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input name="experience" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input name="specialization" />
              </div>
              <div className="space-y-2">
                <Label>Branch ID *</Label>
                <Input name="branchId" required placeholder="Enter branch ID" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Teacher
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                <span className="ml-2">Loading teacher details...</span>
              </div>
            ) : teacherDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {teacherDetails.teacher.firstName[0]}{teacherDetails.teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xl font-semibold">
                        {teacherDetails.teacher.firstName} {teacherDetails.teacher.lastName}
                      </h4>
                      <p className="text-muted-foreground">{teacherDetails.teacher.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Date of Birth</Label>
                      <p className="text-sm text-muted-foreground">
                        {teacherDetails.teacher.dateOfBirth 
                          ? new Date(teacherDetails.teacher.dateOfBirth).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <p className="text-sm text-muted-foreground">
                        {teacherDetails.teacher.gender || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Blood Group</Label>
                      <p className="text-sm text-muted-foreground">
                        {teacherDetails.teacher.bloodGroup || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nationality</Label>
                      <p className="text-sm text-muted-foreground">
                        {teacherDetails.teacher.nationality || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm text-muted-foreground">
                      {teacherDetails.teacher.address || 'Not specified'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {teacherDetails.teacher.phone || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{teacherDetails.teacher.email}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Employee ID</Label>
                      <p className="text-sm font-mono">{teacherDetails.teacher.employeeId || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Experience</Label>
                      <p className="text-sm">{teacherDetails.professional.experience} years</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Qualification</Label>
                      <p className="text-sm">{teacherDetails.professional.qualification}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Subjects/Specialization</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {teacherDetails?.professional?.subjects?.length > 0 ? (
                          teacherDetails.professional.subjects.map((subject: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No subjects assigned</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Branch</Label>
                      <p className="text-sm">{teacherDetails.branch?.name || 'No branch assigned'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">School</Label>
                      <p className="text-sm">{teacherDetails.school?.name || 'No school assigned'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Joining Date</Label>
                      <p className="text-sm">
                        {teacherDetails.teacher.createdAt 
                          ? new Date(teacherDetails.teacher.createdAt).toLocaleDateString()
                          : 'Not available'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Classes and Teaching Information */}
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="text-base font-semibold flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Teaching Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Total Classes</Label>
                        <p className="text-sm">{teacherDetails.teacher.totalClasses || 0} classes</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Total Subjects</Label>
                        <p className="text-sm">{teacherDetails?.professional?.subjects?.length} subjects</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {teacherDetails.professional.experience}
                      </div>
                      <p className="text-xs text-muted-foreground">Years Exp.</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {teacherDetails.teacher.totalClasses || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Classes</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {teacherDetails.professional.subjects.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Subjects</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Failed to load teacher details
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Teacher
              {selectedTeacher && ` - ${selectedTeacher.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                <span className="ml-2">Loading teacher data...</span>
              </div>
            ) : teacherDetails ? (
              <form action={handleEditSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input 
                        name="firstName" 
                        defaultValue={teacherDetails.teacher.firstName}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input 
                        name="lastName" 
                        defaultValue={teacherDetails.teacher.lastName}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input 
                        name="email" 
                        type="email"
                        defaultValue={teacherDetails.teacher.email}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        name="phone" 
                        defaultValue={teacherDetails.teacher.phone || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input 
                        name="dateOfBirth" 
                        type="date"
                        defaultValue={teacherDetails.teacher.dateOfBirth ? new Date(teacherDetails.teacher.dateOfBirth).toISOString().split('T')[0] : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select name="gender" defaultValue={teacherDetails.teacher.gender || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Textarea 
                        name="address" 
                        defaultValue={teacherDetails.teacher.address || ''}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Input 
                        name="nationality" 
                        defaultValue={teacherDetails.teacher.nationality || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Religion</Label>
                      <Input 
                        name="religion" 
                        defaultValue={teacherDetails.teacher.religion || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Select name="bloodGroup" defaultValue={teacherDetails.teacher.bloodGroup || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Qualification *</Label>
                      <Input 
                        name="qualification" 
                        defaultValue={teacherDetails.professional.qualification}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Experience (years)</Label>
                      <Input 
                        name="experience" 
                        type="number"
                        min="0"
                        defaultValue={teacherDetails.professional.experience}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Subjects/Specialization</Label>
                      <Textarea 
                        name="specialization" 
                        defaultValue={teacherDetails.professional.subjects.join(', ') || ''}
                        placeholder="Enter subjects separated by commas (e.g., Mathematics, Physics, Chemistry)"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Teacher
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Failed to load teacher data
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{selectedTeacher?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action will permanently remove the teacher and all related records.
            </p>
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
                'Delete Teacher'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
