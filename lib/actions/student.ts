'use server';

import { db } from '@/lib/db';
import { AttendanceStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface CreateStudentData {
  userId: string;
  rollNumber: string;
  admissionDate: Date;
  sectionId: string;
  parentId?: string;
  aamarId: string;
}

export async function createStudent(data: CreateStudentData) {
  try {
    const student = await db.student.create({
      data: {
        aamarId: data.aamarId,
        userId: data.userId,
        rollNumber: data.rollNumber,
        admissionDate: data.admissionDate,
        sectionId: data.sectionId,
        parentId: data.parentId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        section: {
          include: {
            class: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath('/admin/students');
    return { success: true, student };
  } catch (error) {
    console.error('Error creating student:', error);
    return { success: false, error: 'Failed to create student' };
  }
}

export async function getStudentsByClass(classId: string) {
  try {
    const students = await db.student.findMany({
      where: { 
        section: {
          classId: classId
        }
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        section: {
          include: {
            class: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    return { success: true, students };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { success: false, error: 'Failed to fetch students' };
  }
}

export async function markAttendance(studentId: string, date: Date, status: AttendanceStatus, remarks?: string, aamarId: string = '234567') {
  try {
    const attendance = await db.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date,
        },
      },
      update: {
        status,
        remarks,
      },
      create: {
        aamarId,
        studentId,
        date,
        status,
        remarks,
      },
    });

    revalidatePath('/attendance');
    return { success: true, attendance };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, error: 'Failed to mark attendance' };
  }
}

export async function getAttendanceByStudent(studentId: string, startDate?: Date, endDate?: Date) {
  try {
    const whereClause: any = { studentId };
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendance = await db.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return { success: true, attendance };
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return { success: false, error: 'Failed to fetch attendance' };
  }
}

export async function addExamResult(studentId: string, examId: string, subjectId: string, obtainedMarks: number, fullMarks: number, grade: string, gpa?: number, remarks?: string, aamarId: string = '234567') {
  try {
    const examResult = await db.examResult.create({
      data: {
        aamarId,
        examId,
        studentId,
        subjectId,
        obtainedMarks,
        fullMarks,
        grade,
        gpa,
        remarks,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath('/academic/results');
    return { success: true, examResult };
  } catch (error) {
    console.error('Error adding exam result:', error);
    return { success: false, error: 'Failed to add exam result' };
  }
}

export async function getStudentResults(studentId: string) {
  try {
    const results = await db.examResult.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, results };
  } catch (error) {
    console.error('Error fetching results:', error);
    return { success: false, error: 'Failed to fetch results' };
  }
} 