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
import { Button } from "@/components/ui/button";
import { getSettings } from "@/app/actions/settings";
import { useBranch } from "@/contexts/branch-context";
import { getSubjectsForClass, getClasses } from "@/app/actions/classes";
import { getAllTeachers } from "@/app/actions/teachers";
import { ArrowLeft, Calendar, Pencil, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  upsertClassRoutine,
  getClassRoutine,
} from "@/app/actions/classRoutine";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// Assignment type for slot assignments
type Assignment = {
  subject: string;
  teacher: string;
  classType: string;
  endTime?: string;
};

// Helper to convert time string to minutes
function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
// Helper to convert minutes to time string
function toTime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

// Returns array of [start, end] time strings for regular slots
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

// Generate dynamic time slots for a day based on assignments and custom end times
function getDynamicTimeSlotsForDay(
  day: string,
  start: string,
  end: string,
  duration: number,
  assignments: Record<string, Assignment>,
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

export default function ClassRoutingEditPage() {
  const { selectedBranchId } = useBranch();
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<{
    day: string;
    time: string;
  } | null>(null);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(
    {},
  );
  // Instead of a single timeSlots array, build a map: day -> slots
  const [dayTimeSlots, setDayTimeSlots] = useState<Record<string, string[]>>(
    {},
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Dialog form state
  const [formClassType, setFormClassType] = useState("regular");
  const [formSubject, setFormSubject] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formEndTime, setFormEndTime] = useState("");

  const [subjects, setSubjects] = useState<
    { value: string; label: string; teacherId?: string; teacherName?: string }[]
  >([]);
  const [teachers, setTeachers] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [classBranchId, setClassBranchId] = useState<string | null>(null);

  // Quick Add form state
  const [quickDay, setQuickDay] = useState("");
  const [quickStartTime, setQuickStartTime] = useState("");
  const [quickEndTime, setQuickEndTime] = useState("");
  const [quickClassType, setQuickClassType] = useState("regular");
  const [quickSubject, setQuickSubject] = useState("");
  const [quickTeacher, setQuickTeacher] = useState("");

  useEffect(() => {
    if (days.length > 0 && !quickDay) {
      setQuickDay(days[0]);
    }
  }, [days, quickDay]);

  const handleQuickAdd = () => {
    if (!classValue) {
      toast({
        title: "Validation Error",
        description: "Please select a Class first.",
        variant: "destructive",
      });
      return;
    }
    if (!quickDay) {
      toast({
        title: "Validation Error",
        description: "Please select a Day.",
        variant: "destructive",
      });
      return;
    }
    if (!quickStartTime || !quickEndTime) {
      toast({
        title: "Validation Error",
        description: "Please specify both Start Time and End Time.",
        variant: "destructive",
      });
      return;
    }

    const startMin = toMinutes(quickStartTime);
    const endMin = toMinutes(quickEndTime);

    if (startMin >= endMin) {
      toast({
        title: "Validation Error",
        description: "Start Time must be before End Time.",
        variant: "destructive",
      });
      return;
    }

    // Check for overlaps on the same day
    const overlap = Object.keys(assignments).some((key) => {
      const [slotDay, slotTime] = key.split("|");
      if (slotDay.toLowerCase() !== quickDay.toLowerCase()) return false;
      const [sStart, sEnd] = slotTime.split("-");
      const existingStart = toMinutes(sStart);
      const existingEnd = toMinutes(sEnd);
      return startMin < existingEnd && existingStart < endMin;
    });

    if (overlap) {
      toast({
        title: "Schedule Conflict",
        description: "This slot overlaps with an existing class schedule on this day.",
        variant: "destructive",
      });
      return;
    }

    const key = `${quickDay}|${quickStartTime}-${quickEndTime}`;
    const newAssignments = {
      ...assignments,
      [key]: {
        subject: quickSubject,
        teacher: quickTeacher,
        classType: quickClassType,
        ...(quickClassType !== "regular" ? { endTime: quickEndTime } : {}),
      },
    };
    setAssignments(newAssignments);

    toast({
      title: "Slot Added",
      description: "Successfully added the slot to the routine.",
      variant: "default",
    });

    setQuickStartTime("");
    setQuickEndTime("");
    setQuickSubject("");
    setQuickTeacher("");
    setQuickClassType("regular");

    // Auto-save to database
    handleSaveRoutine(newAssignments);
  };

  console.log("subjects", subjects);
  const classTypeOptions = [
    { value: "regular", label: "Regular" },
    { value: "special", label: "Special" },
    { value: "break", label: "Break" },
  ];

  useEffect(() => {
    async function loadClassesAndSettings() {
      setLoading(true);
      // Load classes using getClassStats
      const classRes = await getClasses(selectedBranchId);
      console.log("classRes", classRes);
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
      // Load settings
      const res = await getSettings();
      if (res.success && res.data) {
        const schedule = parseSchedule(res.data.weeklySchedule);
        const openDays = [
          "Friday",
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ].filter((_, i) => schedule[i]?.open);
        setDays(openDays);
        // Use the first open day for start/end time
        const firstOpen = schedule.find((d) => d.open);
        if (firstOpen && res.data.subjectDuration) {
          setTimeSlots(
            getTimeSlots(
              firstOpen.start,
              firstOpen.end,
              res.data.subjectDuration,
            ),
          );
        } else {
          setTimeSlots([]);
        }
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
      setLoading(false);
    }
    loadClassesAndSettings();
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

  // When classValue changes, fetch subjects and teachers for that class
  useEffect(() => {
    async function fetchSubjectsAndTeachers() {
      if (!classValue) {
        setSubjects([]);
        setTeachers([]);
        setClassBranchId(null);
        return;
      }
      // Find branchId for this class
      const selectedClass = classOptions.find(
        (opt) => opt.value === classValue,
      );
      let branchId = null;
      if (selectedClass) {
        const classObj = (await getClasses(selectedBranchId)).data as any[];
        const foundClass = classObj.find((c: any) => c.id === classValue);
        branchId = foundClass?.branchId || null;
        setClassBranchId(branchId);
      }
      // Fetch subjects for class
      const subjRes = await getSubjectsForClass(classValue);
      console.log("subjRes", subjRes);
      if (subjRes.success && Array.isArray(subjRes.data)) {
        setSubjects(
          subjRes.data.map((s: any) => ({
            value: s.id,
            label: s.name,
            teacherId: s.teacherId,
            teacherName: s.teacher?.user?.firstName
              ? `${s.teacher.user.firstName} ${s.teacher.user.lastName}`
              : undefined,
          })),
        );
      } else {
        setSubjects([]);
      }
      // Fetch teachers for branch
      const teacherRes = await getAllTeachers(selectedBranchId);
      if (teacherRes.success && Array.isArray(teacherRes.data)) {
        setTeachers(
          teacherRes.data.map((t: any) => ({ value: t.id, label: t.name })),
        );
      } else {
        setTeachers([]);
      }
    }
    fetchSubjectsAndTeachers();
  }, [classValue, selectedBranchId]);

  // Recompute time slots for each day when assignments or settings change
  useEffect(() => {
    if (!days.length) return;
    // Find schedule for each day
    const schedule = days.map((day, i) => ({
      day,
      idx: i,
    }));
    // Assume all days use the same start/end/duration for now
    // (could be extended for per-day settings)
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
  }, [days, assignments, timeSlots, subjects.length]);

  // When dialog opens, reset form state
  useEffect(() => {
    if (dialogOpen && dialogData) {
      setFormClassType("regular");
      setFormSubject("");
      setFormTeacher("");
    }
  }, [dialogOpen, dialogData]);

  // Auto-select subject and teacher when editing
  useEffect(() => {
    if (
      dialogOpen &&
      dialogData &&
      assignments[`${dialogData.day}|${dialogData.time}`]
    ) {
      const assigned = assignments[`${dialogData.day}|${dialogData.time}`];
      setFormSubject(assigned.subject);
      setFormTeacher(assigned.teacher);
      setFormClassType(assigned.classType);
      setFormEndTime((assigned as Assignment).endTime || "");
    } else if (dialogOpen && dialogData) {
      setFormSubject("");
      setFormTeacher("");
      setFormClassType("regular");
      setFormEndTime("");
    }
  }, [dialogOpen, dialogData]);

  // Move fetchAndSetRoutine to component scope
  async function fetchAndSetRoutine(
    classId: string,
    subjects: any,
    teachers: any,
  ) {
    if (!classId) {
      setAssignments({});
      return;
    }
    const res = await getClassRoutine(classId);
    console.log("getClassRoutine result for classId", classId, res); // <-- log the result
    if (
      res.success &&
      res.data &&
      Array.isArray(subjects) &&
      Array.isArray(teachers)
    ) {
      const routine = res.data;
      const newAssignments: Record<string, Assignment> = {};
      for (const slot of routine.slots || []) {
        const key = `${slot.day}|${slot.startTime}-${slot.endTime}`;
        newAssignments[key] = {
          subject: slot.subjectId || "",
          teacher: slot.teacherId || "",
          classType: (slot.classType || "REGULAR").toLowerCase(),
          ...(slot.classType !== "REGULAR" && slot.endTime
            ? { endTime: slot.endTime }
            : {}),
        };
      }
      setAssignments(newAssignments);
    } else {
      setAssignments({});
    }
  }

  // Update useEffect to use the new function
  useEffect(() => {
    fetchAndSetRoutine(classValue, subjects, teachers);
    // Only run when classValue, subjects, or teachers change
  }, [classValue, subjects.length, teachers.length]);

  const handleAddSubject = (day: string, time: string) => {
    setDialogData({ day, time });
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!dialogData) return;
    const startTime = dialogData.time.split("-")[0];
    let endTime = dialogData.time.split("-")[1];
    if (formClassType !== "regular" && formEndTime) {
      endTime = formEndTime;
    }
    const newKey = `${dialogData.day}|${startTime}-${endTime}`;
    const newAssignments = { ...assignments };
    // Remove any assignment for the old slot (if it exists)
    Object.keys(newAssignments).forEach((k) => {
      if (k.startsWith(`${dialogData.day}|${startTime}-`)) {
        delete newAssignments[k];
      }
    });
    newAssignments[newKey] = {
      subject: formSubject,
      teacher: formTeacher,
      classType: formClassType,
      ...(formClassType !== "regular" && endTime ? { endTime } : {}),
    };
    setAssignments(newAssignments);
    setDialogOpen(false);
    setDialogData(null);
    handleSaveRoutine(newAssignments);
  };

  // Helper to get current class object
  const currentClassObj = classOptions.find((c) => c.value === classValue);

  // Save routine handler
  async function handleSaveRoutine(updatedAssignments?: Record<string, Assignment>) {
    const activeAssignments = updatedAssignments || assignments;
    if (
      !classValue ||
      !yearValue ||
      !classBranchId
    )
      return;
    setSaveLoading(true);
    // Find the full class object for schoolId/createdBy
    const allClassesRes = await getClasses(selectedBranchId);
    let schoolId = "";
    let createdBy = "";
    if (allClassesRes.success && Array.isArray(allClassesRes.data)) {
      const found = allClassesRes.data.find((c: any) => c.id === classValue);
      schoolId = found?.branch?.schoolId || found?.schoolId || "";
      createdBy = found?.teacherId || ""; // fallback, ideally use session user id
    }
    // Map frontend classType to Prisma enum
    const classTypeMap: Record<string, string> = {
      regular: "REGULAR",
      special: "SPECIAL",
      break: "BREAK",
      lab: "LAB",
      practical: "PRACTICAL",
      assignment: "ASSIGNMENT",
    };
    // Prepare slots
    const slots = Object.entries(activeAssignments).map(([key, value]) => {
      const [day, time] = key.split("|");
      const [startTime, endTime] = time.split("-");
      return {
        day,
        startTime,
        endTime: value.endTime || endTime,
        subjectId: value.subject || undefined,
        teacherId: value.teacher || undefined,
        classType: classTypeMap[value.classType] || "REGULAR",
      };
    });
    const res = await upsertClassRoutine({
      classId: classValue,
      academicYear: yearValue,
      branchId: classBranchId,
      schoolId,
      createdBy,
      slots,
    });
    setSaveLoading(false);
    if (res.success) {
      toast({
        title: "Routine saved successfully!",
        description: "The class routine has been saved.",
        variant: "default",
      });
      // Fetch and update the table with the latest routine
      await fetchAndSetRoutine(classValue, subjects, teachers);
    } else {
      toast({
        title: "Failed to save routine",
        description:
          res.message || "An error occurred while saving the routine.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex-1 space-y-4 p-6">
      <div className="space-y-3">
        <Link href={"/dashboard/class-routine"}>
          <Button variant={"outline"} size={"icon"} className="rounded-full">
            <ArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customize Class Routine
          </h1>
          <p className="text-muted-foreground">
            Manage and view class schedules and timetables
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={classValue} onValueChange={setClassValue}>
                <SelectTrigger className="w-40">
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
              <label className="text-sm font-medium mb-2 block">
                Academic Year
              </label>
              <Select value={yearValue} onValueChange={setYearValue}>
                <SelectTrigger className="w-40">
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
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Timetable Slot Form */}
      <Card className="shadow-md border border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center font-bold text-slate-800">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Quick Add Time Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Class</label>
              <Select value={classValue} onValueChange={setClassValue}>
                <SelectTrigger className="h-10">
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
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Day</label>
              <Select value={quickDay} onValueChange={setQuickDay}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Start Time</label>
              <input
                type="time"
                className="w-full h-10 px-3 py-2 border rounded-md text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={quickStartTime}
                onChange={(e) => setQuickStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">End Time</label>
              <input
                type="time"
                className="w-full h-10 px-3 py-2 border rounded-md text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={quickEndTime}
                onChange={(e) => setQuickEndTime(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Class Type</label>
              <Select value={quickClassType} onValueChange={setQuickClassType}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {classTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={quickClassType === "break" ? "hidden" : "block"}>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Subject</label>
              <Select value={quickSubject} onValueChange={setQuickSubject}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={quickClassType === "break" ? "hidden" : "block"}>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Teacher</label>
              <Select value={quickTeacher} onValueChange={setQuickTeacher}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={quickClassType === "break" ? "col-span-2 lg:col-span-3" : ""}>
              <Button type="button" onClick={handleQuickAdd} className="w-full h-10 gap-1.5">
                <Plus className="h-4 w-4" />
                Add Slot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                                <>
                                  {/* Edit button top left */}
                                  <button
                                    className="absolute top-1 left-1 p-1 text-blue-600 hover:bg-blue-50 rounded-full z-10"
                                    type="button"
                                    onClick={() => {
                                      setFormClassType(assigned.classType);
                                      setFormSubject(assigned.subject);
                                      setFormTeacher(assigned.teacher);
                                      setFormEndTime(
                                        (assigned as Assignment).endTime || "",
                                      );
                                      setDialogData({ day, time: slot });
                                      setDialogOpen(true);
                                    }}
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  {/* Delete button top right */}
                                  <button
                                    className="absolute top-1 right-1 p-1 text-red-600 hover:bg-red-50 rounded-full z-10"
                                    type="button"
                                    onClick={() => {
                                      const newAssignments = { ...assignments };
                                      delete newAssignments[key];
                                      setAssignments(newAssignments);
                                      handleSaveRoutine(newAssignments);
                                    }}
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                  <div className="pt-5">
                                    {/* Padding top for icons */}
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
                                </>
                              ) : (
                                <button
                                  className="flex items-center justify-center w-full h-full text-gray-400 hover:text-blue-600"
                                  type="button"
                                  onClick={() => {
                                    setFormClassType("regular");
                                    setFormSubject("");
                                    setFormTeacher("");
                                    setFormEndTime("");
                                    setDialogData({ day, time: slot });
                                    setDialogOpen(true);
                                  }}
                                  title="Add Subject"
                                  aria-label="Add Subject"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
              {/* Single Dialog instance for Add/Edit */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {dialogData &&
                      assignments[`${dialogData.day}|${dialogData.time}`]
                        ? "Edit Subject"
                        : "Add Subject"}
                    </DialogTitle>
                    <DialogDescription>
                      Assign a subject and teacher to this slot.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div
                      className={`grid items-center ${formClassType !== "regular" ? "grid-cols-2 gap-4" : "grid-cols-1 gap-0"} `}
                    >
                      <div>
                        <label className="text-xs font-medium block mb-1">
                          Time
                        </label>
                        <input
                          className="w-full px-2 py-1 border rounded bg-gray-100"
                          value={dialogData?.time || ""}
                          readOnly
                        />
                      </div>
                      <div
                        className={`${formClassType !== "regular col-span-1" ? "block" : "hidden"}`}
                      >
                        {formClassType !== "regular" && (
                          <>
                            <label className="text-xs font-medium block mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              className="w-full px-2 py-1 border rounded"
                              value={formEndTime}
                              onChange={(e) => setFormEndTime(e.target.value)}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Class
                      </label>
                      <Select
                        value={classValue}
                        onValueChange={(val) => setClassValue(val)}
                      >
                        <SelectTrigger className="w-full">
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
                      <label className="text-xs font-medium block mb-1">
                        Day
                      </label>
                      <input
                        className="w-full px-2 py-1 border rounded bg-gray-100"
                        value={dialogData?.day || ""}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Class Type
                      </label>
                      <Select
                        value={formClassType}
                        onValueChange={setFormClassType}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div
                      className={`${formClassType === "break" ? "hidden" : "block"}`}
                    >
                      <label className="text-xs font-medium block mb-1">
                        Subject
                      </label>
                      <Select
                        value={formSubject}
                        onValueChange={setFormSubject}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div
                      className={`${formClassType === "break" ? "hidden" : "block"}`}
                    >
                      <label className="text-xs font-medium block mb-1">
                        Teacher
                      </label>
                      <Select
                        value={formTeacher}
                        onValueChange={setFormTeacher}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDialogSave} type="button">
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 flex gap-4 items-center">
        <Button
          onClick={() => handleSaveRoutine()}
          disabled={
            saveLoading ||
            !classValue ||
            !classBranchId
          }
        >
          {saveLoading ? "Saving..." : "Save Routine"}
        </Button>
      </div>
    </div>
  );
}
