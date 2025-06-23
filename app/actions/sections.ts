"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";

export interface SectionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Create a new section
export async function createSection(
  formData: FormData,
): Promise<SectionResult> {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();

    const data = {
      name: formData.get("name") as string,
      capacity: parseInt(formData.get("capacity") as string) || 40,
      classId: formData.get("classId") as string,
    };

    // Validate required fields
    if (!data.name || !data.classId) {
      return {
        success: false,
        message: "Required fields are missing",
      };
    }

    // Get class info for displayName
    const classInfo = await prisma.class.findFirst({
      where: {
        id: data.classId,
        aamarId: session.aamarId,
      },
      include: {
        branch: true,
      },
    });

    if (!classInfo) {
      return {
        success: false,
        message: "Class not found",
      };
    }

    // Check if section already exists for this class
    const existingSection = await prisma.section.findFirst({
      where: {
        classId: data.classId,
        name: data.name,
        aamarId: session.aamarId,
      },
    });

    if (existingSection) {
      return {
        success: false,
        message: `Section ${data.name} already exists for ${classInfo.name}`,
      };
    }

    // Create section
    const section = await prisma.section.create({
      data: {
        aamarId: session.aamarId,
        name: data.name,
        displayName: `${classInfo.name} Section ${data.name}`,
        capacity: data.capacity,
        classId: data.classId,
      },
    });

    revalidatePath("/dashboard/classes");

    return {
      success: true,
      message: `Section ${section.displayName} created successfully!`,
      data: section,
    };
  } catch (error) {
    console.error("Create section error:", error);
    return {
      success: false,
      message: "Failed to create section. Please try again.",
    };
  }
}

// Get all sections for a specific class
export async function getSectionsByClass(classId: string) {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();

    const sections = await prisma.section.findMany({
      where: {
        classId: classId,
        aamarId: session.aamarId,
      },
      include: {
        class: {
          include: {
            branch: true,
          },
        },
        students: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedSections = sections.map((section) => ({
      id: section.id,
      name: section.name,
      displayName: section.displayName,
      capacity: section.capacity,
      studentCount: section._count.students,
      availableSlots: section.capacity - section._count.students,
      class: {
        id: section.class.id,
        name: section.class.name,
        branch: section.class.branch.name,
      },
      students: section.students.map((student) => ({
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        rollNumber: student.rollNumber,
        email: student.user.email,
      })),
    }));

    return {
      success: true,
      data: formattedSections,
    };
  } catch (error) {
    console.error("Error fetching sections:", error);
    return {
      success: false,
      error: "Failed to fetch sections",
    };
  }
}

// Get all sections
export async function getSections() {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();

    const sections = await prisma.section.findMany({
      where: {
        aamarId: session.aamarId,
      },
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
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [
        {
          class: {
            name: "asc",
          },
        },
        {
          name: "asc",
        },
      ],
    });

    const formattedSections = sections.map((section) => ({
      id: section.id,
      name: section.name,
      displayName: section.displayName,
      capacity: section.capacity,
      studentCount: section._count.students,
      availableSlots: section.capacity - section._count.students,
      occupancyRate: Math.round(
        (section._count.students / section.capacity) * 100,
      ),
      class: {
        id: section.class.id,
        name: section.class.name,
        academicYear: section.class.academicYear,
        branch: section.class.branch.name,
        teacher: section.class.teacher
          ? `${section.class.teacher.user.firstName} ${section.class.teacher.user.lastName}`
          : "Not assigned",
      },
      status:
        section._count.students >= section.capacity ? "Full" : "Available",
    }));

    return {
      success: true,
      data: formattedSections,
    };
  } catch (error) {
    console.error("Error fetching sections:", error);
    return {
      success: false,
      error: "Failed to fetch sections",
    };
  }
}

// Update section
export async function updateSection(
  sectionId: string,
  formData: FormData,
): Promise<SectionResult> {
  try {
    const data = {
      name: formData.get("name") as string,
      capacity: parseInt(formData.get("capacity") as string) || 40,
    };

    // Validate required fields
    if (!data.name) {
      return {
        success: false,
        message: "Section name is required",
      };
    }

    // Get section with class info
    const existingSection = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { class: true },
    });

    if (!existingSection) {
      return {
        success: false,
        message: "Section not found",
      };
    }

    // Check if another section with the same name exists for this class
    const duplicateSection = await prisma.section.findFirst({
      where: {
        classId: existingSection.classId,
        name: data.name,
        id: { not: sectionId },
      },
    });

    if (duplicateSection) {
      return {
        success: false,
        message: `Section ${data.name} already exists for ${existingSection.class.name}`,
      };
    }

    // Update section
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        name: data.name,
        displayName: `${existingSection.class.name} ${data.name}`,
        capacity: data.capacity,
      },
    });

    revalidatePath("/dashboard/classes");

    return {
      success: true,
      message: `Section ${updatedSection.displayName} updated successfully!`,
      data: updatedSection,
    };
  } catch (error) {
    console.error("Update section error:", error);
    return {
      success: false,
      message: "Failed to update section. Please try again.",
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
        class: true,
      },
    });

    if (!section) {
      return {
        success: false,
        message: "Section not found",
      };
    }

    if (section.students.length > 0) {
      return {
        success: false,
        message: `Cannot delete section ${section.displayName}. It has ${section.students.length} students enrolled.`,
      };
    }

    // Delete section
    await prisma.section.delete({
      where: { id: sectionId },
    });

    revalidatePath("/dashboard/classes");

    return {
      success: true,
      message: `Section ${section.displayName} deleted successfully!`,
    };
  } catch (error) {
    console.error("Delete section error:", error);
    return {
      success: false,
      message: "Failed to delete section. Please try again.",
    };
  }
}

// Get section statistics
export async function getSectionStats() {
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();

    const [totalSections, totalStudents, totalCapacity, averageOccupancy] =
      await Promise.all([
        prisma.section.count({
          where: { aamarId: session.aamarId },
        }),
        prisma.student.count({
          where: { aamarId: session.aamarId },
        }),
        prisma.section.aggregate({
          where: { aamarId: session.aamarId },
          _sum: { capacity: true },
        }),
        prisma.section.findMany({
          where: { aamarId: session.aamarId },
          include: {
            _count: {
              select: { students: true },
            },
          },
        }),
      ]);

    const occupancyData = averageOccupancy.map((section) => ({
      occupancy:
        section.capacity > 0
          ? (section._count.students / section.capacity) * 100
          : 0,
    }));

    const avgOccupancy =
      occupancyData.length > 0
        ? occupancyData.reduce((sum, item) => sum + item.occupancy, 0) /
          occupancyData.length
        : 0;

    return {
      success: true,
      data: {
        totalSections,
        totalStudents,
        totalCapacity: totalCapacity._sum.capacity || 0,
        averageOccupancy: Math.round(avgOccupancy),
        availableSlots: (totalCapacity._sum.capacity || 0) - totalStudents,
      },
    };
  } catch (error) {
    console.error("Error fetching section stats:", error);
    return {
      success: false,
      error: "Failed to fetch section statistics",
    };
  }
}
