/*
  Warnings:

  - You are about to drop the column `classId` on the `Section` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subjectId,name]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_classId_fkey";

-- DropIndex
DROP INDEX "Section_classId_name_key";

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "classId",
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Section_subjectId_name_key" ON "Section"("subjectId", "name");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
