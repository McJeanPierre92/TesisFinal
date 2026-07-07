import {
  CreateLessonInput,
  CreateTaskInput,
  CreateTermGradeInput,
  GradeSubmissionInput,
  SubmitTaskInput,
  UpdateLessonInput,
  UpdateTaskInput
} from './academicInputs'
import {
  MyEnrollment,
  MyGrades,
  MyLesson,
  MyTask,
  TeacherAssignment,
  TeacherSubmission,
  Lesson,
  Task,
  Grade,
  TermGrade,
  Submission
} from './academic'

export interface AcademicRepository {
  // Alumno
  getMyClasses: () => Promise<MyEnrollment[]>
  getMyTasks: () => Promise<MyTask[]>
  getMyLessons: () => Promise<MyLesson[]>
  getMyGrades: () => Promise<MyGrades>
  submitTask: (taskId: number, data: SubmitTaskInput) => Promise<Submission>
  // Profesor
  getTeacherAssignments: () => Promise<TeacherAssignment[]>
  createLesson: (data: CreateLessonInput) => Promise<Lesson>
  createTask: (data: CreateTaskInput) => Promise<Task>
  getTeacherLessons: (assignmentId: number) => Promise<Lesson[]>
  getTeacherTasks: (assignmentId: number) => Promise<Task[]>
  editLesson: (id: number, data: UpdateLessonInput) => Promise<Lesson>
  deleteLesson: (id: number) => Promise<void>
  editTask: (id: number, data: UpdateTaskInput) => Promise<Task>
  deleteTask: (id: number) => Promise<void>
  getSubmissionsForTask: (taskId: number) => Promise<TeacherSubmission[]>
  gradeSubmission: (
    submissionId: number,
    data: GradeSubmissionInput
  ) => Promise<Grade>
  createTermGrade: (data: CreateTermGradeInput) => Promise<TermGrade>
}
