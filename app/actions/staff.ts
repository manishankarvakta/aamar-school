'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Gender, UserRole } from '@prisma/client';

export interface StaffResult {
  success: boolean;
  message: string;
  data?: any;
}

// Create new staff member
export async function createStaff(formData: FormData): Promise<StaffResult> {
  try {
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string || 'defaultPassword123',
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as Gender,
      address: formData.get('address') as string,
      nationality: formData.get('nationality') as string,
      religion: formData.get('religion') as string,
      bloodGroup: formData.get('bloodGroup') as string,
      designation: formData.get('designation') as string,
      department: formData.get('department') as string,
      schoolId: formData.get('schoolId') as string,
      branchId: formData.get('branchId') as string,
      aamarId: formData.get('aamarId') as string || '234567',
    };

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.schoolId || !data.designation) {
      return {
        success: false,
        message: 'Required fields are missing'
      };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Email already exists'
      };
    }

    // Create in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: UserRole.STAFF,
          aamarId: data.aamarId,
          schoolId: data.schoolId,
          branchId: data.branchId,
        }
      });

      // Create profile
      await tx.profile.create({
        data: {
          userId: user.id,
          aamarId: data.aamarId,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          address: data.address,
          nationality: data.nationality,
          religion: data.religion,
          bloodGroup: data.bloodGroup,
        }
      });

      // Create staff record
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          aamarId: data.aamarId,
          designation: data.designation,
          department: data.department,
        }
      });

      return { user, staff };
    });

    revalidatePath('/dashboard/staff');

    return {
      success: true,
      message: `Staff member ${data.firstName} ${data.lastName} created successfully!`,
      data: {
        staffId: result.staff.id,
        userId: result.user.id,
      },
    };

  } catch (error) {
    console.error('Create staff error:', error);
    return {
      success: false,
      message: 'Failed to create staff member. Please try again.',
    };
  }
}

// Get all staff by aamarId
export async function getStaff(aamarId: string = '234567') {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        user: {
          aamarId: aamarId
        }
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: {
              include: {
                school: true
              }
            }
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });

    const formattedStaff = staff.map(member => ({
      id: member.id,
      staffId: member.id,
      name: `${member.user.firstName} ${member.user.lastName}`,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      phone: member.user.profile?.phone || '',
      dateOfBirth: member.user.profile?.dateOfBirth,
      gender: member.user.profile?.gender,
      address: member.user.profile?.address || '',
      nationality: member.user.profile?.nationality || '',
      religion: member.user.profile?.religion || '',
      bloodGroup: member.user.profile?.bloodGroup || '',
      designation: member.designation,
      department: member.department,
      joiningDate: member.createdAt,
      branch: member.user.branch ? {
        id: member.user.branch.id,
        name: member.user.branch.name,
        address: member.user.branch.address,
        phone: member.user.branch.phone,
      } : null,
      school: member.user.branch ? {
        name: member.user.branch.school.name,
      } : null,
      status: 'Active',
    }));

    return {
      success: true,
      data: formattedStaff
    };

  } catch (error) {
    console.error('Error fetching staff:', error);
    return {
      success: false,
      error: 'Failed to fetch staff'
    };
  }
}

// Get staff by ID
export async function getStaffById(staffId: string) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: {
          include: {
            profile: true,
            branch: {
              include: {
                school: true
              }
            }
          }
        }
      }
    });

    if (!staff) {
      return {
        success: false,
        error: 'Staff member not found'
      };
    }

    const staffDetails = {
      id: staff.id,
      
      // Personal information
      staff: {
        firstName: staff.user.firstName,
        lastName: staff.user.lastName,
        email: staff.user.email,
        phone: staff.user.profile?.phone,
        dateOfBirth: staff.user.profile?.dateOfBirth,
        gender: staff.user.profile?.gender,
        address: staff.user.profile?.address,
        nationality: staff.user.profile?.nationality,
        religion: staff.user.profile?.religion,
        bloodGroup: staff.user.profile?.bloodGroup,
      },

      // Professional information
      professional: {
        designation: staff.designation,
        department: staff.department,
        joiningDate: staff.createdAt,
      },

      // Branch and school information
      branch: staff.user.branch ? {
        name: staff.user.branch.name,
        address: staff.user.branch.address,
        phone: staff.user.branch.phone
      } : null,

      school: staff.user.branch ? {
        name: staff.user.branch.school.name,
        address: staff.user.branch.school.address,
        phone: staff.user.branch.school.phone,
        email: staff.user.branch.school.email
      } : null,
    };

    return {
      success: true,
      data: staffDetails
    };

  } catch (error) {
    console.error('Error fetching staff details:', error);
    return {
      success: false,
      error: 'Failed to fetch staff details'
    };
  }
}

// Update staff
export async function updateStaff(staffId: string, formData: FormData): Promise<StaffResult> {
  try {
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as Gender,
      address: formData.get('address') as string,
      nationality: formData.get('nationality') as string,
      religion: formData.get('religion') as string,
      bloodGroup: formData.get('bloodGroup') as string,
      designation: formData.get('designation') as string,
      department: formData.get('department') as string,
      joiningDate: formData.get('joiningDate') as string,
      salary: formData.get('salary') as string,
      branchId: formData.get('branchId') as string,
      emergencyContact: formData.get('emergencyContact') as string,
      employeeId: formData.get('employeeId') as string,
    };

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.designation) {
      return {
        success: false,
        message: 'Required fields are missing'
      };
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get staff with relations
      const staff = await tx.staff.findUnique({
        where: { id: staffId },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      });

      if (!staff) {
        throw new Error('Staff member not found');
      }

      // Update user
      await tx.user.update({
        where: { id: staff.userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        }
      });

      // Update profile
      await tx.profile.update({
        where: { userId: staff.userId },
        data: {
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          address: data.address,
          nationality: data.nationality,
          religion: data.religion,
          bloodGroup: data.bloodGroup,
        }
      });

      // Update staff record
      await tx.staff.update({
        where: { id: staffId },
        data: {
          designation: data.designation,
          department: data.department,
        }
      });

      return staff;
    });

    revalidatePath('/dashboard/staff');

    return {
      success: true,
      message: `Staff member ${data.firstName} ${data.lastName} updated successfully!`,
    };

  } catch (error) {
    console.error('Update staff error:', error);
    return {
      success: false,
      message: 'Failed to update staff member. Please try again.',
    };
  }
}

// Delete staff
export async function deleteStaff(staffId: string): Promise<StaffResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get staff with all relations
      const staff = await tx.staff.findUnique({
        where: { id: staffId },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      });

      if (!staff) {
        throw new Error('Staff member not found');
      }

      const staffName = `${staff.user.firstName} ${staff.user.lastName}`;

      // Delete related records
      await tx.attendance.deleteMany({
        where: { 
          OR: [
            { teacherId: staffId }
          ]
        }
      });

      // Delete staff record
      await tx.staff.delete({
        where: { id: staffId }
      });

      // Delete user profile
      await tx.profile.delete({
        where: { userId: staff.userId }
      });

      // Delete user
      await tx.user.delete({
        where: { id: staff.userId }
      });

      return { staffName };
    });

    revalidatePath('/dashboard/staff');

    return {
      success: true,
      message: `Staff member ${result.staffName} deleted successfully!`,
    };

  } catch (error) {
    console.error('Delete staff error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete staff member. Please try again.',
    };
  }
}

// Get staff statistics
export async function getStaffStats(aamarId: string = '234567') {
  try {
    const totalStaff = await prisma.staff.count({
      where: {
        user: {
          aamarId: aamarId
        }
      }
    });

    const newThisMonth = await prisma.staff.count({
      where: {
        user: {
          aamarId: aamarId
        }
      }
    });

    // Get department-wise distribution
    const departmentWiseCount = await prisma.staff.groupBy({
      by: ['department'],
      where: {
        user: {
          aamarId: aamarId
        }
      },
      _count: {
        id: true
      }
    });

    return {
      success: true,
      data: {
        totalStaff,
        newThisMonth,
        departmentWiseCount,
      }
    };

  } catch (error) {
    console.error('Error fetching staff stats:', error);
    return {
      success: false,
      error: 'Failed to fetch staff statistics'
    };
  }
}

// Search staff
export async function searchStaff(query: string, aamarId: string = '234567') {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        user: {
          aamarId: aamarId,
          OR: [
            {
              firstName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              lastName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        }
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true
          }
        }
      },
      take: 20
    });

    const formattedStaff = staff.map(member => ({
      id: member.id,
      name: `${member.user.firstName} ${member.user.lastName}`,
      email: member.user.email,
      phone: member.user.profile?.phone || '',
      designation: member.designation,
      department: member.department,
      branch: member.user.branch?.name || '',
      joiningDate: member.createdAt,
    }));

    return {
      success: true,
      data: formattedStaff
    };

  } catch (error) {
    console.error('Error searching staff:', error);
    return {
      success: false,
      error: 'Failed to search staff'
    };
  }
} 