-- DropForeignKey
ALTER TABLE "classGroup" DROP CONSTRAINT "classGroup_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "classGroup" DROP CONSTRAINT "classGroup_levelId_fkey";

-- DropForeignKey
ALTER TABLE "enrollment" DROP CONSTRAINT "enrollment_classGroupId_fkey";

-- DropForeignKey
ALTER TABLE "grade" DROP CONSTRAINT "grade_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "lesson" DROP CONSTRAINT "lesson_teachingAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "level" DROP CONSTRAINT "level_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_teachingAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "subject" DROP CONSTRAINT "subject_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "submission" DROP CONSTRAINT "submission_taskId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_teachingAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "teachingAssignment" DROP CONSTRAINT "teachingAssignment_classGroupId_fkey";

-- DropForeignKey
ALTER TABLE "teachingAssignment" DROP CONSTRAINT "teachingAssignment_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "termGrade" DROP CONSTRAINT "termGrade_teachingAssignmentId_fkey";

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classGroup" ADD CONSTRAINT "classGroup_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classGroup" ADD CONSTRAINT "classGroup_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "classGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachingAssignment" ADD CONSTRAINT "teachingAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachingAssignment" ADD CONSTRAINT "teachingAssignment_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "classGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "termGrade" ADD CONSTRAINT "termGrade_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "teachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
