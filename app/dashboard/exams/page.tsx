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
import { Textarea } from '@/components/ui/textarea';
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

// Sample data
const examData = [
  {
    id: 1,
    name: 'Mid-Term Examination',
    type: 'Mid-Term',
    class: 'Grade 10',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'],
    startDate: '2024-02-15',
    endDate: '2024-02-25',
    status: 'Scheduled',
    totalStudents: 45,
    completedResults: 35,
    pendingResults: 10,
    duration: '2 hours',
    maxMarks: 100,
    passingMarks: 40
  },
  {
    id: 2,
    name: 'Final Examination',
    type: 'Final',
    class: 'Grade 9',
    subjects: ['Mathematics', 'Science', 'English', 'History', 'Geography'],
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    status: 'Ongoing',
    totalStudents: 52,
    completedResults: 52,
    pendingResults: 0,
    duration: '3 hours',
    maxMarks: 100,
    passingMarks: 35
  },
  {
    id: 3,
    name: 'Unit Test - 1',
    type: 'Unit Test',
    class: 'Grade 11',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    status: 'Completed',
    totalStudents: 38,
    completedResults: 38,
    pendingResults: 0,
    duration: '1.5 hours',
    maxMarks: 50,
    passingMarks: 20
  }
];

const resultData = [
  {
    id: 1,
    studentId: 'STD2024001',
    name: 'Alice Johnson',
    class: 'Grade 10',
    rollNo: 'A001',
    examName: 'Mid-Term Examination',
    subjects: {
      Mathematics: { obtained: 85, total: 100, grade: 'A' },
      Physics: { obtained: 78, total: 100, grade: 'B+' },
      Chemistry: { obtained: 92, total: 100, grade: 'A+' },
      English: { obtained: 88, total: 100, grade: 'A' },
      Biology: { obtained: 82, total: 100, grade: 'A-' }
    },
    totalObtained: 425,
    totalMax: 500,
    percentage: 85.0,
    grade: 'A',
    rank: 3,
    status: 'Pass',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 2,
    studentId: 'STD2024002',
    name: 'Michael Chen',
    class: 'Grade 10',
    rollNo: 'A002',
    examName: 'Mid-Term Examination',
    subjects: {
      Mathematics: { obtained: 95, total: 100, grade: 'A+' },
      Physics: { obtained: 89, total: 100, grade: 'A' },
      Chemistry: { obtained: 91, total: 100, grade: 'A+' },
      English: { obtained: 87, total: 100, grade: 'A' },
      Biology: { obtained: 88, total: 100, grade: 'A' }
    },
    totalObtained: 450,
    totalMax: 500,
    percentage: 90.0,
    grade: 'A+',
    rank: 1,
    status: 'Pass',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 3,
    studentId: 'STD2024003',
    name: 'Emma Rodriguez',
    class: 'Grade 10',
    rollNo: 'A003',
    examName: 'Mid-Term Examination',
    subjects: {
      Mathematics: { obtained: 65, total: 100, grade: 'C+' },
      Physics: { obtained: 58, total: 100, grade: 'C' },
      Chemistry: { obtained: 72, total: 100, grade: 'B' },
      English: { obtained: 78, total: 100, grade: 'B+' },
      Biology: { obtained: 69, total: 100, grade: 'B-' }
    },
    totalObtained: 342,
    totalMax: 500,
    percentage: 68.4,
    grade: 'B-',
    rank: 15,
    status: 'Pass',
    photo: '/api/placeholder/40/40'
  }
];

const examTypes = ['All Types', 'Mid-Term', 'Final', 'Unit Test', 'Quiz', 'Practical'];
const examStatuses = ['All Status', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'];
const classes = ['All Classes', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function ExamsPage() {
  const [selectedTab, setSelectedTab] = useState('exams');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const stats = [
    { title: 'Total Exams', value: '24', icon: FileTextIcon, color: 'blue' },
    { title: 'Scheduled', value: '8', icon: CalendarIcon, color: 'yellow' },
    { title: 'Ongoing', value: '3', icon: ClockIcon, color: 'green' },
    { title: 'Completed', value: '13', icon: CheckCircleIcon, color: 'purple' },
  ];

  const filteredExams = examData.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All Types' || exam.type === selectedType;
    const matchesStatus = selectedStatus === 'All Status' || exam.status === selectedStatus;
    const matchesClass = selectedClass === 'All Classes' || exam.class === selectedClass;
    return matchesSearch && matchesType && matchesStatus && matchesClass;
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
      case 'A+': case 'A': case 'A-': return 'text-green-600';
      case 'B+': case 'B': case 'B-': return 'text-blue-600';
      case 'C+': case 'C': case 'C-': return 'text-yellow-600';
      case 'D': case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

     const calculateClassAverage = (className: string) => {
     const classResults = resultData.filter(result => result.class === className);
     if (classResults.length === 0) return '0';
     const total = classResults.reduce((sum, result) => sum + result.percentage, 0);
     return (total / classResults.length).toFixed(1);
   };

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
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
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export Results
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
                  placeholder="Search exams..."
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
                {examStatuses.map((status) => (
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
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
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
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-sm text-muted-foreground">{exam.type} • {exam.duration}</p>
                        </div>
                      </TableCell>
                      <TableCell>{exam.class}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{exam.startDate}</p>
                          <p className="text-muted-foreground">to {exam.endDate}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Results</span>
                            <span>{exam.completedResults}/{exam.totalStudents}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(exam.completedResults / exam.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{exam.subjects.length} subjects</p>
                          <p className="text-muted-foreground">Max: {exam.maxMarks}</p>
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
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Exam
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowResultDialog(true)}>
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Enter Results
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PrinterIcon className="h-4 w-4 mr-2" />
                              Print Question Paper
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete Exam
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultData.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={result.photo} />
                            <AvatarFallback>{result.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-sm text-muted-foreground">{result.class} • {result.rollNo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{result.examName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-semibold">{result.totalObtained}</span>
                          <span className="text-muted-foreground">/{result.totalMax}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{result.percentage}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
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
                        <Badge variant="outline" className={getGradeColor(result.grade)}>
                          {result.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <AwardIcon className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold">#{result.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={result.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {result.status}
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
                              View Result Card
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PrinterIcon className="h-4 w-4 mr-2" />
                              Print Report
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <SendIcon className="h-4 w-4 mr-2" />
                              Send to Parent
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Results
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.slice(1, 6).map((cls) => (
                    <div key={cls} className="flex justify-between items-center">
                      <span>{cls}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{calculateClassAverage(cls)}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${parseFloat(calculateClassAverage(cls))}%` }}
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
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>A+ (90-100%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">12</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>A (80-89%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">18</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '37%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>B (70-79%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-yellow-600">15</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '31%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>C (60-69%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">8</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '16%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resultData.slice(0, 5).map((result, index) => (
                    <div key={result.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-600">#{result.rank}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{result.name}</p>
                          <p className="text-xs text-muted-foreground">{result.class}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{result.percentage}%</p>
                        <p className="text-xs text-muted-foreground">{result.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'].map((subject) => (
                    <div key={subject} className="flex justify-between items-center">
                      <span>{subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{Math.floor(Math.random() * 20) + 75}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Exams Conducted</span>
                    <span className="font-semibold">13</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students Appeared</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Percentage</span>
                    <span className="font-semibold text-green-600">87.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Score</span>
                    <span className="font-semibold">76.8%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Improvement</span>
                    <div className="flex items-center gap-1">
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">+3.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Unit Test - Physics</p>
                      <p className="text-xs text-muted-foreground">Grade 11 • Feb 28</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">Scheduled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Mid-Term Exam</p>
                      <p className="text-xs text-muted-foreground">Grade 8 • Mar 5</p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">Preparing</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Upcoming
                  </Button>
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
                    <PrinterIcon className="h-4 w-4" />
                    Print Report Cards
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <SendIcon className="h-4 w-4" />
                    Send Results to Parents
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export Grade Sheet
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <BarChart3Icon className="h-4 w-4" />
                    Generate Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Exam Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examName">Exam Name</Label>
                <Input id="examName" placeholder="Enter exam name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.slice(1).map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examClass">Class</Label>
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
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" placeholder="e.g., 2 hours" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxMarks">Maximum Marks</Label>
                <Input id="maxMarks" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input id="passingMarks" type="number" placeholder="40" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter exam description or instructions" />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Create Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Entry Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter Exam Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Exam</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examData.map((exam) => (
                      <SelectItem key={exam.id} value={exam.name}>{exam.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
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
                <Label>Subject</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Import Results</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Download Template
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  Import CSV
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Student Results</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resultData.slice(0, 3).map((student) => (
                  <div key={student.id} className="flex items-center gap-4 p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.rollNo}</p>
                    </div>
                    <div className="w-20">
                      <Input placeholder="Marks" size="sm" />
                    </div>
                    <div className="w-16 text-xs text-muted-foreground">
                      / 100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowResultDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowResultDialog(false)}>
              Save Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
