'use client';

import React from 'react';
import { useBranch } from '@/contexts/branch-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentsOverview } from './students-overview';
import { OverallAttendance } from './overall-attendance';
import { Performance } from './performance';
import { DashboardCalendar } from './calendar';
import { OnLeave } from './on-leave';
import { Announcements } from './announcements';
import { TeachersOverview } from './teachers-overview';
import { TeachersAttendance } from './teachers-attendance';
import { TeachersPerformance } from './teachers-performance';
import { TeachersOnLeave } from './teachers-on-leave';
import { TeachersAnnouncements } from './teachers-announcements';

interface DashboardBranchData {
  totalStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  studentStats: {
    totalStudents: number;
    newAdmissions: number;
    dropouts: number;
    boys: number;
    girls: number;
  };
  studentAttendance: {
    presentToday: number;
    absentToday: number;
    lateToday: number;
  };
  studentsOnLeave: any[];
  generalAnnouncements: any[];
  performanceStats: {
    averagePercentage: number;
    grade: string;
  };
  teachersOnLeaveCount: number;
  teacherAttendance: {
    presentToday: number;
    absentToday: number;
    lateToday: number;
  };
  topTeachersList: any[];
  detailedTeachersOnLeave: any[];
  staffAnnouncements: any[];
}

interface DashboardClientProps {
  preloadedDataMap: Record<string, DashboardBranchData>;
}

export function DashboardClient({ preloadedDataMap }: DashboardClientProps) {
  const { selectedBranchId } = useBranch();

  // Get data for selected branch, fall back to 'all' or default values
  const currentData = preloadedDataMap[selectedBranchId] || preloadedDataMap['all'] || {
    totalStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    studentStats: { totalStudents: 0, newAdmissions: 0, dropouts: 0, boys: 0, girls: 0 },
    studentAttendance: { presentToday: 0, absentToday: 0, lateToday: 0 },
    studentsOnLeave: [],
    generalAnnouncements: [],
    performanceStats: { averagePercentage: 85, grade: 'Excellent' },
    teachersOnLeaveCount: 0,
    teacherAttendance: { presentToday: 0, absentToday: 0, lateToday: 0 },
    topTeachersList: [],
    detailedTeachersOnLeave: [],
    staffAnnouncements: []
  };

  return (
    <div className="flex-1 space-y-3">
      <Tabs defaultValue="students" className="space-y-3">
        <div className="relative px-6 overflow-hidden pt-4">
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="mb-3">
                <h2 className="text-xl font-bold">Welcome Back,</h2>
                <p className="text-xs">Here&apos;s your updated overview</p>
              </div>
              <TabsList className="border border-slate-700 h-8">
                <TabsTrigger value="students" className="text-xs px-3">Students</TabsTrigger>
                <TabsTrigger value="teachers" className="text-xs px-3">Teachers</TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="students" className="space-y-3 px-4 md:px-6 mt-[-80px] z-10 pb-[150px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              <StudentsOverview
                totalStudents={currentData.studentStats.totalStudents}
                newAdmissions={currentData.studentStats.newAdmissions}
                dropouts={currentData.studentStats.dropouts}
                boys={currentData.studentStats.boys}
                girls={currentData.studentStats.girls}
              />
              <OverallAttendance
                present={currentData.studentAttendance.presentToday}
                absent={currentData.studentAttendance.absentToday}
                late={currentData.studentAttendance.lateToday}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Performance
                  boys={currentData.studentStats.boys}
                  girls={currentData.studentStats.girls}
                  averagePercentage={currentData.performanceStats.averagePercentage}
                  grade={currentData.performanceStats.grade}
                />
                <DashboardCalendar />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-3">
              <OnLeave onLeaveStaff={currentData.studentsOnLeave} />
              <Announcements announcementsList={currentData.generalAnnouncements} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="teachers" className="space-y-3 px-4 md:px-6 mt-[-80px] z-10 pb-[150px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              <TeachersOverview
                totalTeachers={currentData.totalTeachers}
                activeTeachers={currentData.activeTeachers}
                onLeave={currentData.teachersOnLeaveCount}
                fullTime={currentData.totalTeachers}
                partTime={0}
              />
              <TeachersAttendance
                present={currentData.teacherAttendance.presentToday}
                absent={currentData.teacherAttendance.absentToday}
                late={currentData.teacherAttendance.lateToday}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TeachersPerformance performanceDataList={currentData.topTeachersList} />
                <DashboardCalendar />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-3">
              <TeachersOnLeave teachersOnLeaveList={currentData.detailedTeachersOnLeave} />
              <TeachersAnnouncements announcementsList={currentData.staffAnnouncements} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
