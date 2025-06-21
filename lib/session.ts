import { cookies } from 'next/headers';
import { verifyToken, DecodedToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export interface SessionData {
  userId: string;
  role: string;
  aamarId: string;
  schoolId: string;
  branchId: string | null;
}

/**
 * Get session data from JWT token and database
 * This function extracts the user's session information including aamarId
 */
export async function getSessionData(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // Verify and decode JWT token
    const decodedToken: DecodedToken = await verifyToken(token);

    // Get user's aamarId from database
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      select: {
        id: true,
        aamarId: true,
        role: true,
        schoolId: true,
        branchId: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      role: user.role,
      aamarId: user.aamarId,
      schoolId: user.schoolId,
      branchId: user.branchId,
    };
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
}

/**
 * Get session data or throw error if not authenticated
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSessionData();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
} 