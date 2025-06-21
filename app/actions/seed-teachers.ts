'use server';

import { prisma } from '@/lib/prisma';
import { UserRole, Gender } from '@prisma/client';

export async function seedTestTeachers() {
  try {
    // Check if we have any teachers
    const existingTeachers = await prisma.teacher.count();
    
    if (existingTeachers > 0) {
      return {
        success: true,
        message: `Database already has ${existingTeachers} teachers. No seeding needed.`
      };
    }

    // Get or create a school and branch first
    let school = await prisma.school.findFirst({
      where: { aamarId: '234567' }
    });

    if (!school) {
      school = await prisma.school.create({
        data: {
          aamarId: '234567',
          name: 'Demo School',
          code: 'DEMO001',
          address: '123 Demo Street',
          phone: '+1234567890',
          email: 'demo@school.com'
        }
      });
    }

    let branch = await prisma.branch.findFirst({
      where: { schoolId: school.id }
    });

    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          aamarId: '234567',
          name: 'Main Branch',
          code: 'MAIN001',
          address: '123 Demo Street',
          phone: '+1234567890',
          email: 'main@school.com',
          schoolId: school.id
        }
      });
    }

    // Create test teachers
    const testTeachers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@school.com',
        qualification: 'Master of Science in Mathematics',
        experience: 5,
        subjects: ['Mathematics', 'Physics']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@school.com',
        qualification: 'Bachelor of Arts in English Literature',
        experience: 3,
        subjects: ['English', 'Literature']
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@school.com',
        qualification: 'Master of Science in Chemistry',
        experience: 8,
        subjects: ['Chemistry', 'Biology']
      }
    ];

    const createdTeachers = [];

    for (const teacherData of testTeachers) {
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            firstName: teacherData.firstName,
            lastName: teacherData.lastName,
            email: teacherData.email,
            role: UserRole.TEACHER,
            aamarId: '234567',
            password: 'password123', // In production, this should be hashed
            schoolId: school.id,
            branchId: branch.id,
          }
        });

        // Create profile
        await tx.profile.create({
          data: {
            userId: user.id,
            aamarId: '234567',
            phone: '+1234567890',
            gender: Gender.MALE,
          }
        });

        // Create teacher
        const teacher = await tx.teacher.create({
          data: {
            userId: user.id,
            aamarId: '234567',
            qualification: teacherData.qualification,
            experience: teacherData.experience,
            subjects: teacherData.subjects,
          }
        });

        return { user, teacher };
      });

      createdTeachers.push(result);
    }

    return {
      success: true,
      message: `Successfully created ${createdTeachers.length} test teachers`,
      data: createdTeachers
    };

  } catch (error) {
    console.error('Error seeding teachers:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to seed teachers'
    };
  }
} 