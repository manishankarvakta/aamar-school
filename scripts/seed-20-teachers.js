const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed20Teachers() {
  try {
    console.log('Creating 20 teachers seed data...');

    // First, ensure we have a school and branch
    let school = await prisma.school.findFirst();
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Aamar School',
          address: '123 Education Street',
          phone: '555-0123',
          email: 'admin@aamarschool.com',
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
          name: 'Main Campus',
          address: '123 Education Street',
          phone: '555-0124',
          schoolId: school.id,
          aamarId: '234567'
        }
      });
    }

    // Create another branch for variety
    let branch2 = await prisma.branch.findFirst({
      where: { 
        schoolId: school.id,
        name: 'North Campus'
      }
    });
    if (!branch2) {
      branch2 = await prisma.branch.create({
        data: {
          name: 'North Campus',
          address: '456 Learning Avenue',
          phone: '555-0125',
          schoolId: school.id,
          aamarId: '234567'
        }
      });
    }

    // Teacher data with variety
    const teachersData = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@aamarschool.com',
        qualification: 'M.Ed in Elementary Education',
        experience: 8,
        subjects: ['Mathematics', 'Science'],
        branchId: branch.id,
        gender: 'FEMALE',
        phone: '555-1001',
        nationality: 'American',
        religion: 'Christian'
      },
      {
        firstName: 'Robert',
        lastName: 'Williams',
        email: 'robert.williams@aamarschool.com',
        qualification: 'B.A in English Literature',
        experience: 5,
        subjects: ['English', 'Literature'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1002',
        nationality: 'American',
        religion: 'Christian'
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@aamarschool.com',
        qualification: 'M.A in Spanish',
        experience: 7,
        subjects: ['Spanish', 'Social Studies'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1003',
        nationality: 'Spanish',
        religion: 'Catholic'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@aamarschool.com',
        qualification: 'M.Sc in Physics',
        experience: 10,
        subjects: ['Physics', 'Mathematics'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1004',
        nationality: 'British',
        religion: 'Anglican'
      },
      {
        firstName: 'Jennifer',
        lastName: 'Davis',
        email: 'jennifer.davis@aamarschool.com',
        qualification: 'M.Sc in Chemistry',
        experience: 6,
        subjects: ['Chemistry', 'Biology'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1005',
        nationality: 'Canadian',
        religion: 'Protestant'
      },
      {
        firstName: 'Michael',
        lastName: 'Miller',
        email: 'michael.miller@aamarschool.com',
        qualification: 'B.Ed in Physical Education',
        experience: 4,
        subjects: ['Physical Education', 'Health'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1006',
        nationality: 'American',
        religion: 'Methodist'
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@aamarschool.com',
        qualification: 'M.A in Art Education',
        experience: 9,
        subjects: ['Art', 'Creative Writing'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1007',
        nationality: 'Australian',
        religion: 'Non-religious'
      },
      {
        firstName: 'James',
        lastName: 'Moore',
        email: 'james.moore@aamarschool.com',
        qualification: 'M.Sc in Computer Science',
        experience: 3,
        subjects: ['Computer Science', 'Mathematics'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1008',
        nationality: 'American',
        religion: 'Baptist'
      },
      {
        firstName: 'Lisa',
        lastName: 'Taylor',
        email: 'lisa.taylor@aamarschool.com',
        qualification: 'M.Ed in Music Education',
        experience: 12,
        subjects: ['Music', 'Choir'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1009',
        nationality: 'Irish',
        religion: 'Catholic'
      },
      {
        firstName: 'Christopher',
        lastName: 'Anderson',
        email: 'christopher.anderson@aamarschool.com',
        qualification: 'B.A in History',
        experience: 6,
        subjects: ['History', 'Social Studies'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1010',
        nationality: 'American',
        religion: 'Lutheran'
      },
      {
        firstName: 'Amanda',
        lastName: 'Thomas',
        email: 'amanda.thomas@aamarschool.com',
        qualification: 'M.Ed in Special Education',
        experience: 8,
        subjects: ['Special Education', 'Psychology'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1011',
        nationality: 'Canadian',
        religion: 'United Church'
      },
      {
        firstName: 'Daniel',
        lastName: 'Jackson',
        email: 'daniel.jackson@aamarschool.com',
        qualification: 'M.Sc in Biology',
        experience: 5,
        subjects: ['Biology', 'Environmental Science'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1012',
        nationality: 'American',
        religion: 'Presbyterian'
      },
      {
        firstName: 'Michelle',
        lastName: 'White',
        email: 'michelle.white@aamarschool.com',
        qualification: 'M.A in French',
        experience: 7,
        subjects: ['French', 'European History'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1013',
        nationality: 'French',
        religion: 'Catholic'
      },
      {
        firstName: 'Kevin',
        lastName: 'Harris',
        email: 'kevin.harris@aamarschool.com',
        qualification: 'B.Ed in Mathematics',
        experience: 4,
        subjects: ['Mathematics', 'Statistics'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1014',
        nationality: 'American',
        religion: 'Non-denominational'
      },
      {
        firstName: 'Laura',
        lastName: 'Martin',
        email: 'laura.martin@aamarschool.com',
        qualification: 'M.A in Psychology',
        experience: 9,
        subjects: ['Psychology', 'Counseling'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1015',
        nationality: 'American',
        religion: 'Episcopal'
      },
      {
        firstName: 'Brian',
        lastName: 'Thompson',
        email: 'brian.thompson@aamarschool.com',
        qualification: 'M.Ed in Technology Education',
        experience: 6,
        subjects: ['Technology', 'Engineering'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1016',
        nationality: 'American',
        religion: 'Methodist'
      },
      {
        firstName: 'Rachel',
        lastName: 'Garcia',
        email: 'rachel.garcia@aamarschool.com',
        qualification: 'M.A in Library Science',
        experience: 11,
        subjects: ['Library Science', 'Research'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1017',
        nationality: 'Mexican',
        religion: 'Catholic'
      },
      {
        firstName: 'Mark',
        lastName: 'Martinez',
        email: 'mark.martinez@aamarschool.com',
        qualification: 'B.A in Economics',
        experience: 3,
        subjects: ['Economics', 'Business Studies'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1018',
        nationality: 'American',
        religion: 'Baptist'
      },
      {
        firstName: 'Angela',
        lastName: 'Robinson',
        email: 'angela.robinson@aamarschool.com',
        qualification: 'M.Ed in Early Childhood',
        experience: 10,
        subjects: ['Early Childhood', 'Child Development'],
        branchId: branch2.id,
        gender: 'FEMALE',
        phone: '555-1019',
        nationality: 'American',
        religion: 'Pentecostal'
      },
      {
        firstName: 'Thomas',
        lastName: 'Clark',
        email: 'thomas.clark@aamarschool.com',
        qualification: 'M.A in Philosophy',
        experience: 8,
        subjects: ['Philosophy', 'Ethics'],
        branchId: branch.id,
        gender: 'MALE',
        phone: '555-1020',
        nationality: 'British',
        religion: 'Anglican'
      }
    ];

    let created = 0;
    let skipped = 0;

    for (const teacherData of teachersData) {
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
            branchId: teacherData.branchId,
            password: 'password123',
            schoolId: school.id
          }
        });

        // Create profile
        await prisma.profile.create({
          data: {
            userId: user.id,
            aamarId: '234567',
            phone: teacherData.phone,
            address: `${Math.floor(Math.random() * 999) + 1} Teacher Lane, Education City`,
            nationality: teacherData.nationality,
            religion: teacherData.religion,
            gender: teacherData.gender,
            bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
            dateOfBirth: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
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

        created++;
        console.log(`✓ Created teacher: ${teacherData.firstName} ${teacherData.lastName}`);
      } else {
        skipped++;
        console.log(`- Skipped (exists): ${teacherData.firstName} ${teacherData.lastName}`);
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

    console.log(`\n📊 Summary:`);
    console.log(`- Created: ${created} teachers`);
    console.log(`- Skipped: ${skipped} teachers`);
    console.log(`- Total teachers in database: ${totalTeachers}`);
    console.log('\n✅ Seed script completed!');

  } catch (error) {
    console.error('❌ Error creating seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed20Teachers(); 