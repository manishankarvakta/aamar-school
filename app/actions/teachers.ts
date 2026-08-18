'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/session';
import { Gender, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface TeacherData {
  id: string;
  teacherId: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  specialization?: string;
  joiningDate: Date;
  salary?: number;
  emergencyContact?: string;
  isActive: boolean;
  branch?: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
  };
  totalClasses: number;
  totalStudents: number;
}

export interface TeacherStats {
  totalTeachers: number;
  activeTeachers: number;
  averageExperience: number;
  byBranch: Array<{
    branchId: string;
    branchName: string;
    teacherCount: number;
  }>;
}

export interface TeacherResult {
  success: boolean;
  message: string;
  data?: {
    teacherId: string;
    userId: string;
    email?: string;
    password?: string;
  } | TeacherData | TeacherData[] | TeacherStats;
}

// Create new teacher
export async function createTeacher(formData: FormData): Promise<TeacherResult> {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
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
      qualification: formData.get('qualification') as string,
      experience: formData.get('experience') as string,
      specialization: formData.get('specialization') as string,
      joiningDate: formData.get('joiningDate') as string,
      salary: formData.get('salary') as string,
      branchId: formData.get('branchId') as string,
      emergencyContact: formData.get('emergencyContact') as string,
    };

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.branchId) {
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

    // Generate random teacher password and hash it
    const teacherPassword = `TEA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const hashedTeacherPassword = await bcrypt.hash(teacherPassword, 10);

    // Create in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: UserRole.TEACHER,
          aamarId: session.aamarId,
          branchId: data.branchId || session.branchId,
          password: hashedTeacherPassword,
          schoolId: session.schoolId,
        }
      });

      // Create profile
      await tx.profile.create({
        data: {
          userId: user.id,
          aamarId: session.aamarId,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          address: data.address,
          nationality: data.nationality,
          religion: data.religion,
          bloodGroup: data.bloodGroup,
        }
      });

      // Create teacher record
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          aamarId: session.aamarId,
          qualification: data.qualification,
          experience: data.experience ? parseInt(data.experience) : 0,
          specialization: data.specialization,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          salary: data.salary ? parseFloat(data.salary) : null,
          emergencyContact: data.emergencyContact,
          subjects: data.specialization ? [data.specialization] : [],
        }
      });

      return { user, teacher };
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    revalidatePath('/dashboard/teachers');
    revalidatePath('/dashboard/staff');

    return {
      success: true,
      message: `Teacher ${data.firstName} ${data.lastName} created successfully!`,
      data: {
        teacherId: result.teacher.id,
        userId: result.user.id,
        email: data.email,
        password: teacherPassword,
      },
    };

  } catch (error) {
    console.error('Create teacher error:', error);
    return {
      success: false,
      message: 'Failed to create teacher. Please try again.',
    };
  }
}

// Get all teachers by aamarId with pagination
export async function getTeachers(page: number = 1, limit: number = 10, branchId?: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const skip = (page - 1) * limit;

    // Build where clause — optionally filter by branch
    const whereClause: any = {
      aamarId: session.aamarId,
      ...(branchId && branchId !== 'all' ? { user: { branchId } } : {}),
    };
    
    // Get total count for pagination
    const totalCount = await prisma.teacher.count({
      where: whereClause
    });

    const teachers = await prisma.teacher.findMany({
      where: whereClause,
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
        },
        classes: {
          include: {
            sections: {
              include: {
                students: true
              }
            }
          }
        },
        _count: {
          select: {
            classes: true
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      },
      skip,
      take: limit
    });

    const formattedTeachers: TeacherData[] = teachers.map(teacher => {
      const userData = teacher.user;
      const userBranch = userData.branch;
      
      return {
        id: teacher.id,
        teacherId: teacher.id,
        employeeId: `EMP${teacher.id.slice(-6).toUpperCase()}`,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.profile?.phone || '',
        qualification: teacher.qualification,
        experience: teacher.experience,
        specialization: teacher.specialization || teacher.subjects?.[0] || '',
        joiningDate: teacher.joiningDate,
        salary: teacher.salary || 0,
        emergencyContact: teacher.emergencyContact || '',
        isActive: userData.isActive,
        branch: userBranch ? {
          id: userBranch.id,
          name: userBranch.name,
          address: userBranch.address,
          phone: userBranch.phone
        } : undefined,
        totalClasses: teacher._count.classes,
        totalStudents: teacher.classes.reduce((total, cls) => {
          return total + cls.sections.reduce((secTotal, section) => {
            return secTotal + section.students.length;
          }, 0);
        }, 0)
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: formattedTeachers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

  } catch (error) {
    console.error('Error fetching teachers:', error);
    return {
      success: false,
      data: [],
      error: 'Failed to fetch teachers'
    };
  }
}

// Get all teachers for aamarId, no pagination, minimal info for selects
export async function getAllTeachers() {
  try {
    const session = await requireAuth();
    const teachers = await prisma.teacher.findMany({
      where: { aamarId: session.aamarId },
      include: {
        user: true
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });
    return {
      success: true,
      data: teachers.map(t => ({
        id: t.id,
        name: `${t.user.firstName} ${t.user.lastName}`
      }))
    };
  } catch (error) {
    console.error('Error fetching all teachers:', error);
    return {
      success: false,
      data: [],
      error: 'Failed to fetch all teachers'
    };
  }
}

// Get teacher by ID
export async function getTeacherById(teacherId: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const teacher = await prisma.teacher.findFirst({
      where: { 
        id: teacherId,
        aamarId: session.aamarId
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
        },
        classes: {
          include: {
            sections: {
              include: {
                students: true
              }
            }
          }
        }
      }
    });

    if (!teacher) {
      return {
        success: false,
        error: 'Teacher not found'
      };
    }

    const teacherDetails = {
      id: teacher.id,
      employeeId: `EMP${teacher.id.slice(-6).toUpperCase()}`,
      
      // Personal information
      teacher: {
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        email: teacher.user.email,
        phone: teacher.user.profile?.phone || '',
        dateOfBirth: teacher.user.profile?.dateOfBirth,
        gender: teacher.user.profile?.gender,
        address: teacher.user.profile?.address || '',
        nationality: teacher.user.profile?.nationality || '',
        religion: teacher.user.profile?.religion || '',
        bloodGroup: teacher.user.profile?.bloodGroup || '',
      },

      // Professional information
      professional: {
        qualification: teacher.qualification,
        experience: teacher.experience,
        specialization: teacher.specialization,
        joiningDate: teacher.joiningDate,
        salary: teacher.salary,
        emergencyContact: teacher.emergencyContact,
        subjects: teacher.subjects || [],
      },

      // Branch and school information
      branch: teacher.user.branch ? {
        id: teacher.user.branch.id,
        name: teacher.user.branch.name,
        address: teacher.user.branch.address || '',
        phone: teacher.user.branch.phone || ''
      } : null,

      school: teacher.user.branch?.school ? {
        id: teacher.user.branch.school.id,
        name: teacher.user.branch.school.name,
        address: teacher.user.branch.school.address || '',
        phone: teacher.user.branch.school.phone || '',
        email: teacher.user.branch.school.email || ''
      } : null,

      // Classes
      classes: teacher.classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        displayName: cls.name,
        studentCount: cls.sections.reduce((total, section) => total + section.students.length, 0),
      })),

      // Subjects as string array
      subjects: teacher.subjects || [],
      totalSubjects: (teacher.subjects || []).length,
    };

    return {
      success: true,
      data: teacherDetails
    };

  } catch (error) {
    console.error('Error fetching teacher details:', error);
    return {
      success: false,
      error: 'Failed to fetch teacher details'
    };
  }
}

// Update teacher
export async function updateTeacher(teacherId: string, formData: FormData): Promise<TeacherResult> {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
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
      qualification: formData.get('qualification') as string,
      experience: formData.get('experience') as string,
      specialization: formData.get('specialization') as string,
      joiningDate: formData.get('joiningDate') as string,
      salary: formData.get('salary') as string,
      branchId: formData.get('branchId') as string,
      emergencyContact: formData.get('emergencyContact') as string,
    };

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return {
        success: false,
        message: 'Required fields are missing'
      };
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Get teacher with relations
      const teacher = await tx.teacher.findFirst({
        where: { 
          id: teacherId,
          aamarId: session.aamarId
        },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      });

      if (!teacher) {
        throw new Error('Teacher not found');
      }

      // Update user
      await tx.user.update({
        where: { id: teacher.userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          branchId: data.branchId || teacher.user.branchId,
        }
      });

      // Update profile
      await tx.profile.update({
        where: { userId: teacher.userId },
        data: {
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : teacher.user.profile?.dateOfBirth,
          gender: data.gender || teacher.user.profile?.gender,
          address: data.address,
          nationality: data.nationality,
          religion: data.religion,
          bloodGroup: data.bloodGroup,
        }
      });

      // Update teacher record
      await tx.teacher.update({
        where: { id: teacherId },
        data: {
          qualification: data.qualification,
          experience: data.experience ? parseInt(data.experience) : teacher.experience,
          specialization: data.specialization,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : teacher.joiningDate,
          salary: data.salary ? parseFloat(data.salary) : teacher.salary,
          emergencyContact: data.emergencyContact,
          subjects: data.specialization ? [data.specialization] : teacher.subjects,
        }
      });
    });

    revalidatePath('/dashboard/teachers');
    revalidatePath('/dashboard/staff');

    return {
      success: true,
      message: `Teacher ${data.firstName} ${data.lastName} updated successfully!`,
    };

  } catch (error) {
    console.error('Error updating teacher:', error);
    return {
      success: false,
      message: 'Failed to update teacher information',
    };
  }
}

// Delete teacher
export async function deleteTeacher(teacherId: string): Promise<TeacherResult> {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
          await prisma.$transaction(async (tx) => {
        const teacher = await tx.teacher.findFirst({
          where: { 
            id: teacherId,
            aamarId: session.aamarId
          },
        include: { user: true }
      });

      if (!teacher) {
        throw new Error('Teacher not found');
      }

      // Delete teacher record first
      await tx.teacher.delete({
        where: { id: teacherId }
      });

      // Delete profile
      await tx.profile.deleteMany({
        where: { userId: teacher.userId }
      });

      // Delete user
      await tx.user.delete({
        where: { id: teacher.userId }
      });
    });

    revalidatePath('/dashboard/teachers');
    revalidatePath('/dashboard/staff');

    return {
      success: true,
      message: 'Teacher deleted successfully',
    };

  } catch (error) {
    console.error('Delete teacher error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete teacher. Please try again.',
    };
  }
}

export async function getTeacherStats(branchId?: string): Promise<TeacherResult> {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    // Get teachers with their users and branches
    const teachers = await prisma.teacher.findMany({
      where: {
        aamarId: session.aamarId,
        ...(branchId ? { user: { branchId } } : {})
      },
      include: {
        user: {
          include: {
            branch: true
          }
        }
      }
    });

    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.user.isActive).length;
    const averageExperience = totalTeachers > 0 
      ? teachers.reduce((sum, t) => sum + t.experience, 0) / totalTeachers 
      : 0;

    // Manual grouping by branch
    const branchCounts = new Map<string, { branchId: string; branchName: string; count: number }>();
    
    teachers.forEach(teacher => {
      if (teacher.user.branchId) {
        const branchId = teacher.user.branchId;
        const branchName = teacher.user.branch?.name || 'Unknown Branch';
        
        if (branchCounts.has(branchId)) {
          branchCounts.get(branchId)!.count++;
        } else {
          branchCounts.set(branchId, {
            branchId,
            branchName,
            count: 1
          });
        }
      }
    });

    const byBranch = Array.from(branchCounts.values()).map(branch => ({
      branchId: branch.branchId,
      branchName: branch.branchName,
      teacherCount: branch.count
    }));

    const stats: TeacherStats = {
      totalTeachers,
      activeTeachers,
      averageExperience: Math.round(averageExperience * 100) / 100,
      byBranch
    };

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };

  } catch (error) {
    console.error('Error fetching teacher statistics:', error);
    return {
      success: false,
      message: 'Failed to fetch statistics',
    };
  }
}

// Search teachers
export async function searchTeachers(query: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const teachers = await prisma.teacher.findMany({
      where: {
        aamarId: session.aamarId,
        OR: [
          {
            user: {
              firstName: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              lastName: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              email: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true
          }
        },
        classes: {
          include: {
            sections: {
              include: {
                students: true
              }
            }
          }
        },
        _count: {
          select: {
            classes: true
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });

    const formattedTeachers: TeacherData[] = teachers.map(teacher => {
      const userData = teacher.user;
      const userBranch = userData.branch;
      
      return {
        id: teacher.id,
        teacherId: teacher.id,
        employeeId: `EMP${teacher.id.slice(-6).toUpperCase()}`,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.profile?.phone || '',
        qualification: teacher.qualification,
        experience: teacher.experience,
        specialization: teacher.specialization || teacher.subjects?.[0] || '',
        joiningDate: teacher.joiningDate,
        salary: teacher.salary || 0,
        emergencyContact: teacher.emergencyContact || '',
        isActive: userData.isActive,
        branch: userBranch ? {
          id: userBranch.id,
          name: userBranch.name,
          address: userBranch.address,
          phone: userBranch.phone
        } : undefined,
        totalClasses: teacher._count.classes,
        totalStudents: teacher.classes.reduce((total, cls) => {
          return total + cls.sections.reduce((secTotal, section) => {
            return secTotal + section.students.length;
          }, 0);
        }, 0)
      };
    });

    return {
      success: true,
      data: formattedTeachers
    };

  } catch (error) {
    console.error('Error searching teachers:', error);
    return {
      success: false,
      data: [],
      error: 'Failed to search teachers'
    };
  }
}

// Get top teachers for dashboard performance listing (dynamic, real data)
export async function getTopTeachers(branchId?: string) {
  try {
    const session = await requireAuth();

    const teachers = await prisma.teacher.findMany({
      where: { 
        aamarId: session.aamarId, 
        user: { 
          isActive: true,
          ...(branchId ? { branchId } : {})
        } 
      },
      include: {
        user: {
          include: {
            branch: { select: { name: true } },
          },
        },
        classes: {
          include: {
            sections: {
              include: {
                students: { select: { id: true } },
              },
            },
          },
        },
        attendance: {
          where: {
            // Last 30 days
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          select: { status: true },
        },
      },
      take: 5,
      orderBy: { experience: 'desc' },
    });

    const result = teachers.map((t) => {
      // Total students taught
      const totalStudents = t.classes.reduce((sum, cls) =>
        sum + cls.sections.reduce((s, sec) => s + sec.students.length, 0), 0
      );

      // Attendance rate (last 30 days)
      const totalAttRecords = t.attendance.length;
      const presentCount = t.attendance.filter(
        (a) => a.status === 'PRESENT'
      ).length;
      const attendanceRate =
        totalAttRecords > 0 ? (presentCount / totalAttRecords) * 100 : 100;

      // Rating: weighted from experience + attendance rate + classes
      // Max 5.0: experience contributes up to 2.5, attendance up to 1.5, classes up to 1.0
      const expScore = Math.min(t.experience / 20, 1) * 2.5;
      const attScore = (attendanceRate / 100) * 1.5;
      const classScore = Math.min(t.classes.length / 5, 1) * 1.0;
      const rawRating = expScore + attScore + classScore;
      const rating = Math.max(3.0, Math.min(5.0, parseFloat(rawRating.toFixed(1))));

      const status =
        rating >= 4.8 ? 'Outstanding'
        : rating >= 4.5 ? 'Excellent'
        : rating >= 4.0 ? 'Very Good'
        : rating >= 3.5 ? 'Good'
        : 'Average';

      // Improvement: compare to a base 4.0 reference
      const diff = parseFloat((rating - 4.0).toFixed(1));
      const improvement = diff >= 0 ? `+${diff}` : `${diff}`;

      return {
        id: t.id,
        name: `${t.user.firstName} ${t.user.lastName}`,
        department: t.specialization || t.user.branch?.name || 'General',
        qualification: t.qualification,
        experience: t.experience,
        rating,
        students: totalStudents,
        classes: t.classes.length,
        attendanceRate: Math.round(attendanceRate),
        improvement,
        status,
        initials: `${t.user.firstName[0]}${t.user.lastName[0]}`.toUpperCase(),
      };
    });

    // Sort by rating descending
    result.sort((a, b) => b.rating - a.rating);

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching top teachers:', error);
    return { success: false, data: [] };
  }
}

 