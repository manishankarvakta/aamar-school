'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, AlertTriangle, Users, Sparkles } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface ChildData {
  profile: {
    id: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    className: string;
    sectionName: string;
    gender?: string | null;
    bloodGroup: string;
    phone: string;
  };
  routine: {
    slots: Array<{
      id: string;
      day: string;
      startTime: string;
      endTime: string;
      classType: string;
      subjectName: string;
      teacherName: string;
    }>;
  } | null;
}

interface ParentRoutineClientProps {
  data: {
    parent: {
      firstName: string;
      lastName: string;
      email: string;
    };
    children: ChildData[];
  };
}

export function ParentRoutineClient({ data }: ParentRoutineClientProps) {
  const { parent, children } = data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedChildIndex = parseInt(searchParams.get('child') || '0', 10);
  const activeChild = children[selectedChildIndex] || children[0];

  const handleChildSelect = (val: string) => {
    router.push(`${pathname}?child=${val}`);
  };

  if (!activeChild) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">No Students Linked</h2>
        <p className="text-muted-foreground text-sm">
          There are currently no students associated with your parent account. Please contact the school administration.
        </p>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const routineByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = activeChild.routine?.slots.filter(s => s.day.toLowerCase() === day.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 p-6 pb-20 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10" />
        <div className="space-y-2 relative z-10">
          <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1 w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Class Routines
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Class Routine Timetable</h1>
          <p className="text-indigo-200 text-sm max-w-md">
            View the weekly scheduled routine, subjects, and teachers for your child.
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 ? (
          <div className="space-y-1.5 relative z-10 w-full md:w-60 bg-white/10 p-3 rounded-xl border border-white/20">
            <label className="text-xs text-indigo-150 font-bold uppercase tracking-wider block">SELECT CHILD</label>
            <Select value={selectedChildIndex.toString()} onValueChange={handleChildSelect}>
              <SelectTrigger className="bg-white text-slate-800 border-none h-10">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child, idx) => (
                  <SelectItem key={child.profile.id} value={idx.toString()}>
                    {child.profile.firstName} ({child.profile.className})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-3 rounded-xl text-sm flex items-center gap-3 relative z-10 shrink-0">
            <Users className="h-5 w-5" />
            <div className="text-left">
              <span className="text-xs text-indigo-200 block font-medium uppercase tracking-wider">CHILD</span>
              <span className="font-bold">{activeChild.profile.firstName} {activeChild.profile.lastName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Routine list */}
      <Card className="shadow-md border border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-700" />
            Class Routine - {activeChild.profile.firstName} {activeChild.profile.lastName}
          </CardTitle>
          <CardDescription>Weekly scheduled class hours and subject details.</CardDescription>
        </CardHeader>
        <CardContent>
          {!activeChild.routine || activeChild.routine.slots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              📚 No class routine has been set up for this class yet.
            </div>
          ) : (
            <div className="space-y-8">
              {daysOfWeek.map((day) => {
                const slots = routineByDay[day];
                if (slots.length === 0) return null;

                return (
                  <div key={day} className="space-y-3">
                    <h3 className="font-bold text-slate-800 border-b pb-1.5 border-slate-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      {day}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {slots.map((slot: any) => (
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
                            Teacher: {slot.teacherName}
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
    </div>
  );
}
