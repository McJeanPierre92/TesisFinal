import { Term } from './academic'

export type SubmitTaskInput = {
  fileUrl?: string
  comment?: string
  answers?: Record<number, number>
}

export type CreateLessonInput = {
  teachingAssignmentId: number
  title: string
  content?: string
  order?: number
}

export type CreateTaskInput = {
  teachingAssignmentId: number
  lessonId?: number | null
  title: string
  description?: string
  type?: 'documento' | 'examen'
  dueDate?: string | null
  maxScore?: number
  questions?: { text: string; options: { text: string; isCorrect: boolean }[] }[]
}

export type GradeSubmissionInput = {
  score: number
  feedback?: string
}

export type CreateTermGradeInput = {
  teachingAssignmentId: number
  studentId: number
  term: Term
  score: number
  observations?: string
}

// Edición (parcial). El teachingAssignmentId se omite (no se cambia de asignación).
export type UpdateLessonInput = {
  title?: string
  content?: string
  order?: number
}

export type UpdateTaskInput = {
  title?: string
  description?: string
  dueDate?: string | null
  maxScore?: number
  lessonId?: number | null
}
