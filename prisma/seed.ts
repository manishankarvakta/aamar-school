const { PrismaClient, UserRole, Gender, AttendanceStatus, PaymentStatus, LessonType, AudienceType, AnnouncementType, ActionType, ExamType, FeeType, AccountType, TransactionType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Consistent aamarId for all records in this organization
const ORGANIZATION_AAMAR_ID = 'AAMAR001';

// Function to clean up existing data
async function cleanupDatabase() {
  console.log('🧹 Cleaning up existing data...');
  
  // Delete in reverse order of dependencies
  await prisma.activityLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examSubject.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.bookBorrowing.deleteMany();
  await prisma.book.deleteMany();
  await prisma.route.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.school.deleteMany();
  
  console.log('✅ Database cleaned up successfully!');
}

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Clear existing data in correct order
  await prisma.activityLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examSubject.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.bookBorrowing.deleteMany();
  await prisma.book.deleteMany();
  await prisma.route.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.school.deleteMany();

  // Create School
  const school = await prisma.school.create({
    data: {
      aamarId: ORGANIZATION_AAMAR_ID,
      name: 'Greenwood International School',
      code: 'GIS001',
      address: '123 Education Street, Dhaka, Bangladesh',
      phone: '+880-2-123456789',
      email: 'info@greenwood.edu.bd',
      website: 'https://greenwood.edu.bd',
      logo: '/logos/greenwood-logo.png',
    },
  });

  // Create Multiple Branches
  const branchData = [
    {
      name: 'Main Campus',
      code: 'MAIN',
      address: '123 Education Street, Dhaka, Bangladesh',
      phone: '+880-2-123456789',
      email: 'main@greenwood.edu.bd',
    },
    {
      name: 'North Campus',
      code: 'NORTH',
      address: '456 Learning Avenue, Uttara, Dhaka, Bangladesh',
      phone: '+880-2-987654321',
      email: 'north@greenwood.edu.bd',
    },
    {
      name: 'South Campus',
      code: 'SOUTH',
      address: '789 Knowledge Street, Dhanmondi, Dhaka, Bangladesh',
      phone: '+880-2-555123456',
      email: 'south@greenwood.edu.bd',
    },
    {
      name: 'East Campus',
      code: 'EAST',
      address: '321 Wisdom Road, Gulshan, Dhaka, Bangladesh',
      phone: '+880-2-444987654',
      email: 'east@greenwood.edu.bd',
    },
  ];

  const branches = [];
  for (const branchInfo of branchData) {
    const branch = await prisma.branch.create({
      data: {
        aamarId: ORGANIZATION_AAMAR_ID,
        name: branchInfo.name,
        code: branchInfo.code,
        address: branchInfo.address,
        phone: branchInfo.phone,
        email: branchInfo.email,
        schoolId: school.id,
      },
    });
    branches.push(branch);
  }

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      aamarId: ORGANIZATION_AAMAR_ID,
      email: 'admin@greenwood.edu.bd',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      schoolId: school.id,
      branchId: branches[0].id, // Main Campus
      profile: {
        create: {
          aamarId: ORGANIZATION_AAMAR_ID,
          email: 'admin@greenwood.edu.bd',
          phone: '+8801712345678',
          address: 'Dhaka, Bangladesh',
          gender: Gender.MALE,
          nationality: 'Bangladeshi',
          religion: 'Islam',
        },
      },
    },
  });

  // Create Classes across different branches
  const classes = [];
  const classNames = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  
  // Distribute classes across branches (2-3 classes per branch)
  for (let i = 0; i < classNames.length; i++) {
    const branchIndex = Math.floor(i / 3) % branches.length; // Distribute classes across branches
    const cls = await prisma.class.create({
      data: {
        aamarId: ORGANIZATION_AAMAR_ID,
        name: classNames[i],
        branchId: branches[branchIndex].id,
        academicYear: '2024-25',
      },
    });
    classes.push(cls);
  }

  // Create Sections for each class
  const sections = [];
  const sectionNames = ['A', 'B', 'C'];
  
  for (const cls of classes) {
    for (const sectionName of sectionNames) {
      const section = await prisma.section.create({
        data: {
          aamarId: ORGANIZATION_AAMAR_ID,
          name: sectionName,
          displayName: `${cls.name} Section ${sectionName}`,
          capacity: 40,
          classId: cls.id,
        },
      });
      sections.push(section);
    }
  }

  // Create Subjects
  const subjectData = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'English', code: 'ENG' },
    { name: 'Science', code: 'SCI' },
    { name: 'Social Studies', code: 'SS' },
    { name: 'Bengali', code: 'BEN' },
    { name: 'Physical Education', code: 'PE' },
    { name: 'Art & Craft', code: 'ART' },
  ];

  const subjects = [];
  for (const cls of classes) {
    for (const subjectInfo of subjectData) {
      const subject = await prisma.subject.create({
        data: {
          aamarId: ORGANIZATION_AAMAR_ID,
          name: subjectInfo.name,
          code: `${subjectInfo.code}-${cls.name.replace(' ', '')}`,
          description: `${subjectInfo.name} curriculum for ${cls.name}`,
          schoolId: school.id,
          classId: cls.id,
        },
      });
      subjects.push(subject);
    }
  }

  // Create Teachers distributed across branches
  const teacherData = [
    // Main Campus Teachers
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@greenwood.edu.bd', phone: '+8801712345679', qualification: 'M.Ed Mathematics', experience: 8, subjects: ['Mathematics'], branchIndex: 0 },
    { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@greenwood.edu.bd', phone: '+8801712345680', qualification: 'M.A English Literature', experience: 6, subjects: ['English'], branchIndex: 0 },
    { firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@greenwood.edu.bd', phone: '+8801712345681', qualification: 'M.Sc Physics', experience: 10, subjects: ['Science'], branchIndex: 0 },
    
    // North Campus Teachers
    { firstName: 'David', lastName: 'Thompson', email: 'david.thompson@greenwood.edu.bd', phone: '+8801712345682', qualification: 'M.A History', experience: 7, subjects: ['Social Studies'], branchIndex: 1 },
    { firstName: 'Lisa', lastName: 'Ahmed', email: 'lisa.ahmed@greenwood.edu.bd', phone: '+8801712345683', qualification: 'M.A Bengali Literature', experience: 9, subjects: ['Bengali'], branchIndex: 1 },
    { firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@greenwood.edu.bd', phone: '+8801712345684', qualification: 'M.Sc Computer Science', experience: 5, subjects: ['Science'], branchIndex: 1 },
    
    // South Campus Teachers
    { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@greenwood.edu.bd', phone: '+8801712345685', qualification: 'M.A Art Education', experience: 8, subjects: ['Art & Craft'], branchIndex: 2 },
    { firstName: 'Ahmed', lastName: 'Rahman', email: 'ahmed.rahman@greenwood.edu.bd', phone: '+8801712345686', qualification: 'B.Ed Physical Education', experience: 6, subjects: ['Physical Education'], branchIndex: 2 },
    
    // East Campus Teachers
    { firstName: 'Fatima', lastName: 'Khan', email: 'fatima.khan@greenwood.edu.bd', phone: '+8801712345687', qualification: 'M.Ed Mathematics', experience: 7, subjects: ['Mathematics'], branchIndex: 3 },
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@greenwood.edu.bd', phone: '+8801712345688', qualification: 'M.A English', experience: 9, subjects: ['English'], branchIndex: 3 },
  ];

  const teachers = [];
  for (let i = 0; i < teacherData.length; i++) {
    const teacherInfo = teacherData[i];
    const user = await prisma.user.create({
      data: {
        aamarId: ORGANIZATION_AAMAR_ID,
        email: teacherInfo.email,
        password: 'teacher123',
        firstName: teacherInfo.firstName,
        lastName: teacherInfo.lastName,
        role: UserRole.TEACHER,
        schoolId: school.id,
        branchId: branches[teacherInfo.branchIndex].id,
        profile: {
          create: {
            aamarId: ORGANIZATION_AAMAR_ID,
            email: teacherInfo.email,
            phone: teacherInfo.phone,
            gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
            nationality: 'Bangladeshi',
            religion: 'Islam',
          },
        },
        teacher: {
          create: {
            aamarId: ORGANIZATION_AAMAR_ID,
            qualification: teacherInfo.qualification,
            experience: teacherInfo.experience,
            specialization: teacherInfo.subjects[0], // First subject as specialization
            joiningDate: new Date('2024-01-01'),
            salary: 50000 + (teacherInfo.experience * 2000), // Base salary + experience bonus
            emergencyContact: `+88017123456${90 + i}`,
            subjects: teacherInfo.subjects,
          },
        },
      },
      include: { teacher: true },
    });
    teachers.push(user);
  }

  // Assign class teachers
  for (let i = 0; i < Math.min(classes.length, teachers.length); i++) {
    await prisma.class.update({
      where: { id: classes[i].id },
      data: { teacherId: teachers[i].teacher.id },
    });
  }

  // Create Parents and Students distributed across branches
  const students = [];
  const parents = [];
  
  for (let i = 0; i < 60; i++) { // Increased to 60 students across 4 branches
    const branchIndex = i % branches.length; // Distribute students across branches
    
    // Create Parent
    const parentUser = await prisma.user.create({
      data: {
        aamarId: ORGANIZATION_AAMAR_ID,
        email: `parent${i + 1}@example.com`,
        password: 'parent123',
        firstName: `Parent${i + 1}`,
        lastName: 'Guardian',
        role: UserRole.PARENT,
        schoolId: school.id,
        branchId: branches[branchIndex].id,
        profile: {
          create: {
            aamarId: ORGANIZATION_AAMAR_ID,
            email: `parent${i + 1}@example.com`,
            phone: `+88017123456${84 + i}`,
            gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
            nationality: 'Bangladeshi',
            religion: 'Islam',
          },
        },
        parent: {
          create: {
            aamarId: ORGANIZATION_AAMAR_ID,
            relation: i % 2 === 0 ? 'Father' : 'Mother',
          },
        },
      },
      include: { parent: true },
    });
    parents.push(parentUser);

    // Create Student
    const studentUser = await prisma.user.create({
      data: {
        aamarId: ORGANIZATION_AAMAR_ID,
        email: `student${i + 1}@example.com`,
        password: 'student123',
        firstName: `Student${i + 1}`,
        lastName: 'Learner',
        role: UserRole.STUDENT,
        schoolId: school.id,
        branchId: branches[branchIndex].id,
        profile: {
          create: {
            aamarId: ORGANIZATION_AAMAR_ID,
            email: `student${i + 1}@example.com`,
            phone: `+88017123457${14 + i}`,
            dateOfBirth: new Date(2010 + Math.floor(i / 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
            bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
            nationality: 'Bangladeshi',
            religion: 'Islam',
          },
        },
        student: {
          create: {
            aamarId: ORGANIZATION_AAMAR_ID,
            rollNumber: `2024${String(i + 1).padStart(3, '0')}`,
            admissionDate: new Date('2024-01-01'),
            sectionId: sections[i % sections.length].id,
            parentId: parentUser.parent.id,
          },
        },
      },
      include: { student: true },
    });
    students.push(studentUser);
  }

  // Create Accounts per branch
  const accounts = [];
  const accountTypes = [
    { name: 'Cash Account', type: AccountType.CASH, number: 'CASH', balance: 50000 },
    { name: 'Bank Account - DBBL', type: AccountType.BANK, number: 'BANK', balance: 500000 },
    { name: 'Tuition Revenue', type: AccountType.REVENUE, number: 'REV', balance: 0 },
    { name: 'Salary Expense', type: AccountType.EXPENSE, number: 'EXP', balance: 0 },
  ];

  for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
    for (const accountInfo of accountTypes) {
      const account = await prisma.account.create({
        data: {
          aamarId: ORGANIZATION_AAMAR_ID,
          name: `${accountInfo.name} - ${branches[branchIndex].name}`,
          accountType: accountInfo.type,
          accountNumber: `${accountInfo.number}${String(branchIndex + 1).padStart(3, '0')}`,
          balance: accountInfo.balance,
          schoolId: school.id,
        },
      });
      accounts.push(account);
    }
  }

  // Create Exams
  const exams = [];
  for (const cls of classes.slice(0, 8)) { // First 8 classes (2 per branch)
    const exam = await prisma.exam.create({
      data: {
        aamarId: ORGANIZATION_AAMAR_ID,
        name: `${cls.name} Midterm Examination 2024`,
        examType: ExamType.MIDTERM,
        description: `Midterm examination for ${cls.name} students`,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        classId: cls.id,
        schoolId: school.id,
      },
    });
    exams.push(exam);

    // Create exam subjects
    const classSubjects = subjects.filter(s => s.classId === cls.id);
    for (const subject of classSubjects.slice(0, 5)) { // First 5 subjects per class
      await prisma.examSubject.create({
        data: {
          aamarId: ORGANIZATION_AAMAR_ID,
          examId: exam.id,
          subjectId: subject.id,
          fullMarks: 100,
          passMarks: 40,
          examDate: new Date('2024-06-05'),
          duration: 180, // 3 hours
        },
      });
    }
  }

  // Create Fees
  const feeTypes = [FeeType.TUITION, FeeType.TRANSPORT, FeeType.LIBRARY, FeeType.EXAM];
  for (const student of students.slice(0, 20)) { // First 20 students
    for (let i = 0; i < feeTypes.length; i++) {
      const fee = await prisma.fee.create({
        data: {
          aamarId: ORGANIZATION_AAMAR_ID,
          feeType: feeTypes[i],
          title: `${feeTypes[i]} Fee - January 2024`,
          amount: [5000, 2000, 500, 1000][i], // Different amounts for different fee types
          lateFee: 100,
          dueDate: new Date('2024-01-31'),
          status: i % 2 === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
          studentId: student.student.id,
        },
      });

      // Create transaction for paid fees
      if (i % 2 === 0) {
        await prisma.transaction.create({
          data: {
            aamarId: ORGANIZATION_AAMAR_ID,
            accountId: accounts[0].id, // Cash account
            transactionType: TransactionType.CREDIT,
            amount: [5000, 2000, 500, 1000][i],
            description: `Fee payment received from ${student.firstName} ${student.lastName}`,
            reference: `FEE-${fee.id}`,
            studentId: student.student.id,
            feeId: fee.id,
            createdById: adminUser.id,
          },
        });
      }
    }
  }

  // Create Announcements per branch
  const announcementTemplates = [
    {
      title: 'School Reopening Notice',
      message: 'School will reopen on January 2nd, 2024 after winter vacation. All students are requested to attend regularly.',
      type: AnnouncementType.GENERAL,
      audience: [AudienceType.ALL],
    },
    {
      title: 'Midterm Exam Schedule',
      message: 'Midterm examinations will be held from June 1st to June 15th, 2024. Detailed schedule will be shared soon.',
      type: AnnouncementType.URGENT,
      audience: [AudienceType.STUDENT, AudienceType.PARENT],
    },
    {
      title: 'Sports Day Event',
      message: 'Annual Sports Day will be celebrated on March 15th, 2024. All students are encouraged to participate.',
      type: AnnouncementType.EVENT,
      audience: [AudienceType.STUDENT, AudienceType.TEACHER, AudienceType.PARENT],
    },
  ];

  for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
    for (const announcementData of announcementTemplates) {
      await prisma.announcement.create({
        data: {
          aamarId: ORGANIZATION_AAMAR_ID,
          branchId: branches[branchIndex].id,
          title: `${announcementData.title} - ${branches[branchIndex].name}`,
          message: `${announcementData.message} (${branches[branchIndex].name})`,
          audience: announcementData.audience,
          announcementType: announcementData.type,
          visibleFrom: new Date(),
          visibleUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdById: adminUser.id,
        },
      });
    }
  }

  // Create Activity Logs
  const actions = [ActionType.LOGIN, ActionType.CREATE, ActionType.UPDATE, ActionType.READ];
  const modules = ['Users', 'Students', 'Classes', 'Subjects', 'Exams', 'Fees'];

  for (let i = 0; i < 40; i++) { // More activity logs across branches
    await prisma.activityLog.create({
      data: {
        aamarId: ORGANIZATION_AAMAR_ID,
        userId: [adminUser.id, ...teachers.map(t => t.id), ...students.slice(0, 5).map(s => s.id)][i % 8],
        branchId: branches[i % branches.length].id,
        action: actions[i % actions.length],
        module: modules[i % modules.length],
        targetId: students[i % students.length]?.student?.id,
        description: `${actions[i % actions.length]} operation performed on ${modules[i % modules.length]}`,
        ipAddress: `192.168.1.${100 + (i % 50)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time in last 7 days
      },
    });
  }

  console.log('✅ Comprehensive seed completed successfully!');
  console.log(`📊 Created:
  - 1 School with ${accounts.length} Accounts
  - ${branches.length} Branches (${branches.map(b => b.name).join(', ')})
  - ${classes.length} Classes with ${sections.length} Sections
  - ${subjects.length} Subjects
  - ${teachers.length} Teachers
  - ${students.length} Students with ${parents.length} Parents
  - ${exams.length} Exams with Results
  - ${branches.length * announcementTemplates.length} Announcements
  - 40 Activity Logs
  - Multiple Fees and Transactions`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 