'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/session';
import { Gender, UserRole } from '@prisma/client';

export interface ParentData {
  id: string;
  parentId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date | null;
  gender?: string | null;
  address: string;
  nationality: string;
  religion: string;
  relation: string;
  occupation: string;
  students: StudentInfo[];
  totalStudents: number;
  lastContact?: Date;
  status: string;
  createdAt?: Date;
}

export interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  branch: string;
}

export interface ParentStats {
  totalParents: number;
  activeParents: number;
  newThisMonth: number;
  parentsWithMultipleChildren: number;
  messagesSent: number;
  pendingIssues: number;
}

export interface ParentResult {
  success: boolean;
  message: string;
  data?: ParentData | ParentData[] | ParentStats | { parentId: string; userId: string } | unknown;
  error?: string;
}

// Get all parents with full details
export async function getParents() {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const parents = await prisma.parent.findMany({
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
        students: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            section: {
              include: {
                class: {
                  include: {
                    branch: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          user: {
            firstName: 'asc',
          },
        },
      ],
    });

    return {
      success: true,
      data: parents,
    };
  } catch (error) {
    console.error('Error fetching parents:', error);
    return {
      success: false,
      error: 'Failed to fetch parents',
    };
  }
}

// Get parent by ID
export async function getParentById(id: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const parent = await prisma.parent.findFirst({
      where: {
        id,
        aamarId: session.aamarId,
      },
      include: {
        user: {
          include: {
            profile: true,
            branch: true,
          },
        },
        students: {
          include: {
            user: {
              include: {
                profile: true,
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
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return {
        success: false,
        error: 'Parent not found',
      };
    }

    return {
      success: true,
      data: parent,
    };
  } catch (error) {
    console.error('Error fetching parent:', error);
    return {
      success: false,
      error: 'Failed to fetch parent',
    };
  }
}

// Create a new parent
export async function createParent(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  occupation?: string;
  relationship?: string;
  emergencyContact?: string;
  branchId?: string;
}) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return {
        success: false,
        error: 'First name, last name, and email are required',
      };
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Email already exists',
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
          role: UserRole.PARENT,
          schoolId: session.schoolId,
          branchId: formData.branchId || session.branchId,
          profile: {
            create: {
              aamarId: session.aamarId,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
              gender: formData.gender && ['MALE', 'FEMALE', 'OTHER'].includes(formData.gender) 
                ? formData.gender as Gender 
                : null,
            },
          },
        },
      });

              // Create parent record
        const parent = await tx.parent.create({
          data: {
            aamarId: session.aamarId,
            userId: user.id,
            relation: formData.relationship || 'Parent',
          },
        });

      return { user, parent };
    });

    revalidatePath('/dashboard/parents');
    return {
      success: true,
      data: result.parent,
      message: 'Parent created successfully',
    };
  } catch (error) {
    console.error('Error creating parent:', error);
    return {
      success: false,
      error: 'Failed to create parent',
    };
  }
}

// Update parent
export async function updateParent(id: string, formData: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  occupation?: string;
  relationship?: string;
  emergencyContact?: string;
  branchId?: string;
}) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    // Check if parent exists and belongs to the same aamarId
    const existingParent = await prisma.parent.findFirst({
      where: {
        id,
        aamarId: session.aamarId,
      },
      include: {
        user: true,
      },
    });

    if (!existingParent) {
      return {
        success: false,
        error: 'Parent not found',
      };
    }

    // If email is being updated, check for duplicates
    if (formData.email && formData.email !== existingParent.user.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: formData.email },
      });

      if (duplicateEmail) {
        return {
          success: false,
          error: 'Email already exists',
        };
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update user information
      const updatedUser = await tx.user.update({
        where: { id: existingParent.userId },
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          branchId: formData.branchId,
          profile: {
            update: {
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
              gender: formData.gender && ['MALE', 'FEMALE', 'OTHER'].includes(formData.gender) 
                ? formData.gender as Gender 
                : undefined,
            },
          },
        },
      });

              // Update parent information
        const updatedParent = await tx.parent.update({
          where: { id },
          data: {
            relation: formData.relationship,
          },
        });

      return { user: updatedUser, parent: updatedParent };
    });

    revalidatePath('/dashboard/parents');
    return {
      success: true,
      data: result.parent,
      message: 'Parent updated successfully',
    };
  } catch (error) {
    console.error('Error updating parent:', error);
    return {
      success: false,
      error: 'Failed to update parent',
    };
  }
}

// Delete parent
export async function deleteParent(id: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    // Check if parent exists and belongs to the same aamarId
    const existingParent = await prisma.parent.findFirst({
      where: {
        id,
        aamarId: session.aamarId,
      },
      include: {
        user: true,
        students: true,
      },
    });

    if (!existingParent) {
      return {
        success: false,
        error: 'Parent not found',
      };
    }

    // Check if parent has students
    if (existingParent.students.length > 0) {
      return {
        success: false,
        error: 'Cannot delete parent with students',
        message: 'Please reassign or remove students before deleting this parent',
      };
    }

    await prisma.$transaction(async (tx) => {
      // Delete parent record first
      await tx.parent.delete({
        where: { id },
      });

      // Delete user and profile (cascade will handle profile)
      await tx.user.delete({
        where: { id: existingParent.userId },
      });
    });

    revalidatePath('/dashboard/parents');
    return {
      success: true,
      message: 'Parent deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting parent:', error);
    return {
      success: false,
      error: 'Failed to delete parent',
    };
  }
}

// Get parents by branch
export async function getParentsByBranch(branchId: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const parents = await prisma.parent.findMany({
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
        students: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            section: {
              include: {
                class: {
                  include: {
                    branch: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          user: {
            firstName: 'asc',
          },
        },
      ],
    });

    return {
      success: true,
      data: parents,
    };
  } catch (error) {
    console.error('Error fetching parents by branch:', error);
    return {
      success: false,
      error: 'Failed to fetch parents',
    };
  }
}

// Get parent statistics
export async function getParentStats() {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const [
      totalParents,
      activeParents,
      maleParents,
      femaleParents,
      parentsWithMultipleChildren,
    ] = await Promise.all([
      prisma.parent.count({
        where: {
          aamarId: session.aamarId,
        },
      }),
      prisma.parent.count({
        where: {
          aamarId: session.aamarId,
          user: {
            isActive: true,
          },
        },
      }),
      prisma.parent.count({
        where: {
          aamarId: session.aamarId,
          user: {
            profile: {
              gender: 'MALE',
            },
          },
        },
      }),
      prisma.parent.count({
        where: {
          aamarId: session.aamarId,
          user: {
            profile: {
              gender: 'FEMALE',
            },
          },
        },
      }),
      prisma.parent.count({
        where: {
          aamarId: session.aamarId,
          students: {
            some: {
              id: {
                not: undefined,
              },
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalParents,
        activeParents,
        inactiveParents: totalParents - activeParents,
        maleParents,
        femaleParents,
        parentsWithMultipleChildren,
      },
    };
  } catch (error) {
    console.error('Error fetching parent stats:', error);
    return {
      success: false,
      error: 'Failed to fetch parent statistics',
    };
  }
}

// Search parents
export async function searchParents(query: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    
    const parents = await prisma.parent.findMany({
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
            relation: {
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
        students: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            section: {
              include: {
                class: {
                  include: {
                    branch: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          user: {
            firstName: 'asc',
          },
        },
      ],
    });

    return {
      success: true,
      data: parents,
    };
  } catch (error) {
    console.error('Error searching parents:', error);
    return {
      success: false,
      error: 'Failed to search parents',
    };
  }
} 