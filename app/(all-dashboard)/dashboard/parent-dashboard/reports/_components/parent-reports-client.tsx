'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileTextIcon,
  SearchIcon,
  AlertTriangleIcon,
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  BabyIcon,
} from 'lucide-react';
import { format } from 'date-fns';

interface Child {
  id: string;
  name: string;
  className: string;
  rollNumber: string;
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
  teacherName: string;
}

interface ParentReportsClientProps {
  initialData: {
    children: Child[];
    reports: Report[];
  };
}

export function ParentReportsClient({ initialData }: ParentReportsClientProps) {
  const [children] = useState<Child[]>(initialData.children);
  const [reports] = useState<Report[]>(initialData.reports);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState('All Children');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = report.title.toLowerCase().includes(searchLower) ||
                          report.description.toLowerCase().includes(searchLower) ||
                          report.teacherName.toLowerCase().includes(searchLower);
    const matchesChild = selectedChild === 'All Children' || report.studentName === selectedChild;
    const matchesCategory = selectedCategory === 'All Categories' || report.category === selectedCategory;

    return matchesSearch && matchesChild && matchesCategory;
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
        return <BookOpenIcon className="h-4 w-4 text-blue-600 mr-1.5 shrink-0" />;
      case 'Attendance':
        return <ClockIcon className="h-4 w-4 text-orange-600 mr-1.5 shrink-0" />;
      case 'Behavior':
        return <AlertTriangleIcon className="h-4 w-4 text-red-600 mr-1.5 shrink-0" />;
      default:
        return <FileTextIcon className="h-4 w-4 text-slate-600 mr-1.5 shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            Teacher Reports & Observations
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Review detailed behavior updates, academic advice, and feedback sent by your children's teachers.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="shadow-sm border border-slate-100 bg-slate-50/50">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by title, teacher name, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto shrink-0">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 bg-background">
                <SelectValue placeholder="Filter by Child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Children">All Children</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.name}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 bg-background">
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
        </CardContent>
      </Card>

      {/* Reports Feed */}
      <div className="space-y-5">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-card">
            <FileTextIcon className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-800">No Teacher Reports Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm || selectedChild !== 'All Children' || selectedCategory !== 'All Categories'
                ? 'Try adjusting your search query or filters to find what you need.'
                : 'There are no active observations or reports published by your children\'s teachers at the moment.'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <Card
              key={report.id}
              className="shadow-sm hover:shadow-md border border-slate-100 hover:border-slate-200/80 transition-all duration-300 overflow-hidden"
            >
              {/* Colored Category Bar */}
              <div
                className={`h-1.5 ${
                  report.category === 'Academic'
                    ? 'bg-blue-500'
                    : report.category === 'Attendance'
                    ? 'bg-orange-500'
                    : report.category === 'Behavior'
                    ? 'bg-red-500'
                    : 'bg-slate-400'
                }`}
              />
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`${getCategoryBadgeColor(report.category)} font-medium`}>
                      <span className="flex items-center">
                        {getCategoryIcon(report.category)}
                        {report.category}
                      </span>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      <BabyIcon className="h-3 w-3" />
                      {report.studentName} (Roll: {report.rollNumber})
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 leading-tight">
                    {report.title}
                  </CardTitle>
                </div>
                <div className="text-xs text-muted-foreground text-right shrink-0 flex items-center gap-1 bg-slate-100 py-1 px-2 rounded-full font-medium">
                  <CalendarIcon className="h-3 w-3 text-slate-500" />
                  {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                </div>
              </CardHeader>
              <CardContent className="pb-4 space-y-4">
                <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                  {report.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-primary/10 border">
                      <AvatarFallback className="text-primary text-xs font-semibold">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {report.teacherName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Class Teacher</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
