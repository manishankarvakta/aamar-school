'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface SectionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Create a new section
export async function createSection(formData: FormData): Promise<SectionResult> {
  try {
    const data = {
      name: formData.get('name') as string,
      capacity: parseInt(formData.get('capacity') as string) || 40,
      subjectId: formData.get('subjectId') as string,
    };

    // Validate required fields
    if (!data.name || !data.subjectId) {
      return {
        success: false,
        message: 'Required fields are missing'
      };
    }

    // Get subject info for displayName
    const subjectInfo = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      include: {
        class: true
      }
    });

    if (!subjectInfo) {
      return {
        success: false,
        message: 'Subject not found'
      };
    }

    // Check if section already exists for this subject
    const existingSection = await prisma.section.findFirst({
      where: {
        subjectId: data.subjectId,
        name: data.name
      }
    });

    if (existingSection) {
      return {
        success: false,
        message: `Section ${data.name} already exists for ${subjectInfo.name}`
      };
    }

    // Create section
    const section = await prisma.section.create({
      data: {
        aamarId: '234567',
        name: data.name,
        displayName: `${subjectInfo.name} Section ${data.name}`,
        capacity: data.capacity,
        subjectId: data.subjectId,
      },
    });

    revalidatePath('/dashboard/subjects');

    return {
      success: true,
      message: `Section ${section.displayName} created successfully!`,
      data: section
    };

  } catch (error) {
    console.error('Create section error:', error);
    return {
      success: false,
      message: 'Failed to create section. Please try again.',
    };
  }
}

// Get all sections for a specific subject
export async function getSectionsBySubject(subjectId: string) {
  try {
    const sections = await prisma.section.findMany({
      where: {
        subjectId: subjectId
      },
      include: {
        subject: {
          include: {
            class: {
              include: {
                branch: true
              }
            }
          }
        },
        students: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedSections = sections.map(section => ({
      id: section.id,
      name: section.name,
      displayName: section.displayName,
      capacity: section.capacity,
      studentCount: section._count.students,
      availableSlots: section.capacity - section._count.students,
      subject: {
        id: section.subject.id,
        name: section.subject.name,
        code: section.subject.code,
        class: {
          id: section.subject.class.id,
          name: section.subject.class.name,
          branch: section.subject.class.branch.name,
        }
      },
      students: section.students.map(student => ({
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        rollNumber: student.rollNumber,
        email: student.user.email
      }))
    }));

    return {
      success: true,
      data: formattedSections
    };

  } catch (error) {
    console.error('Error fetching sections:', error);
    return {
      success: false,
      error: 'Failed to fetch sections'
    };
  }
}

// Get all sections
export async function getSections(aamarId: string = '234567') {
  try {
    const sections = await prisma.section.findMany({
      where: {
        aamarId: aamarId
      },
      include: {
        subject: {
          include: {
            class: {
              include: {
                branch: true,
                teacher: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: [
        {
          subject: {
            class: {
              name: 'asc'
            }
          }
        },
        {
          subject: {
            name: 'asc'
          }
        },
        {
          name: 'asc'
        }
      ]
    });

    const formattedSections = sections.map(section => ({
      id: section.id,
      name: section.name,
      displayName: section.displayName,
      capacity: section.capacity,
      studentCount: section._count.students,
      availableSlots: section.capacity - section._count.students,
      occupancyRate: Math.round((section._count.students / section.capacity) * 100),
      subject: {
        id: section.subject.id,
        name: section.subject.name,
        code: section.subject.code,
        class: {
          id: section.subject.class.id,
          name: section.subject.class.name,
          academicYear: section.subject.class.academicYear,
          branch: section.subject.class.branch.name,
          teacher: section.subject.class.teacher ? `${section.subject.class.teacher.user.firstName} ${section.subject.class.teacher.user.lastName}` : 'Not assigned'
        }
      },
      status: section._count.students >= section.capacity ? 'Full' : 'Available'
    }));

    return {
      success: true,
      data: formattedSections
    };

  } catch (error) {
    console.error('Error fetching sections:', error);
    return {
      success: false,
      error: 'Failed to fetch sections'
    };
  }
}

// Update section
export async function updateSection(sectionId: string, formData: FormData): Promise<SectionResult> {
  try {
    const data = {
      name: formData.get('name') as string,
      capacity: parseInt(formData.get('capacity') as string) || 40,
    };

    // Validate required fields
    if (!data.name) {
      return {
        success: false,
        message: 'Section name is required'
      };
    }

    // Get section with class info
    const existingSection = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { class: true }
    });

    if (!existingSection) {
      return {
        success: false,
        message: 'Section not found'
      };
    }

    // Check if another section with the same name exists for this class
    const duplicateSection = await prisma.section.findFirst({
      where: {
        classId: existingSection.classId,
        name: data.name,
        id: { not: sectionId }
      }
    });

    if (duplicateSection) {
      return {
        success: false,
        message: `Section ${data.name} already exists for ${existingSection.class.name}`
      };
    }

    // Update section
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        name: data.name,
        displayName: `${existingSection.class.name} ${data.name}`,
        capacity: data.capacity,
      }
    });

    revalidatePath('/dashboard/classes');

    return {
      success: true,
      message: `Section ${updatedSection.displayName} updated successfully!`,
      data: updatedSection
    };

  } catch (error) {
    console.error('Update section error:', error);
    return {
      success: false,
      message: 'Failed to update section. Please try again.',
    };
  }
}

// Delete section
export async function deleteSection(sectionId: string): Promise<SectionResult> {
  try {
    // Check if section has students
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        students: true,
        class: true
      }
    });

    if (!section) {
      return {
        success: false,
        message: 'Section not found'
      };
    }

    if (section.students.length > 0) {
      return {
        success: false,
        message: `Cannot delete section ${section.displayName}. It has ${section.students.length} students enrolled.`
      };
    }

    // Delete section
    await prisma.section.delete({
      where: { id: sectionId }
    });

    revalidatePath('/dashboard/classes');

    return {
      success: true,
      message: `Section ${section.displayName} deleted successfully!`
    };

  } catch (error) {
    console.error('Delete section error:', error);
    return {
      success: false,
      message: 'Failed to delete section. Please try again.',
    };
  }
}

// Get section statistics
export async function getSectionStats(aamarId: string = '234567') {
  try {
    const [totalSections, totalStudents, totalCapacity, averageOccupancy] = await Promise.all([
      prisma.section.count({
        where: { aamarId }
      }),
      prisma.student.count({
        where: { aamarId }
      }),
      prisma.section.aggregate({
        where: { aamarId },
        _sum: { capacity: true }
      }),
      prisma.section.findMany({
        where: { aamarId },
        include: {
          _count: {
            select: { students: true }
          }
        }
      })
    ]);

    const occupancyData = averageOccupancy.map(section => ({
      occupancy: section.capacity > 0 ? (section._count.students / section.capacity) * 100 : 0
    }));

    const avgOccupancy = occupancyData.length > 0 
      ? occupancyData.reduce((sum, item) => sum + item.occupancy, 0) / occupancyData.length 
      : 0;

    return {
      success: true,
      data: {
        totalSections,
        totalStudents,
        totalCapacity: totalCapacity._sum.capacity || 0,
        averageOccupancy: Math.round(avgOccupancy),
        availableSlots: (totalCapacity._sum.capacity || 0) - totalStudents
      }
    };

  } catch (error) {
    console.error('Error fetching section stats:', error);
    return {
      success: false,
      error: 'Failed to fetch section statistics'
    };
  }
} 