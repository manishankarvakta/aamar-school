"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  LoaderIcon,
} from "lucide-react";

// Import actions
import {
  getClasses,
  getClassStats,
  searchClasses,
  updateClass,
  deleteClass,
  assignStudentsToClass,
} from "@/app/actions/classes";
import { getSubjects } from "@/app/actions/subjects";
import { getStudents } from "@/app/actions/students";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionStats,
} from "@/app/actions/sections";

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
  } | null;
  teacher?: {
    id: string;
    userId: string;
    name: string; // Combined firstName + lastName
    email: string;
    phone: string | null;
    qualification: string | null;
    experience: number | null;
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
  school?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
    displayName: string;
    studentCount: number;
    branch: string;
  };
  sections?: Array<{
    id: string;
    name: string;
    displayName: string;
    capacity: number;
    studentCount: number;
  }>;
  status?: string;
}

interface SectionData {
  id: string;
  name: string;
  displayName: string;
  capacity: number;
  studentCount: number;
  availableSlots: number;
  occupancyRate: number;
  class: {
    id: string;
    name: string;
    academicYear: string;
    branch: string;
    teacher: string;
  };
  status: string;
}

interface StatsData {
  totalClasses: number;
  totalStudents: number;
  averageStudentsPerClass: number;
  branchStats: Record<string, { classes: number; students: number }>;
}

interface StudentData {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rollNumber: string;
  section?: {
    class: {
      name: string;
    };
  };
}

export default function ClassesPage() {
  const [selectedTab, setSelectedTab] = useState("classes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [sectionStats, setSectionStats] = useState<any>(null);

  // Section-specific states
  const [sectionSearchTerm, setSectionSearchTerm] = useState("");
  const [selectedSectionClass, setSelectedSectionClass] =
    useState("All Classes");
  const [selectedSectionBranch, setSelectedSectionBranch] =
    useState("All Branches");

  // Dialog states
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTimetableDialog, setShowTimetableDialog] = useState(false);
  const [showManageStudentsDialog, setShowManageStudentsDialog] =
    useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    academicYear: "",
    branchId: "",
    teacherId: "",
    capacity: 40,
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading data...");

      const [
        classesResult,
        statsResult,
        subjectsResult,
        studentsResult,
        sectionsResult,
        sectionStatsResult,
      ] = await Promise.all([
        getClasses(),
        getClassStats(),
        getSubjects(),
        getStudents(),
        getSections(),
        getSectionStats(),
      ]);

      console.log("API Results:", {
        classes: classesResult,
        stats: statsResult,
        subjects: subjectsResult,
        students: studentsResult,
        sections: sectionsResult,
        sectionStats: sectionStatsResult,
      });

      if (classesResult.success) {
        const classesData = (classesResult.data as ClassData[]) || [];
        console.log("Classes data:", classesData);
        setClasses(classesData);
      } else {
        throw new Error(classesResult.error || "Failed to load classes");
      }

      if (statsResult.success) {
        setStats(statsResult.data as StatsData);
      } else {
        console.warn("Failed to load stats:", statsResult.error);
      }

      if (subjectsResult.success) {
        setSubjects((subjectsResult.data as SubjectData[]) || []);
      } else {
        console.warn("Failed to load subjects:", subjectsResult.error);
      }

      if (studentsResult.success) {
        setAllStudents((studentsResult.data as StudentData[]) || []);
      } else {
        console.warn("Failed to load students:", studentsResult.error);
      }

      if (sectionsResult.success) {
        const sectionsData = (sectionsResult.data as SectionData[]) || [];
        console.log("Sections data:", sectionsData);
        setSections(sectionsData);
      } else {
        console.warn("Failed to load sections:", sectionsResult.error);
      }

      if (sectionStatsResult.success) {
        setSectionStats(sectionStatsResult.data);
      } else {
        console.warn("Failed to load section stats:", sectionStatsResult.error);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
      // Set empty arrays to prevent map errors
      setClasses([] as ClassData[]);
      setStats(null);
      setSubjects([] as SubjectData[]);
      setAllStudents([] as StudentData[]);
      setSections([] as SectionData[]);
      setSectionStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate grades and branches from actual data
  const grades = [
    "All Grades",
    ...Array.from(new Set(classes.map((cls) => cls.name))),
  ];
  const branches: string[] = [
    "All Branches",
    ...(Array.from(
      new Set(classes.map((cls) => cls.branch?.name).filter(Boolean)),
    ) as string[]),
  ];
  const academicYears = Array.from(
    new Set(classes.map((cls) => cls.academicYear)),
  );

  const statisticsCards = [
    {
      title: "Total Classes",
      value: stats?.totalClasses?.toString() || classes.length.toString(),
      icon: BookOpenIcon,
      color: "blue",
    },
    {
      title: "Total Students",
      value:
        stats?.totalStudents?.toString() ||
        classes.reduce((sum, cls) => sum + cls.totalStudents, 0).toString(),
      icon: UsersIcon,
      color: "green",
    },
    {
      title: "Average Students/Class",
      value:
        stats?.averageStudentsPerClass?.toString() ||
        Math.round(
          classes.reduce((sum, cls) => sum + cls.totalStudents, 0) /
            Math.max(classes.length, 1),
        ).toString(),
      icon: TrendingUpIcon,
      color: "purple",
    },
    {
      title: "Active Subjects",
      value: subjects.length.toString(),
      icon: BookOpenIcon,
      color: "orange",
    },
  ];

  const filteredClasses = classes.filter((cls) => {
    const teacherName = cls.teacher?.name || "";
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade =
      selectedGrade === "All Grades" || cls.name === selectedGrade;
    const matchesBranch =
      selectedBranch === "All Branches" || cls.branch?.name === selectedBranch;
    return matchesSearch && matchesGrade && matchesBranch;
  });

  console.log("Filtered classes:", {
    totalClasses: classes.length,
    filteredClasses: filteredClasses.length,
    searchTerm,
    selectedGrade,
    selectedBranch,
    classes: classes.map((cls) => ({
      name: cls.name,
      branch: cls.branch?.name,
      teacher: cls.teacher?.name,
    })),
  });

  // Section-specific data
  const sectionClasses = [
    "All Classes",
    ...Array.from(new Set(sections.map((section) => section.class.name))),
  ];
  const sectionBranches = [
    "All Branches",
    ...Array.from(new Set(sections.map((section) => section.class.branch))),
  ];

  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.name.toLowerCase().includes(sectionSearchTerm.toLowerCase()) ||
      section.displayName
        .toLowerCase()
        .includes(sectionSearchTerm.toLowerCase()) ||
      section.class.name
        .toLowerCase()
        .includes(sectionSearchTerm.toLowerCase()) ||
      section.class.branch
        .toLowerCase()
        .includes(sectionSearchTerm.toLowerCase());
    const matchesClass =
      selectedSectionClass === "All Classes" ||
      section.class.name === selectedSectionClass;
    const matchesBranch =
      selectedSectionBranch === "All Branches" ||
      section.class.branch === selectedSectionBranch;
    return matchesSearch && matchesClass && matchesBranch;
  });

  console.log("Filtered sections:", {
    totalSections: sections.length,
    filteredSections: filteredSections.length,
    sectionSearchTerm,
    selectedSectionClass,
    selectedSectionBranch,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCapacityColor = (current: number, capacity: number = 40) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 95) return "text-red-600";
    if (percentage >= 85) return "text-yellow-600";
    return "text-green-600";
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
      branchId: classData.branchId || "",
      teacherId: classData.teacherId || "",
      capacity: 40,
    });
    setShowEditDialog(true);
  };

  const handleManageStudents = (classData: ClassData) => {
    // TODO: Fix type issues
    // setSelectedClass(classData);
    // setSelectedStudentIds(classData.students.map(s => s.id));
    // setShowManageStudentsDialog(true);
    console.log(
      "Manage students feature temporarily disabled due to type issues",
    );
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
          // section: classData.section, // Removed due to type error
          academicYear: classData.academicYear,
          teacher: classData.teacher?.name || "Not assigned",
          branch: classData.branch?.name,
          totalStudents: classData.totalStudents,
          totalSubjects: classData.totalSubjects,
        },
        // subjects: classData.subjects, // Removed due to type error
        // students: classData.students, // Removed due to type error
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      // link.download = `${classData.name}-${classData.section}-data.json`; // Removed due to type error
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const result = await updateClass(selectedClass.id, {
        name: editForm.name,
        // section: editForm.section, // Removed due to type error
        academicYear: editForm.academicYear,
        branchId: editForm.branchId,
        teacherId: editForm.teacherId,
      });

      if (result.success) {
        await loadData(); // Reload data
        setShowEditDialog(false);
        setSelectedClass(null);
      } else {
        throw new Error(result.error || "Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update class",
      );
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
        throw new Error(result.error || "Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete class",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudentAssignments = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const result = await assignStudentsToClass(
        selectedClass.id,
        selectedStudentIds,
      );

      if (result.success) {
        await loadData(); // Reload data
        setShowManageStudentsDialog(false);
        setSelectedClass(null);
      } else {
        throw new Error(result.error || "Failed to assign students");
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      setError(
        error instanceof Error ? error.message : "Failed to assign students",
      );
    } finally {
      setLoading(false);
    }
  };

  // Section statistics cards
  const sectionStatisticsCards = [
    {
      title: "Total Sections",
      value:
        sectionStats?.totalSections?.toString() || sections.length.toString(),
      icon: UsersIcon,
      color: "blue",
    },
    {
      title: "Total Students",
      value: sectionStats?.totalStudents?.toString() || "0",
      icon: UsersIcon,
      color: "green",
    },
    {
      title: "Available Slots",
      value: sectionStats?.availableSlots?.toString() || "0",
      icon: TrendingUpIcon,
      color: "purple",
    },
    {
      title: "Avg Occupancy",
      value: `${sectionStats?.averageOccupancy?.toString() || "0"}%`,
      icon: BookOpenIcon,
      color: "orange",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <LoaderIcon className="h-6 w-6 animate-spin" />
          <span>Loading classes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6  p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage classes, sections, and academic structure
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statisticsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 text-${card.color}-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="timetables">Timetables</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-6">
          {/* Classes Tab Filters */}
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
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <BookOpenIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{cls.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Academic Year: {cls.academicYear}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Branch
                          </p>
                          <p className="font-medium">
                            {cls.branch?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Teacher
                          </p>
                          <p className="font-medium">
                            {cls.teacher?.name || "Not assigned"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Students
                          </p>
                          <p className="font-medium">{cls.totalStudents}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Subjects
                          </p>
                          <p className="font-medium">{cls.totalSubjects}</p>
                        </div>
                      </div>

                      {cls.sections && cls.sections.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Sections:
                          </p>
                          <div className="flex gap-2">
                            {cls.sections.map((section) => (
                              <Badge key={section.id} variant="outline">
                                {section.name} ({section.students.length}/
                                {section.capacity})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(cls)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClass(cls)}>
                          <EditIcon className="h-4 w-4 mr-2" />
                          Edit Class
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleManageStudents(cls)}
                        >
                          <UsersIcon className="h-4 w-4 mr-2" />
                          Manage Students
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewTimetable(cls)}
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          View Timetable
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportData(cls)}>
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClass(cls)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          {/* Section Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sectionStatisticsCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className={`h-4 w-4 text-${card.color}-600`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sections Tab Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sections..."
                      value={sectionSearchTerm}
                      onChange={(e) => setSectionSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={selectedSectionClass}
                  onValueChange={setSelectedSectionClass}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionClasses.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedSectionBranch}
                  onValueChange={setSelectedSectionBranch}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionBranches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sections Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sections</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSections.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No sections found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {sectionSearchTerm ||
                    selectedSectionClass !== "All Classes" ||
                    selectedSectionBranch !== "All Branches"
                      ? "Try adjusting your search or filters"
                      : "Get started by creating your first section"}
                  </p>
                  {!sectionSearchTerm &&
                    selectedSectionClass === "All Classes" &&
                    selectedSectionBranch === "All Branches" && (
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Occupancy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSections.map((section) => (
                        <TableRow key={section.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{section.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {section.displayName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {section.class.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {section.class.academicYear}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{section.class.branch}</TableCell>
                          <TableCell>{section.class.teacher}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {section.studentCount}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                / {section.capacity}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{section.capacity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    section.occupancyRate >= 90
                                      ? "bg-red-500"
                                      : section.occupancyRate >= 75
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{ width: `${section.occupancyRate}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {section.occupancyRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                section.status === "Full"
                                  ? "destructive"
                                  : section.occupancyRate >= 75
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {section.status}
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
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <EditIcon className="h-4 w-4 mr-2" />
                                  Edit Section
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UsersIcon className="h-4 w-4 mr-2" />
                                  Manage Students
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete Section
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetables" className="space-y-6">
          {/* Timetables Tab Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search timetables..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.slice(1).map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Timetable
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Timetable management coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Tab Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search performance data..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.slice(1).map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Performance analytics coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Reports Tab Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search reports..." className="pl-10" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="administrative">
                      Administrative
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Reports generation coming soon...
            </p>
          </div>
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
              Are you sure you want to delete "{selectedClass?.name}"? This
              action cannot be undone and will remove all associated data.
            </p>
            {selectedClass && selectedClass.totalStudents > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  Warning: This class has {selectedClass.totalStudents} students
                  enrolled. All student assignments will be removed.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Class"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
