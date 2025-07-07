-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "scheduleId" TEXT;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "SchoolSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
