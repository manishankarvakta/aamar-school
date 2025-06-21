const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTeachers() {
  try {
    console.log('Creating test data...');

    // First, check if we have any schools and branches
    let school = await prisma.school.findFirst();
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Test School',
          address: '123 Test Street',
          phone: '555-0123',
          email: 'test@school.com',
          aamarId: '234567'
        }
      });
    }

    let branch = await prisma.branch.findFirst({
      where: { schoolId: school.id }
    });
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          name: 'Main Branch',
          address: '123 Test Street',
          phone: '555-0124',
          schoolId: school.id,
          aamarId: '234567'
        }
      });
    }

    // Create test users and teachers
    const testTeachers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@testschool.com',
        qualification: 'B.Ed in Mathematics',
        experience: 5,
        subjects: ['Mathematics', 'Physics']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@testschool.com',
        qualification: 'M.A in English',
        experience: 8,
        subjects: ['English', 'Literature']
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@testschool.com',
        qualification: 'M.Sc in Chemistry',
        experience: 3,
        subjects: ['Chemistry', 'Biology']
      }
    ];

    for (const teacherData of testTeachers) {
      // Check if teacher already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: teacherData.email }
      });

      if (!existingUser) {
        // Create user
        const user = await prisma.user.create({
          data: {
            firstName: teacherData.firstName,
            lastName: teacherData.lastName,
            email: teacherData.email,
            role: 'TEACHER',
            aamarId: '234567',
            branchId: branch.id,
            password: 'password123',
            schoolId: school.id
          }
        });

        // Create profile
        await prisma.profile.create({
          data: {
            userId: user.id,
            aamarId: '234567',
            phone: '555-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
            address: '123 Teacher Street',
            nationality: 'US',
            religion: 'Christian',
            bloodGroup: 'O+',
          }
        });

        // Create teacher
        await prisma.teacher.create({
          data: {
            userId: user.id,
            aamarId: '234567',
            qualification: teacherData.qualification,
            experience: teacherData.experience,
            subjects: teacherData.subjects
          }
        });

        console.log(`Created teacher: ${teacherData.firstName} ${teacherData.lastName}`);
      } else {
        console.log(`Teacher ${teacherData.firstName} ${teacherData.lastName} already exists`);
      }
    }

    // Count total teachers
    const totalTeachers = await prisma.teacher.count({
      where: {
        user: {
          aamarId: '234567'
        }
      }
    });

    console.log(`\nTotal teachers in database: ${totalTeachers}`);

    console.log('\n✅ Test data creation completed!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTeachers(); 