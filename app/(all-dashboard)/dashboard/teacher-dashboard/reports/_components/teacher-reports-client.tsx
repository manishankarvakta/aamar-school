'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileTextIcon,
  SearchIcon,
  PlusIcon,
  AlertTriangleIcon,
  BookOpenIcon,
  ClockIcon,
  UserCheckIcon,
  SendIcon,
} from 'lucide-react';
import { createReport } from '@/app/actions/reports';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Student {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  className: string;
}

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  studentName: string;
  className: string;
  rollNumber: string;
}

interface TeacherReportsClientProps {
  initialData: {
    students: Student[];
    reports: Report[];
  };
}

export function TeacherReportsClient({ initialData }: TeacherReportsClientProps) {
  const [students, setStudents] = useState<Student[]>(initialData.students);
  const [reports, setReports] = useState<Report[]>(initialData.reports);
  const { toast } = useToast();

  // Search & Filter state for students
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');

  // Search & Filter state for reports
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportCategoryFilter, setReportCategoryFilter] = useState('All Categories');

  // Dialog & Form states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formDescription, setFormDescription] = useState('');

  // Extract unique classes
  const classesList = ['All Classes', ...Array.from(new Set(students.map((s) => s.className)))];

  // Filter students
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(studentSearchTerm.toLowerCase()) || 
                          student.rollNumber.includes(studentSearchTerm);
    const matchesClass = selectedClass === 'All Classes' || student.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                          report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                          report.studentName.toLowerCase().includes(reportSearchTerm.toLowerCase());
    const matchesCategory = reportCategoryFilter === 'All Categories' || report.category === reportCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Attendance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Behavior':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academic':
        return <BookOpenIcon className="h-4.5 w-4.5 text-blue-600 mr-2 shrink-0" />;
      case 'Attendance':
        return <ClockIcon className="h-4.5 w-4.5 text-orange-600 mr-2 shrink-0" />;
      case 'Behavior':
        return <AlertTriangleIcon className="h-4.5 w-4.5 text-red-600 mr-2 shrink-0" />;
      default:
        return <FileTextIcon className="h-4.5 w-4.5 text-slate-600 mr-2 shrink-0" />;
    }
  };

  const handleOpenReportDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormTitle('');
    setFormCategory('General');
    setFormDescription('');
    setIsDialogOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!formTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a title for the report.',
        variant: 'destructive',
      });
      return;
    }

    if (!formDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a description for the report.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createReport({
        title: formTitle,
        description: formDescription,
        category: formCategory,
        studentId: selectedStudent.id,
      });

      if (response.success && response.data) {
        toast({
          title: 'Success',
          description: 'Report sent to parent successfully.',
          variant: 'default',
        });

        // Add the newly created report to the local list state
        const newReportItem: Report = {
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          createdAt: response.data.createdAt,
          studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
          className: selectedStudent.className,
          rollNumber: selectedStudent.rollNumber,
        };

        setReports([newReportItem, ...reports]);
        setIsDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to submit report.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            Student & Parent Reports
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Monitor students, draft observations, and instantly report issues or feedback directly to their parents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Students List */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md border border-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center">
                <UserCheckIcon className="h-5 w-5 mr-2 text-primary" />
                My Students
              </CardTitle>
              <CardDescription>Select a student to draft a new report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Filter by Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesList.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students Scroll Area */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg bg-slate-50/50">
                    <p className="text-sm text-muted-foreground">No students found</p>
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-55 hover:border-primary/25 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/10">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Class: {student.className} • Roll: {student.rollNumber}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReportDialog(student)}
                        className="h-8 hover:bg-primary hover:text-white"
                      >
                        <PlusIcon className="h-3.5 w-3.5 mr-1" />
                        Report
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Reports History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center">
                <FileTextIcon className="h-5 w-5 mr-2 text-primary" />
                Submitted Reports History
              </CardTitle>
              <CardDescription>All reports and observations sent by you to parents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* History filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or report details..."
                    value={reportSearchTerm}
                    onChange={(e) => setReportSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={reportCategoryFilter} onValueChange={setReportCategoryFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Attendance">Attendance</SelectItem>
                    <SelectItem value="Behavior">Behavior</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reports Table/List */}
              <div className="border rounded-lg overflow-hidden bg-card">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-16">
                    <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-base font-semibold text-slate-700">No reports drafted yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Select a student on the left sidebar and click "Report" to notify their parent.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/75">
                        <TableRow>
                          <TableHead className="w-[180px]">Student</TableHead>
                          <TableHead className="w-[120px]">Category</TableHead>
                          <TableHead className="w-[200px]">Report Summary</TableHead>
                          <TableHead className="w-[120px]">Date Sent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id} className="hover:bg-slate-50/50">
                            <TableCell className="align-top py-4">
                              <div>
                                <p className="font-semibold text-sm text-foreground">
                                  {report.studentName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {report.className} • Roll: {report.rollNumber}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-4">
                              <Badge variant="outline" className={getCategoryBadgeColor(report.category)}>
                                <span className="flex items-center text-xs">
                                  {report.category}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="align-top py-4 max-w-md">
                              <div>
                                <h4 className="font-semibold text-sm text-foreground">
                                  {report.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">
                                  {report.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-4 text-xs text-muted-foreground">
                              {format(new Date(report.createdAt), 'MMM dd, yyyy h:mm a')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for drafting a report */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Draft Student Observation
            </DialogTitle>
            <DialogDescription>
              Create an academic or behavioral report for{' '}
              <span className="font-bold text-primary">
                {selectedStudent?.firstName} {selectedStudent?.lastName}
              </span>{' '}
              (Class {selectedStudent?.className}). The student's parents will see this immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReport} className="space-y-5 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Report Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">
                    <span className="flex items-center">
                      {getCategoryIcon('General')} General Observance
                    </span>
                  </SelectItem>
                  <SelectItem value="Academic">
                    <span className="flex items-center">
                      {getCategoryIcon('Academic')} Academic Progress
                    </span>
                  </SelectItem>
                  <SelectItem value="Attendance">
                    <span className="flex items-center">
                      {getCategoryIcon('Attendance')} Attendance Note
                    </span>
                  </SelectItem>
                  <SelectItem value="Behavior">
                    <span className="flex items-center">
                      {getCategoryIcon('Behavior')} Behavior / Discipline
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                placeholder="e.g., Incomplete Homework, Excellent Performance"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Detailed Description / Message</Label>
              <Textarea
                id="description"
                placeholder="Describe your observation in detail. Suggest actions for parents if necessary."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="min-h-[140px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <SendIcon className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Report'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
