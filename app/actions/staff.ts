'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { UserRole, AttendanceStatus } from '@prisma/client';

export async function getStaffData() {
  try {
    const session = await requireAuth();

    // 1. Fetch all staff members
    const staff = await prisma.staff.findMany({
      where: { aamarId: session.aamarId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    // 2. Fetch today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await prisma.attendance.findMany({
      where: {
        aamarId: session.aamarId,
        staffId: { not: null },
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    // 3. Fetch leaves
    const leaves = await prisma.staffLeave.findMany({
      where: { aamarId: session.aamarId },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { appliedDate: 'desc' },
    });

    const currentDateStr = new Date().toISOString().split('T')[0];

    return {
      success: true,
      data: {
        staff: staff.map((st) => {
          const isOnLeave = leaves.some(
            (l) => l.staffId === st.id && l.status === 'Approved' &&
            l.startDate.toISOString().split('T')[0] <= currentDateStr &&
            l.endDate.toISOString().split('T')[0] >= currentDateStr
          );
          return {
            id: st.id,
            employeeId: st.user.email.split('@')[0].toUpperCase(), // fallback employee ID
            name: `${st.user.firstName} ${st.user.lastName}`,
            position: st.designation,
            department: st.department,
            joinDate: st.joiningDate.toISOString().split('T')[0],
            phone: st.user.profile?.phone || 'N/A',
            email: st.user.email,
            salary: st.salary || 25000,
            status: isOnLeave ? 'On Leave' : st.user.isActive ? 'Active' : 'Inactive',
            workingHours: st.workingHours,
            photo: st.user.profile?.avatar || '',
            branchId: st.user.branchId || null,
          };
        }),
        attendance: todayAttendance.map((a) => ({
          id: a.id,
          employeeId: a.staff?.user.email.split('@')[0].toUpperCase() || '',
          name: a.staff ? `${a.staff.user.firstName} ${a.staff.user.lastName}` : 'Unknown Staff',
          department: a.staff?.department || 'N/A',
          checkIn: a.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          checkOut: a.updatedAt > a.createdAt ? a.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          hoursWorked: 9, // dummy fallback
          status: a.status === AttendanceStatus.PRESENT ? 'Present' : 'Absent',
          date: a.date.toISOString().split('T')[0],
          branchId: a.staff?.user.branchId || null,
        })),
        leaves: leaves.map((l) => ({
          id: l.id,
          employeeId: l.staff.user.email.split('@')[0].toUpperCase(),
          name: `${l.staff.user.firstName} ${l.staff.user.lastName}`,
          leaveType: l.leaveType,
          startDate: l.startDate.toISOString().split('T')[0],
          endDate: l.endDate.toISOString().split('T')[0],
          days: Math.ceil((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
          reason: l.reason || 'Personal reasons',
          status: l.status,
          appliedDate: l.appliedDate.toISOString().split('T')[0],
          branchId: l.staff.user.branchId || null,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching staff records:', error);
    return { success: false, error: 'Failed to fetch staff records.' };
  }
}

import bcrypt from 'bcryptjs';

export async function getStaffPermissions(staffId: string) {
  try {
    const session = await requireAuth();
    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        permissions: true,
        allowedBranches: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!staff) {
      return { success: false, error: 'Staff member not found' };
    }

    return { success: true, data: staff };
  } catch (error) {
    console.error('Error fetching staff permissions:', error);
    return { success: false, error: 'Failed to fetch staff permissions' };
  }
}

export async function updateStaffPermissions(
  staffId: string,
  permissions: any,
  allowedBranches: string[]
) {
  try {
    const session = await requireAuth();
    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        permissions,
        allowedBranches,
      },
    });

    revalidatePath('/dashboard/staff');
    return { success: true, message: 'Permissions updated successfully' };
  } catch (error) {
    console.error('Error updating staff permissions:', error);
    return { success: false, error: 'Failed to update staff permissions' };
  }
}

export async function addStaff(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  salary: number;
  workingHours: string;
  branchId?: string;
}) {
  try {
    const session = await requireAuth();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Email already exists.',
      };
    }

    // 1. Create unique password & User
    const staffPassword = `STF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const hashedStaffPassword = await bcrypt.hash(staffPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        aamarId: session.aamarId,
        schoolId: session.schoolId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedStaffPassword,
        role: UserRole.STAFF,
        branchId: data.branchId || null,
        profile: {
          create: {
            aamarId: session.aamarId,
            phone: data.phone,
          },
        },
        staff: {
          create: {
            aamarId: session.aamarId,
            designation: data.designation,
            department: data.department,
            salary: data.salary,
            workingHours: data.workingHours,
            allowedBranches: data.branchId ? [data.branchId] : [],
            permissions: {}, // starts empty
          },
        },
      },
    });

    revalidatePath('/dashboard/staff');
    return { 
      success: true, 
      data: {
        id: newUser.id,
        email: newUser.email,
        password: staffPassword,
      } 
    };
  } catch (error) {
    console.error('Error adding staff member:', error);
    return { success: false, error: 'Failed to add staff member.' };
  }
}

export async function deleteStaff(id: string) {
  try {
    const session = await requireAuth();

    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      return { success: false, error: 'Staff member not found.' };
    }

    // Delete User (cascades profile and staff relations)
    await prisma.user.delete({
      where: { id: staff.userId },
    });

    revalidatePath('/dashboard/staff');
    return { success: true };
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return { success: false, error: 'Failed to remove staff member.' };
  }
}

export async function submitLeaveRequest(data: {
  staffId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  try {
    const session = await requireAuth();

    const leave = await prisma.staffLeave.create({
      data: {
        aamarId: session.aamarId,
        staffId: data.staffId,
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: 'Pending',
      },
    });

    revalidatePath('/dashboard/staff');
    return { success: true, data: leave };
  } catch (error) {
    console.error('Error submitting leave request:', error);
    return { success: false, error: 'Failed to submit leave request.' };
  }
}

export async function updateLeaveStatus(leaveId: string, status: string) {
  try {
    await prisma.staffLeave.update({
      where: { id: leaveId },
      data: {
        status: status, // Approved / Rejected
      },
    });

    revalidatePath('/dashboard/staff');
    return { success: true };
  } catch (error) {
    console.error('Error updating leave status:', error);
    return { success: false, error: 'Failed to update leave status.' };
  }
}