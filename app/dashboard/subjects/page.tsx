"use client";

import { useState, useEffect, useRef } from "react";
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
  BookIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  FolderIcon,
  FileTextIcon,
  ClockIcon,
  UserIcon,
  GraduationCapIcon,
  ChevronRightIcon,
  EyeIcon,
  LoaderIcon,
} from "lucide-react";

// Import actions
import {
  getSubjects,
  getSubjectStats,
  createSubject,
  updateSubject,
  deleteSubject,
  searchSubjects,
  createChapter,
  updateChapter,
  deleteChapter,
  getChaptersBySubject,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByChapter,
} from "@/app/actions/subjects";
import { getClasses } from "@/app/actions/classes";
import { getTeacherStats } from '@/app/actions/teachers';

interface SubjectData {
  id: string;
  name: string;
  code: string;
  description: string;
  school: {
    id: string;
    name: string;
  };
  class: {
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
  chapters: Array<{
    id: string;
    name: string;
    description?: string | null;
    orderIndex: number;
    lessonsCount: number;
    duration?: string | null;
    lessons: LessonData[];
  }>;
  totalChapters: number;
  totalTimetables: number;
  status: string;
}

interface ChapterData {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  lessons: LessonData[];
  _count: {
    lessons: number;
  };
}

interface LessonData {
  id: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  duration?: string | null;
  lessonType: string;
  type?: string;
  status?: string;
}

interface StatsData {
  totalSubjects: number;
  totalChapters: number;
  totalLessons: number;
  totalClasses: number;
  subjectsWithClasses?: number;
  totalTimetables?: number;
  activeTeachers: number;
}

interface ClassData {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  displayName?: string;
}

// Move handleSearch to the top level of the file
async function handleSearch(
  term: string,
  loadData: () => Promise<void>,
  setLoading: (b: boolean) => void,
  setSubjects: (s: any[]) => void,
) {
  if (!term.trim()) {
    await loadData();
    return;
  }
  try {
    setLoading(true);
    const result = await searchSubjects(term);
    if (result.success) {
      setSubjects(result.data || []);
    }
  } catch (error) {
    console.error("Error searching subjects:", error);
  } finally {
    setLoading(false);
  }
}

// Type guard for TeacherStats
function isTeacherStats(data: any): data is { activeTeachers: number } {
  return (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    typeof data.activeTeachers === 'number'
  );
}

export default function SubjectsPage() {
  const [selectedTab, setSelectedTab] = useState("subjects");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(
    null,
  );
  const [selectedChapter, setSelectedChapter] = useState<{
    name?: string;
    id?: string;
  } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogType, setDialogType] = useState("subject"); // subject, chapter, lesson
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectData[]>([]);
  const [paginatedSubjects, setPaginatedSubjects] = useState<SubjectData[]>([]);

  // Form states
  const [addForm, setAddForm] = useState({
    name: "",
    code: "",
    description: "",
    schoolId: "",
    classId: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Add this after addForm state
  type AddChapterForm = {
    name: string;
    description: string;
    orderIndex: string;
  };
  const [addChapterForm, setAddChapterForm] = useState<AddChapterForm>({
    name: "",
    description: "",
    orderIndex: "",
  });

  // Debounce search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // 1. Add state for editing chapter and dialogs
  const [showEditChapterDialog, setShowEditChapterDialog] = useState(false);
  const [showDeleteChapterDialog, setShowDeleteChapterDialog] = useState(false);
  const [selectedChapterForEdit, setSelectedChapterForEdit] =
    useState<any>(null);
  const [editChapterForm, setEditChapterForm] = useState({
    name: "",
    description: "",
    orderIndex: "",
  });
  const [selectedChapterForDelete, setSelectedChapterForDelete] =
    useState<any>(null);

  // Add state for chapters pagination after subjects pagination state
  const [chaptersCurrentPage, setChaptersCurrentPage] = useState(1);
  const [chaptersItemsPerPage, setChaptersItemsPerPage] = useState(10);

  // LESSON STATE
  const [addLessonForm, setAddLessonForm] = useState({
    name: "",
    description: "",
    orderIndex: "",
    duration: "",
    lessonType: "theory",
  });
  const [showEditLessonDialog, setShowEditLessonDialog] = useState(false);
  const [showDeleteLessonDialog, setShowDeleteLessonDialog] = useState(false);
  const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<any>(null);
  const [editLessonForm, setEditLessonForm] = useState({
    name: "",
    description: "",
    orderIndex: "",
    duration: "",
    lessonType: "theory",
  });
  const [selectedLessonForDelete, setSelectedLessonForDelete] =
    useState<any>(null);

  // Add state for lessons pagination after chapters pagination state
  const [lessonsCurrentPage, setLessonsCurrentPage] = useState(1);
  const [lessonsItemsPerPage, setLessonsItemsPerPage] = useState(10);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [subjectsResult, statsResult, classesResult, teacherStatsResult] = await Promise.all([
        getSubjects(),
        getSubjectStats(),
        getClasses(),
        getTeacherStats(),
      ]);

      console.log("subjectsResult", subjectsResult);

      if (subjectsResult.success) {
        // Transform the data to match SubjectData interface
        const transformedSubjects = (subjectsResult.data || []).map(
          (subject: any) => ({
            ...subject,
            class: {
              ...subject.class,
              studentCount: subject.class.studentCount || 0,
            },
          }),
        );
        setSubjects(transformedSubjects);
      } else {
        throw new Error(subjectsResult.error || "Failed to load subjects");
      }

      if (statsResult.success && statsResult.data) {
        let activeTeachers = 0;
        if (
          teacherStatsResult.success &&
          isTeacherStats(teacherStatsResult.data)
        ) {
          activeTeachers = teacherStatsResult.data.activeTeachers;
        }
        console.log("statsResult", statsResult);
        const statsData: StatsData = {
          totalSubjects: statsResult?.data?.totalSubjects || 0,
          totalChapters: statsResult?.data?.totalChapters || 0,
          totalLessons: statsResult?.data?.totalLessons || 0,
          totalClasses: Array.isArray(statsResult.data.classWiseCount) ? statsResult.data.classWiseCount.length : 0,
          subjectsWithClasses: Array.isArray(statsResult.data.classWiseCount) ? statsResult.data.classWiseCount.length : 0,
          totalTimetables: 0,
          activeTeachers,
        };
        setStats(statsData);
      }

      if (classesResult.success) {
        const classArray = Array.isArray(classesResult.data)
          ? classesResult.data
          : [];
        const transformedClasses: ClassData[] = classArray.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          section: cls.name, // Use name as section since section doesn't exist
          academicYear: cls.academicYear || "",
          displayName: cls.name,
        }));
        setClasses(transformedClasses);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      // No loading animation for search
      // Just update searchTerm, filtering effect will run
    }, 300);
  };

  // Action handlers
  const handleAddSubject = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", addForm.name);
      formData.append("code", addForm.code);
      formData.append("description", addForm.description);
      formData.append("schoolId", addForm.schoolId || "default-school-id");
      formData.append("classId", addForm.classId);

      const result = await createSubject(formData);

      if (result.success) {
        await loadData(); // Reload data
        setShowAddDialog(false);
        setAddForm({
          name: "",
          code: "",
          description: "",
          schoolId: "",
          classId: "",
        });
      } else {
        throw new Error(result.message || "Failed to create subject");
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create subject",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = async () => {
    if (!selectedSubject) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("code", editForm.code);
      formData.append("description", editForm.description);

      const result = await updateSubject(selectedSubject.id, formData);

      if (result.success) {
        await loadData(); // Reload data
        setShowEditDialog(false);
        setSelectedSubject(null);
      } else {
        throw new Error(result.message || "Failed to update subject");
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update subject",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    try {
      setLoading(true);
      const result = await deleteSubject(selectedSubject.id);

      if (result.success) {
        await loadData(); // Reload data
        setShowDeleteDialog(false);
        setSelectedSubject(null);
      } else {
        throw new Error(result.message || "Failed to delete subject");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete subject",
      );
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (subject: SubjectData) => {
    setSelectedSubject(subject);
    setEditForm({
      name: subject.name,
      code: subject.code,
      description: subject.description,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (subject: SubjectData) => {
    setSelectedSubject(subject);
    setShowDeleteDialog(true);
  };

  const openAddDialog = (
    type: string,
    subject: SubjectData | null = null,
    chapter: any = null,
  ) => {
    setDialogType(type);
    setSelectedSubject(subject);
    setSelectedChapter(chapter);
    setShowAddDialog(true);
  };

  // Filtering effect (like teachers page)
  useEffect(() => {
    let filtered = subjects;
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selectedClass !== "all") {
      filtered = filtered.filter(
        (subject) =>
          `${subject.class.name} - ${subject.class.displayName}` ===
          selectedClass,
      );
    }
    setFilteredSubjects(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [subjects, searchTerm, selectedClass]);

  // Pagination effect (like teachers page)
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedSubjects(filteredSubjects.slice(startIndex, endIndex));
  }, [filteredSubjects, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredSubjects.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Complete":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-orange-100 text-orange-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case "Theory":
        return "bg-blue-100 text-blue-800";
      case "Practice":
        return "bg-green-100 text-green-800";
      case "Assignment":
        return "bg-purple-100 text-purple-800";
      case "Lab":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Add handleAddChapter function after handleAddSubject
  const handleAddChapter = async () => {
    if (!selectedSubject) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", addChapterForm.name);
      formData.append("description", addChapterForm.description);
      formData.append("orderIndex", addChapterForm.orderIndex);
      formData.append("subjectId", selectedSubject.id);
      formData.append("aamarId", "234567"); // or use actual aamarId if available

      const result = await createChapter(formData);
      if (result.success) {
        await loadData();
        setShowAddDialog(false);
        setAddChapterForm({ name: "", description: "", orderIndex: "" });
      } else {
        throw new Error(result.message || "Failed to create chapter");
      }
    } catch (error) {
      console.error("Error creating chapter:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create chapter",
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Implement handleEditChapter
  const openEditChapterDialog = (chapter: any) => {
    setSelectedChapterForEdit(chapter);
    setEditChapterForm({
      name: chapter.name || "",
      description: chapter.description || "",
      orderIndex: String(chapter.orderIndex || ""),
    });
    setShowEditChapterDialog(true);
  };
  const handleEditChapter = async () => {
    if (!selectedChapterForEdit) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editChapterForm.name);
      formData.append("description", editChapterForm.description);
      formData.append("orderIndex", editChapterForm.orderIndex);
      const result = await updateChapter(selectedChapterForEdit.id, formData);
      if (result.success) {
        await loadData();
        setShowEditChapterDialog(false);
        setSelectedChapterForEdit(null);
      } else {
        throw new Error(result.message || "Failed to update chapter");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update chapter",
      );
    } finally {
      setLoading(false);
    }
  };
  // 3. Implement handleDeleteChapter
  const openDeleteChapterDialog = (chapter: any) => {
    setSelectedChapterForDelete(chapter);
    setShowDeleteChapterDialog(true);
  };
  const handleDeleteChapter = async () => {
    if (!selectedChapterForDelete) return;
    try {
      setLoading(true);
      const result = await deleteChapter(selectedChapterForDelete.id);
      if (result.success) {
        await loadData();
        setShowDeleteChapterDialog(false);
        setSelectedChapterForDelete(null);
      } else {
        throw new Error(result.message || "Failed to delete chapter");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete chapter",
      );
    } finally {
      setLoading(false);
    }
  };

  // Compute paginated subjects for chapters tab
  const chaptersTotalPages = Math.ceil(subjects.length / chaptersItemsPerPage);
  const chaptersStartItem =
    (chaptersCurrentPage - 1) * chaptersItemsPerPage + 1;
  const chaptersEndItem = Math.min(
    chaptersCurrentPage * chaptersItemsPerPage,
    subjects.length,
  );
  const paginatedSubjectsForChapters = subjects.slice(
    (chaptersCurrentPage - 1) * chaptersItemsPerPage,
    chaptersCurrentPage * chaptersItemsPerPage,
  );

  // ADD LESSON HANDLER
  const handleAddLesson = async () => {
    if (!selectedChapter || !selectedChapter.id) {
      setError("No chapter selected for this lesson. Please try again.");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", addLessonForm.name);
      formData.append("description", addLessonForm.description);
      formData.append("orderIndex", addLessonForm.orderIndex);
      formData.append("duration", addLessonForm.duration);
      formData.append("lessonType", addLessonForm.lessonType);
      formData.append("chapterId", String(selectedChapter.id));
      const result = await createLesson(formData);
      if (result.success) {
        await loadData();
        setShowAddDialog(false);
        setAddLessonForm({
          name: "",
          description: "",
          orderIndex: "",
          duration: "",
          lessonType: "theory",
        });
      } else {
        throw new Error(result.message || "Failed to create lesson");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create lesson",
      );
    } finally {
      setLoading(false);
    }
  };

  // EDIT LESSON HANDLER
  const openEditLessonDialog = (lesson: any) => {
    setSelectedLessonForEdit(lesson);
    setEditLessonForm({
      name: lesson.name || "",
      description: lesson.description || "",
      orderIndex: String(lesson.orderIndex || ""),
      duration: lesson.duration || "",
      lessonType: lesson.type || lesson.lessonType || "theory",
    });
    setShowEditLessonDialog(true);
  };
  const handleEditLesson = async () => {
    if (!selectedLessonForEdit) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editLessonForm.name);
      formData.append("description", editLessonForm.description);
      formData.append("orderIndex", editLessonForm.orderIndex);
      formData.append("duration", editLessonForm.duration);
      formData.append("lessonType", editLessonForm.lessonType);
      const result = await updateLesson(selectedLessonForEdit.id, formData);
      if (result.success) {
        await loadData();
        setShowEditLessonDialog(false);
        setSelectedLessonForEdit(null);
      } else {
        throw new Error(result.message || "Failed to update lesson");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update lesson",
      );
    } finally {
      setLoading(false);
    }
  };
  // DELETE LESSON HANDLER
  const openDeleteLessonDialog = (lesson: any) => {
    setSelectedLessonForDelete(lesson);
    setShowDeleteLessonDialog(true);
  };
  const handleDeleteLesson = async () => {
    if (!selectedLessonForDelete) return;
    try {
      setLoading(true);
      const result = await deleteLesson(selectedLessonForDelete.id);
      if (result.success) {
        await loadData();
        setShowDeleteLessonDialog(false);
        setSelectedLessonForDelete(null);
      } else {
        throw new Error(result.message || "Failed to delete lesson");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete lesson",
      );
    } finally {
      setLoading(false);
    }
  };

  // Compute all subject-chapter pairs for lessons tab
  const subjectChapterPairs = subjects.flatMap((subject) =>
    subject.chapters.map((chapter) => ({ subject, chapter })),
  );
  const lessonsTotalPages = Math.ceil(
    subjectChapterPairs.length / lessonsItemsPerPage,
  );
  const lessonsStartItem = (lessonsCurrentPage - 1) * lessonsItemsPerPage + 1;
  const lessonsEndItem = Math.min(
    lessonsCurrentPage * lessonsItemsPerPage,
    subjectChapterPairs.length,
  );
  const paginatedSubjectChapterPairs = subjectChapterPairs.slice(
    (lessonsCurrentPage - 1) * lessonsItemsPerPage,
    lessonsCurrentPage * lessonsItemsPerPage,
  );

  if (loading && (subjects || []).length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <LoaderIcon className="h-6 w-6 animate-spin" />
          <span>Loading subjects data...</span>
        </div>
      </div>
    );
  }

  if (error && (subjects || []).length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subject Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage subjects, chapters, and lessons for your curriculum
          </p>
        </div>
        <Button onClick={() => openAddDialog("subject")} className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Subjects
                    </p>
                    <p className="text-xl font-bold">{stats.totalSubjects}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <BookIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Chapters
                    </p>
                    <p className="text-xl font-bold">{stats.totalChapters}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-100">
                    <FolderIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Lessons
                    </p>
                    <p className="text-xl font-bold">{stats.totalLessons}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-100">
                    <FileTextIcon className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Active Teachers
                    </p>
                    <p className="text-xl font-bold">{stats.activeTeachers}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-100">
                    <UserIcon className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subjects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearchInput(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem
                    key={cls.id}
                    value={`${cls.name} - ${cls.displayName}`}
                  >{`${cls.name} - ${cls.displayName}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6">
          <div className="grid gap-6">
            {paginatedSubjects.map((subject) => (
              <Card key={subject.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {subject.name}
                        </h3>
                        <Badge variant="outline">{subject.code}</Badge>
                        <Badge className={getStatusColor(subject.status)}>
                          {subject.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {subject.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Class: {subject.class.name}</span>
                        <span>Branch: {subject.class.branch}</span>
                        <span>Students: {subject.class.studentCount}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(subject)}
                        >
                          <EditIcon className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openAddDialog("chapter", subject)}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Chapter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(subject)}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {subject.chapters.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">
                        Chapters ({subject.totalChapters})
                      </h4>
                      <div className="space-y-2">
                        {subject.chapters.slice(0, 3).map((chapter) => (
                          <div
                            key={chapter.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{chapter.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {chapter.lessonsCount} lessons
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openAddDialog("lesson", subject, chapter)
                                }
                              >
                                Add Lesson
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVerticalIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      openEditChapterDialog(chapter)
                                    }
                                  >
                                    <EditIcon className="h-4 w-4 mr-2" />
                                    Edit Chapter
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      openDeleteChapterDialog(chapter)
                                    }
                                  >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Delete Chapter
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                        {subject.chapters.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{subject.chapters.length - 3} more chapters
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <div>
                <span className="text-sm text-muted-foreground">
                  Showing {filteredSubjects.length === 0 ? 0 : startItem} -{" "}
                  {endItem} of {filteredSubjects.length} subjects
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
                <select
                  className="ml-2 border rounded px-2 py-1 text-sm"
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chapters" className="space-y-4">
          <div className="space-y-6">
            {paginatedSubjectsForChapters.map((subject) => (
              <Card key={subject.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookIcon className="h-5 w-5" />
                      {subject.name} - Chapters
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Class: {subject.class.name}{" "}
                      {subject.class.branch
                        ? ` | Branch: ${subject.class.branch}`
                        : ""}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => openAddDialog("chapter", subject)}
                  >
                    <PlusIcon className="h-4 w-4" /> Add Chapter
                  </Button>
                </CardHeader>
                <CardContent>
                  {subject.chapters.length > 0 ? (
                    <div className="space-y-3">
                      {subject.chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {chapter.orderIndex}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{chapter.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {chapter.description}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <ClockIcon className="h-3 w-3" />
                                  {chapter.duration}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {chapter.lessons?.length ??
                                    chapter.lessonsCount ??
                                    0}{" "}
                                  lessons
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openAddDialog("lesson", subject, chapter)
                              }
                            >
                              Add Lesson
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditChapterDialog(chapter)}
                                >
                                  <EditIcon className="h-4 w-4 mr-2" />
                                  Edit Chapter
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    openDeleteChapterDialog(chapter)
                                  }
                                >
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete Chapter
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No chapters added yet
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => openAddDialog("chapter", subject)}
                      >
                        Add First Chapter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination info */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Showing {subjects.length === 0 ? 0 : chaptersStartItem} -{" "}
              {chaptersEndItem} of {subjects.length} subjects
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={chaptersCurrentPage === 1}
                onClick={() => setChaptersCurrentPage(chaptersCurrentPage - 1)}
              >
                Prev
              </Button>
              {Array.from({ length: chaptersTotalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === chaptersCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChaptersCurrentPage(p)}
                  >
                    {p}
                  </Button>
                ),
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={
                  chaptersCurrentPage === chaptersTotalPages ||
                  chaptersTotalPages === 0
                }
                onClick={() => setChaptersCurrentPage(chaptersCurrentPage + 1)}
              >
                Next
              </Button>
              <select
                className="ml-2 border rounded px-2 py-1 text-sm"
                value={chaptersItemsPerPage}
                onChange={(e) => {
                  setChaptersItemsPerPage(Number(e.target.value));
                  setChaptersCurrentPage(1);
                }}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <div className="space-y-6">
            {paginatedSubjectChapterPairs.map(({ subject, chapter }) => (
              <Card key={`${subject.id}-${chapter.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookIcon className="h-4 w-4" />
                    {subject.name}
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    <FolderIcon className="h-4 w-4" />
                    {chapter.name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    Class: {subject.class.name}{" "}
                    {subject.class.branch
                      ? `| Branch: ${subject.class.branch}`
                      : ""}
                  </div>
                </CardHeader>
                <CardContent>
                  {(chapter.lessons?.length ?? 0) > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lesson</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(chapter.lessons || []).map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                {lesson.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3 text-muted-foreground" />
                                {lesson.duration || "---"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getLessonTypeColor(
                                  lesson.type || lesson.lessonType || "THEORY",
                                )}
                              >
                                {lesson.type || lesson.lessonType || "THEORY"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(
                                  lesson.status || "Active",
                                )}
                              >
                                {lesson.status || "Active"}
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
                                  <DropdownMenuItem
                                    onClick={() => openEditLessonDialog(lesson)}
                                  >
                                    <EditIcon className="h-4 w-4 mr-2" />
                                    Edit Lesson
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      openDeleteLessonDialog(lesson)
                                    }
                                  >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Delete Lesson
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No lessons added yet
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() =>
                          openAddDialog("lesson", subject, chapter)
                        }
                      >
                        Add First Lesson
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination info */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Showing {subjectChapterPairs.length === 0 ? 0 : lessonsStartItem}{" "}
              - {lessonsEndItem} of {subjectChapterPairs.length} subject-chapter
              pairs
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={lessonsCurrentPage === 1}
                onClick={() => setLessonsCurrentPage(lessonsCurrentPage - 1)}
              >
                Prev
              </Button>
              {Array.from({ length: lessonsTotalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === lessonsCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLessonsCurrentPage(p)}
                  >
                    {p}
                  </Button>
                ),
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={
                  lessonsCurrentPage === lessonsTotalPages ||
                  lessonsTotalPages === 0
                }
                onClick={() => setLessonsCurrentPage(lessonsCurrentPage + 1)}
              >
                Next
              </Button>
              <select
                className="ml-2 border rounded px-2 py-1 text-sm"
                value={lessonsItemsPerPage}
                onChange={(e) => {
                  setLessonsItemsPerPage(Number(e.target.value));
                  setLessonsCurrentPage(1);
                }}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Add New {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogType === "subject" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      placeholder="Enter subject name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Subject Code</Label>
                    <Input
                      id="code"
                      value={addForm.code}
                      onChange={(e) =>
                        setAddForm({ ...addForm, code: e.target.value })
                      }
                      placeholder="e.g., MATH101"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={addForm.description}
                    onChange={(e) =>
                      setAddForm({ ...addForm, description: e.target.value })
                    }
                    placeholder="Enter subject description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    onValueChange={(value) =>
                      setAddForm({ ...addForm, schoolId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem
                          key={cls.id}
                          value={cls.id}
                        >{`${cls.name} - ${cls.displayName}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add teacher selection logic */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credit Hours</Label>
                  <Input
                    id="credits"
                    type="number"
                    placeholder="Enter credit hours"
                  />
                </div>
              </>
            )}

            {dialogType === "chapter" && (
              <>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {selectedSubject?.name} ({selectedSubject?.code})
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapterName">Chapter Name</Label>
                    <Input
                      id="chapterName"
                      value={addChapterForm.name}
                      onChange={(e) =>
                        setAddChapterForm((f) => ({
                          ...f,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter chapter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={addChapterForm.orderIndex}
                      onChange={(e) =>
                        setAddChapterForm((f) => ({
                          ...f,
                          orderIndex: e.target.value,
                        }))
                      }
                      placeholder="Chapter order"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapterDescription">Description</Label>
                  <Textarea
                    id="chapterDescription"
                    value={addChapterForm.description}
                    onChange={(e) =>
                      setAddChapterForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter chapter description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <Input id="duration" placeholder="e.g., 2 weeks" disabled />
                </div>
              </>
            )}

            {dialogType === "lesson" && (
              <>
                <div className="space-y-2">
                  <Label>Chapter</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {selectedSubject?.name} → {selectedChapter?.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonName">Lesson Name</Label>
                  <Input
                    id="lessonName"
                    value={addLessonForm.name}
                    onChange={(e) =>
                      setAddLessonForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Enter lesson name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lessonDuration">Duration</Label>
                    <Input
                      id="lessonDuration"
                      value={addLessonForm.duration}
                      onChange={(e) =>
                        setAddLessonForm((f) => ({
                          ...f,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="e.g., 45 min"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lessonType">Type</Label>
                    <Select
                      value={addLessonForm.lessonType}
                      onValueChange={(value) =>
                        setAddLessonForm((f) => ({ ...f, lessonType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THEORY">Theory</SelectItem>
                        <SelectItem value="PRACTICE">Practice</SelectItem>
                        <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                        <SelectItem value="LAB">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonOrder">Order</Label>
                  <Input
                    id="lessonOrder"
                    type="number"
                    value={addLessonForm.orderIndex}
                    onChange={(e) =>
                      setAddLessonForm((f) => ({
                        ...f,
                        orderIndex: e.target.value,
                      }))
                    }
                    placeholder="Lesson order"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonDescription">Description</Label>
                  <Textarea
                    id="lessonDescription"
                    value={addLessonForm.description}
                    onChange={(e) =>
                      setAddLessonForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter lesson description"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={
                  dialogType === "subject"
                    ? handleAddSubject
                    : dialogType === "chapter"
                      ? handleAddChapter
                      : dialogType === "lesson"
                        ? handleAddLesson
                        : undefined
                }
                disabled={loading}
              >
                {loading
                  ? "Adding..."
                  : `Add ${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Subject Name</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter subject name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCode">Subject Code</Label>
                <Input
                  id="editCode"
                  value={editForm.code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value })
                  }
                  placeholder="e.g., MATH101"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter subject description"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubject} disabled={loading}>
                {loading ? "Updating..." : "Update Subject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{selectedSubject?.name}"? This
              action cannot be undone and will remove all associated chapters
              and lessons.
            </p>
            {selectedSubject && selectedSubject.totalChapters > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  Warning: This subject has {selectedSubject.totalChapters}{" "}
                  chapters. All chapters and lessons will be permanently
                  deleted.
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
                onClick={handleDeleteSubject}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Subject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog
        open={showEditChapterDialog}
        onOpenChange={setShowEditChapterDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editChapterName">Chapter Name</Label>
                <Input
                  id="editChapterName"
                  value={editChapterForm.name}
                  onChange={(e) =>
                    setEditChapterForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Enter chapter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOrder">Order</Label>
                <Input
                  id="editOrder"
                  type="number"
                  value={editChapterForm.orderIndex}
                  onChange={(e) =>
                    setEditChapterForm((f) => ({
                      ...f,
                      orderIndex: e.target.value,
                    }))
                  }
                  placeholder="Chapter order"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editChapterDescription">Description</Label>
              <Textarea
                id="editChapterDescription"
                value={editChapterForm.description}
                onChange={(e) =>
                  setEditChapterForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter chapter description"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditChapterDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditChapter} disabled={loading}>
                {loading ? "Updating..." : "Update Chapter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Chapter Confirmation Dialog */}
      <Dialog
        open={showDeleteChapterDialog}
        onOpenChange={setShowDeleteChapterDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{selectedChapterForDelete?.name}
              "? This action cannot be undone and will remove all associated
              lessons.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteChapterDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteChapter}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Chapter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog
        open={showEditLessonDialog}
        onOpenChange={setShowEditLessonDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editLessonName">Lesson Name</Label>
              <Input
                id="editLessonName"
                value={editLessonForm.name}
                onChange={(e) =>
                  setEditLessonForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Enter lesson name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editLessonDuration">Duration</Label>
                <Input
                  id="editLessonDuration"
                  value={editLessonForm.duration}
                  onChange={(e) =>
                    setEditLessonForm((f) => ({
                      ...f,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="e.g., 45 min"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLessonType">Type</Label>
                <Select
                  value={editLessonForm.lessonType}
                  onValueChange={(value) =>
                    setEditLessonForm((f) => ({ ...f, lessonType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLessonOrder">Order</Label>
              <Input
                id="editLessonOrder"
                type="number"
                value={editLessonForm.orderIndex}
                onChange={(e) =>
                  setEditLessonForm((f) => ({
                    ...f,
                    orderIndex: e.target.value,
                  }))
                }
                placeholder="Lesson order"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLessonDescription">Description</Label>
              <Textarea
                id="editLessonDescription"
                value={editLessonForm.description}
                onChange={(e) =>
                  setEditLessonForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter lesson description"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditLessonDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditLesson} disabled={loading}>
                {loading ? "Updating..." : "Update Lesson"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Lesson Confirmation Dialog */}
      <Dialog
        open={showDeleteLessonDialog}
        onOpenChange={setShowDeleteLessonDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{selectedLessonForDelete?.name}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteLessonDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteLesson}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Lesson"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
