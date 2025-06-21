/*
  Warnings:

  - You are about to drop the `_ClassToSubject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `classId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ClassToSubject" DROP CONSTRAINT "_ClassToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassToSubject" DROP CONSTRAINT "_ClassToSubject_B_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "birthCertificateNo" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "religion" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "classId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ClassToSubject";

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
