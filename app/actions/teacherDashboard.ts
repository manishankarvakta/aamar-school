'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { AudienceType } from '@prisma/client';

export async function getTeacherDashboardData() {
  try {
    const session = await requireAuth();

    if (session.role !== 'TEACHER') {
      return { success: false, error: 'Unauthorized. Only teachers can access this data.' };
    }

    // 1. Fetch Teacher profile details
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          include: {
            profile: true,
            branch: true,
          },
        },
        classes: {
          include: {
            students: true,
          },
        },
      },
    });

    if (!teacher) {
      return { success: false, error: 'Teacher profile not found.' };
    }

    // 2. Fetch announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        aamarId: session.aamarId,
        audience: {
          hasSome: [AudienceType.TEACHER, AudienceType.ALL],
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
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 3. Fetch routine slots for the teacher
    const routineSlots = await prisma.routineSlot.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        subject: true,
        classRoutine: {
          include: {
            class: true,
          },
        },
      },
    });

    // Format routine slots
    const formattedSlots = routineSlots.map((slot) => ({
      id: slot.id,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      classType: slot.classType,
      subjectName: slot.subject?.name || 'N/A',
      className: slot.classRoutine?.class?.name || 'N/A',
    }));

    // Calculate unique students count across all classes assigned to this teacher
    const uniqueStudentIds = new Set<string>();
    teacher.classes.forEach((cls) => {
      cls.students.forEach((stu) => {
        uniqueStudentIds.add(stu.id);
      });
    });

    return {
      success: true,
      data: {
        profile: {
          id: teacher.id,
          employeeId: teacher.id.substring(0, 8).toUpperCase(), // fallback employee id
          firstName: teacher.user.firstName,
          lastName: teacher.user.lastName,
          email: teacher.user.email,
          phone: teacher.user.profile?.phone || 'N/A',
          address: teacher.user.profile?.address || 'N/A',
          dateOfBirth: teacher.user.profile?.dateOfBirth,
          gender: teacher.user.profile?.gender,
          bloodGroup: teacher.user.profile?.bloodGroup || 'N/A',
          qualification: teacher.qualification,
          experience: teacher.experience,
          specialization: teacher.specialization || 'N/A',
          joiningDate: teacher.joiningDate,
          branchName: teacher.user.branch?.name || 'N/A',
        },
        routine: {
          slots: formattedSlots,
        },
        classesCount: teacher.classes.length,
        studentsCount: uniqueStudentIds.size,
        announcements: announcements.map((ann) => ({
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
    console.error('Error fetching teacher dashboard data:', error);
    return { success: false, error: 'Failed to fetch dashboard data. Please try again.' };
  }
}
