"use server";

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { ClassType } from '@prisma/client';

interface RoutineSlotInput {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId?: string;
  teacherId?: string;
  classType: string;
}

interface ClassRoutineResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Get a ClassRoutine by id (with slots, subject, teacher, class)
export async function getClassRoutine(classId: string): Promise<ClassRoutineResult> {
  try {
    const session = await requireAuth();
    const routine = await prisma.classRoutine.findFirst({
      where: { classId, aamarId: session.aamarId },
      include: {
        class: true,
        slots: {
          include: {
            subject: true,
            teacher: true,
          },
          where: { aamarId: session.aamarId },
        },
      },
    });
    if (!routine) {
      return {
        success: false,
        error: 'ClassRoutine not found',
        message: 'The specified class routine was not found',
      };
    }
    return {
      success: true,
      data: routine,
      message: 'ClassRoutine retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching class routine:', error);
    return {
      success: false,
      error: 'Failed to fetch class routine',
      message: 'An error occurred while fetching the class routine',
    };
  }
}

// Delete a ClassRoutine by id
export async function deleteClassRoutine(id: string): Promise<ClassRoutineResult> {
  try {
    const session = await requireAuth();
    const routine = await prisma.classRoutine.findFirst({ where: { id, aamarId: session.aamarId } });
    if (!routine) {
      return {
        success: false,
        error: 'ClassRoutine not found',
        message: 'The specified class routine was not found',
      };
    }
    await prisma.classRoutine.delete({ where: { id, aamarId: session.aamarId } });
    return {
      success: true,
      message: 'ClassRoutine deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting class routine:', error);
    return {
      success: false,
      error: 'Failed to delete class routine',
      message: 'An error occurred while deleting the class routine',
    };
  }
}


// Pass slots as an array of slot objects (with day, startTime, endTime, subjectId, teacherId, classType)
export async function upsertClassRoutine({
  id,
  classId,
  academicYear,
  branchId,
  schoolId,
  createdBy,
  slots,
}: {
  id?: string;
  classId: string;
  academicYear: string;
  branchId: string;
  schoolId: string;
  createdBy: string;
  slots: RoutineSlotInput[];
}): Promise<ClassRoutineResult> {
  try {
    const session = await requireAuth();
    // Validate class ownership
    const classObj = await prisma.class.findUnique({ where: { id: classId } });
    if (!classObj || classObj.aamarId !== session.aamarId) {
      return {
        success: false,
        error: 'Invalid class',
        message: 'The specified class does not exist or does not belong to your school',
      };
    }
    // Validate branch ownership
    const branchObj = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branchObj || branchObj.aamarId !== session.aamarId) {
      return {
        success: false,
        error: 'Invalid branch',
        message: 'The specified branch does not exist or does not belong to your school',
      };
    }
    // Use upsert if possible (requires a unique constraint on classId + academicYear + aamarId)
    // If not possible, fallback to manual logic
    // We'll check if a routine exists for this class, academicYear, and aamarId
    const existing = await prisma.classRoutine.findFirst({
      where: { classId, academicYear, aamarId: session.aamarId },
    });
    if (existing) {
      // Delete old slots and recreate (simplest for grid update)
      await prisma.routineSlot.deleteMany({ where: { classRoutineId: existing.id, aamarId: session.aamarId } });
      const updated = await prisma.classRoutine.update({
        where: { id: existing.id, aamarId: session.aamarId },
        data: {
          classId,
          academicYear,
          branchId,
          schoolId,
          createdBy,
          aamarId: session.aamarId,
          slots: {
            create: slots.map(slot => ({
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              subjectId: slot.subjectId,
              teacherId: slot.teacherId,
              classType: slot.classType as ClassType,
              aamarId: session.aamarId,
            })),
          },
        },
        include: {
          class: true,
          slots: { include: { subject: true, teacher: true }, where: { aamarId: session.aamarId } },
        },
      });
      return {
        success: true,
        data: updated,
        message: 'ClassRoutine updated successfully',
      };
    } else {
      // Create new
      const created = await prisma.classRoutine.create({
        data: {
          classId,
          academicYear,
          branchId,
          schoolId,
          createdBy,
          aamarId: session.aamarId,
          slots: {
            create: slots.map(slot => ({
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              subjectId: slot.subjectId,
              teacherId: slot.teacherId,
              classType: slot.classType as ClassType,
              aamarId: session.aamarId,
            })),
          },
        },
        include: {
          class: true,
          slots: { include: { subject: true, teacher: true }, where: { aamarId: session.aamarId } },
        },
      });
      return {
        success: true,
        data: created,
        message: 'ClassRoutine created successfully',
      };
    }
  } catch (error) {
    console.error('Error upserting class routine:', error);
    return {
      success: false,
      error: 'Failed to upsert class routine',
      message: 'An error occurred while saving the class routine',
    };
  }
}

// Optionally: Add a getClassRoutinesByClass or byAcademicYear, etc. following the same pattern. 