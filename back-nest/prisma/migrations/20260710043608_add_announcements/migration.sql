-- CreateTable
CREATE TABLE "announcement" (
    "id" SERIAL NOT NULL,
    "teachingAssignmentId" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
