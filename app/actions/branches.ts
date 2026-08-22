"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface BranchWithStats {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSections: number;
}

// ─── Get all branches with live counts ─────────────────────────────────────
export async function getBranchesWithStats() {
  try {
    const session = await requireAuth();

    // Enforce branch permissions for staff
    let allowedBranchIds: string[] | null = null;
    if (session.role === 'STAFF') {
      const staff = await prisma.staff.findUnique({
        where: { userId: session.userId },
        select: { allowedBranches: true }
      });
      if (staff) {
        allowedBranchIds = staff.allowedBranches;
      }
    }

    const branches = await prisma.branch.findMany({
      where: { 
        aamarId: session.aamarId,
        ...(allowedBranchIds ? { id: { in: allowedBranchIds } } : {})
      },
      include: {
        classes: {
          include: {
            sections: {
              include: {
                students: { select: { id: true } },
              },
            },
          },
        },
        users: {
          where: { role: "TEACHER" },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const data: BranchWithStats[] = branches.map((b) => {
      const totalStudents = b.classes.reduce(
        (sum, cls) =>
          sum +
          cls.sections.reduce((s, sec) => s + sec.students.length, 0),
        0
      );
      const totalTeachers = b.users.length;
      const totalClasses = b.classes.length;
      const totalSections = b.classes.reduce(
        (sum, cls) => sum + cls.sections.length,
        0
      );

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        address: b.address ?? "",
        phone: b.phone ?? "",
        email: b.email ?? "",
        isActive: b.isActive,
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSections,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching branches with stats:", error);
    return { success: false, data: [] as BranchWithStats[], error: error instanceof Error ? error.message : "Failed to fetch branches" };
  }
}

// ─── Add a new branch ───────────────────────────────────────────────────────
export async function addBranch(formData: {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}) {
  try {
    const session = await requireAuth();

    if (!formData.name || !formData.code) {
      return { success: false, error: "Name and code are required" };
    }

    if (!session.schoolId) {
      return { success: false, error: "School not found" };
    }

    const branch = await prisma.branch.create({
      data: {
        aamarId: session.aamarId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        schoolId: session.schoolId,
      },
    });

    revalidatePath("/dashboard/branches");
    return { success: true, data: branch };
  } catch (error: any) {
    console.error("Error adding branch:", error);
    if (error?.code === "P2002") {
      return { success: false, error: "Branch code already exists" };
    }
    return { success: false, error: "Failed to add branch" };
  }
}

// ─── Toggle branch active status ───────────────────────────────────────────
export async function toggleBranchStatus(id: string, isActive: boolean) {
  try {
    await prisma.branch.update({
      where: { id },
      data: { isActive: !isActive },
    });
    revalidatePath("/dashboard/branches");
    return { success: true };
  } catch (error) {
    console.error("Error toggling branch status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// ─── Get branches by aamarId ────────────────────────────────────────────────
export async function getBranchesByAamarId(aamarId: string) {
  try {
    const branches = await prisma.branch.findMany({
      where: { aamarId },
      orderBy: { name: "asc" },
    });
    return { success: true, data: branches };
  } catch (error) {
    console.error("Error fetching branches by aamarId:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch branches by aamarId" };
  }
}