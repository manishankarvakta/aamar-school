"use server";

import { prisma } from "@/lib/prisma";
import { CalendarEventType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Get all CalendarEvents for a given month and year
 */
export async function getCalendarEvents(year: number, month: number) {
  try {
    // Start and end of the month (UTC)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const events = await prisma.calendarEvent.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Convert to a day-keyed map: { 5: [{...}], 12: [{...}] }
    const eventMap: Record<
      number,
      { id: string; title: string; type: CalendarEventType; description: string | null }[]
    > = {};

    for (const ev of events) {
      // Use UTC day to avoid timezone shifts
      const day = ev.date.getUTCDate();
      if (!eventMap[day]) eventMap[day] = [];
      eventMap[day].push({
        id: ev.id,
        title: ev.title,
        type: ev.type,
        description: ev.description,
      });
    }

    return { success: true, data: eventMap };
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return { success: false, data: {} };
  }
}

/**
 * Add a new CalendarEvent (EVENT or MEETING)
 */
export async function addCalendarEvent(formData: {
  title: string;
  date: string; // "YYYY-MM-DD"
  type: "EVENT" | "MEETING";
  description?: string;
  schoolId: string;
}) {
  try {
    const { title, date, type, description, schoolId } = formData;

    if (!title || !date || !type || !schoolId) {
      return { success: false, error: "Missing required fields" };
    }

    // Parse date as UTC midnight to avoid day-shift issues
    const [year, month, day] = date.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        date: utcDate,
        type: type as CalendarEventType,
        description: description ?? null,
        schoolId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error adding calendar event:", error);
    return { success: false, error: "Failed to add event" };
  }
}

/**
 * Delete a CalendarEvent by id
 */
export async function deleteCalendarEvent(id: string) {
  try {
    await prisma.calendarEvent.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

/**
 * Get the first school's id (for single-school setups)
 */
export async function getDefaultSchoolId() {
  try {
    const school = await prisma.school.findFirst({ select: { id: true } });
    return { success: true, schoolId: school?.id ?? null };
  } catch {
    return { success: false, schoolId: null };
  }
}
