'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  EyeIcon,
  EditIcon,
  CalendarIcon,
  UsersIcon,
  DownloadIcon,
  TrashIcon,
  BookOpenIcon,
  MapPinIcon,
  TrendingUpIcon,
  ClockIcon,
  XIcon,
  LoaderIcon
} from 'lucide-react';

// Import actions
import { getClasses, getClassStats, searchClasses, getAvailableSubjects, updateClass, deleteClass, assignStudentsToClass, getClassTimetables } from '@/app/actions/classes';
import { getSubjects } from '@/app/actions/subjects';
import { getStudents } from '@/app/actions/students';
import { 
  getSections, 
  getSectionsBySubject, 
  createSection, 
  updateSection, 
  deleteSection, 
  getSectionStats 
} from '@/app/actions/sections';

interface ClassData {
  id: string;
  name: string;
  academicYear: string;
  branchId: string;
  teacherId?: string | null;
  totalStudents: number;
  totalSubjects: number;
  totalTimetables: number;
  branch?: {
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  teacher?: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string | null;
    qualification?: string | null;
    experience?: number | null;
    subjects: string[];
  } | null;
  sections?: Array<{
    id: string;
    name: string;
    displayName: string;
    capacity: number;
    students: Array<{
      id: string;
      name: string;
      rollNumber: string;
    }>;
  }>;
}

interface SubjectData {
  id: string;
  name: string;
  code: string;
  description?: string;
  totalClasses: number;
  totalChapters: number;
}

interface SectionData {
  id: string;
  name: string;
  maxStudents: number;
  currentStudents: number;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  students: Array<{
    id: string;
    name: string;
    rollNumber: string;
  }>;
  _count: {
    students: number;
  };
}

interface StatsData {
  totalClasses: number;
  totalStudents: number;
  averageStudentsPerClass: number;
  branchStats: Record<string, { classes: number; students: number }>;
}

interface StudentData {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  classId?: string;
}

export default function ClassesPage() {
  const [selectedTab, setSelectedTab] = useState('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);

  // Action dialog states
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showManageStudentsDialog, setShowManageStudentsDialog] = useState(false);
  const [showTimetableDialog, setShowTimetableDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Edit form states
  const [editForm, setEditForm] = useState({
    name: '',
    academicYear: '',
    branchId: '',
    teacherId: '',
    capacity: 40,
  });

  // Students management state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load classes, stats, subjects, and students in parallel
      const [classesResult, statsResult, subjectsResult, studentsResult] = await Promise.all([
        getClasses(),
        getClassStats(),
        getSubjects(),
        getStudents()
      ]);

      if (classesResult.success) {
        // The data is already in the correct format from the actions
        setClasses(classesResult.data || []);
      } else {
        throw new Error(classesResult.error || 'Failed to load classes');
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (subjectsResult.success) {
        setSubjects(subjectsResult.data || []);
      }

      if (studentsResult.success) {
        const transformedStudents: StudentData[] = (studentsResult.data || []).map((student: any) => ({
          id: student.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          rollNumber: student.rollNumber,
          email: student.user.email,
          classId: student.classId
        }));
        setAllStudents(transformedStudents);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Generate grades and branches from actual data
  const grades = ['All Grades', ...Array.from(new Set(classes.map(cls => cls.name)))];
  const branches = ['All Branches', ...Array.from(new Set(classes.map(cls => cls.branch?.name).filter(Boolean)))];
  const academicYears = Array.from(new Set(classes.map(cls => cls.academicYear)));

  const statisticsCards = [
    { title: 'Total Classes', value: stats?.totalClasses?.toString() || classes.length.toString(), icon: BookOpenIcon, color: 'blue' },
    { title: 'Total Students', value: stats?.totalStudents?.toString() || classes.reduce((sum, cls) => sum + cls.totalStudents, 0).toString(), icon: UsersIcon, color: 'green' },
    { title: 'Average Students/Class', value: stats?.averageStudentsPerClass?.toString() || Math.round(classes.reduce((sum, cls) => sum + cls.totalStudents, 0) / Math.max(classes.length, 1)).toString(), icon: TrendingUpIcon, color: 'purple' },
    { title: 'Active Subjects', value: subjects.length.toString(), icon: BookOpenIcon, color: 'orange' },
  ];

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'All Grades' || cls.name === selectedGrade;
    const matchesBranch = selectedSection === 'All Branches' || cls.branch?.name === selectedSection;
    return matchesSearch && matchesGrade && matchesBranch;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCapacityColor = (current: number, capacity: number = 40) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 85) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Action handlers
  const handleViewDetails = (classData: ClassData) => {
    setSelectedClass(classData);
    setShowViewDialog(true);
  };

  const handleEditClass = (classData: ClassData) => {
    setSelectedClass(classData);
    setEditForm({
      name: classData.name,
      academicYear: classData.academicYear,
      branchId: classData.branchId || '',
      teacherId: classData.teacherId || '',
      capacity: 40,
    });
    setShowEditDialog(true);
  };

  const handleManageStudents = (classData: ClassData) => {
    setSelectedClass(classData);
    setSelectedStudentIds(classData.students.map(s => s.id));
    setShowManageStudentsDialog(true);
  };

  const handleViewTimetable = (classData: ClassData) => {
    setSelectedClass(classData);
    setShowTimetableDialog(true);
  };

  const handleDeleteClass = (classData: ClassData) => {
    setSelectedClass(classData);
    setShowDeleteDialog(true);
  };

  const handleExportData = async (classData: ClassData) => {
    try {
      const data = {
        class: {
          name: classData.name,
          section: classData.section,
          academicYear: classData.academicYear,
          teacher: classData.teacher?.name,
          branch: classData.branch?.name,
          totalStudents: classData._count.students,
          totalSubjects: classData.subjects.length,
        },
        subjects: classData.subjects,
        students: classData.students,
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${classData.name}-${classData.section}-data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const result = await updateClass(selectedClass.id, {
        name: editForm.name,
        section: editForm.section,
        academicYear: editForm.academicYear,
        branchId: editForm.branchId,
        teacherId: editForm.teacherId,
      });

      if (result.success) {
        await loadData(); // Reload data
        setShowEditDialog(false);
        setSelectedClass(null);
      } else {
        throw new Error(result.error || 'Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      setError(error instanceof Error ? error.message : 'Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const result = await deleteClass(selectedClass.id);

      if (result.success) {
        await loadData(); // Reload data
        setShowDeleteDialog(false);
        setSelectedClass(null);
      } else {
        throw new Error(result.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete class');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudentAssignments = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const result = await assignStudentsToClass(selectedClass.id, selectedStudentIds);

      if (result.success) {
        await loadData(); // Reload data
        setShowManageStudentsDialog(false);
        setSelectedClass(null);
      } else {
        throw new Error(result.error || 'Failed to assign students');
      }
    } catch (error) {
      console.error('Error assigning students:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <LoaderIcon className="h-6 w-6 animate-spin" />
          <span>Loading classes data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-[150px] p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Classes Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage class sections, student assignments, and timetables
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <Button onClick={loadData}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Classes Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage class sections, student assignments, and timetables
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statisticsCards.map((stat) => (
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
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="timetables">Timetables</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{cls.name} - {cls.section}</p>
                            <p className="text-sm text-muted-foreground">{cls.academicYear}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={cls.teacher?.name} />
                            <AvatarFallback>{getInitials(cls.teacher?.name || '')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{cls.teacher?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                          {cls.branch?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className={`font-semibold ${getCapacityColor(cls._count.students, 40)}`}>
                            {cls._count.students}
                          </span>
                          <span className="text-muted-foreground">/40</span>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${(cls._count.students / 40) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cls.subjects.slice(0, 2).map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{subject.name}</Badge>
                          ))}
                          {cls.subjects.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{cls.subjects.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUpIcon className={`h-4 w-4 ${getCapacityColor(cls._count.students, 40)}`} />
                          <span className={`font-semibold ${getCapacityColor(cls._count.students, 40)}`}>
                            {cls._count.students}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getCapacityColor(cls._count.students, 40)}`}>
                          {cls._count.students}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(cls)}>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClass(cls)}>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Class
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewTimetable(cls)}>
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              View Timetable
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageStudents(cls)}>
                              <UsersIcon className="h-4 w-4 mr-2" />
                              Manage Students
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportData(cls)}>
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDeleteClass(cls)}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete Class
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

        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Sections Management</h3>
                <p className="text-muted-foreground mb-4">
                  Sections are organized by subjects and managed through the Subjects page.
                </p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/subjects'}
                  className="gap-2"
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Go to Subjects Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetables" className="space-y-6">
          {/* Timetable content */}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{selectedClass?.name} - {selectedClass?.section}"? 
              This action cannot be undone and will remove all associated data.
            </p>
            {selectedClass && selectedClass._count.students > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  Warning: This class has {selectedClass._count.students} students enrolled. 
                  All student assignments will be removed.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete Class'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
