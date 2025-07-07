"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Calendar, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Import actions
import { getTimetables, getTimetableStats } from "@/app/actions/timetables";
import { getClasses } from "@/app/actions/classes";
import { getSubjects } from "@/app/actions/subjects";

// Types
interface TimetableData {
  id: string;
  aamarId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classId: string;
  subjectId: string;
  class?: {
    id: string;
    name: string;
    academicYear: string;
    branch: {
      name: string;
    };
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

interface ClassData {
  id: string;
  name: string;
  academicYear: string;
  branch?: {
    name: string;
  };
}

interface SubjectData {
  id: string;
  name: string;
  code: string;
}

interface TimetableStatsData {
  totalTimetables: number;
  totalClasses: number;
  totalSubjects: number;
  averagePeriodsPerDay: number;
}

// Helper functions
const getDayName = (dayOfWeek: number): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek] || "Unknown";
};

const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const getDayNumber = (dayName: string): number => {
  const days = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 0
  };
  return days[dayName as keyof typeof days] || 1;
};

export default function ClassRoutinePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [timetables, setTimetables] = useState<TimetableData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [timetableStats, setTimetableStats] = useState<TimetableStatsData | null>(null);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [timetablesResult, classesResult, subjectsResult, statsResult] = await Promise.all([
        getTimetables(),
        getClasses(),
        getSubjects(),
        getTimetableStats(),
      ]);

      if (timetablesResult.success) {
        const timetablesData = (timetablesResult.data as TimetableData[]) || [];
        setTimetables(timetablesData);
      } else {
        console.warn("Failed to load timetables:", timetablesResult.error);
      }

      if (classesResult.success) {
        const classesData = (classesResult.data as ClassData[]) || [];
        setClasses(classesData);
        // Set default selected class if available
        if (classesData.length > 0) {
          setSelectedClass(classesData[0].id);
        }
      } else {
        console.warn("Failed to load classes:", classesResult.error);
      }

      if (subjectsResult.success) {
        const subjectsData = (subjectsResult.data as SubjectData[]) || [];
        setSubjects(subjectsData);
      } else {
        console.warn("Failed to load subjects:", subjectsResult.error);
      }

      if (statsResult.success) {
        const statsData = statsResult.data as TimetableStatsData;
        setTimetableStats(statsData);
      } else {
        console.warn("Failed to load timetable stats:", statsResult.error);
      }

    } catch (error) {
      console.error("Error loading data:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter timetables based on selected class
  const filteredTimetables = timetables.filter(timetable => {
    const matchesClass = !selectedClass || timetable.classId === selectedClass;
    const matchesYear = !selectedAcademicYear || selectedAcademicYear === "all" || timetable.class?.academicYear === selectedAcademicYear;
    const matchesSearch = !searchTerm || 
      timetable.class?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timetable.subject?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesClass && matchesYear && matchesSearch;
  });

  // Get unique time slots for the selected class
  const timeSlots = Array.from(new Set(
    filteredTimetables.map(t => `${formatTime(t.startTime)} - ${formatTime(t.endTime)}`)
  )).sort();

  // Get days of week that have timetables
  const daysOfWeek = Array.from(new Set(
    filteredTimetables.map(t => getDayName(t.dayOfWeek))
  )).sort((a, b) => getDayNumber(a) - getDayNumber(b));

  // Get schedule item for a specific day and time
  const getScheduleItem = (day: string, timeSlot: string) => {
    const dayNumber = getDayNumber(day);
    return filteredTimetables.find(t => 
      t.dayOfWeek === dayNumber && 
      `${formatTime(t.startTime)} - ${formatTime(t.endTime)}` === timeSlot
    );
  };

  // Get selected class data
  const selectedClassData = classes.find(c => c.id === selectedClass);

  // Get academic years from classes
  const academicYears = Array.from(new Set(classes.map(c => c.academicYear))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading class routine...</span>
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
    <div className="flex-1 space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Routine</h1>
          <p className="text-muted-foreground">
            Manage and view class schedules and timetables
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Schedule
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classData) => (
                    <SelectItem key={classData.id} value={classData.id}>
                      {classData.name} ({classData.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Academic Year</Label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={loadData}>
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Weekly Schedule - {selectedClassData?.name || "Select a Class"}
              {selectedClassData && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({selectedClassData.academicYear})
                </span>
              )}
            </CardTitle>
            <Badge variant="secondary">
              {filteredTimetables.length} periods
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTimetables.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No timetables found
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedClass 
                  ? "No timetables available for the selected class and filters"
                  : "Please select a class to view its timetable"
                }
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-3 bg-gray-50 text-left font-medium">
                    Time
                  </th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="border border-gray-200 p-3 bg-gray-50 text-center font-medium">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                      {timeSlot}
                    </td>
                    {daysOfWeek.map((day) => {
                      const scheduleItem = getScheduleItem(day, timeSlot);
                      
                      if (!scheduleItem) {
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3 text-center text-gray-400">
                            -
                          </td>
                        );
                      }

                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{scheduleItem.subject?.name || "N/A"}</div>
                              <div className="text-xs text-gray-600">{scheduleItem.subject?.code || "N/A"}</div>
                              <div className="text-xs text-gray-500">
                                {(() => {
                                  const start = new Date(scheduleItem.startTime);
                                  const end = new Date(scheduleItem.endTime);
                                  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                                  return `${duration} min`;
                                })()}
                              </div>
                            </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {timetableStats?.totalTimetables || filteredTimetables.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Periods/Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {timetableStats?.totalSubjects || subjects.length}
            </div>
            <p className="text-xs text-muted-foreground">Subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {daysOfWeek.length}
            </div>
            <p className="text-xs text-muted-foreground">Teaching Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {timetableStats?.averagePeriodsPerDay || 0}
            </div>
            <p className="text-xs text-muted-foreground">Avg Periods/Day</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 