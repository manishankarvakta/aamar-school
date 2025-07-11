"use server";

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

// Get settings for the current user's school
export async function getSettings() {
  try {
    const user = await requireAuth();
    if (!user?.aamarId || !user?.schoolId) {
      return { success: false, message: 'No aamarId or schoolId found for user' };
    }
    const settings = await prisma.settings.findFirst({
      where: { aamarId: user.aamarId, schoolId: user.schoolId },
    });
    if (!settings) {
      return { success: false, message: 'Settings not found' };
    }
    // Return both weeklySchedule and subjectDuration
    return { success: true, data: { weeklySchedule: settings.weeklySchedule, subjectDuration: settings.subjectDuration } };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to get settings' };
  }
}

// Update or create the weekly schedule and subject duration for the current user's school
export async function updateSettings(data: { weeklySchedule: any, subjectDuration: number }) {
  try {
    const user = await requireAuth();
    if (!user?.aamarId || !user?.schoolId) {
      return { success: false, message: 'No aamarId or schoolId found for user' };
    }
    const updated = await prisma.settings.upsert({
      where: { schoolId: user.schoolId },
      update: { weeklySchedule: data.weeklySchedule, subjectDuration: data.subjectDuration },
      create: {
        aamarId: user.aamarId,
        schoolId: user.schoolId,
        weeklySchedule: data.weeklySchedule,
        subjectDuration: data.subjectDuration,
      },
    });
    return { success: true, data: { weeklySchedule: updated.weeklySchedule, subjectDuration: updated.subjectDuration } };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to update settings' };
  }
} 