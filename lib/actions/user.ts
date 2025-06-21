'use server';

import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { UserRole, Gender } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId: string;
  branchId?: string;
  phone?: string;
  address?: string;
  gender?: Gender;
  dateOfBirth?: Date;
}

export async function createUser(data: CreateUserData) {
  try {
    const hashedPassword = await hashPassword(data.password);

    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        schoolId: data.schoolId,
        branchId: data.branchId,
        profile: {
          create: {
            phone: data.phone,
            address: data.address,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
          },
        },
      },
      include: {
        profile: true,
        school: true,
        branch: true,
      },
    });

    revalidatePath('/admin/users');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      include: {
        profile: true,
        school: true,
        branch: true,
        teacher: true,
        student: true,
        parent: true,
        staff: true,
      },
    });

    if (!user || !user.isActive) {
      return { success: false, error: 'Invalid credentials' };
    }

    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function getUsersBySchool(schoolId: string) {
  try {
    const users = await db.user.findMany({
      where: { schoolId },
      include: {
        profile: true,
        teacher: true,
        student: true,
        parent: true,
        staff: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function updateUserProfile(userId: string, data: Partial<CreateUserData>) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        profile: {
          update: {
            phone: data.phone,
            address: data.address,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    revalidatePath('/profile');
    return { success: true, user };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
} 