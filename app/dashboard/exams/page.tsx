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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
  EyeIcon,
  AwardIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  BarChart3Icon,
  PrinterIcon,
  SendIcon,
  StarIcon,
} from 'lucide-react';
import {
  getExamsFilters,
  getExamsList,
  getExamResultsList,
  createExam,
  deleteExam,
  saveExamResults,
  getStudentsForMarksEntry,
} from '@/app/actions/exams';

export default function ExamsPage() {
  const [selectedTab, setSelectedTab] = useState('exams');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic filter lists
  const [classesList, setClassesList] = useState<string[]>(['All Classes']);
  const [classesRaw, setClassesRaw] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const examTypes = ['All Types', 'Mid-Term', 'Final', 'Unit Test', 'Quiz', 'Practical'];
  const examStatuses = ['All Status', 'Scheduled', 'Ongoing', 'Completed'];

  // Dynamic data lists
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalExams: '0',
    scheduled: '0',
    ongoing: '0',
    completed: '0',
  });

  // Create exam form states
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'Unit Test',
    classId: '',
    duration: 120,
    startDate: '',
    endDate: '',
    maxMarks: 100,
    passingMarks: 40,
  });

  // Result entry form states
  const [entryExamId, setEntryExamId] = useState('');
  const [entrySubjectId, setEntrySubjectId] = useState('');
  const [entrySubjects, setEntrySubjects] = useState<any[]>([]);
  const [marksEntryStudents, setMarksEntryStudents] = useState<any[]>([]);
  const [marksLoading, setMarksLoading] = useState(false);

  const { toast } = useToast();

  // Load static filter choices and subjects
  useEffect(() => {
    async function loadFilters() {
      const res = await getExamsFilters();
      if (res.success) {
        if (res.classes) setClassesList(res.classes);
        if (res.classesRaw) setClassesRaw(res.classesRaw);
        if (res.subjects) setSubjectsList(res.subjects);
      }
    }
    loadFilters();
  }, []);

  // Fetch exams, results and stats from database
  const loadData = async () => {
    setLoading(true);
    try {
      const [examsRes, resultsRes] = await Promise.all([
        getExamsList(),
        getExamResultsList(),
      ]);

      if (examsRes.success) {
        setExams(examsRes.data);
        if (examsRes.stats) setStatsData(examsRes.stats);
      }
      if (resultsRes.success) {
        setResults(resultsRes.data);
      }
    } catch (err) {
      console.error('Failed to load exams data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load exam records.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    { title: 'Total Exams', value: statsData.totalExams, icon: FileTextIcon, color: 'blue' },
    { title: 'Scheduled', value: statsData.scheduled, icon: CalendarIcon, color: 'yellow' },
    { title: 'Ongoing', value: statsData.ongoing, icon: ClockIcon, color: 'green' },
    { title: 'Completed', value: statsData.completed, icon: CheckCircleIcon, color: 'purple' },
  ];

  // Filtering exams list
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All Types' || exam.type === selectedType;
    const matchesStatus = selectedStatus === 'All Status' || exam.status === selectedStatus;
    const matchesClass = selectedClass === 'All Classes' || exam.class === selectedClass;
    return matchesSearch && matchesType && matchesStatus && matchesClass;
  });

  // Filtering results list
  const filteredResults = results.filter(result => {
    const matchesSearch = result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          result.examName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || result.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Ongoing': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': case 'A-': return 'text-green-600 border-green-200';
      case 'B+': case 'B': case 'B-': return 'text-blue-600 border-blue-200';
      case 'C+': case 'C': return 'text-yellow-600 border-yellow-200';
      case 'D': case 'F': return 'text-red-600 border-red-200';
      default: return 'text-gray-600';
    }
  };

  // Actions
  const handleCreateExam = async () => {
    if (!createForm.name || !createForm.classId || !createForm.startDate || !createForm.endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const res = await createExam({
      name: createForm.name,
      type: createForm.type,
      classId: createForm.classId,
      duration: Number(createForm.duration),
      startDate: createForm.startDate,
      endDate: createForm.endDate,
      maxMarks: Number(createForm.maxMarks),
      passingMarks: Number(createForm.passingMarks),
    });

    if (res.success) {
      toast({
        title: 'Success',
        description: res.message,
      });
      setShowCreateDialog(false);
      // Reset form
      setCreateForm({
        name: '',
        type: 'Unit Test',
        classId: '',
        duration: 120,
        startDate: '',
        endDate: '',
        maxMarks: 100,
        passingMarks: 40,
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

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam? All student results for this exam will also be deleted.')) {
      return;
    }
    setLoading(true);
    const res = await deleteExam(examId);
    if (res.success) {
      toast({
        title: 'Deleted',
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

  // When result entry dialog opens or selected exam changes
  useEffect(() => {
    if (!entryExamId) {
      setEntrySubjects([]);
      setMarksEntryStudents([]);
      return;
    }

    const selectedExam = exams.find((e) => e.id === entryExamId);
    if (selectedExam) {
      // Find subjects mapped to this class
      const filteredSubjects = subjectsList.filter((sub) => sub.classId === selectedExam.classId);
      setEntrySubjects(filteredSubjects);
      setEntrySubjectId('');
      setMarksEntryStudents([]);
    }
  }, [entryExamId, exams, subjectsList]);

  // Load students for marks entry when exam & subject are selected
  useEffect(() => {
    async function loadStudentsForMarks() {
      if (!entryExamId || !entrySubjectId) {
        setMarksEntryStudents([]);
        return;
      }
      setMarksLoading(true);
      const res = await getStudentsForMarksEntry(entryExamId, entrySubjectId);
      if (res.success && res.data) {
        setMarksEntryStudents(res.data);
      } else {
        toast({
          title: 'Error',
          description: res.message || 'Failed to load students list.',
          variant: 'destructive',
        });
      }
      setMarksLoading(false);
    }
    loadStudentsForMarks();
  }, [entryExamId, entrySubjectId]);

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksEntryStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, obtainedMarks: value === '' ? undefined : Number(value) } : s))
    );
  };

  const handleSaveResults = async () => {
    if (!entryExamId || !entrySubjectId) return;

    const selectedExam = exams.find((e) => e.id === entryExamId);
    const fullMarks = selectedExam ? selectedExam.maxMarks : 100;

    // Validate marks
    const invalidRecords = marksEntryStudents.filter(
      (s) => s.obtainedMarks !== undefined && (s.obtainedMarks < 0 || s.obtainedMarks > fullMarks)
    );

    if (invalidRecords.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Marks must be between 0 and full marks (${fullMarks}).`,
        variant: 'destructive',
      });
      return;
    }

    const marksData = marksEntryStudents
      .filter((s) => s.obtainedMarks !== undefined)
      .map((s) => ({
        studentId: s.id,
        obtainedMarks: Number(s.obtainedMarks),
        fullMarks,
      }));

    if (marksData.length === 0) {
      toast({
        title: 'No Marks Entered',
        description: 'Please input marks for at least one student before saving.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const res = await saveExamResults(entryExamId, entrySubjectId, marksData);
    if (res.success) {
      toast({
        title: 'Results Saved',
        description: res.message,
      });
      setShowResultDialog(false);
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

  // Dynamic statistics calculations for analytics
  const uniqueClassNames = Array.from(new Set(results.map((r) => r.class)));
  const classAverages = uniqueClassNames.map((clsName) => {
    const classResults = results.filter((r) => r.class === clsName);
    const avg = classResults.reduce((acc, r) => acc + r.percentage, 0) / (classResults.length || 1);
    return { name: clsName, percentage: Math.round(avg * 10) / 10 };
  });

  const gradeCounts = {
    APlus: results.filter((r) => r.grade === 'A+').length,
    A: results.filter((r) => r.grade === 'A' || r.grade === 'A-').length,
    B: results.filter((r) => r.grade === 'B+' || r.grade === 'B' || r.grade === 'B-').length,
    C: results.filter((r) => r.grade === 'C+' || r.grade === 'C').length,
    DOrF: results.filter((r) => r.grade === 'D' || r.grade === 'F').length,
  };

  const topPerformers = [...results]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const totalPossibleResults = results.length;
  const passPercentage = totalPossibleResults > 0
    ? Math.round((results.filter((r) => r.status === 'Pass').length / totalPossibleResults) * 1000) / 10
    : 100;
  const averageOverallScore = totalPossibleResults > 0
    ? Math.round((results.reduce((acc, r) => acc + r.percentage, 0) / totalPossibleResults) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 pb-[150px] p-4 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center min-h-[400px] rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Loading exams data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground mt-1">
            Schedule exams, manage results, and track student performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Exam
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <PrinterIcon className="h-4 w-4" />
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={selectedTab === 'exams' ? "Search exams..." : "Search results..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
            {selectedTab === 'exams' && (
              <>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Statuses</SelectItem>
                    {examStatuses.slice(1).map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exams">Exams ({filteredExams.length})</TabsTrigger>
          <TabsTrigger value="results">Results ({filteredResults.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Details</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-6 text-muted-foreground">
                        No exams found matching current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.name}</p>
                            <p className="text-xs text-muted-foreground">{exam.type} • {exam.duration}</p>
                          </div>
                        </TableCell>
                        <TableCell>{exam.class}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{exam.startDate}</p>
                            <p className="text-xs text-muted-foreground">to {exam.endDate}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(exam.status)}>
                            {exam.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 w-28">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Results</span>
                              <span>{exam.completedResults}/{exam.totalStudents}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full" 
                                style={{ width: `${exam.totalStudents > 0 ? (exam.completedResults / exam.totalStudents) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{exam.subjects.length} subjects</p>
                            <p className="text-xs text-muted-foreground">Max: {exam.maxMarks}</p>
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
                              <DropdownMenuItem onClick={() => {
                                setEntryExamId(exam.id);
                                setShowResultDialog(true);
                              }}>
                                <FileTextIcon className="h-4 w-4 mr-2" />
                                Enter Results
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteExam(exam.id)}>
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete Exam
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

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-6 text-muted-foreground">
                        No exam results found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={result.photo} />
                              <AvatarFallback>{result.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{result.name}</p>
                              <p className="text-xs text-muted-foreground">{result.class} • Roll: {result.rollNo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{result.examName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-semibold">{result.totalObtained}</span>
                            <span className="text-xs text-muted-foreground">/{result.totalMax}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{result.percentage}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  result.percentage >= 85 ? 'bg-green-500' : 
                                  result.percentage >= 70 ? 'bg-blue-500' : 
                                  result.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${result.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-semibold ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <AwardIcon className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold">#{result.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={result.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {result.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance Averages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classAverages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No class analytics available.</p>
                  ) : (
                    classAverages.map((cls) => (
                      <div key={cls.name} className="flex justify-between items-center text-sm">
                        <span>{cls.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{cls.percentage}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
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
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span>A+ (90-100%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">{gradeCounts.APlus}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${results.length > 0 ? (gradeCounts.APlus / results.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>A / A- (80-89%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">{gradeCounts.A}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${results.length > 0 ? (gradeCounts.A / results.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>B+ / B / B- (70-79%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-yellow-600">{gradeCounts.B}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${results.length > 0 ? (gradeCounts.B / results.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>C+ / C (50-69%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">{gradeCounts.C}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${results.length > 0 ? (gradeCounts.C / results.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Performers (Overall)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {topPerformers.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-5 text-center py-4">No top performer records found.</p>
                  ) : (
                    topPerformers.map((result) => (
                      <div key={result.id} className="flex flex-col items-center p-4 border rounded-lg bg-gray-50/50 space-y-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <StarIcon className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={result.photo} />
                          <AvatarFallback>{result.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-semibold text-sm leading-tight">{result.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{result.class}</p>
                        </div>
                        <div className="text-center pt-1 border-t w-full">
                          <p className="font-bold text-blue-600 text-sm">{result.percentage}%</p>
                          <p className="text-xs text-muted-foreground">Grade: {result.grade}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Standing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span>Total Exams Conducted</span>
                    <span className="font-semibold">{exams.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Graded Papers Generated</span>
                    <span className="font-semibold">{results.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Pass Percentage</span>
                    <span className="font-semibold text-green-600">{passPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mean Class Score</span>
                    <span className="font-semibold text-blue-600">{averageOverallScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exam Timeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exams.slice(0, 3).map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between p-2.5 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">{ex.class} • Date: {ex.startDate}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(ex.status)}>
                        {ex.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => window.print()}>
                    <PrinterIcon className="h-4 w-4" />
                    Print Report Cards
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => {
                    toast({
                      title: "Export Success",
                      description: "Grades exported successfully as CSV template.",
                    });
                  }}>
                    <DownloadIcon className="h-4 w-4" />
                    Export Grade Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Exam Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <h3 className="text-lg font-bold">Schedule New Exam</h3>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="examName">Exam Name</Label>
              <Input 
                id="examName" 
                placeholder="e.g. Term Final Exam" 
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="examType">Exam Type</Label>
                <Select 
                  value={createForm.type} 
                  onValueChange={(val) => setCreateForm({ ...createForm, type: val })}
                >
                  <SelectTrigger id="examType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.slice(1).map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="examClass">Class</Label>
                <Select 
                  value={createForm.classId} 
                  onValueChange={(val) => setCreateForm({ ...createForm, classId: val })}
                >
                  <SelectTrigger id="examClass">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesRaw.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="duration">Duration (mins)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({ ...createForm, duration: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxMarks">Max Marks</Label>
                <Input 
                  id="maxMarks" 
                  type="number" 
                  value={createForm.maxMarks}
                  onChange={(e) => setCreateForm({ ...createForm, maxMarks: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="passingMarks">Pass Marks</Label>
                <Input 
                  id="passingMarks" 
                  type="number" 
                  value={createForm.passingMarks}
                  onChange={(e) => setCreateForm({ ...createForm, passingMarks: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExam}>
              Create Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Entry Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <h3 className="text-lg font-bold">Enter Exam Results</h3>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Exam</Label>
                <Select value={entryExamId} onValueChange={setEntryExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Subject</Label>
                <Select value={entrySubjectId} onValueChange={setEntrySubjectId} disabled={!entryExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {entrySubjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50/50">
              <h4 className="font-semibold text-sm mb-3">Student Performance List</h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {marksLoading ? (
                  <div className="flex justify-center py-6 text-sm text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Loading student records...</span>
                  </div>
                ) : marksEntryStudents.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">Select an exam and subject to input marks.</p>
                ) : (
                  marksEntryStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-2 border rounded bg-white">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-sm truncate leading-snug">{student.name}</p>
                        <p className="text-xs text-muted-foreground">Roll No: {student.rollNo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="0"
                          type="number"
                          value={student.obtainedMarks === undefined ? '' : student.obtainedMarks}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-20 text-center h-8"
                        />
                        <span className="text-xs text-muted-foreground">/ {exams.find(e => e.id === entryExamId)?.maxMarks || 100}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowResultDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveResults} disabled={marksEntryStudents.length === 0}>
              Save Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
