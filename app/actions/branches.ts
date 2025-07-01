"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

// Fetch a single branch by aamarId
export async function getBranchByAamarId(id: string, aamarId: string) {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id,aamarId },
    });
    if (!branch) {
      return { success: false, message: "Branch not found" };
    }
    return { success: true, data: branch };
  } catch (error) {
    return { success: false, message: "Error fetching branch" };
  }
}

// Fetch multiple branches by aamarId (if aamarId is not unique, or for future-proofing)
export async function getBranchesByAamarId() {
  try {
    const session = await requireAuth();
    
    const branches = await prisma.branch.findMany({
      where: { aamarId: session.aamarId },
    });
    return { success: true, data: branches };
  } catch (error) {
    return { success: false, message: "Error fetching branches" };
  }
} 