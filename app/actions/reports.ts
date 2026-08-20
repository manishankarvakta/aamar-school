'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getTeacherReportsData() {
  try {
    const session = await requireAuth();

    if (session.role !== 'TEACHER') {
      return { success: false, error: 'Unauthorized. Only teachers can access this data.' };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
      include: {
        classes: {
          include: {
            students: {
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

    if (!teacher) {
      return { success: false, error: 'Teacher profile not found.' };
    }

    // Collect all students from teacher's classes
    const studentsList = teacher.classes.flatMap((cls) =>
      cls.students.map((student) => ({
        id: student.id,
        rollNumber: student.rollNumber,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        className: cls.name,
      }))
    );

    // Fetch reports submitted by this teacher
    const reports = await prisma.report.findMany({
      where: {
        teacherId: teacher.id,
        aamarId: session.aamarId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        students: studentsList,
        reports: reports.map((rep) => ({
          id: rep.id,
          title: rep.title,
          description: rep.description,
          category: rep.category,
          createdAt: rep.createdAt,
          studentName: `${rep.student.user.firstName} ${rep.student.user.lastName}`,
          className: rep.student.class.name,
          rollNumber: rep.student.rollNumber,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching teacher reports data:', error);
    return { success: false, error: 'Failed to fetch reports data.' };
  }
}

export async function createReport(data: {
  title: string;
  description: string;
  category: string;
  studentId: string;
}) {
  try {
    const session = await requireAuth();

    if (session.role !== 'TEACHER') {
      return { success: false, error: 'Unauthorized. Only teachers can create reports.' };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
    });

    if (!teacher) {
      return { success: false, error: 'Teacher profile not found.' };
    }

    const newReport = await prisma.report.create({
      data: {
        aamarId: session.aamarId,
        title: data.title,
        description: data.description,
        category: data.category,
        studentId: data.studentId,
        teacherId: teacher.id,
      },
    });

    revalidatePath('/dashboard/teacher-dashboard/reports');
    revalidatePath('/dashboard/parent-dashboard/reports');

    return { success: true, data: newReport };
  } catch (error) {
    console.error('Error creating report:', error);
    return { success: false, error: 'Failed to submit report. Please try again.' };
  }
}

export async function getParentReportsData() {
  try {
    const session = await requireAuth();

    if (session.role !== 'PARENT') {
      return { success: false, error: 'Unauthorized. Only parents can access this data.' };
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.userId },
    });

    if (!parent) {
      return { success: false, error: 'Parent profile not found.' };
    }

    // Find children linked to this parent
    const students = await prisma.student.findMany({
      where: {
        parentId: parent.id,
        aamarId: session.aamarId,
      },
      select: {
        id: true,
        rollNumber: true,
        class: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const childrenIds = students.map((s) => s.id);

    // Fetch reports for these children
    const reports = await prisma.report.findMany({
      where: {
        studentId: { in: childrenIds },
        aamarId: session.aamarId,
      },
      include: {
        student: {
          select: {
            rollNumber: true,
            class: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        children: students.map((s) => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          className: s.class.name,
          rollNumber: s.rollNumber,
        })),
        reports: reports.map((rep) => ({
          id: rep.id,
          title: rep.title,
          description: rep.description,
          category: rep.category,
          createdAt: rep.createdAt,
          studentName: `${rep.student.user.firstName} ${rep.student.user.lastName}`,
          className: rep.student.class.name,
          rollNumber: rep.student.rollNumber,
          teacherName: `${rep.teacher.user.firstName} ${rep.teacher.user.lastName}`,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching parent reports data:', error);
    return { success: false, error: 'Failed to fetch reports data.' };
  }
}
