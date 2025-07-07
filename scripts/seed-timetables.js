const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to create time string
function createTimeString(hours, minutes) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

// Helper function to get day number (0 = Sunday, 1 = Monday, etc.)
function getDayNumber(dayName) {
  const days = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };
  return days[dayName];
}

async function seedTimetables() {
  try {
    console.log('🌱 Starting timetable seeding...');

    // Get all classes
    const classes = await prisma.class.findMany({
      where: { aamarId: "AAMAR001" },
      include: {
        subjects: true,
        branch: true
      }
    });

    console.log(`Found ${classes.length} classes`);

    if (classes.length === 0) {
      console.log('No classes found. Please seed classes first.');
      return;
    }

    // Get all subjects
    const subjects = await prisma.subject.findMany({
      where: { aamarId: "AAMAR001" }
    });

    console.log(`Found ${subjects.length} subjects`);

    if (subjects.length === 0) {
      console.log('No subjects found. Please seed subjects first.');
      return;
    }

    // Clear existing timetables
    await prisma.timetable.deleteMany({
      where: { aamarId: "AAMAR001" }
    });

    console.log('Cleared existing timetables');

    const timetablesToCreate = [];

    // Define common subjects for different grade levels
    const kindergartenSubjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Physical Education'];
    const highSchoolSubjects = ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science'];

    // Define time slots
    const morningShift = {
      start: 8, // 8 AM
      end: 12,  // 12 PM
      periodDuration: 45, // 45 minutes per period
      breakDuration: 15 // 15 minutes break
    };

    const afternoonShift = {
      start: 12.5, // 12:30 PM
      end: 17,     // 5 PM
      periodDuration: 45, // 45 minutes per period
      breakDuration: 15 // 15 minutes break
    };

    // Days of the week (excluding weekends)
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (const classData of classes) {
      const className = classData.name;
      const classNumber = parseInt(className.replace(/\D/g, ''));
      
      // Determine shift and subjects based on class level
      let shift, subjectsForClass;
      
      if (classNumber >= 1 && classNumber <= 5) {
        // Kindergarten (Class 1-5): Morning shift
        shift = morningShift;
        subjectsForClass = kindergartenSubjects;
      } else if (classNumber >= 6 && classNumber <= 10) {
        // High School (Class 6-10): Afternoon shift
        shift = afternoonShift;
        subjectsForClass = highSchoolSubjects;
      } else {
        // Default to morning shift for other classes
        shift = morningShift;
        subjectsForClass = [...kindergartenSubjects, ...highSchoolSubjects];
      }

      console.log(`Creating timetable for ${className} (${classNumber >= 1 && classNumber <= 5 ? 'Kindergarten' : 'High School'})`);

      // Calculate periods
      const totalMinutes = (shift.end - shift.start) * 60;
      const totalPeriods = Math.floor(totalMinutes / (shift.periodDuration + shift.breakDuration));
      
      // Create timetables for each day
      for (const dayName of weekDays) {
        const dayOfWeek = getDayNumber(dayName);
        let currentTime = shift.start;

        for (let period = 0; period < totalPeriods; period++) {
          // Select subject for this period
          const subjectIndex = period % subjectsForClass.length;
          const subjectName = subjectsForClass[subjectIndex];
          
          // Find the subject in the database
          const subject = subjects.find(s => 
            s.name.toLowerCase().includes(subjectName.toLowerCase()) ||
            subjectName.toLowerCase().includes(s.name.toLowerCase())
          );

          if (subject) {
            const startTime = createTimeString(Math.floor(currentTime), (currentTime % 1) * 60);
            currentTime += shift.periodDuration / 60;
            const endTime = createTimeString(Math.floor(currentTime), (currentTime % 1) * 60);
            currentTime += shift.breakDuration / 60;

            timetablesToCreate.push({
              aamarId: "AAMAR001",
              dayOfWeek,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              classId: classData.id,
              subjectId: subject.id
            });
          }
        }
      }
    }

    // Create all timetables in batches
    const batchSize = 100;
    for (let i = 0; i < timetablesToCreate.length; i += batchSize) {
      const batch = timetablesToCreate.slice(i, i + batchSize);
      await prisma.timetable.createMany({
        data: batch
      });
      console.log(`Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(timetablesToCreate.length / batchSize)}`);
    }

    console.log(`✅ Successfully created ${timetablesToCreate.length} timetable entries`);

    // Print summary
    const timetableStats = await prisma.timetable.groupBy({
      by: ['classId'],
      where: { aamarId: "AAMAR001" },
      _count: {
        id: true
      }
    });

    console.log('\n📊 Timetable Summary:');
    for (const stat of timetableStats) {
      const classData = classes.find(c => c.id === stat.classId);
      console.log(`  ${classData?.name}: ${stat._count.id} periods`);
    }

  } catch (error) {
    console.error('❌ Error seeding timetables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTimetables()
  .then(() => {
    console.log('🎉 Timetable seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Timetable seeding failed:', error);
    process.exit(1);
  }); 