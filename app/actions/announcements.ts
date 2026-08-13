'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function getAnnouncements() {
  try {
    const session = await requireAuth();
    const aamarId = session.aamarId;

    const announcements = await prisma.announcement.findMany({
      where: { aamarId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (announcements.length === 0) {
      return {
        success: true,
        data: [], // Return empty to allow UI fallback or empty state
      };
    }

    return {
      success: true,
      data: announcements.map((ann) => {
        const dateObj = new Date(ann.createdAt);
        return {
          date: String(dateObj.getDate()).padStart(2, '0'),
          month: dateObj.toLocaleString('en-US', { month: 'short' }),
          title: ann.title,
          description: ann.message,
          bgColor: ann.announcementType === 'URGENT' ? 'bg-red-50' : ann.announcementType === 'EVENT' ? 'bg-yellow-50' : 'bg-blue-50',
        };
      }),
    };
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return {
      success: false,
      data: [],
    };
  }
}

export async function getTeacherAnnouncements() {
  try {
    const session = await requireAuth();
    const aamarId = session.aamarId;

    const announcements = await prisma.announcement.findMany({
      where: {
        aamarId,
        audience: {
          hasSome: ['TEACHER', 'ALL'],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (announcements.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: announcements.map((ann) => {
        const dateObj = new Date(ann.createdAt);
        return {
          title: ann.title,
          description: ann.message,
          priority: ann.announcementType === 'URGENT' ? 'High' : 'Medium',
          category: ann.announcementType === 'EVENT' ? 'Event' : 'Meeting',
          date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: 'N/A',
          audience: ann.audience.includes('ALL') ? 'All Teachers' : 'Teachers',
        };
      }),
    };
  } catch (error) {
    console.error('Error fetching teacher announcements:', error);
    return {
      success: false,
      data: [],
    };
  }
}
