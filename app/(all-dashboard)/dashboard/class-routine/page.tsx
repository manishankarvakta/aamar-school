"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getClasses, getSubjectsForClass } from "@/app/actions/classes";
import { getClassRoutine, getTeachersWithRoutines } from "@/app/actions/classRoutine";
import { getAllTeachers } from "@/app/actions/teachers";
import { Plus, Download, Calendar, MoreVertical, Eye } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { getSettings } from "@/app/actions/settings";
import { useBranch } from "@/contexts/branch-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/permission-guard";
import { useUser } from "@/contexts/user-context";

// Helper functions (reuse from addRoutine)
function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function toTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}
function getTimeSlots(start: string, end: string, duration: number) {
  const slots = [];
  let cur = toMinutes(start);
  const endM = toMinutes(end);
  while (cur < endM) {
    const next = Math.min(cur + duration, endM);
    slots.push(`${toTime(cur)}-${toTime(next)}`);
    cur = next;
  }
  return slots;
}
function getDynamicTimeSlotsForDay(
  day: string,
  start: string,
  end: string,
  duration: number,
  assignments: Record<string, any>,
): string[] {
  const boundaries = new Set<number>();
  const startM = toMinutes(start);
  const endM = toMinutes(end);
  boundaries.add(startM);
  boundaries.add(endM);

  // Add explicit start and end times from assignments for this day
  Object.keys(assignments).forEach((key) => {
    const [slotDay, slotTime] = key.split("|");
    if (slotDay.toLowerCase() === day.toLowerCase()) {
      const [sStart, sEnd] = slotTime.split("-");
      boundaries.add(toMinutes(sStart));
      boundaries.add(toMinutes(sEnd));
    }
  });

  // Add default slot boundaries
  let cur = startM;
  while (cur < endM) {
    boundaries.add(cur);
    cur += duration;
  }

  // Filter out boundaries that lie strictly inside any assignment
  const isInsideSlot = (m: number) => {
    return Object.entries(assignments).some(([key, val]) => {
      const [slotDay, slotTime] = key.split("|");
      if (slotDay.toLowerCase() !== day.toLowerCase()) return false;
      const [sStart, sEnd] = slotTime.split("-");
      return m > toMinutes(sStart) && m < toMinutes(sEnd);
    });
  };

  const sortedBoundaries = Array.from(boundaries)
    .filter((b) => !isInsideSlot(b))
    .sort((a, b) => a - b);

  const slots: string[] = [];
  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const s = sortedBoundaries[i];
    const e = sortedBoundaries[i + 1];
    // Ignore slots outside the normal start-end unless there is a custom assignment
    if (s >= endM) {
      const sTimeStr = toTime(s);
      const hasAssigned = Object.keys(assignments).some((k) =>
        k.startsWith(`${day}|${sTimeStr}-`),
      );
      if (!hasAssigned) continue;
    }
    slots.push(`${toTime(s)}-${toTime(e)}`);
  }
  return slots;
}
function parseSchedule(
  raw: any,
): { open: boolean; start: string; end: string }[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "open" in item &&
        "start" in item &&
        "end" in item
      ) {
        return {
          open: !!item.open,
          start: String(item.start),
          end: String(item.end),
        };
      }
      return { open: false, start: "08:00", end: "14:00" };
    });
  }
  return [
    { open: false, start: "08:00", end: "14:00" },
    { open: false, start: "08:00", end: "14:00" },
    { open: false, start: "08:00", end: "14:00" },
    { open: false, start: "08:00", end: "14:00" },
    { open: false, start: "08:00", end: "14:00" },
    { open: false, start: "08:00", end: "14:00" },
    { open: false, start: "08:00", end: "14:00" },
  ];
}

// Helper to identify break slots from assignments
function getBreakSlots(assignments: Record<string, any>, days: string[]): Record<string, string> {
  // key: slot (e.g., "12:00-12:30"), value: label (e.g., "Break")
  const breakSlots: Record<string, string> = {};
  const slotCounts: Record<string, number> = {};
  Object.entries(assignments).forEach(([key, value]) => {
    if (value.classType === "break") {
      const [, slot] = key.split("|");
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
      breakSlots[slot] = value.label || "Break";
    }
  });
  // Only include slots that are breaks for all days (or at least one day)
  return breakSlots;
}

function ClassRoutinePageContent() {
  const { selectedBranchId } = useBranch();
  const { hasPermission } = useUser();
  const [classValue, setClassValue] = useState("");
  const [yearValue, setYearValue] = useState("");
  const [classOptions, setClassOptions] = useState<
    { value: string; label: string; academicYear: string }[]
  >([]);
  const [academicYearOptions, setAcademicYearOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, any>>({});
  const [dayTimeSlots, setDayTimeSlots] = useState<Record<string, string[]>>({});
  const [teachers, setTeachers] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [subjects, setSubjects] = useState<
    { value: string; label: string }[]
  >([]);
  const [teachersWithRoutines, setTeachersWithRoutines] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<any | null>(null);
  const [showViewScheduleDialog, setShowViewScheduleDialog] = useState(false);

  const canViewClassSchedule = hasPermission('class-routine', 'view_class_schedule');
  const canViewTeacherSchedule = hasPermission('class-routine', 'view_teacher_schedule');
  const [activeTab, setActiveTab] = useState("classes");

  useEffect(() => {
    if (!canViewClassSchedule && canViewTeacherSchedule) {
      setActiveTab("teachers");
    } else {
      setActiveTab("classes");
    }
  }, [canViewClassSchedule, canViewTeacherSchedule]);

  // Load classes, academic years, teachers, and settings on mount
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      // Load classes
      const classRes = await getClasses(selectedBranchId);
      let classes: any[] = [];
      if (classRes.success && Array.isArray(classRes.data)) {
        classes = classRes.data;
        setClassOptions(
          classes.map((cls) => ({
            value: cls.id,
            label: `${cls.name} (${cls.academicYear})`,
            academicYear: cls.academicYear,
          })),
        );
        const years = Array.from(
          new Set(classes.map((cls) => cls.academicYear)),
        );
        setAcademicYearOptions(years.map((y) => ({ value: y, label: y })));
        if (classes.length > 0) {
          setClassValue(classes[0].id);
          setYearValue(classes[0].academicYear);
        }
      } else {
        setClassOptions([]);
        setAcademicYearOptions([]);
        setClassValue("");
        setYearValue("");
      }
      // Load teachers
      const teacherRes = await getAllTeachers(selectedBranchId);
      if (teacherRes.success && Array.isArray(teacherRes.data)) {
        setTeachers(
          teacherRes.data.map((t: any) => ({ value: t.id, label: t.name })),
        );
      } else {
        setTeachers([]);
      }
      // Load settings for open days and time slots
      const settingsRes = await getSettings();
      if (settingsRes.success && settingsRes.data) {
        // weeklySchedule is now [{ name, start, end, open }]
        const schedule = Array.isArray(settingsRes.data.weeklySchedule)
          ? (settingsRes.data.weeklySchedule as any[])
          : [];
        // Only open days
        const openDays = schedule.filter((d: any) => d.open);
        setDays(openDays.map((d: { name: string }) => d.name as string));
        // For each open day, generate its own slots
        const allSlotsSet = new Set<string>();
        openDays.forEach((day: { start: string; end: string }) => {
          if (day.start && day.end && settingsRes.data.subjectDuration) {
            getTimeSlots(day.start, day.end, settingsRes.data.subjectDuration).forEach((slot: string) => {
              allSlotsSet.add(slot);
            });
          }
        });
        // Sort slots by start time
        const allSlots = Array.from(allSlotsSet) as string[];
        allSlots.sort((a: string, b: string) => {
          const [aStart] = a.split("-");
          const [bStart] = b.split("-");
          return toMinutes(aStart) - toMinutes(bStart);
        });
        setTimeSlots(allSlots);
      } else {
        // Fallback default settings if school settings are not initialized yet
        const defaultDays = [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ];
        setDays(defaultDays);
        setTimeSlots(getTimeSlots("08:00", "14:00", 45));
      }

      // Load teachers with schedules
      setLoadingTeachers(true);
      const teacherRoutinesRes = await getTeachersWithRoutines(selectedBranchId);
      if (teacherRoutinesRes.success && Array.isArray(teacherRoutinesRes.data)) {
        setTeachersWithRoutines(teacherRoutinesRes.data);
      } else {
        setTeachersWithRoutines([]);
      }
      setLoadingTeachers(false);

      setLoading(false);
    }
    loadInitialData();
  }, [selectedBranchId]);

  // Filter class options by selected academic year
  const filteredClassOptions = classOptions.filter(
    (opt) => opt.academicYear === yearValue,
  );

  // When academic year changes, reset classValue to first available class in that year
  useEffect(() => {
    if (filteredClassOptions.length > 0) {
      setClassValue(filteredClassOptions[0].value);
    } else {
      setClassValue("");
    }
  }, [yearValue, classOptions.length]);

  // When classValue changes, fetch routine and set up table
  useEffect(() => {
    async function fetchRoutineAndSetup() {
      if (!classValue) {
        setAssignments({});
        return;
      }
      setLoading(true);
      // Fetch subjects for class
      const subjRes = await getSubjectsForClass(classValue);
      if (subjRes.success && Array.isArray(subjRes.data)) {
        setSubjects(
          subjRes.data.map((s: any) => ({
            value: s.id,
            label: s.name,
          })),
        );
      } else {
        setSubjects([]);
      }

      // Fetch routine
      const res = await getClassRoutine(classValue);
      console.log('Fetched routine for class', classValue, res);
      if (res.success && res.data) {
        const routine = res.data;
        // Get all time slots for each day
        const assignments: Record<string, any> = {};
        for (const slot of routine.slots || []) {
          const key = `${slot.day}|${slot.startTime}-${slot.endTime}`;
          assignments[key] = {
            subject: slot.subjectId || "",
            teacher: slot.teacherId || "",
            classType: (slot.classType || "REGULAR").toLowerCase(),
            endTime: slot.endTime,
          };
        }
        setAssignments(assignments);
      } else {
        setAssignments({});
      }
      setLoading(false);
    }
    fetchRoutineAndSetup();
  }, [classValue]);

  // Recompute time slots for each day when assignments or settings change
  useEffect(() => {
    if (!days.length) return;
    // Find schedule for each day
    const schedule = days.map((day, i) => ({
      day,
      idx: i,
    }));
    // Assume all days use the same start/end/duration for now
    let start = "08:00";
    let end = "14:00";
    let duration = 45;
    if (timeSlots.length > 0) {
      // Use first slot as base
      const [firstStart, firstEnd] = timeSlots[0].split("-");
      start = firstStart;
      // Use last slot's end as day end
      const lastSlot = timeSlots[timeSlots.length - 1];
      end = lastSlot.split("-")[1];
      // Use default duration
      duration =
        toMinutes(timeSlots[0].split("-")[1]) -
        toMinutes(timeSlots[0].split("-")[0]);
    }
    const newDayTimeSlots: Record<string, string[]> = {};
    for (const { day } of schedule) {
      newDayTimeSlots[day] = getDynamicTimeSlotsForDay(
        day,
        start,
        end,
        duration,
        assignments,
      );
    }
    setDayTimeSlots(newDayTimeSlots);
  }, [days, assignments, timeSlots]);

  // Helper to get teacher name by id
  const getTeacherName = (id: string) =>
    teachers.find((t) => t.value === id)?.label || id;

  // Helper to get subject name by id
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.value === id)?.label || id;

  const breakSlots = getBreakSlots(assignments, days);

  return (
    <div className="flex-1 space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Routine</h1>
          <p className="text-muted-foreground">
            view class schedules and timetables
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          {hasPermission('class-routine', 'create') && (
            <Link href="/dashboard/class-routine/addRoutine">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Schedule
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex border-b border-gray-200">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            {canViewClassSchedule && (
              <TabsTrigger
                value="classes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-sm shadow-none"
              >
                Class Timetable
              </TabsTrigger>
            )}
            {canViewTeacherSchedule && (
              <TabsTrigger
                value="teachers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-sm shadow-none"
              >
                Teacher Schedules
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {canViewClassSchedule && (
          <TabsContent value="classes" className="space-y-4 outline-none">
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
                  <label className="text-sm font-medium mb-2 block">Class</label>
                  <Select value={classValue} onValueChange={setClassValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClassOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Academic Year</label>
                  <Select value={yearValue} onValueChange={setYearValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYearOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Term</label>
                  <Select defaultValue="term-1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term-1">Term 1</SelectItem>
                      <SelectItem value="term-2">Term 2</SelectItem>
                      <SelectItem value="term-3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Apply Filters</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Table */}
          <Card>
            <CardHeader>
              <CardTitle>Class Routing Table</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr>
                        <th className="border border-gray-200 p-3 text-sm bg-gray-50 text-left font-medium w-28 min-w-[7rem] max-w-[7rem] h-16 min-h-[4rem]">
                          Time
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className="border border-gray-200 p-3 text-sm bg-gray-50 text-center font-medium w-32 min-w-[8rem] max-w-[8rem] h-16 min-h-[4rem]"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Use dynamic slots per day */}
                      {dayTimeSlots[days[0]] &&
                        dayTimeSlots[days[0]].map((slot, slotIdx) => (
                          <tr
                            key={slot}
                            className="hover:bg-gray-50 h-20 min-h-[5rem]"
                          >
                            <td className="border border-gray-200 p-3 font-medium bg-gray-50 text-xs w-28 min-w-[7rem] max-w-[7rem] h-20 min-h-[5rem] align-middle">
                              {slot}
                            </td>
                            {days.map((day) => {
                              const slotsForDay = dayTimeSlots[day] || [];
                              const slotForDay = slotsForDay[slotIdx];
                              const key = `${day}|${slotForDay}`;
                              const assigned = assignments[key];
                              return (
                                <td
                                  key={day}
                                  className="border relative border-gray-200 p-3 text-center w-32 min-w-[8rem] max-w-[8rem] h-20 min-h-[5rem] align-middle"
                                >
                                  {assigned ? (
                                    <div className="pt-5">
                                      <div className="font-medium text-sm">
                                        {subjects.find(
                                          (s) => s.value === assigned.subject,
                                        )?.label || assigned.subject}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {teachers.find(
                                          (t) => t.value === assigned.teacher,
                                        )?.label || assigned.teacher}
                                      </div>
                                      <div
                                        className={[
                                          "text-[0.60rem] capitalize border rounded-full px-2 inline-block",
                                          assigned.classType === "regular"
                                            ? "bg-[#d0eff5]"
                                            : "",
                                          assigned.classType === "special"
                                            ? "bg-[#f0cec5]"
                                            : "",
                                          assigned.classType === "break"
                                            ? "bg-[#f8fac5]"
                                            : "",
                                        ].join(" ")}
                                      >
                                        {assigned.classType}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
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
        </TabsContent>
      )}

        {canViewTeacherSchedule && (
          <TabsContent value="teachers" className="outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Teachers Schedule Directory</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTeachers ? (
                  <div className="text-center py-12 text-muted-foreground">Loading teacher schedules...</div>
                ) : teachersWithRoutines.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No teachers found.</div>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-4 text-left font-semibold text-sm text-gray-700">Teacher Name</th>
                          <th className="p-4 text-left font-semibold text-sm text-gray-700">Classes Taught</th>
                          <th className="p-4 text-center font-semibold text-sm text-gray-700 w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {teachersWithRoutines.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm font-semibold text-gray-900">{teacher.name}</td>
                            <td className="p-4 text-sm text-gray-600">
                              {teacher.classesTaught.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {teacher.classesTaught.map((clsName: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="bg-[#e0f2fe] text-[#0369a1] border-none font-medium text-xs px-2.5 py-0.5">
                                      {clsName}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No classes assigned</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedTeacherForView(teacher);
                                      setShowViewScheduleDialog(true);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Schedule
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
 
       {/* View Teacher Schedule Dialog */}
       <Dialog open={showViewScheduleDialog} onOpenChange={setShowViewScheduleDialog}>
         <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="text-xl font-bold flex items-center">
               📅 {selectedTeacherForView?.name}&apos;s Weekly Schedule
             </DialogTitle>
           </DialogHeader>
           <div className="mt-4 space-y-4">
             {!selectedTeacherForView?.schedule || selectedTeacherForView.schedule.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                 This teacher has no scheduled classes.
               </div>
             ) : (
               <div className="overflow-hidden border rounded-lg">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-gray-50 border-b">
                       <th className="p-3 text-left font-semibold text-sm text-gray-600">Day</th>
                       <th className="p-3 text-left font-semibold text-sm text-gray-600">Time</th>
                       <th className="p-3 text-left font-semibold text-sm text-gray-600">Class</th>
                       <th className="p-3 text-left font-semibold text-sm text-gray-600">Subject</th>
                       <th className="p-3 text-left font-semibold text-sm text-gray-600">Type</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {[...selectedTeacherForView.schedule]
                       .sort((a, b) => {
                         const daysOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                         const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
                         if (dayDiff !== 0) return dayDiff;
 
                         const [aStart] = a.startTime.split("-");
                         const [bStart] = b.startTime.split("-");
                         return toMinutes(aStart) - toMinutes(bStart);
                       })
                       .map((slot: any) => (
                         <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                           <td className="p-3 text-sm font-semibold text-gray-900">{slot.day}</td>
                           <td className="p-3 text-sm font-mono text-gray-600">{slot.startTime} - {slot.endTime}</td>
                           <td className="p-3 text-sm text-gray-800 font-medium">{slot.className}</td>
                           <td className="p-3 text-sm text-gray-800">{slot.subjectName}</td>
                           <td className="p-3 text-sm">
                             <span
                               className={[
                                 "text-[0.65rem] capitalize border rounded-full px-2 py-0.5 inline-block font-medium",
                                 slot.classType === "REGULAR" || slot.classType === "regular"
                                   ? "bg-sky-50 text-sky-700 border-sky-200"
                                   : "",
                                 slot.classType === "SPECIAL" || slot.classType === "special"
                                   ? "bg-rose-50 text-rose-700 border-rose-200"
                                   : "",
                                 slot.classType === "BREAK" || slot.classType === "break"
                                   ? "bg-amber-50 text-amber-700 border-amber-200"
                                   : "",
                               ].join(" ")}
                             >
                               {slot.classType.toLowerCase()}
                             </span>
                           </td>
                         </tr>
                       ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 }
 
 export default function ClassRoutinePage() {
   return (
     <PermissionGuard permission="class-routine">
       <ClassRoutinePageContent />
     </PermissionGuard>
   );
 }