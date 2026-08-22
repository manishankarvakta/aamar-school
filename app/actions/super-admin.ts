"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Verify that the user is an admin
async function requireAdminAuth() {
  const session = await requireAuth();
  if (session.role !== 'SUPER_ADMIN') {
    throw new Error("Unauthorized: Super Admin access only.");
  }
  return session;
}

// ─── Get overall system statistics ──────────────────────────────────────────
export async function getSuperAdminStats() {
  try {
    await requireAdminAuth();

    const [
      totalSchools,
      totalStudents,
      maleStudents,
      femaleStudents,
      totalTeachers,
      maleTeachers,
      femaleTeachers,
      totalStaff,
      totalParents,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.student.count(),
      prisma.student.count({
        where: { user: { profile: { gender: "MALE" } } },
      }),
      prisma.student.count({
        where: { user: { profile: { gender: "FEMALE" } } },
      }),
      prisma.teacher.count(),
      prisma.teacher.count({
        where: { user: { profile: { gender: "MALE" } } },
      }),
      prisma.teacher.count({
        where: { user: { profile: { gender: "FEMALE" } } },
      }),
      prisma.staff.count(),
      prisma.parent.count(),
    ]);

    // Fetch top 5 schools based on student population for the chart data
    const schoolsWithStats = await prisma.school.findMany({
      select: {
        name: true,
        users: {
          select: {
            role: true,
          }
        }
      }
    });

    const schoolChartData = schoolsWithStats.map(school => {
      const students = school.users.filter(u => u.role === 'STUDENT').length;
      const teachers = school.users.filter(u => u.role === 'TEACHER').length;
      return {
        name: school.name,
        students,
        teachers,
      };
    });

    // Sort by student count descending and take top 5
    const topSchools = schoolChartData
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalSchools,
        totalStudents,
        studentGender: { male: maleStudents, female: femaleStudents },
        totalTeachers,
        teacherGender: { male: maleTeachers, female: femaleTeachers },
        totalStaff,
        totalParents,
        topSchools,
      },
    };
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

// ─── Get list of all schools ────────────────────────────────────────────────
export async function getSchoolsList() {
  try {
    await requireAdminAuth();

    const schools = await prisma.school.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        email: true,
        phone: true,
      },
    });

    return { success: true, data: schools };
  } catch (error) {
    console.error("Error fetching schools list:", error);
    return { success: false, error: "Failed to fetch schools" };
  }
}

// ─── Get detailed data for a specific school ────────────────────────────────
export async function getSchoolData(schoolId: string) {
  try {
    await requireAdminAuth();

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!school) {
      return { success: false, error: "School not found" };
    }

    const [
      studentsCount,
      boysCount,
      girlsCount,
      teachersCount,
      maleTeachersCount,
      femaleTeachersCount,
      staffCount,
      parentsCount,
      studentsList,
      teachersList,
      parentsList,
    ] = await Promise.all([
      prisma.student.count({ where: { userId: { in: school.users.map((u) => u.id) } } }),
      prisma.student.count({
        where: {
          userId: { in: school.users.map((u) => u.id) },
          user: { profile: { gender: "MALE" } },
        },
      }),
      prisma.student.count({
        where: {
          userId: { in: school.users.map((u) => u.id) },
          user: { profile: { gender: "FEMALE" } },
        },
      }),
      prisma.teacher.count({ where: { userId: { in: school.users.map((u) => u.id) } } }),
      prisma.teacher.count({
        where: {
          userId: { in: school.users.map((u) => u.id) },
          user: { profile: { gender: "MALE" } },
        },
      }),
      prisma.teacher.count({
        where: {
          userId: { in: school.users.map((u) => u.id) },
          user: { profile: { gender: "FEMALE" } },
        },
      }),
      prisma.staff.count({ where: { userId: { in: school.users.map((u) => u.id) } } }),
      prisma.parent.count({ where: { userId: { in: school.users.map((u) => u.id) } } }),
      
      // Fetch students
      prisma.student.findMany({
        where: { user: { schoolId } },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          class: true,
          section: true,
          parent: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Fetch teachers
      prisma.teacher.findMany({
        where: { user: { schoolId } },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Fetch parents
      prisma.parent.findMany({
        where: { user: { schoolId } },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          students: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const { users, ...schoolWithoutUsers } = school;

    return {
      success: true,
      data: {
        school: schoolWithoutUsers,
        stats: {
          totalStudents: studentsCount,
          boys: boysCount,
          girls: girlsCount,
          totalTeachers: teachersCount,
          maleTeachers: maleTeachersCount,
          femaleTeachers: femaleTeachersCount,
          totalStaff: staffCount,
          totalParents: parentsCount,
        },
        users,
        students: studentsList,
        teachers: teachersList,
        parents: parentsList,
      },
    };
  } catch (error) {
    console.error("Error fetching school details:", error);
    return { success: false, error: "Failed to fetch school details" };
  }
}

// ─── Toggle School Active/Inactive status ──────────────────────────────────
export async function toggleSchoolStatus(schoolId: string, isActive: boolean) {
  try {
    await requireAdminAuth();

    await prisma.school.update({
      where: { id: schoolId },
      data: { isActive },
    });

    revalidatePath("/dashboard/super-admin");
    return { success: true, message: `School status updated to ${isActive ? "Active" : "Inactive"}` };
  } catch (error) {
    console.error("Error updating school status:", error);
    return { success: false, error: "Failed to update school status" };
  }
}

// ─── Toggle User Active/Inactive status ───────────────────────────────────
export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    await requireAdminAuth();

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath("/dashboard/super-admin");
    return { success: true, message: `User status updated successfully` };
  } catch (error) {
    console.error("Error updating user status:", error);
    return { success: false, error: "Failed to update user status" };
  }
}

// ─── Delete School User ───────────────────────────────────────────────────
export async function deleteSchoolUser(userId: string) {
  try {
    await requireAdminAuth();

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/dashboard/super-admin");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting school user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function startImpersonation(schoolId: string) {
  try {
    await requireAdminAuth();

    const cookieStore = await cookies();
    cookieStore.set('impersonated_school_id', schoolId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Clear branch selection to avoid mismatch
    cookieStore.delete('selectedBranchId');

    return { success: true };
  } catch (error) {
    console.error("Error starting impersonation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to start impersonation" };
  }
}

export async function stopImpersonation() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('impersonated_school_id');
    cookieStore.delete('selectedBranchId');
    return { success: true };
  } catch (error) {
    console.error("Error stopping impersonation:", error);
    return { success: false, error: "Failed to stop impersonation" };
  }
}

export async function getAllStudentsAcrossSchools() {
  try {
    await requireAdminAuth();

    const students = await prisma.student.findMany({
      include: {
        user: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                code: true,
              }
            },
            profile: {
              select: {
                gender: true,
                phone: true,
              }
            }
          }
        },
        class: {
          select: {
            name: true,
          }
        },
        section: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("Error fetching all students across schools:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch student directory" };
  }
}

export async function getAllTeachersAcrossSchools() {
  try {
    await requireAdminAuth();

    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                code: true,
              }
            },
            profile: {
              select: {
                gender: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: teachers };
  } catch (error) {
    console.error("Error fetching all teachers across schools:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch teacher directory" };
  }
}
