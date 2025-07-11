-- AlterTable
ALTER TABLE "SchoolSchedule" ADD COLUMN     "includeBreak" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "includeLunch" BOOLEAN NOT NULL DEFAULT true;
