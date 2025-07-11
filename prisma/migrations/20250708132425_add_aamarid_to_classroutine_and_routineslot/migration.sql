/*
  Warnings:

  - Added the required column `aamarId` to the `ClassRoutine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aamarId` to the `RoutineSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClassRoutine" ADD COLUMN     "aamarId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoutineSlot" ADD COLUMN     "aamarId" TEXT NOT NULL;
