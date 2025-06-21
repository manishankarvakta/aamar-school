/*
  Warnings:

  - The values [PARTIAL] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
ALTER TABLE "Fee" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "Attendance_aamarId_key";

-- DropIndex
DROP INDEX "Book_aamarId_key";

-- DropIndex
DROP INDEX "BookBorrowing_aamarId_key";

-- DropIndex
DROP INDEX "Branch_aamarId_key";

-- DropIndex
DROP INDEX "Class_aamarId_key";

-- DropIndex
DROP INDEX "ExamResult_aamarId_key";

-- DropIndex
DROP INDEX "Fee_aamarId_key";

-- DropIndex
DROP INDEX "Parent_aamarId_key";

-- DropIndex
DROP INDEX "Profile_aamarId_key";

-- DropIndex
DROP INDEX "Route_aamarId_key";

-- DropIndex
DROP INDEX "School_aamarId_key";

-- DropIndex
DROP INDEX "Staff_aamarId_key";

-- DropIndex
DROP INDEX "Student_aamarId_key";

-- DropIndex
DROP INDEX "Subject_aamarId_key";

-- DropIndex
DROP INDEX "Teacher_aamarId_key";

-- DropIndex
DROP INDEX "Timetable_aamarId_key";

-- DropIndex
DROP INDEX "User_aamarId_key";

-- DropIndex
DROP INDEX "Vehicle_aamarId_key";
