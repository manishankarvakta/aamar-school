'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/session';
import { Gender } from '@prisma/client';

// Remove hardcoded identifier - now using session data
// const CURRENT_AAMAR_ID = '234567';

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  rollNumber: string;
  admissionDate: string;
  sectionId: string;
  parentId?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  birthCertificateNo?: string;
  nIdNo?: string;
  nationality?: string;
  religion?: string;
}

// Update student information
export async function updateStudent(studentId: string, formData: {
  // Personal information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  birthCertificateNo?: string;
  // Academic information
  rollNumber: string;
  isActive: boolean;
  admissionDate: string;
  // Parent information (optional)
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  relation?: string;
}) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    // First, verify the student exists and belongs to the current organization
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        aamarId: session.aamarId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        parent: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!existingStudent) {
      return {
        success: false,
        error: 'Student not found',
      };
    }

    // Update student and related data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user information
      const updatedUser = await tx.user.update({
        where: { id: existingStudent.userId },
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          isActive: formData.isActive,
          profile: {
            update: {
              phone: formData.phone || null,
              address: formData.address || null,
              dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
              gender: formData.gender && ['MALE', 'FEMALE', 'OTHER'].includes(formData.gender) 
                ? formData.gender as Gender 
                : null,
              bloodGroup: formData.bloodGroup || null,
              nationality: formData.nationality || null,
              religion: formData.religion || null,
              birthCertificateNo: formData.birthCertificateNo || null,
            },
          },
        },
      });

      // Update student information
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: {
          rollNumber: formData.rollNumber,
          admissionDate: new Date(formData.admissionDate),
        },
      });

      // Update parent information if provided and parent exists
      if (existingStudent.parent && formData.parentFirstName) {
        await tx.user.update({
          where: { id: existingStudent.parent.userId },
          data: {
            firstName: formData.parentFirstName,
            lastName: formData.parentLastName || '',
            email: formData.parentEmail || existingStudent.parent.user.email,
          },
        });

        // Update parent profile
        if (existingStudent.parent.user.profile) {
          await tx.profile.update({
            where: { id: existingStudent.parent.user.profile.id },
            data: {
              phone: formData.parentPhone || null,
            },
          });
        } else if (formData.parentPhone) {
          await tx.profile.create({
            data: {
              aamarId: session.aamarId,
              userId: existingStudent.parent.userId,
              phone: formData.parentPhone,
            },
          });
        }

        // Update parent relation
        await tx.parent.update({
          where: { id: existingStudent.parent.id },
          data: {
            relation: formData.relation || existingStudent.parent.relation,
          },
        });
      }

      return { user: updatedUser, student: updatedStudent };
    });

    // Revalidate the students page to refresh data
    revalidatePath('/dashboard/students');

    return {
      success: true,
      data: result.student,
      message: 'Student updated successfully',
    };
  } catch (error) {
    console.error('Error updating student:', error);
    return {
      success: false,
      error: 'Failed to update student information',
    };
  }
}

// Get all students with their related data
export async function getStudents() {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                branch: true,
                teacher: {
                  include: {
                    user: true,
                  },
                },
                subjects: true,
              },
            },
          },
        },
        parent: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        attendance: {
          take: 10,
          orderBy: {
            date: 'desc',
          },
        },
        fees: {
          orderBy: {
            dueDate: 'desc',
          },
        },
        examResults: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    console.error('Error fetching students:', error);
    return {
      success: false,
      error: 'Failed to fetch students',
    };
  }
}

// Get student by ID with full details
export async function getStudentById(studentId: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        aamarId: session.aamarId,
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                branch: true,
                teacher: {
                  include: {
                    user: true,
                  },
                },
                subjects: true,
              },
            },
          },
        },
        parent: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        attendance: {
          orderBy: {
            date: 'desc',
          },
          take: 30, // Last 30 attendance records
        },
        fees: {
          orderBy: {
            dueDate: 'desc',
          },
        },
        examResults: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        bookBorrowings: {
          include: {
            book: true,
          },
          orderBy: {
            borrowDate: 'desc',
          },
        },
      },
    });

    if (!student) {
      return {
        success: false,
        error: 'Student not found',
      };
    }

    return {
      success: true,
      data: student,
    };
  } catch (error) {
    console.error('Error fetching student:', error);
    return {
      success: false,
      error: 'Failed to fetch student details',
    };
  }
}

// Get students by section
export async function getStudentsBySection(sectionId: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const students = await prisma.student.findMany({
      where: {
        sectionId,
        aamarId: session.aamarId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        section: {
          include: {
            class: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
        attendance: {
          take: 5,
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        rollNumber: 'asc',
      },
    });

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    console.error('Error fetching students by section:', error);
    return {
      success: false,
      error: 'Failed to fetch students',
    };
  }
}

// Get students by branch
export async function getStudentsByBranch(branchId: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
        user: {
          branchId,
        },
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                teacher: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [
        {
          section: {
            class: {
              name: 'asc',
            },
          },
        },
        {
          rollNumber: 'asc',
        },
      ],
    });

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    console.error('Error fetching students by branch:', error);
    return {
      success: false,
      error: 'Failed to fetch students',
    };
  }
}

// Get student statistics
export async function getStudentStats() {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const [
      totalStudents,
      activeStudents,
      maleStudents,
      femaleStudents,
      studentsWithFees,
      recentAdmissions,
    ] = await Promise.all([
      // Total students
      prisma.student.count({
        where: {
          aamarId: session.aamarId,
        },
      }),
      
      // Active students (based on user.isActive)
      prisma.student.count({
        where: {
          aamarId: session.aamarId,
          user: {
            isActive: true,
          },
        },
      }),
      
      // Male students
      prisma.student.count({
        where: {
          aamarId: session.aamarId,
          user: {
            profile: {
              gender: 'MALE',
            },
          },
        },
      }),
      
      // Female students
      prisma.student.count({
        where: {
          aamarId: session.aamarId,
          user: {
            profile: {
              gender: 'FEMALE',
            },
          },
        },
      }),
      
      // Students with pending fees
      prisma.student.count({
        where: {
          aamarId: session.aamarId,
          fees: {
            some: {
              status: 'PENDING',
            },
          },
        },
      }),
      
      // Recent admissions (last 30 days)
      prisma.student.count({
        where: {
          aamarId: session.aamarId,
          admissionDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalStudents,
        activeStudents,
        maleStudents,
        femaleStudents,
        studentsWithFees,
        recentAdmissions,
      },
    };
  } catch (error) {
    console.error('Error fetching student statistics:', error);
    return {
      success: false,
      error: 'Failed to fetch statistics',
    };
  }
}

// Search students
export async function searchStudents(query: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
        OR: [
          {
            user: {
              firstName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              lastName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              email: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            rollNumber: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true,
          },
        },
        section: {
          include: {
            class: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        rollNumber: 'asc',
      },
    });

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    console.error('Error searching students:', error);
    return {
      success: false,
      error: 'Failed to search students',
    };
  }
}

// Create a new student
export async function createStudent(formData: StudentFormData) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.rollNumber || !formData.sectionId) {
      return {
        success: false,
        error: 'First name, last name, roll number, and section are required',
      };
    }

    // Check if roll number already exists in the same aamarId
    const existingStudent = await prisma.student.findFirst({
      where: {
        aamarId: session.aamarId,
        rollNumber: formData.rollNumber,
      },
    });

    if (existingStudent) {
      return {
        success: false,
        error: 'Roll number already exists',
      };
    }

    // Get section details to ensure it belongs to the same aamarId
    const section = await prisma.section.findFirst({
      where: {
        id: formData.sectionId,
        aamarId: session.aamarId,
      },
      include: {
        class: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!section) {
      return {
        success: false,
        error: 'Invalid section selected',
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          aamarId: session.aamarId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: 'temp123', // Temporary password - should be changed on first login
          role: 'STUDENT',
          schoolId: session.schoolId,
          branchId: section.class.branch.id,
          profile: {
            create: {
              aamarId: session.aamarId,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
              gender: formData.gender,
              bloodGroup: formData.bloodGroup,
              birthCertificateNo: formData.birthCertificateNo,
              nIdNo: formData.nIdNo,
              nationality: formData.nationality,
              religion: formData.religion,
            },
          },
        },
      });

      // Create student record
      const student = await tx.student.create({
        data: {
          aamarId: session.aamarId,
          userId: user.id,
          rollNumber: formData.rollNumber,
          admissionDate: new Date(formData.admissionDate),
          sectionId: formData.sectionId,
          parentId: formData.parentId,
        },
      });

      return { user, student };
    });

    revalidatePath('/dashboard/students');
    return {
      success: true,
      data: result.student,
      message: 'Student created successfully',
    };
  } catch (error) {
    console.error('Error creating student:', error);
    return {
      success: false,
      error: 'Failed to create student',
    };
  }
}

// Delete student
export async function deleteStudent(id: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    // Check if student exists and belongs to the same aamarId
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        aamarId: session.aamarId,
      },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      return {
        success: false,
        error: 'Student not found',
      };
    }

    await prisma.$transaction(async (tx) => {
      // Delete student record first
      await tx.student.delete({
        where: { id },
      });

      // Delete user and profile (cascade will handle profile)
      await tx.user.delete({
        where: { id: existingStudent.userId },
      });
    });

    revalidatePath('/dashboard/students');
    return {
      success: true,
      message: 'Student deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting student:', error);
    return {
      success: false,
      error: 'Failed to delete student',
    };
  }
}

// Get students by class
export async function getStudentsByClass(classId: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
        section: {
          classId,
        },
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                teacher: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [
        {
          rollNumber: 'asc',
        },
      ],
    });

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    console.error('Error fetching students by class:', error);
    return {
      success: false,
      error: 'Failed to fetch students',
    };
  }
} 