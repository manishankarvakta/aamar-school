-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('REGULAR', 'SPECIAL', 'BREAK', 'LAB', 'PRACTICAL', 'ASSIGNMENT');

-- CreateTable
CREATE TABLE "ClassRoutine" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineSlot" (
    "id" TEXT NOT NULL,
    "classRoutineId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subjectId" TEXT,
    "teacherId" TEXT,
    "classType" "ClassType" NOT NULL,

    CONSTRAINT "RoutineSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClassRoutine" ADD CONSTRAINT "ClassRoutine_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineSlot" ADD CONSTRAINT "RoutineSlot_classRoutineId_fkey" FOREIGN KEY ("classRoutineId") REFERENCES "ClassRoutine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineSlot" ADD CONSTRAINT "RoutineSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineSlot" ADD CONSTRAINT "RoutineSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
