'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock } from 'lucide-react';
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

export function TeacherRoutineClient({ data }: TeacherRoutineClientProps) {
  const { profile, routine, classesCount, studentsCount, announcements } = data;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const routineByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = routine.slots.filter(s => s.day.toLowerCase() === day.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, any[]>);

  const layoutStats = {
    classesCount,
    studentsCount,
    slotsCount: routine.slots.length,
    announcementCount: announcements.length,
  };

  return (
    <TeacherDashboardLayout profile={profile} stats={layoutStats}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-700" />
            My Teaching Schedule (Class Routine)
          </CardTitle>
          <CardDescription>Your weekly scheduled teaching periods and slots</CardDescription>
        </CardHeader>
        <CardContent>
          {routine.slots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              📚 No routine teaching slots have been assigned to you.
            </div>
          ) : (
            <div className="space-y-8">
              {daysOfWeek.map((day) => {
                const slots = routineByDay[day];
                if (slots.length === 0) return null;

                return (
                  <div key={day} className="space-y-3">
                    <h3 className="font-bold text-slate-800 border-b pb-1 border-slate-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      {day}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {slots.map((slot) => (
                        <div key={slot.id} className="border p-4 rounded-xl shadow-sm bg-card hover:border-slate-300 transition-colors space-y-2 relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-800">{slot.subjectName}</span>
                            <Badge variant="secondary" className="text-[10px] font-medium tracking-wide">
                              {slot.classType}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700">
                            Class: {slot.className}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TeacherDashboardLayout>
  );
}
