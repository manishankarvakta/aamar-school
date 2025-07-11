/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the `SchoolSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolSchedule" DROP CONSTRAINT "SchoolSchedule_schoolId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "scheduleId";

-- DropTable
DROP TABLE "SchoolSchedule";

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "aamarId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "weeklySchedule" JSONB NOT NULL,
    "notificationSettings" JSONB NOT NULL,
    "securitySettings" JSONB NOT NULL,
    "systemSettings" JSONB NOT NULL,
    "backupSettings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_schoolId_key" ON "Settings"("schoolId");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
