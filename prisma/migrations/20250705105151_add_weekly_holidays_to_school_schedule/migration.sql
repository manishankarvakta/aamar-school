-- AlterTable
ALTER TABLE "SchoolSchedule" ADD COLUMN     "weeklyHolidays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
