'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TeacherDashboardLayout } from './teacher-dashboard-layout';

interface TeacherRoutineClientProps {
  data: {
    profile: {
      firstName: string;
      lastName: string;
      qualification: string;
      branchName: string;
      employeeId: string;
    };
    routine: {
      slots: Array<{
        id: string;
        day: string;
        startTime: string;
        endTime: string;
        classType: string;
        subjectName: string;
        className: string;
      }>;
    };
    classesCount: number;
    studentsCount: number;
    announcements: Array<any>;
  };
}

// Helper functions for time conversion and slots
function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function TeacherRoutineClient({ data }: TeacherRoutineClientProps) {
  const { profile, routine, classesCount, studentsCount, announcements } = data;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filter days to only those that have slots to keep the table compact
  const days = daysOfWeek.filter(day => 
    routine.slots.some(s => s.day.toLowerCase() === day.toLowerCase())
  );

  // Get unique time slots sorted
  const allSlotsSet = new Set<string>();
  routine.slots.forEach(slot => {
    allSlotsSet.add(`${slot.startTime}-${slot.endTime}`);
  });
  const timeSlots = Array.from(allSlotsSet).sort((a, b) => {
    const [aStart] = a.split('-');
    const [bStart] = b.split('-');
    return toMinutes(aStart) - toMinutes(bStart);
  });

  // Map slots to a quick lookup map
  const assignments: Record<string, any> = {};
  routine.slots.forEach(slot => {
    const key = `${slot.day.toLowerCase()}|${slot.startTime}-${slot.endTime}`;
    assignments[key] = {
      subjectName: slot.subjectName,
      className: slot.className,
      classType: slot.classType.toLowerCase(),
    };
  });

  const layoutStats = {
    classesCount,
    studentsCount,
    slotsCount: routine.slots.length,
    announcementCount: announcements.length,
  };

  return (
    <TeacherDashboardLayout profile={profile} stats={layoutStats}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Class Routine</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              View your scheduled teaching periods and weekly timetable grid
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/teacher-dashboard/routine/addRoutine">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add/Edit Routine
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Schedule
            </Button>
          </div>
        </div>

        {/* Schedule Table Card */}
        <Card className="shadow-md border border-slate-100 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-800">
              <BookOpen className="h-5 w-5 text-primary" />
              Weekly Schedule Grid
            </CardTitle>
            <CardDescription>Your classes mapped by weekday and time slots</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {routine.slots.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">📚</span>
                <p className="font-semibold text-slate-600">No classes scheduled</p>
                <p className="text-xs text-muted-foreground">You do not have any assigned teaching periods at the moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/75 border-b">
                      <th className="border-r border-slate-100 p-3.5 text-xs bg-slate-50 text-left font-bold text-muted-foreground uppercase tracking-wider w-28 min-w-[7rem] max-w-[7rem] h-12 align-middle">
                        Time
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border-r border-slate-100 p-3.5 text-xs bg-slate-50 text-center font-bold text-muted-foreground uppercase tracking-wider h-12 align-middle"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot} className="hover:bg-slate-50/30 border-b border-slate-100 last:border-0">
                        <td className="border-r border-slate-100 p-3.5 font-semibold bg-slate-50/30 text-xs text-slate-700 w-28 min-w-[7rem] max-w-[7rem] align-middle flex items-center gap-1.5 justify-start">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{slot}</span>
                        </td>
                        {days.map((day) => {
                          const key = `${day.toLowerCase()}|${slot}`;
                          const assigned = assignments[key];
                          return (
                            <td
                              key={day}
                              className="border-r border-slate-100 p-3 text-center align-middle relative last:border-r-0"
                            >
                              {assigned ? (
                                <div className="py-2.5 px-1 flex flex-col items-center justify-center gap-1">
                                  <div className="font-bold text-sm text-slate-800 leading-tight">
                                    {assigned.subjectName}
                                  </div>
                                  <div className="text-xs text-slate-600 font-medium bg-slate-100/80 px-2 py-0.5 rounded">
                                    Class: {assigned.className}
                                  </div>
                                  <div
                                    className={`text-[10px] uppercase font-bold tracking-wider border rounded-full px-2.5 py-0.5 mt-1 inline-block ${
                                      assigned.classType === 'regular'
                                        ? 'bg-sky-50 text-sky-700 border-sky-100'
                                        : assigned.classType === 'special'
                                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                                        : assigned.classType === 'break'
                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                        : 'bg-slate-50 text-slate-700 border-slate-100'
                                    }`}
                                  >
                                    {assigned.classType}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-300 font-light">—</span>
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
    </TeacherDashboardLayout>
  );
}
