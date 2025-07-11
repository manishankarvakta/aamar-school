-- CreateTable
CREATE TABLE "SchoolSchedule" (
    "id" TEXT NOT NULL,
    "aamarId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "periodDuration" INTEGER NOT NULL,
    "breakDuration" INTEGER NOT NULL,
    "lunchDuration" INTEGER NOT NULL,
    "breakAfterPeriod" INTEGER NOT NULL,
    "lunchAfterPeriod" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSchedule_schoolId_name_key" ON "SchoolSchedule"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "SchoolSchedule" ADD CONSTRAINT "SchoolSchedule_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
