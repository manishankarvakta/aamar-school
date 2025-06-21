'use server';

import { db } from '@/lib/db';
import { AttendanceStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface CreateStudentData {
  userId: string;
  rollNumber: string;
  admissionDate: Date;
  classId: string;
  parentId?: string;
}

export async function createStudent(data: CreateStudentData) {
  try {
    const student = await db.student.create({
      data: {
        userId: data.userId,
        rollNumber: data.rollNumber,
        admissionDate: data.admissionDate,
        classId: data.classId,
        parentId: data.parentId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        class: true,
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
      where: { classId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        class: true,
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

export async function markAttendance(studentId: string, date: Date, status: AttendanceStatus, remarks?: string) {
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

export async function addExamResult(studentId: string, examType: string, subject: string, marks: number, grade: string, remarks?: string) {
  try {
    const examResult = await db.examResult.create({
      data: {
        studentId,
        examType,
        subject,
        marks,
        grade,
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