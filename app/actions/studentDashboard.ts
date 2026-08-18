'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { AudienceType, AttendanceStatus, PaymentStatus } from '@prisma/client';

export async function getStudentDashboardData() {
  try {
    const session = await requireAuth();

    if (session.role !== 'STUDENT') {
      return { success: false, error: 'Unauthorized role' };
    }

    // 1. Fetch student info linked to logged-in user ID
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        class: true,
        section: true,
      },
    });

    if (!student) {
      return { success: false, error: 'Student profile not found' };
    }

    // 2. Fetch Class Routine
    const routine = await prisma.classRoutine.findFirst({
      where: {
        classId: student.classId,
        aamarId: session.aamarId,
      },
      include: {
        slots: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3. Fetch Exam Results
    const examResults = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
        aamarId: session.aamarId,
      },
      include: {
        exam: true,
        subject: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 4. Fetch Attendance Summary
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        aamarId: session.aamarId,
      },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendanceRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const lateDays = attendanceRecords.filter(r => r.status === AttendanceStatus.LATE).length;
    const excusedDays = attendanceRecords.filter(r => r.status === AttendanceStatus.EXCUSED).length;
    const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays + excusedDays) / totalDays) * 100) : 100;

    // 5. Fetch Student specific fees
    const fees = await prisma.fee.findMany({
      where: {
        studentId: student.id,
        aamarId: session.aamarId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const totalDue = fees
      .filter(f => f.status === PaymentStatus.PENDING || f.status === PaymentStatus.OVERDUE)
      .reduce((sum, f) => sum + f.amount + (f.lateFee || 0), 0);

    // 6. Fetch School Announcements matching STUDENT or ALL
    const announcements = await prisma.announcement.findMany({
      where: {
        aamarId: session.aamarId,
        audience: {
          hasSome: [AudienceType.STUDENT, AudienceType.ALL],
        },
        visibleFrom: {
          lte: new Date(),
        },
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return {
      success: true,
      data: {
        profile: {
          id: student.id,
          rollNumber: student.rollNumber,
          admissionDate: student.admissionDate,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          email: student.user.email,
          phone: student.user.profile?.phone ?? 'N/A',
          address: student.user.profile?.address ?? 'N/A',
          dateOfBirth: student.user.profile?.dateOfBirth,
          gender: student.user.profile?.gender,
          bloodGroup: student.user.profile?.bloodGroup ?? 'N/A',
          nationality: student.user.profile?.nationality ?? 'Bangladeshi',
          religion: student.user.profile?.religion ?? 'Islam',
          className: student.class.name,
          sectionName: student.section.name,
        },
        routine: routine
          ? {
              id: routine.id,
              academicYear: routine.academicYear,
              slots: routine.slots.map(slot => ({
                id: slot.id,
                day: slot.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                classType: slot.classType,
                subjectName: slot.subject?.name ?? 'N/A',
                teacherName: slot.teacher 
                  ? `${slot.teacher.user.firstName} ${slot.teacher.user.lastName}` 
                  : 'N/A',
              })),
            }
          : null,
        examResults: examResults.map(res => ({
          id: res.id,
          examName: res.exam.name,
          subjectName: res.subject.name,
          obtainedMarks: res.obtainedMarks,
          fullMarks: res.fullMarks,
          grade: res.grade,
          remarks: res.remarks ?? 'N/A',
        })),
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          excusedDays,
          attendanceRate,
          records: attendanceRecords.map(r => ({
            id: r.id,
            date: r.date,
            status: r.status,
            remarks: r.remarks,
          })),
        },
        fees: fees.map(f => ({
          id: f.id,
          title: f.title,
          feeType: f.feeType,
          amount: f.amount,
          lateFee: f.lateFee ?? 0,
          dueDate: f.dueDate,
          status: f.status,
        })),
        totalDue,
        announcements: announcements.map(ann => ({
          id: ann.id,
          title: ann.title,
          message: ann.message,
          type: ann.announcementType,
          createdAt: ann.createdAt,
          author: `${ann.createdBy.firstName} ${ann.createdBy.lastName}`,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    return { success: false, error: 'Internal server error occurred' };
  }
}

export async function getParentDashboardData() {
  try {
    const session = await requireAuth();

    if (session.role !== 'PARENT') {
      return { success: false, error: 'Unauthorized role' };
    }

    // Find Parent record
    const parent = await prisma.parent.findUnique({
      where: { userId: session.userId },
      include: {
        user: true,
      },
    });

    if (!parent) {
      return { success: false, error: 'Parent profile not found' };
    }

    // Fetch children linked to this parent
    const students = await prisma.student.findMany({
      where: {
        parentId: parent.id,
        aamarId: session.aamarId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        class: true,
        section: true,
        attendance: true,
        examResults: {
          include: {
            exam: true,
            subject: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        fees: {
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });

    const announcements = await prisma.announcement.findMany({
      where: {
        aamarId: session.aamarId,
        audience: {
          hasSome: [AudienceType.PARENT, AudienceType.ALL],
        },
        visibleFrom: {
          lte: new Date(),
        },
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const childrenData = await Promise.all(
      students.map(async (student) => {
        const routine = await prisma.classRoutine.findFirst({
          where: {
            classId: student.classId,
            aamarId: session.aamarId,
          },
          include: {
            slots: {
              include: {
                subject: true,
                teacher: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const totalDays = student.attendance.length;
        const presentDays = student.attendance.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const absentDays = student.attendance.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const lateDays = student.attendance.filter(r => r.status === AttendanceStatus.LATE).length;
        const excusedDays = student.attendance.filter(r => r.status === AttendanceStatus.EXCUSED).length;
        const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays + excusedDays) / totalDays) * 100) : 100;

        const totalDue = student.fees
          .filter(f => f.status === PaymentStatus.PENDING || f.status === PaymentStatus.OVERDUE)
          .reduce((sum, f) => sum + f.amount + (f.lateFee || 0), 0);

        return {
          profile: {
            id: student.id,
            rollNumber: student.rollNumber,
            firstName: student.user.firstName,
            lastName: student.user.lastName,
            email: student.user.email,
            className: student.class.name,
            sectionName: student.section.name,
            gender: student.user.profile?.gender,
            bloodGroup: student.user.profile?.bloodGroup ?? 'N/A',
            phone: student.user.profile?.phone ?? 'N/A',
          },
          attendance: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            excusedDays,
            attendanceRate,
            records: student.attendance.map(r => ({
              id: r.id,
              date: r.date,
              status: r.status,
              remarks: r.remarks,
            })),
          },
          examResults: student.examResults.map(res => ({
            id: res.id,
            examName: res.exam.name,
            subjectName: res.subject.name,
            obtainedMarks: res.obtainedMarks,
            fullMarks: res.fullMarks,
            grade: res.grade,
            remarks: res.remarks ?? 'N/A',
          })),
          fees: student.fees.map(f => ({
            id: f.id,
            title: f.title,
            feeType: f.feeType,
            amount: f.amount,
            lateFee: f.lateFee ?? 0,
            dueDate: f.dueDate,
            status: f.status,
          })),
          totalDue,
          routine: routine
            ? {
                slots: routine.slots.map(slot => ({
                  id: slot.id,
                  day: slot.day,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  classType: slot.classType,
                  subjectName: slot.subject?.name ?? 'N/A',
                  teacherName: slot.teacher 
                    ? `${slot.teacher.user.firstName} ${slot.teacher.user.lastName}` 
                    : 'N/A',
                })),
              }
            : null,
        };
      })
    );

    return {
      success: true,
      data: {
        parent: {
          firstName: parent.user.firstName,
          lastName: parent.user.lastName,
          email: parent.user.email,
        },
        children: childrenData,
        announcements: announcements.map(ann => ({
          id: ann.id,
          title: ann.title,
          message: ann.message,
          type: ann.announcementType,
          createdAt: ann.createdAt,
          author: `${ann.createdBy.firstName} ${ann.createdBy.lastName}`,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching parent dashboard data:', error);
    return { success: false, error: 'Internal server error occurred' };
  }
}
