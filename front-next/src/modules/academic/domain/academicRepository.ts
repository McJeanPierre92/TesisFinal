import {
  CreateAnnouncementInput,
  CreateLessonInput,
  CreateTaskInput,
  CreateTermGradeInput,
  GradeSubmissionInput,
  SubmitTaskInput,
  UpdateAnnouncementInput,
  UpdateLessonInput,
  UpdateTaskInput
} from './academicInputs'
import {
  Announcement,
  MyAnnouncement,
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
  getMyAnnouncements: () => Promise<MyAnnouncement[]>
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
  // Anuncios
  getTeacherAnnouncements: (assignmentId: number) => Promise<Announcement[]>
  createAnnouncement: (data: CreateAnnouncementInput) => Promise<Announcement>
  editAnnouncement: (id: number, data: UpdateAnnouncementInput) => Promise<Announcement>
  deleteAnnouncement: (id: number) => Promise<void>
}
