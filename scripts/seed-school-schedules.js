const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSchoolSchedules() {
  try {
    console.log('🌱 Seeding school schedules...');

    // Get the first school (assuming it exists)
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('❌ No school found. Please create a school first.');
      return;
    }

    const schedules = [
      {
        aamarId: 'AAMAR001',
        schoolId: school.id,
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '12:00',
        periodDuration: 45,
        breakDuration: 15,
        lunchDuration: 0, // No lunch for morning shift
        breakAfterPeriod: 2,
        lunchAfterPeriod: 0,
        isActive: true,
      },
      {
        aamarId: 'AAMAR001',
        schoolId: school.id,
        name: 'Afternoon Shift',
        startTime: '12:30',
        endTime: '17:00',
        periodDuration: 45,
        breakDuration: 15,
        lunchDuration: 30,
        breakAfterPeriod: 2,
        lunchAfterPeriod: 4,
        isActive: true,
      },
      {
        aamarId: 'AAMAR001',
        schoolId: school.id,
        name: 'Full Day Schedule',
        startTime: '08:00',
        endTime: '15:30',
        periodDuration: 50,
        breakDuration: 20,
        lunchDuration: 45,
        breakAfterPeriod: 2,
        lunchAfterPeriod: 5,
        isActive: true,
      },
      {
        aamarId: 'AAMAR001',
        schoolId: school.id,
        name: 'Kindergarten Schedule',
        startTime: '09:00',
        endTime: '13:00',
        periodDuration: 30,
        breakDuration: 20,
        lunchDuration: 30,
        breakAfterPeriod: 2,
        lunchAfterPeriod: 4,
        isActive: true,
      },
    ];

    for (const scheduleData of schedules) {
      const existingSchedule = await prisma.schoolSchedule.findFirst({
        where: {
          schoolId: scheduleData.schoolId,
          name: scheduleData.name,
        },
      });

      if (!existingSchedule) {
        await prisma.schoolSchedule.create({
          data: scheduleData,
        });
        console.log(`✅ Created schedule: ${scheduleData.name}`);
      } else {
        console.log(`⏭️  Schedule already exists: ${scheduleData.name}`);
      }
    }

    console.log('🎉 School schedules seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding school schedules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSchoolSchedules(); 