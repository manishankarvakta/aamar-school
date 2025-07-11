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
import { getClasses } from "@/app/actions/classes";
import { getClassRoutine } from "@/app/actions/classRoutine";
import { getAllTeachers } from "@/app/actions/teachers";
import { Plus, Download, Calendar } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { getSettings } from "@/app/actions/settings";

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
  const slots: string[] = [];
  let cur = toMinutes(start);
  const endM = toMinutes(end);
  while (cur < endM) {
    let next: number;
    const curTimeStr = toTime(cur);
    // Find any assignment for this day and start time
    const foundKey = Object.keys(assignments).find((k) =>
      k.startsWith(`${day}|${curTimeStr}-`),
    );
    const assigned: any = foundKey ? assignments[foundKey] : undefined;
    let slotEnd: string;
    if (assigned && assigned.classType !== "regular" && assigned.endTime) {
      slotEnd = assigned.endTime;
      next = toMinutes(slotEnd);
      slots.push(`${curTimeStr}-${slotEnd}`);
      cur = next;
    } else {
      const defaultEnd = Math.min(cur + duration, endM);
      slotEnd = toTime(defaultEnd);
      next = defaultEnd;
      slots.push(`${curTimeStr}-${slotEnd}`);
      cur = next;
    }
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

export default function ClassRoutinePage() {
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

  // Load classes, academic years, teachers, and settings on mount
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      // Load classes
      const classRes = await getClasses();
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
      const teacherRes = await getAllTeachers();
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
          ? settingsRes.data.weeklySchedule
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
        setDays([]);
        setTimeSlots([]);
      }
      setLoading(false);
    }
    loadInitialData();
  }, []);

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
        setDays([]);
        setTimeSlots([]);
        setDayTimeSlots({});
        return;
      }
      setLoading(true);
      // Fetch routine
      const res = await getClassRoutine(classValue);
      console.log('Fetched routine for class', classValue, res);
      if (res.success && res.data) {
        const routine = res.data;
        // Get all subjects for this class (from slots)
        const allSubjects = Array.from(
          new Set(
            (routine.slots || [])
              .map((slot: any) => ({
                value: slot.subject?.id || slot.subjectId,
                label: slot.subject?.name || "",
              }))
              .filter((s: any) => s.value && s.label),
          )
        );
        setSubjects(allSubjects);
        // Get days from slots
        const allDays = Array.from(new Set((routine.slots || []).map((slot: any) => slot.day)));
        setDays(allDays);
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

        // Compute time slots for each day
        // Use the earliest start and latest end for the day
        const dayTimeSlots: Record<string, string[]> = {};
        for (const day of allDays) {
          const slotsForDay = (routine.slots || []).filter(
            (slot: any) => slot.day === day,
          );
          if (slotsForDay.length > 0) {
            // Sort by start time
            slotsForDay.sort(
              (a: any, b: any) =>
                toMinutes(a.startTime) - toMinutes(b.startTime),
            );
            dayTimeSlots[day] = slotsForDay.map(
              (slot: any) => `${slot.startTime}-${slot.endTime}`,
            );
          } else {
            dayTimeSlots[day] = [];
          }
        }
        setDayTimeSlots(dayTimeSlots);
      } else {
        setAssignments({});
        setDays([]);
        setTimeSlots([]);
        setDayTimeSlots({});
      }
      setLoading(false);
    }
    fetchRoutineAndSetup();
  }, [classValue]);

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
          <Link href="/dashboard/class-routine/addRoutine">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Schedule
            </Button>
          </Link>
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
          <div className="flex justify-between items-center">
            <CardTitle>Weekly Schedule - {filteredClassOptions.find(opt => opt.value === classValue)?.label || "Class"}</CardTitle>
            <Badge variant="secondary">Current Week</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : days.length === 0 || timeSlots.length === 0 ? (
            <div>No routine found for this class.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="border border-gray-200 p-3 text-sm bg-gray-50 text-left font-medium w-28 min-w-[7rem] max-w-[7rem] h-16 min-h-[4rem]">Time</th>
                    {days.map(day => (
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
                  {timeSlots.map(slot => {
                    // Check if any day in this slot has a break assignment
                    const isBreakRow = days.some(day => {
                      const key = `${day}|${slot}`;
                      const assigned = assignments[key];
                      return assigned && assigned.classType === "break";
                    });
                    if (isBreakRow) {
                      // Use the first break label found
                      const breakLabel = days.map(day => {
                        const key = `${day}|${slot}`;
                        const assigned = assignments[key];
                        return assigned && assigned.classType === "break" && assigned.label;
                      }).find(Boolean) || "Break";
                      return (
                        <tr key={slot} className="bg-yellow-50 h-20 min-h-[5rem]">
                          <td className="border border-gray-200 p-3 font-medium bg-gray-50 text-xs w-28 min-w-[7rem] max-w-[7rem] h-20 min-h-[5rem] align-middle">
                            {slot}
                          </td>
                          <td colSpan={days.length} className="border border-gray-200 p-3 text-center font-semibold text-yellow-700 text-base align-middle">
                            {breakLabel}
                          </td>
                        </tr>
                      );
                    }
                    // Not a break row, render normal cells
                    return (
                      <tr key={slot} className="hover:bg-gray-50 h-20 min-h-[5rem]">
                        <td className="border border-gray-200 p-3 font-medium bg-gray-50 text-xs w-28 min-w-[7rem] max-w-[7rem] h-20 min-h-[5rem] align-middle">
                          {slot}
                        </td>
                        {days.map((day: string) => {
                          const key = `${day}|${slot}`;
                          const assigned = assignments[key];
                          return (
                            <td
                              key={day}
                              className="border relative border-gray-200 p-3 text-center w-32 min-w-[8rem] max-w-[8rem] h-20 min-h-[5rem] align-middle"
                            >
                              {assigned ? (
                                <div className="pt-5">
                                  <div className="font-medium text-sm">
                                    {getSubjectName(assigned.subject)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {getTeacherName(assigned.teacher)}
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
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 