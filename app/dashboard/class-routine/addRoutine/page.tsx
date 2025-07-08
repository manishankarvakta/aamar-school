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
import { getSubjectsForClass, getClasses } from "@/app/actions/classes";
import { getAllTeachers } from "@/app/actions/teachers";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
    const assigned: Assignment | undefined = foundKey
      ? assignments[foundKey]
      : undefined;
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

export default function ClassRoutingEditPage() {
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
      const classRes = await getClasses();
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
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
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
        setDays([]);
        setTimeSlots([]);
      }
      setLoading(false);
    }
    loadClassesAndSettings();
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
        const classObj = (await getClasses()).data as any[];
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
      const teacherRes = await getAllTeachers();
      if (teacherRes.success && Array.isArray(teacherRes.data)) {
        setTeachers(
          teacherRes.data.map((t: any) => ({ value: t.id, label: t.name })),
        );
      } else {
        setTeachers([]);
      }
    }
    fetchSubjectsAndTeachers();
  }, [classValue]);

  // Recompute time slots for each day when assignments or settings change
  useEffect(() => {
    if (!days.length || !subjects.length) return;
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
    if (subjects.length > 0 && timeSlots.length > 0) {
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
    setAssignments((prev) => {
      const updated = { ...prev };
      // Remove any assignment for the old slot (if it exists)
      Object.keys(updated).forEach((k) => {
        if (k.startsWith(`${dialogData.day}|${startTime}-`)) {
          delete updated[k];
        }
      });
      updated[newKey] = {
        subject: formSubject,
        teacher: formTeacher,
        classType: formClassType,
        ...(formClassType !== "regular" && endTime ? { endTime } : {}),
      };
      return updated;
    });
    setDialogOpen(false);
    setDialogData(null);
  };

  return (
    <div className="flex-1 space-y-4 p-6">
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
      <Card>
        <CardHeader>
          <CardTitle>Class Routing Table</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 p-3 text-sm bg-gray-50 text-left font-medium">
                      Time
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className="border border-gray-200 p-3 text-sm bg-gray-50 text-center font-medium"
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
                      <tr key={slot} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-3 font-medium bg-gray-50 text-xs">
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
                              className="border relative border-gray-200 p-3 text-center"
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
                                      setAssignments((prev) => {
                                        const newAssignments = { ...prev };
                                        delete newAssignments[key];
                                        return newAssignments;
                                      });
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
                                  className="text-xs w-full h-full"
                                  type="button"
                                  onClick={() => {
                                    setFormClassType("regular");
                                    setFormSubject("");
                                    setFormTeacher("");
                                    setFormEndTime("");
                                    setDialogData({ day, time: slot });
                                    setDialogOpen(true);
                                  }}
                                >
                                  Add Subject
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
                      <div className={`${formClassType !== "regular col-span-1" ? "block":"hidden"}`}>
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

                    <div className={`${formClassType === "break" ? "hidden":"block"}`}>
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
                    <div className={`${formClassType === "break" ? "hidden":"block"}`}>
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
    </div>
  );
}
