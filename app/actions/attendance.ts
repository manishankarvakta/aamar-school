'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { AttendanceStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Helper to convert Date object to YYYY-MM-DD string at local time
const formatDateLocal = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

// Get start and end of day in UTC for querying
const getDayRange = (dateStr: string) => {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
};

// Map database status to UI status
const mapDbToUiStatus = (status?: AttendanceStatus): string => {
  if (!status) return 'Present'; // Default status if not marked
  switch (status) {
    case 'PRESENT': return 'Present';
    case 'ABSENT': return 'Absent';
    case 'LATE': return 'Late';
    case 'EXCUSED': return 'Excused';
    default: return 'Present';
  }
};

// Map UI status to database status
const mapUiToDbStatus = (status: string): AttendanceStatus => {
  switch (status) {
    case 'Present': return 'PRESENT';
    case 'Absent': return 'ABSENT';
    case 'Late': return 'LATE';
    case 'Excused': return 'EXCUSED';
    default: return 'PRESENT';
  }
};

// Fetch dynamic filter options (classes, sections)
export async function getAttendanceFilters(branchId?: string) {
  try {
    const session = await requireAuth();

    const classes = await prisma.class.findMany({
      where: {
        aamarId: session.aamarId,
        ...(branchId && branchId !== 'all' ? { branchId } : {}),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const sections = await prisma.section.findMany({
      where: {
        aamarId: session.aamarId,
        ...(branchId && branchId !== 'all' ? { class: { branchId } } : {}),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // Remove duplicates from section names (e.g. if multiple classes have section "A")
    const uniqueSectionNames = Array.from(new Set(sections.map((s) => s.name))).sort();

    return {
      success: true,
      classes: ['All Classes', ...classes.map((c) => c.name)],
      sections: ['All Sections', ...uniqueSectionNames],
    };
  } catch (error) {
    console.error('Error fetching attendance filters:', error);
    return {
      success: false,
      classes: ['All Classes'],
      sections: ['All Sections'],
    };
  }
}

// Fetch attendance stats for a date
export async function getAttendanceStats(dateStr: string, branchId?: string) {
  try {
    const session = await requireAuth();
    const { start, end } = getDayRange(dateStr);

    const baseWhereStudent = branchId ? { user: { branchId } } : {};

    // Get total student count
    const totalStudents = await prisma.student.count({
      where: { aamarId: session.aamarId, ...baseWhereStudent },
    });

    // Get today's attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        student: branchId ? { user: { branchId } } : { isNot: null },
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length;

    // Unmarked are assumed present by default in the system, or we can count marked ones
    // Present Today = Present + Late + (Total - Marked)
    const markedCount = attendanceRecords.length;
    const actualPresent = presentCount + (totalStudents - markedCount);

    // Calculate monthly average attendance rate
    const oneMonthAgo = new Date(new Date(dateStr).getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthRecords = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        student: branchId ? { user: { branchId } } : { isNot: null },
        date: {
          gte: oneMonthAgo,
          lte: end,
        },
      },
    });

    // Total possible attendance checks in the month = totalStudents * number of distinct dates
    const distinctDates = Array.from(new Set(monthRecords.map(r => formatDateLocal(r.date))));
    const daysCount = distinctDates.length || 1;
    const totalPossible = totalStudents * daysCount;
    const totalAbsents = monthRecords.filter(r => r.status === 'ABSENT').length;
    const averageAttendance = totalPossible > 0 
      ? Math.round(((totalPossible - totalAbsents) / totalPossible) * 100) 
      : 100;

    return {
      success: true,
      stats: {
        presentToday: actualPresent,
        absentToday: absentCount,
        lateToday: lateCount,
        averageAttendance: `${averageAttendance}%`,
      },
    };
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return {
      success: false,
      stats: {
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        averageAttendance: '100%',
      },
    };
  }
}

// Fetch student list with attendance status
export async function getStudentsAttendanceList(dateStr: string, branchId?: string) {
  try {
    const session = await requireAuth();
    const { start, end } = getDayRange(dateStr);

    // Fetch all students for the school
    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
        ...(branchId && branchId !== 'all' ? { user: { branchId } } : {}),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        class: true,
        section: true,
      },
      orderBy: {
        rollNumber: 'asc',
      },
    });

    const studentWhereFilter = branchId && branchId !== 'all' ? { student: { user: { branchId } } } : {};

    // Fetch attendance for these students on today's date
    const todayAttendance = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        studentId: { not: null },
        ...studentWhereFilter,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Fetch all attendance for this month to calculate statistics
    const startOfMonth = new Date(new Date(dateStr).getFullYear(), new Date(dateStr).getMonth(), 1);
    const monthAttendance = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        studentId: { not: null },
        ...studentWhereFilter,
        date: {
          gte: startOfMonth,
          lte: end,
        },
      },
    });

    // Fetch all attendance for this week to calculate weekly stats
    const startOfWeek = new Date(new Date(dateStr).getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAttendance = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        studentId: { not: null },
        ...studentWhereFilter,
        date: {
          gte: startOfWeek,
          lte: end,
        },
      },
    });

    const formattedStudents = students.map((student) => {
      const todayRecord = todayAttendance.find((r) => r.studentId === student.id);
      const studentWeekRecords = weekAttendance.filter((r) => r.studentId === student.id);
      const studentMonthRecords = monthAttendance.filter((r) => r.studentId === student.id);

      // Weekly stats
      const weekPresent = studentWeekRecords.filter((r) => r.status === 'PRESENT').length;
      const weekAbsent = studentWeekRecords.filter((r) => r.status === 'ABSENT').length;
      const weekLate = studentWeekRecords.filter((r) => r.status === 'LATE').length;

      // Unmarked days in the database are assumed Present
      const totalWeekDays = 5; // standard school week
      const markedWeekDays = studentWeekRecords.length;
      const actualWeekPresent = weekPresent + Math.max(0, totalWeekDays - markedWeekDays);

      // Monthly stats
      const monthPresent = studentMonthRecords.filter((r) => r.status === 'PRESENT').length;
      const monthAbsent = studentMonthRecords.filter((r) => r.status === 'ABSENT').length;
      const monthLate = studentMonthRecords.filter((r) => r.status === 'LATE').length;
      const monthTotalMarked = studentMonthRecords.length;

      // Attendance percentage
      const distinctMonthDates = Array.from(new Set(monthAttendance.map(r => formatDateLocal(r.date)))).length || 1;
      const possibleDays = Math.max(1, distinctMonthDates);
      const actualMonthPresent = monthPresent + monthLate + Math.max(0, possibleDays - monthTotalMarked);
      const percentage = Math.round((actualMonthPresent / possibleDays) * 1000) / 10;

      // Find last absent date
      const allStudentRecords = studentMonthRecords.filter((r) => r.status === 'ABSENT');
      const lastAbsent = allStudentRecords.length > 0 
        ? formatDateLocal(new Date(Math.max(...allStudentRecords.map(r => r.date.getTime()))))
        : null;

      return {
        id: student.id,
        studentId: `STD${student.id.slice(-6).toUpperCase()}`,
        name: `${student.user.firstName} ${student.user.lastName}`,
        class: student.class.name,
        section: student.section.name,
        rollNo: student.rollNumber,
        photo: student.user.profile?.avatar || '/api/placeholder/40/40',
        today: mapDbToUiStatus(todayRecord?.status),
        thisWeek: {
          present: actualWeekPresent,
          absent: weekAbsent,
          late: weekLate,
        },
        thisMonth: {
          present: actualMonthPresent,
          absent: monthAbsent,
          late: monthLate,
          percentage: Math.min(100, percentage),
        },
        parentContact: student.user.profile?.phone || '',
        lastAbsent: lastAbsent,
      };
    });

    return {
      success: true,
      data: formattedStudents,
    };
  } catch (error) {
    console.error('Error fetching students attendance:', error);
    return {
      success: false,
      data: [],
    };
  }
}

// Fetch staff (teacher) list with attendance status
export async function getStaffAttendanceList(dateStr: string, branchId?: string) {
  try {
    const session = await requireAuth();
    const { start, end } = getDayRange(dateStr);

    const teachers = await prisma.teacher.findMany({
      where: {
        aamarId: session.aamarId,
        ...(branchId && branchId !== 'all' ? { user: { branchId } } : {}),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    const teacherWhereFilter = branchId && branchId !== 'all' ? { teacher: { user: { branchId } } } : {};

    const todayAttendance = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        teacherId: { not: null },
        ...teacherWhereFilter,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const startOfMonth = new Date(new Date(dateStr).getFullYear(), new Date(dateStr).getMonth(), 1);
    const monthAttendance = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        teacherId: { not: null },
        ...teacherWhereFilter,
        date: {
          gte: startOfMonth,
          lte: end,
        },
      },
    });

    const formattedStaff = teachers.map((teacher) => {
      const todayRecord = todayAttendance.find((r) => r.teacherId === teacher.id);
      const teacherMonthRecords = monthAttendance.filter((r) => r.teacherId === teacher.id);

      const monthPresent = teacherMonthRecords.filter((r) => r.status === 'PRESENT').length;
      const monthLate = teacherMonthRecords.filter((r) => r.status === 'LATE').length;
      const monthAbsent = teacherMonthRecords.filter((r) => r.status === 'ABSENT').length;
      const monthTotalMarked = teacherMonthRecords.length;

      const distinctMonthDates = Array.from(new Set(monthAttendance.map(r => formatDateLocal(r.date)))).length || 1;
      const possibleDays = Math.max(1, distinctMonthDates);
      const actualMonthPresent = monthPresent + monthLate + Math.max(0, possibleDays - monthTotalMarked);
      const percentage = Math.round((actualMonthPresent / possibleDays) * 1000) / 10;

      return {
        id: teacher.id,
        employeeId: `EMP${teacher.id.slice(-6).toUpperCase()}`,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        department: teacher.specialization || 'General',
        today: mapDbToUiStatus(todayRecord?.status),
        checkIn: todayRecord?.status === 'PRESENT' || todayRecord?.status === 'LATE' 
          ? (todayRecord?.status === 'LATE' ? '09:15 AM' : '08:30 AM') 
          : (todayRecord?.status === 'ABSENT' ? 'N/A' : '08:30 AM'), // assume default present has checkIn
        checkOut: null,
        thisMonth: {
          present: actualMonthPresent,
          absent: monthAbsent,
          late: monthLate,
          percentage: Math.min(100, percentage),
        },
        photo: teacher.user.profile?.avatar || '/api/placeholder/40/40',
      };
    });

    return {
      success: true,
      data: formattedStaff,
    };
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    return {
      success: false,
      data: [],
    };
  }
}

// Mark student attendance
export async function markStudentAttendance(studentId: string, dateStr: string, status: string) {
  try {
    const session = await requireAuth();
    const targetDate = new Date(`${dateStr}T12:00:00.000Z`); // set mid-day to avoid timezone shifting

    const dbStatus = mapUiToDbStatus(status);

    // Look for existing attendance record
    const existing = await prisma.attendance.findFirst({
      where: {
        aamarId: session.aamarId,
        studentId: studentId,
        date: {
          gte: new Date(`${dateStr}T00:00:00.000Z`),
          lte: new Date(`${dateStr}T23:59:59.999Z`),
        },
      },
    });

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: dbStatus },
      });
    } else {
      await prisma.attendance.create({
        data: {
          aamarId: session.aamarId,
          studentId: studentId,
          date: targetDate,
          status: dbStatus,
        },
      });
    }

    revalidatePath('/dashboard/attendance');
    return { success: true, message: `Attendance marked as ${status}` };
  } catch (error) {
    console.error('Error marking student attendance:', error);
    return { success: false, message: 'Failed to mark attendance' };
  }
}

// Mark staff/teacher attendance
export async function markStaffAttendance(teacherId: string, dateStr: string, status: string) {
  try {
    const session = await requireAuth();
    const targetDate = new Date(`${dateStr}T12:00:00.000Z`);

    const dbStatus = mapUiToDbStatus(status);

    const existing = await prisma.attendance.findFirst({
      where: {
        aamarId: session.aamarId,
        teacherId: teacherId,
        date: {
          gte: new Date(`${dateStr}T00:00:00.000Z`),
          lte: new Date(`${dateStr}T23:59:59.999Z`),
        },
      },
    });

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: dbStatus },
      });
    } else {
      await prisma.attendance.create({
        data: {
          aamarId: session.aamarId,
          teacherId: teacherId,
          date: targetDate,
          status: dbStatus,
        },
      });
    }

    revalidatePath('/dashboard/attendance');
    return { success: true, message: `Staff attendance marked as ${status}` };
  } catch (error) {
    console.error('Error marking staff attendance:', error);
    return { success: false, message: 'Failed to mark staff attendance' };
  }
}

// Quick Bulk Mark Attendance
export async function quickBulkMarkAttendance(
  className: string,
  sectionName: string,
  dateStr: string,
  action: 'MARK_ALL_PRESENT' | 'MARK_SELECTED_ABSENT',
  studentIds?: string[]
) {
  try {
    const session = await requireAuth();
    const targetDate = new Date(`${dateStr}T12:00:00.000Z`);

    // Fetch students of the class and section
    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
        class: className !== 'All Classes' ? { name: className } : undefined,
        section: sectionName !== 'All Sections' ? { name: sectionName } : undefined,
      },
      select: { id: true },
    });

    const targetStudents = students.map((s) => s.id);
    const affectedIds = action === 'MARK_SELECTED_ABSENT' && studentIds 
      ? studentIds.filter(id => targetStudents.includes(id))
      : targetStudents;

    const dbStatus = action === 'MARK_ALL_PRESENT' ? 'PRESENT' : 'ABSENT';

    for (const studentId of affectedIds) {
      const existing = await prisma.attendance.findFirst({
        where: {
          aamarId: session.aamarId,
          studentId: studentId,
          date: {
            gte: new Date(`${dateStr}T00:00:00.000Z`),
            lte: new Date(`${dateStr}T23:59:59.999Z`),
          },
        },
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status: dbStatus },
        });
      } else {
        await prisma.attendance.create({
          data: {
            aamarId: session.aamarId,
            studentId: studentId,
            date: targetDate,
            status: dbStatus,
          },
        });
      }
    }

    revalidatePath('/dashboard/attendance');
    return { success: true, message: `Successfully updated attendance for ${affectedIds.length} students.` };
  } catch (error) {
    console.error('Error in quick bulk marking:', error);
    return { success: false, message: 'Failed to bulk mark attendance' };
  }
}

// Fetch teacher attendance stats for a date
export async function getTeacherAttendanceStats(dateStr: string, branchId?: string) {
  try {
    const session = await requireAuth();
    const { start, end } = getDayRange(dateStr);

    const baseWhereTeacher = branchId ? { user: { branchId } } : {};

    // Get total teacher count
    const totalTeachers = await prisma.teacher.count({
      where: { aamarId: session.aamarId, ...baseWhereTeacher },
    });

    // Get today's attendance records for teachers
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        teacher: branchId ? { user: { branchId } } : { isNot: null },
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length;

    // Unmarked are assumed present by default
    const markedCount = attendanceRecords.length;
    const actualPresent = presentCount + (totalTeachers - markedCount);

    return {
      success: true,
      stats: {
        presentToday: actualPresent,
        absentToday: absentCount,
        lateToday: lateCount,
      },
    };
  } catch (error) {
    console.error('Error fetching teacher attendance stats:', error);
    return {
      success: false,
      stats: {
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
      },
    };
  }
}

// Fetch list of students on leave today
export async function getStudentsOnLeaveToday(branchId?: string) {
  try {
    const session = await requireAuth();
    const todayStr = formatDateLocal(new Date());
    const { start, end } = getDayRange(todayStr);

    const leaves = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        status: 'EXCUSED',
        student: branchId ? { user: { branchId } } : { isNot: null },
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      success: true,
      data: leaves.map((l) => ({
        name: l.student ? `${l.student.user.firstName} ${l.student.user.lastName}` : 'Student',
        initials: l.student ? `${l.student.user.firstName[0] || ''}${l.student.user.lastName[0] || ''}` : 'S',
        image: l.student?.user.id ? `/avatars/${l.student.user.id}.png` : '',
      })),
    };
  } catch (error) {
    console.error('Error fetching students on leave:', error);
    return {
      success: false,
      data: [],
    };
  }
}

// Fetch list of teachers on leave today (avatar format)
export async function getTeachersOnLeaveToday(branchId?: string) {
  try {
    const session = await requireAuth();
    const todayStr = formatDateLocal(new Date());
    const { start, end } = getDayRange(todayStr);

    const leaves = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        status: 'EXCUSED',
        teacher: branchId ? { user: { branchId } } : { isNot: null },
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      success: true,
      data: leaves.map((l) => ({
        name: l.teacher ? `${l.teacher.user.firstName} ${l.teacher.user.lastName}` : 'Teacher',
        initials: l.teacher ? `${l.teacher.user.firstName[0] || ''}${l.teacher.user.lastName[0] || ''}` : 'T',
        image: l.teacher?.user.id ? `/avatars/${l.teacher.user.id}.png` : '',
      })),
    };
  } catch (error) {
    console.error('Error fetching teachers on leave:', error);
    return {
      success: false,
      data: [],
    };
  }
}

// Fetch detailed list of teachers on leave for list view
export async function getDetailedTeachersOnLeave(branchId?: string) {
  try {
    const session = await requireAuth();
    const todayStr = formatDateLocal(new Date());
    const { start, end } = getDayRange(todayStr);

    const leaves = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        status: 'EXCUSED',
        teacher: branchId ? { user: { branchId } } : { isNot: null },
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      success: true,
      data: leaves.map((l) => ({
        name: l.teacher ? `${l.teacher.user.firstName} ${l.teacher.user.lastName}` : 'Teacher',
        department: l.teacher?.specialization || 'General',
        leaveType: 'Excused Absent',
        duration: '1 day',
        startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        endDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Approved',
      })),
    };
  } catch (error) {
    console.error('Error fetching detailed teachers on leave:', error);
    return {
      success: false,
      data: [],
    };
  }
}

