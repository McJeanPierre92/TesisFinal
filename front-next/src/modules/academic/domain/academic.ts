// Tipos del dominio académico LMS.
// Reflejan las respuestas del backend (back-nest /v1/promo/api/academic/* y CRUD).

export type SubmissionStatus = 'pendiente' | 'entregada' | 'calificada'
export type TaskType = 'documento' | 'examen'
export type Term = 'primerParcial' | 'segundoParcial' | 'tercerParcial' | 'final'
export type WeekDay =
  | 'domingo'
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'

export type Institution = {
  id: number
  name: string
  description?: string
  state: boolean
  createdAt: string
  updatedAt: string
}

export type Level = {
  id: number
  name: string
  order: number
  institutionId: number
  state: boolean
}

export type Subject = {
  id: number
  name: string
  institutionId: number
  state: boolean
}

export type ClassGroup = {
  id: number
  parallel: string
  levelId: number
  institutionId: number
  state: boolean
  level?: Level
}

export type Enrollment = {
  id: number
  classGroupId: number
  studentId: number
  state: boolean
  classGroup?: ClassGroup
  student?: { id: number; name: string; userName: string }
}

export type TeachingAssignment = {
  id: number
  subjectId: number
  classGroupId: number
  teacherId: number
  state: boolean
  subject?: Subject
  classGroup?: ClassGroup
  teacher?: { id: number; name: string; userName: string }
  schedules?: Schedule[]
}

export type Schedule = {
  id: number
  teachingAssignmentId: number
  dayOfWeek: WeekDay
  startTime: string
  endTime: string
  state: boolean
}

export type Lesson = {
  id: number
  teachingAssignmentId: number
  title: string
  content?: string
  order: number
  state: boolean
  tasks?: Task[]
}

export type Task = {
  id: number
  teachingAssignmentId: number
  lessonId?: number
  title: string
  description?: string
  type?: TaskType
  dueDate?: string
  maxScore: number
  state: boolean
  lesson?: Lesson
  questions?: Question[]
  submissions?: Submission[]
}

/** Opción de respuesta de una pregunta de cuestionario */
export type Option = {
  id: number
  questionId: number
  text: string
  isCorrect?: boolean // solo visible para el profesor
  order: number
  state: boolean
}

/** Pregunta de un cuestionario */
export type Question = {
  id: number
  taskId: number
  text: string
  order: number
  state: boolean
  options: Option[]
}

export type Submission = {
  id: number
  taskId: number
  studentId: number
  fileUrl?: string
  comment?: string
  submittedAt: string
  status: SubmissionStatus
  state: boolean
  grade?: Grade
}

export type Grade = {
  id: number
  submissionId: number
  score: number
  feedback?: string
  gradedById: number
  gradedAt: string
  state: boolean
  gradedBy?: { id: number; name: string }
}

export type TermGrade = {
  id: number
  teachingAssignmentId: number
  studentId: number
  term: Term
  score: number
  observations?: string
  state: boolean
}

// --- Respuestas específicas del módulo academic ---

/** Matrícula del alumno con su paralelo y materias (GET /academic/my-classes) */
export type MyEnrollment = Enrollment & {
  classGroup: ClassGroup & {
    teachingAssignments: (TeachingAssignment & {
      subject: Subject
      teacher: { id: number; name: string }
      schedules?: Schedule[]
    })[]
  }
}

/** Tarea del alumno con su entrega si existe (GET /academic/my-tasks) */
export type MyTask = Task & {
  teachingAssignment: TeachingAssignment & {
    subject: Subject
    classGroup: ClassGroup
  }
  submissions: Pick<Submission, 'id' | 'status' | 'submittedAt' | 'fileUrl'>[]
}

/** Lección del alumno con su asignación (GET /academic/my-lessons) */
export type MyLesson = Lesson & {
  teachingAssignment: TeachingAssignment & {
    subject: Subject
    classGroup: ClassGroup
  }
}

/** Anuncio del tablón de un curso */
export type Announcement = {
  id: number
  teachingAssignmentId: number
  title: string
  content?: string
  state: boolean
  createdAt: string
  updatedAt: string
}

/** Anuncio del alumno con info de la materia */
export type MyAnnouncement = Announcement & {
  teachingAssignment?: {
    id: number
    subject?: { id: number; name: string }
  }
}

/** Resumen de notas del alumno (GET /academic/my-grades) */
export type MyGrades = {
  submissions: (Submission & {
    task: Task & {
      teachingAssignment: TeachingAssignment & { subject: Subject }
    }
    grade?: Grade
  })[]
  termGrades: (TermGrade & {
    teachingAssignment: TeachingAssignment & { subject: Subject }
  })[]
}

/** Asignación del profesor con conteos (GET /academic/teacher/assignments) */
export type TeacherAssignment = TeachingAssignment & {
  subject: Subject
  classGroup: ClassGroup & { level: Level }
  schedules: Schedule[]
  _count: { lessons: number; tasks: number; termGrades: number }
}

/** Entrrega del alumno vista por el profesor (GET /academic/teacher/submissions/:taskId) */
export type TeacherSubmission = Submission & {
  student: { id: number; name: string; userName: string }
  grade?: Grade
}

export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ApiError = {
  statusCode: number
  message: string | string[]
  error?: string
}
