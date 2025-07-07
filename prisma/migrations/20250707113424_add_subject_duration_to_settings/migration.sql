/*
  Warnings:

  - You are about to drop the column `backupSettings` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `notificationSettings` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `securitySettings` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `systemSettings` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "backupSettings",
DROP COLUMN "notificationSettings",
DROP COLUMN "securitySettings",
DROP COLUMN "systemSettings",
ADD COLUMN     "subjectDuration" INTEGER,
ALTER COLUMN "weeklySchedule" DROP NOT NULL;
