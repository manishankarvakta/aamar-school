'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { AnnouncementType, AudienceType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AnnouncementFull {
  id: string;
  title: string;
  message: string;
  announcementType: AnnouncementType;
  audience: AudienceType[];
  visibleFrom: string;
  visibleUntil: string | null;
  createdAt: string;
  createdBy: {
    name: string;
    initials: string;
  };
}

export interface AnnouncementStats {
  total: number;
  urgent: number;
  event: number;
  general: number;
  scheduled: number;
}

// ─── Map type → page UI type string ──────────────────────────────────────────
function mapType(t: AnnouncementType): string {
  switch (t) {
    case 'URGENT': return 'urgent';
    case 'EVENT':  return 'event';
    case 'NEWS':   return 'academic';
    default:       return 'general';
  }
}

function mapPriority(t: AnnouncementType): string {
  switch (t) {
    case 'URGENT': return 'high';
    case 'EVENT':  return 'medium';
    default:       return 'low';
  }
}

function mapAudience(a: AudienceType[]): string[] {
  return a.map((x) => {
    switch (x) {
      case 'STUDENT': return 'Students';
      case 'TEACHER': return 'Teachers';
      case 'PARENT':  return 'Parents';
      case 'STAFF':   return 'Staff';
      case 'ALL':     return 'Everyone';
    }
  });
}

// ─── Get ALL announcements (for the /announcements page) ──────────────────────
export async function getAllAnnouncements() {
  try {
    const session = await requireAuth();

    const announcements = await prisma.announcement.findMany({
      where: { aamarId: session.aamarId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const now = new Date();
    const data = announcements.map((ann) => {
      const name = `${ann.createdBy.firstName} ${ann.createdBy.lastName}`;
      const isScheduled = ann.visibleFrom > now;
      return {
        id: ann.id,
        title: ann.title,
        content: ann.message,
        type: mapType(ann.announcementType),
        priority: mapPriority(ann.announcementType),
        audience: mapAudience(ann.audience),
        author: name,
        authorInitials: `${ann.createdBy.firstName[0]}${ann.createdBy.lastName[0]}`.toUpperCase(),
        createdAt: new Date(ann.createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
        scheduledAt: isScheduled
          ? ann.visibleFrom.toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          : null,
        status: isScheduled ? 'scheduled' : 'published',
      };
    });

    const stats: AnnouncementStats = {
      total: announcements.length,
      urgent:    announcements.filter((a) => a.announcementType === 'URGENT').length,
      event:     announcements.filter((a) => a.announcementType === 'EVENT').length,
      general:   announcements.filter((a) => a.announcementType === 'GENERAL').length,
      scheduled: announcements.filter((a) => a.visibleFrom > now).length,
    };

    return { success: true, data, stats };
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    return { success: false, data: [], stats: { total: 0, urgent: 0, event: 0, general: 0 } };
  }
}

// ─── Create announcement ──────────────────────────────────────────────────────
export async function createAnnouncement(formData: {
  title: string;
  message: string;
  announcementType: string;
  audience: string[];
  scheduledAt?: string; // ISO datetime string, undefined = publish now
}) {
  try {
    const session = await requireAuth();

    if (!formData.title.trim() || !formData.message.trim()) {
      return { success: false, error: 'Title and content are required.' };
    }

    const typeMap: Record<string, AnnouncementType> = {
      general: 'GENERAL',
      urgent:  'URGENT',
      event:   'EVENT',
      academic: 'NEWS',
      holiday: 'GENERAL',
    };

    const audienceMap: Record<string, AudienceType> = {
      all:      'ALL',
      students: 'STUDENT',
      parents:  'PARENT',
      teachers: 'TEACHER',
      staff:    'STAFF',
    };

    const announcementType = typeMap[formData.announcementType] ?? 'GENERAL';
    const audience: AudienceType[] = formData.audience.length > 0
      ? formData.audience.map((a) => audienceMap[a] ?? 'ALL')
      : ['ALL'];

    const visibleFrom = formData.scheduledAt
      ? new Date(formData.scheduledAt)
      : new Date();

    if (formData.scheduledAt && visibleFrom <= new Date()) {
      return { success: false, error: 'Scheduled time must be in the future.' };
    }

    await prisma.announcement.create({
      data: {
        aamarId: session.aamarId,
        title: formData.title.trim(),
        message: formData.message.trim(),
        announcementType,
        audience,
        visibleFrom,
        createdById: session.userId,
      },
    });

    revalidatePath('/dashboard/announcements');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return { success: false, error: 'Failed to create announcement.' };
  }
}

// ─── Delete announcement ──────────────────────────────────────────────────────
export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath('/dashboard/announcements');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: 'Failed to delete.' };
  }
}

// ─── Dashboard widget: latest 5 ──────────────────────────────────────────────
export async function getAnnouncements(branchId?: string) {
  try {
    const session = await requireAuth();
    const aamarId = session.aamarId;

    const announcements = await prisma.announcement.findMany({
      where: { 
        aamarId,
        ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (announcements.length === 0) {
      return { success: true, data: [] };
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
    return { success: false, data: [] };
  }
}

// ─── Dashboard widget: teacher-specific ──────────────────────────────────────
export async function getTeacherAnnouncements(branchId?: string) {
  try {
    const session = await requireAuth();
    const aamarId = session.aamarId;

    const announcements = await prisma.announcement.findMany({
      where: {
        aamarId,
        audience: { hasSome: ['TEACHER', 'ALL'] },
        ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (announcements.length === 0) {
      return { success: true, data: [] };
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
    return { success: false, data: [] };
  }
}
