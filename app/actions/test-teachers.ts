'use server';

import { prisma } from '@/lib/prisma';

export async function testTeachers() {
  try {
    console.log('Testing teacher database connection...');
    
    // First, check if we can connect to the database
    const totalTeachers = await prisma.teacher.count();
    console.log('Total teachers in database:', totalTeachers);
    
    // Check teachers with aamarId
    const teachersWithAamarId = await prisma.teacher.count({
      where: {
        user: {
          aamarId: '234567'
        }
      }
    });
    console.log('Teachers with aamarId 234567:', teachersWithAamarId);
    
    // Get a simple list of all teachers without complex includes
    const simpleTeachers = await prisma.teacher.findMany({
      take: 5,
      select: {
        id: true,
        qualification: true,
        experience: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            aamarId: true
          }
        }
      }
    });
    
    console.log('Sample teachers:', JSON.stringify(simpleTeachers, null, 2));
    
    return {
      success: true,
      data: {
        totalTeachers,
        teachersWithAamarId,
        sampleTeachers: simpleTeachers
      }
    };
    
  } catch (error) {
    console.error('Error testing teachers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 