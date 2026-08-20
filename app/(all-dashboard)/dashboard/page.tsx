import { getSubjects, getSubjectStats } from "@/app/actions/subjects";
import { getTeacherStats, getTopTeachers } from "@/app/actions/teachers";
import { getStudentStats } from "@/app/actions/students";
import {
  getAttendanceStats,
  getTeacherAttendanceStats,
  getStudentsOnLeaveToday,
  getTeachersOnLeaveToday,
  getDetailedTeachersOnLeave,
} from "@/app/actions/attendance";
import { getPerformanceStats } from "@/app/actions/exams";
import { getAnnouncements, getTeacherAnnouncements } from "@/app/actions/announcements";
import { DashboardClient } from "./_components/dashboard/dashboard-client";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const todayStr = new Date().toISOString().split("T")[0];

  const session = await requireAuth();

  // Get all branches for this organization
  const branches = await prisma.branch.findMany({
    where: { aamarId: session.aamarId },
    select: { id: true }
  });

  const branchIds = ['all', ...branches.map((b) => b.id)];

  // Fetch all dashboard data for all branches in parallel
  const preloadedDataPromises = branchIds.map(async (branchId) => {
    const branchIdParam = branchId === 'all' ? undefined : branchId;

    const [
      subjectsResult,
      subjectStatsResult,
      teacherStatsResult,
      studentStatsResult,
      studentAttendanceStatsResult,
      teacherAttendanceStatsResult,
      studentsOnLeaveResult,
      teachersOnLeaveResult,
      detailedTeachersOnLeaveResult,
      performanceStatsResult,
      topTeachersResult,
      announcementsResult,
      teacherAnnouncementsResult,
    ] = await Promise.all([
      getSubjects(branchIdParam),
      getSubjectStats(branchIdParam),
      getTeacherStats(branchIdParam),
      getStudentStats(branchIdParam),
      getAttendanceStats(todayStr, branchIdParam),
      getTeacherAttendanceStats(todayStr, branchIdParam),
      getStudentsOnLeaveToday(branchIdParam),
      getTeachersOnLeaveToday(branchIdParam),
      getDetailedTeachersOnLeave(branchIdParam),
      getPerformanceStats(branchIdParam),
      getTopTeachers(branchIdParam),
      getAnnouncements(branchIdParam),
      getTeacherAnnouncements(branchIdParam),
    ]);

    // Extract data safely
    const totalStudents = subjectsResult.success && subjectsResult.data
      ? subjectsResult.data.reduce((sum: number, s: any) => sum + (s.class?.studentCount || 0), 0)
      : 0;
    
    const totalTeachers = teacherStatsResult.success && teacherStatsResult.data && typeof teacherStatsResult.data === 'object' && 'totalTeachers' in teacherStatsResult.data
      ? teacherStatsResult.data.totalTeachers
      : 0;
    
    const activeTeachers = teacherStatsResult.success && teacherStatsResult.data && typeof teacherStatsResult.data === 'object' && 'activeTeachers' in teacherStatsResult.data
      ? teacherStatsResult.data.activeTeachers
      : 0;

    const studentStats = studentStatsResult.success && studentStatsResult.data
      ? {
          totalStudents: studentStatsResult.data.totalStudents,
          newAdmissions: studentStatsResult.data.recentAdmissions,
          dropouts: 0,
          boys: studentStatsResult.data.maleStudents,
          girls: studentStatsResult.data.femaleStudents,
        }
      : { totalStudents: totalStudents || 0, newAdmissions: 0, dropouts: 0, boys: 0, girls: 0 };

    const studentAttendance = studentAttendanceStatsResult.success
      ? studentAttendanceStatsResult.stats
      : { presentToday: 0, absentToday: 0, lateToday: 0 };

    const studentsOnLeave = studentsOnLeaveResult.success && studentsOnLeaveResult.data ? studentsOnLeaveResult.data : [];
    const generalAnnouncements = announcementsResult.success && announcementsResult.data ? announcementsResult.data : [];

    const performanceStats = performanceStatsResult.success && performanceStatsResult.data
      ? performanceStatsResult.data
      : { averagePercentage: 85, grade: "Excellent" };

    const teachersOnLeaveCount = teachersOnLeaveResult.success && teachersOnLeaveResult.data ? teachersOnLeaveResult.data.length : 0;
    
    const teacherAttendance = teacherAttendanceStatsResult.success
      ? teacherAttendanceStatsResult.stats
      : { presentToday: 0, absentToday: 0, lateToday: 0 };

    const topTeachersList = topTeachersResult.success && topTeachersResult.data ? topTeachersResult.data : [];
    const detailedTeachersOnLeave = detailedTeachersOnLeaveResult.success && detailedTeachersOnLeaveResult.data ? detailedTeachersOnLeaveResult.data : [];
    const staffAnnouncements = teacherAnnouncementsResult.success && teacherAnnouncementsResult.data ? teacherAnnouncementsResult.data : [];

    return {
      branchId,
      data: {
        totalStudents,
        totalTeachers,
        activeTeachers,
        studentStats,
        studentAttendance,
        studentsOnLeave,
        generalAnnouncements,
        performanceStats,
        teachersOnLeaveCount,
        teacherAttendance,
        topTeachersList,
        detailedTeachersOnLeave,
        staffAnnouncements,
      }
    };
  });

  const resolvedPreloadedData = await Promise.all(preloadedDataPromises);
  const preloadedDataMap: Record<string, any> = {};
  resolvedPreloadedData.forEach((item) => {
    preloadedDataMap[item.branchId] = item.data;
  });

  return <DashboardClient preloadedDataMap={preloadedDataMap} />;
}
