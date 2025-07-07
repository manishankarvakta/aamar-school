"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getSettings } from '@/app/actions/settings';
import { getAvailableTeachers, getClassStats, getSubjectsForClass, getClasses } from '@/app/actions/classes';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

const academicYearOptions = [
  { value: '2024-25', label: '2024-25' },
  { value: '2023-24', label: '2023-24' },
  { value: '2022-23', label: '2022-23' },
];

function getTimeSlots(start: string, end: string, duration: number) {
  // Returns array of [start, end] time strings
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };
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

function parseSchedule(raw: any): { open: boolean; start: string; end: string }[] {
  if (Array.isArray(raw)) {
    return raw.map(item => {
      if (typeof item === 'object' && item !== null && 'open' in item && 'start' in item && 'end' in item) {
        return { open: !!item.open, start: String(item.start), end: String(item.end) };
      }
      return { open: false, start: '08:00', end: '14:00' };
    });
  }
  return [
    { open: false, start: '08:00', end: '14:00' },
    { open: false, start: '08:00', end: '14:00' },
    { open: false, start: '08:00', end: '14:00' },
    { open: false, start: '08:00', end: '14:00' },
    { open: false, start: '08:00', end: '14:00' },
    { open: false, start: '08:00', end: '14:00' },
    { open: false, start: '08:00', end: '14:00' },
  ];
}

export default function ClassRoutingEditPage() {
  const [classValue, setClassValue] = useState('');
  const [yearValue, setYearValue] = useState('');
  const [classOptions, setClassOptions] = useState<{ value: string; label: string; academicYear: string }[]>([]);
  const [academicYearOptions, setAcademicYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<{ day: string; time: string } | null>(null);
  const [assignments, setAssignments] = useState<Record<string, { subject: string; teacher: string; classType: string }>>({});

  // Dialog form state
  const [formClassType, setFormClassType] = useState('regular');
  const [formSubject, setFormSubject] = useState('');
  const [formTeacher, setFormTeacher] = useState('');

  const [subjects, setSubjects] = useState<{ value: string; label: string; teacherId?: string; teacherName?: string }[]>([]);
  const [teachers, setTeachers] = useState<{ value: string; label: string }[]>([]);
  const [classBranchId, setClassBranchId] = useState<string | null>(null);


  console.log("subjects", subjects);
  const classTypeOptions = [
    { value: 'regular', label: 'Regular' },
    { value: 'special', label: 'Special' },
    { value: 'break', label: 'Break' },
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
        setClassOptions(classes.map(cls => ({
          value: cls.id,
          label: `${cls.name} (${cls.academicYear})`,
          academicYear: cls.academicYear,
        })));
        const years = Array.from(new Set(classes.map(cls => cls.academicYear)));
        setAcademicYearOptions(years.map(y => ({ value: y, label: y })));
        if (classes.length > 0) {
          setClassValue(classes[0].id);
          setYearValue(classes[0].academicYear);
        }
      } else {
        setClassOptions([]);
        setAcademicYearOptions([]);
        setClassValue('');
        setYearValue('');
      }
      // Load settings
      const res = await getSettings();
      if (res.success && res.data) {
        const schedule = parseSchedule(res.data.weeklySchedule);
        const openDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          .filter((_, i) => schedule[i]?.open);
        setDays(openDays);
        // Use the first open day for start/end time
        const firstOpen = schedule.find(d => d.open);
        if (firstOpen && res.data.subjectDuration) {
          setTimeSlots(getTimeSlots(firstOpen.start, firstOpen.end, res.data.subjectDuration));
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
  const filteredClassOptions = classOptions.filter(opt => opt.academicYear === yearValue);

  // When academic year changes, reset classValue to first available class in that year
  useEffect(() => {
    if (filteredClassOptions.length > 0) {
      setClassValue(filteredClassOptions[0].value);
    } else {
      setClassValue('');
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
      const selectedClass = classOptions.find(opt => opt.value === classValue);
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
        setSubjects(subjRes.data.map((s: any) => ({
          value: s.id,
          label: s.name,
          teacherId: s.teacherId,
          teacherName: s.teacher?.user?.firstName ? `${s.teacher.user.firstName} ${s.teacher.user.lastName}` : undefined,
        })));
      } else {
        setSubjects([]);
      }
      // Fetch teachers for branch
      if (branchId) {
        const teacherRes = await getAvailableTeachers(branchId);
        if (teacherRes.success && Array.isArray(teacherRes.data)) {
          setTeachers(teacherRes.data.map((t: any) => ({ value: t.id, label: t.name })));
        } else {
          setTeachers([]);
        }
      } else {
        setTeachers([]);
      }
    }
    fetchSubjectsAndTeachers();
  }, [classValue]);

  // When dialog opens, reset form state
  useEffect(() => {
    if (dialogOpen && dialogData) {
      setFormClassType('regular');
      setFormSubject('');
      setFormTeacher('');
    }
  }, [dialogOpen, dialogData]);

  const handleAddSubject = (day: string, time: string) => {
    setDialogData({ day, time });
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!dialogData) return;
    setAssignments(prev => ({
      ...prev,
      [`${dialogData.day}|${dialogData.time}`]: {
        subject: formSubject,
        teacher: formTeacher,
        classType: formClassType,
      },
    }));
    setDialogOpen(false);
    setDialogData(null);
  };

  // When subject changes, auto-select teacher if available
  useEffect(() => {
    if (formSubject) {
      const subj = subjects.find(s => s.value === formSubject);
      if (subj && subj.teacherId) setFormTeacher(subj.teacherId);
    }
  }, [formSubject, subjects]);

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
              {filteredClassOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Academic Year</label>
          <Select value={yearValue} onValueChange={setYearValue}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYearOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
                    <th className="border border-gray-200 p-3 bg-gray-50 text-left font-medium">Time</th>
                    {days.map(day => (
                      <th key={day} className="border border-gray-200 p-3 bg-gray-50 text-center font-medium">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium bg-gray-50">{slot}</td>
                      {days.map(day => {
                        const key = `${day}|${slot}`;
                        const assigned = assignments[key];
                        return (
                          <td key={day} className="border border-gray-200 p-3 text-center">
                            {assigned ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{assigned.subject}</div>
                                <div className="text-xs text-gray-600">{assigned.teacher}</div>
                                <div className="text-xs text-gray-500 capitalize">{assigned.classType}</div>
                              </div>
                            ) : (
                              <Dialog open={dialogOpen && dialogData?.day === day && dialogData?.time === slot} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => handleAddSubject(day, slot)}>Add Subject</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Subject</DialogTitle>
                                    <DialogDescription>
                                      Assign a subject and teacher to this slot.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium block mb-1">Time</label>
                                      <input className="w-full px-2 py-1 border rounded bg-gray-100" value={slot} readOnly />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium block mb-1">Day</label>
                                      <input className="w-full px-2 py-1 border rounded bg-gray-100" value={day} readOnly />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium block mb-1">Class Type</label>
                                      <Select value={formClassType} onValueChange={setFormClassType}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {classTypeOptions.map((opt: { value: string; label: string }) => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium block mb-1">Subject</label>
                                      <Select value={formSubject} onValueChange={setFormSubject}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {subjects.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium block mb-1">Teacher</label>
                                      <Select value={formTeacher} onValueChange={setFormTeacher}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select Teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {teachers.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)} type="button">Cancel</Button>
                                    <Button onClick={handleDialogSave} type="button">Save</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
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
    </div>
  );
} 