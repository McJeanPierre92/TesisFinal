import { apiFetch, jsonBody, jsonHeaders } from '@/lib/apiFetch'
import {
  CreateLessonInput,
  CreateTaskInput,
  CreateTermGradeInput,
  GradeSubmissionInput,
  SubmitTaskInput,
  UpdateLessonInput,
  UpdateTaskInput
} from '../domain/academicInputs'
import { AcademicRepository } from '../domain/academicRepository'
import {
  Grade,
  Lesson,
  MyEnrollment,
  MyGrades,
  MyLesson,
  MyTask,
  Submission,
  Task,
  TeacherAssignment,
  TeacherSubmission,
  TermGrade
} from '../domain/academic'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = jsonHeaders

export const apiAcademic = (): AcademicRepository => {
  const getMyClasses = async () => {
    return apiFetch(`${API}/academic/my-classes`, {
      method: 'GET',
      headers
    }) as Promise<MyEnrollment[]>
  }

  const getMyTasks = async () => {
    return apiFetch(`${API}/academic/my-tasks`, {
      method: 'GET',
      headers
    }) as Promise<MyTask[]>
  }

  const getMyLessons = async () => {
    return apiFetch(`${API}/academic/my-lessons`, {
      method: 'GET',
      headers
    }) as Promise<MyLesson[]>
  }

  const getMyGrades = async () => {
    return apiFetch(`${API}/academic/my-grades`, {
      method: 'GET',
      headers
    }) as Promise<MyGrades>
  }

  const submitTask = async (taskId: number, data: SubmitTaskInput) => {
    return apiFetch(`${API}/academic/submissions/${taskId}`, {
      method: 'POST',
      headers,
      body: jsonBody(data)
    }) as Promise<Submission>
  }

  const getTeacherAssignments = async () => {
    return apiFetch(`${API}/academic/teacher/assignments`, {
      method: 'GET',
      headers
    }) as Promise<TeacherAssignment[]>
  }

  const createLesson = async (data: CreateLessonInput) => {
    return apiFetch(`${API}/academic/teacher/lessons`, {
      method: 'POST',
      headers,
      body: jsonBody(data)
    }) as Promise<Lesson>
  }

  const createTask = async (data: CreateTaskInput) => {
    return apiFetch(`${API}/academic/teacher/tasks`, {
      method: 'POST',
      headers,
      body: jsonBody(data)
    }) as Promise<Task>
  }

  const getTeacherLessons = async (assignmentId: number) => {
    return apiFetch(`${API}/academic/teacher/lessons/${assignmentId}`, {
      method: 'GET',
      headers
    }) as Promise<Lesson[]>
  }

  const getTeacherTasks = async (assignmentId: number) => {
    return apiFetch(`${API}/academic/teacher/tasks/${assignmentId}`, {
      method: 'GET',
      headers
    }) as Promise<Task[]>
  }

  const editLesson = async (id: number, data: UpdateLessonInput) => {
    return apiFetch(`${API}/academic/teacher/lessons/${id}`, {
      method: 'PATCH',
      headers,
      body: jsonBody(data)
    }) as Promise<Lesson>
  }

  const deleteLesson = async (id: number) => {
    await apiFetch(`${API}/academic/teacher/lessons/${id}`, {
      method: 'DELETE',
      noJson: true
    })
  }

  const editTask = async (id: number, data: UpdateTaskInput) => {
    return apiFetch(`${API}/academic/teacher/tasks/${id}`, {
      method: 'PATCH',
      headers,
      body: jsonBody(data)
    }) as Promise<Task>
  }

  const deleteTask = async (id: number) => {
    await apiFetch(`${API}/academic/teacher/tasks/${id}`, {
      method: 'DELETE',
      noJson: true
    })
  }

  const getSubmissionsForTask = async (taskId: number) => {
    return apiFetch(`${API}/academic/teacher/submissions/${taskId}`, {
      method: 'GET',
      headers
    }) as Promise<TeacherSubmission[]>
  }

  const gradeSubmission = async (
    submissionId: number,
    data: GradeSubmissionInput
  ) => {
    return apiFetch(`${API}/academic/teacher/grades/${submissionId}`, {
      method: 'POST',
      headers,
      body: jsonBody(data)
    }) as Promise<Grade>
  }

  const createTermGrade = async (data: CreateTermGradeInput) => {
    return apiFetch(`${API}/academic/teacher/term-grades`, {
      method: 'POST',
      headers,
      body: jsonBody(data)
    }) as Promise<TermGrade>
  }

  return {
    getMyClasses,
    getMyTasks,
    getMyLessons,
    getMyGrades,
    submitTask,
    getTeacherAssignments,
    createLesson,
    createTask,
    getTeacherLessons,
    getTeacherTasks,
    editLesson,
    deleteLesson,
    editTask,
    deleteTask,
    getSubmissionsForTask,
    gradeSubmission,
    createTermGrade
  }
}
