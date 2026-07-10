import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { submissionStatus } from '@prisma/client'
import { PrismaService } from 'src/storage/postgres/prisma.service'
import { CreateAnnouncementByTeacherDto } from './dto/create-announcement-by-teacher.dto'
import { CreateGradeByTeacherDto } from './dto/create-grade-by-teacher.dto'
import { CreateLessonByTeacherDto } from './dto/create-lesson-by-teacher.dto'
import { CreateSubmissionByStudentDto } from './dto/create-submission-by-student.dto'
import { CreateTaskByTeacherDto } from './dto/create-task-by-teacher.dto'
import { CreateTermGradeByTeacherDto } from './dto/create-term-grade-by-teacher.dto'

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  //  ALUMNO
  // ============================================================

  /** Clases (classGroup + teachingAssignment) donde el alumno está matriculado */
  async findMyClasses(studentId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId, state: true },
      include: {
        classGroup: {
          include: {
            level: { select: { id: true, name: true, order: true } },
            teachingAssignments: {
              where: { state: true },
              include: {
                subject: { select: { id: true, name: true } },
                teacher: { select: { id: true, name: true } },
                schedules: {
                  where: { state: true },
                  orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
                },
                announcements: {
                  where: { state: true },
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    })
    return enrollments
  }

  /** Tareas de las asignaciones del paralelo del alumno (las que puede entregar) */
  async findMyTasks(studentId: number) {
    // 1. Paralelos del alumno
    const myClassGroups = await this.prisma.enrollment.findMany({
      where: { studentId, state: true },
      select: { classGroupId: true }
    })
    const classGroupIds = myClassGroups.map((e) => e.classGroupId)
    if (classGroupIds.length === 0) return []

    // 2. Asignaciones de esos paralelos
    const assignments = await this.prisma.teachingAssignment.findMany({
      where: { classGroupId: { in: classGroupIds }, state: true },
      select: { id: true }
    })
    const assignmentIds = assignments.map((a) => a.id)

    // 3. Tareas + su entrega (si ya existe) hecha por el alumno
    return this.prisma.task.findMany({
      where: { teachingAssignmentId: { in: assignmentIds }, state: true },
      include: {
        teachingAssignment: {
          select: {
            id: true,
            subject: { select: { id: true, name: true } },
            classGroup: {
              select: {
                id: true,
                parallel: true,
                level: { select: { id: true, name: true } }
              }
            }
          }
        },
        lesson: { select: { id: true, title: true } },
        // Si es examen, incluir preguntas y opciones (sin isCorrect)
        questions: {
          where: { state: true },
          include: {
            options: {
              where: { state: true },
              select: { id: true, text: true, order: true }
            }
          },
          orderBy: { order: 'asc' }
        },
        submissions: {
          where: { studentId },
          select: {
            id: true,
            status: true,
            submittedAt: true,
            fileUrl: true,
            answers: true,
            grade: { select: { score: true, feedback: true } }
          }
        }
      },
      orderBy: { id: 'desc' }
    })
  }

  /** Crea o actualiza la entrega del alumno para una tarea (re-entrega = upsert) */
  async submitTask(
    studentId: number,
    taskId: number,
    dto: CreateSubmissionByStudentDto
  ) {
    // Validar que la tarea pertenece a un paralelo donde el alumno está matriculado
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        teachingAssignment: { select: { id: true, classGroupId: true } }
      }
    })
    if (!task || !task.state) {
      throw new NotFoundException('Tarea no encontrada')
    }

    const enrolled = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        classGroupId: task.teachingAssignment.classGroupId,
        state: true
      }
    })
    if (!enrolled) {
      throw new ForbiddenException(
        'No estás matriculado en el paralelo de esta tarea'
      )
    }

    // upsert por (taskId, studentId) — constraint único del schema
    const submission = await this.prisma.submission.upsert({
      where: { taskId_studentId: { taskId, studentId } },
      create: {
        taskId,
        studentId,
        fileUrl: dto.fileUrl,
        comment: dto.comment,
        answers: dto.answers ?? undefined,
        status: submissionStatus.entregada,
        submittedAt: new Date()
      },
      update: {
        fileUrl: dto.fileUrl ?? undefined,
        comment: dto.comment ?? undefined,
        answers: dto.answers ?? undefined,
        status: submissionStatus.entregada,
        submittedAt: new Date()
      }
    })

    // Si la tarea es un examen y trae respuestas, auto-calificar
    if (task.type === 'examen' && dto.answers) {
      const questions = await this.prisma.question.findMany({
        where: { taskId },
        include: { options: true }
      })

      let correctCount = 0
      const total = questions.length
      for (const q of questions) {
        const selectedOptionId = dto.answers[q.id]
        if (selectedOptionId) {
          const selected = q.options.find((o) => o.id === selectedOptionId)
          if (selected && selected.isCorrect) correctCount++
        }
      }

      const score =
        total > 0
          ? Math.round((correctCount / total) * Number(task.maxScore) * 100) / 100
          : 0

      // Crear/actualizar la nota automáticamente
      await this.prisma.grade.upsert({
        where: { submissionId: submission.id },
        create: {
          submissionId: submission.id,
          score,
          feedback: `Cuestionario auto-calificado: ${correctCount} de ${total} correctas.`,
          gradedById: studentId // auto-calificación: el "gradedBy" es el propio alumno
        },
        update: {
          score,
          feedback: `Cuestionario auto-calificado: ${correctCount} de ${total} correctas.`,
          gradedAt: new Date()
        }
      })

      // Marcar como calificada
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: { status: submissionStatus.calificada }
      })
    }

    return this.prisma.submission.findUnique({
      where: { id: submission.id },
      include: { grade: true }
    })
  }

  /** Notas del alumno por materia y parcial */
  async findMyGrades(studentId: number) {
    const [submissions, termGrades] = await Promise.all([
      this.prisma.submission.findMany({
        where: { studentId },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              maxScore: true,
              teachingAssignment: {
                select: {
                  id: true,
                  subject: { select: { id: true, name: true } }
                }
              }
            }
          },
          grade: {
            select: { id: true, score: true, feedback: true, gradedAt: true }
          }
        },
        orderBy: { id: 'desc' }
      }),
      this.prisma.termGrade.findMany({
        where: { studentId },
        include: {
          teachingAssignment: {
            select: {
              id: true,
              subject: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { id: 'desc' }
      })
    ])

    return { submissions, termGrades }
  }

  // ============================================================
  //  PROFESOR
  // ============================================================

  /** Asignaciones del profesor (qué materia da a qué paralelo) */
  async findTeacherAssignments(teacherId: number) {
    return this.prisma.teachingAssignment.findMany({
      where: { teacherId, state: true },
      include: {
        subject: { select: { id: true, name: true } },
        classGroup: {
          select: {
            id: true,
            parallel: true,
            level: { select: { id: true, name: true } }
          }
        },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: {
          select: { lessons: true, tasks: true, termGrades: true }
        }
      },
      orderBy: { id: 'asc' }
    })
  }

  /** Valida que un teachingAssignment pertenezca al profesor */
  private async assertOwnsAssignment(
    teacherId: number,
    teachingAssignmentId: number
  ) {
    const assignment = await this.prisma.teachingAssignment.findUnique({
      where: { id: teachingAssignmentId }
    })
    if (!assignment || assignment.teacherId !== teacherId) {
      throw new ForbiddenException(
        'No tienes permiso sobre esta asignación académica'
      )
    }
    return assignment
  }

  async createLessonByTeacher(
    teacherId: number,
    dto: CreateLessonByTeacherDto
  ) {
    await this.assertOwnsAssignment(teacherId, dto.teachingAssignmentId)
    return this.prisma.lesson.create({
      data: {
        teachingAssignmentId: dto.teachingAssignmentId,
        title: dto.title,
        content: dto.content,
        order: dto.order ?? 0
      }
    })
  }

  async createTaskByTeacher(teacherId: number, dto: CreateTaskByTeacherDto) {
    await this.assertOwnsAssignment(teacherId, dto.teachingAssignmentId)

    // Si viene lessonId, validar que la lección sea de la misma asignación
    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId }
      })
      if (!lesson || lesson.teachingAssignmentId !== dto.teachingAssignmentId) {
        throw new ForbiddenException(
          'La lección no pertenece a esta asignación académica'
        )
      }
    }

    // Si es tipo examen, validar que vengan preguntas
    if (dto.type === 'examen' && (!dto.questions || dto.questions.length === 0)) {
      throw new ForbiddenException(
        'Los cuestionarios deben tener al menos una pregunta'
      )
    }

    return this.prisma.task.create({
      data: {
        teachingAssignmentId: dto.teachingAssignmentId,
        lessonId: dto.lessonId,
        title: dto.title,
        description: dto.description,
        type: dto.type ?? 'documento',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        maxScore: dto.maxScore ?? 10,
        // Si es examen, crear las preguntas y opciones anidadas
        ...(dto.type === 'examen' && dto.questions
          ? {
              questions: {
                create: dto.questions.map((q, qi) => ({
                  text: q.text,
                  order: qi,
                  options: {
                    create: q.options.map((o, oi) => ({
                      text: o.text,
                      isCorrect: o.isCorrect,
                      order: oi
                    }))
                  }
                }))
              }
            }
          : {})
      },
      include:
        dto.type === 'examen'
          ? { questions: { include: { options: true }, orderBy: { order: 'asc' } } }
          : undefined
    })
  }

  /** Entregas de una tarea del profesor (valida ownership de la tarea) */
  async findSubmissionsForTeacherTask(teacherId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { teachingAssignment: { select: { teacherId: true } } }
    })
    if (!task) {
      throw new NotFoundException('Tarea no encontrada')
    }
    if (task.teachingAssignment.teacherId !== teacherId) {
      throw new ForbiddenException('Esta tarea no te pertenece')
    }

    return this.prisma.submission.findMany({
      where: { taskId },
      include: {
        student: { select: { id: true, name: true, userName: true } },
        grade: true
      },
      orderBy: { submittedAt: 'desc' }
    })
  }

  /** Califica una entrega (valida que la task de la submission sea del profesor) */
  async gradeSubmission(
    teacherId: number,
    submissionId: number,
    dto: CreateGradeByTeacherDto
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: { include: { teachingAssignment: { select: { teacherId: true } } } }
      }
    })
    if (!submission) {
      throw new NotFoundException('Entrega no encontrada')
    }
    if (submission.task.teachingAssignment.teacherId !== teacherId) {
      throw new ForbiddenException(
        'No puedes calificar una entrega que no corresponde a tu tarea'
      )
    }

    const grade = await this.prisma.grade.upsert({
      where: { submissionId },
      create: {
        submissionId,
        score: dto.score,
        feedback: dto.feedback,
        gradedById: teacherId
      },
      update: {
        score: dto.score,
        feedback: dto.feedback,
        gradedById: teacherId,
        gradedAt: new Date()
      }
    })

    // Marca la entrega como calificada
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: submissionStatus.calificada }
    })

    return grade
  }

  /** Registra nota de parcial (valida ownership de la asignación) */
  async createTermGradeByTeacher(
    teacherId: number,
    dto: CreateTermGradeByTeacherDto
  ) {
    await this.assertOwnsAssignment(teacherId, dto.teachingAssignmentId)

    return this.prisma.termGrade.upsert({
      where: {
        teachingAssignmentId_studentId_term: {
          teachingAssignmentId: dto.teachingAssignmentId,
          studentId: dto.studentId,
          term: dto.term
        }
      },
      create: {
        teachingAssignmentId: dto.teachingAssignmentId,
        studentId: dto.studentId,
        term: dto.term,
        score: dto.score,
        observations: dto.observations
      },
      update: {
        score: dto.score,
        observations: dto.observations
      }
    })
  }

  // ============================================================
  //  LECCIONES Y TAREAS (alumno: lectura; profesor: list/edit/delete)
  // ============================================================

  /** Lecciones del paralelo del alumno (con contenido) */
  async findMyLessons(studentId: number) {
    const myClassGroups = await this.prisma.enrollment.findMany({
      where: { studentId, state: true },
      select: { classGroupId: true }
    })
    const classGroupIds = myClassGroups.map((e) => e.classGroupId)
    if (classGroupIds.length === 0) return []

    const assignments = await this.prisma.teachingAssignment.findMany({
      where: { classGroupId: { in: classGroupIds }, state: true },
      select: { id: true }
    })
    const assignmentIds = assignments.map((a) => a.id)

    return this.prisma.lesson.findMany({
      where: { teachingAssignmentId: { in: assignmentIds }, state: true },
      include: {
        teachingAssignment: {
          select: {
            id: true,
            subject: { select: { id: true, name: true } },
            classGroup: {
              select: {
                id: true,
                parallel: true,
                level: { select: { id: true, name: true } }
              }
            }
          }
        }
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }]
    })
  }

  /** Lecciones de una asignación del profesor */
  async findTeacherLessons(teacherId: number, assignmentId: number) {
    await this.assertOwnsAssignment(teacherId, assignmentId)
    return this.prisma.lesson.findMany({
      where: { teachingAssignmentId: assignmentId, state: true },
      orderBy: [{ order: 'asc' }, { id: 'asc' }]
    })
  }

  /** Tareas de una asignación del profesor */
  async findTeacherTasks(teacherId: number, assignmentId: number) {
    await this.assertOwnsAssignment(teacherId, assignmentId)
    return this.prisma.task.findMany({
      where: { teachingAssignmentId: assignmentId, state: true },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { id: 'desc' }
    })
  }

  /** Valida que una lección pertenezca a una asignación del profesor */
  private async assertOwnsLesson(teacherId: number, lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { teachingAssignment: { select: { teacherId: true } } }
    })
    if (!lesson) throw new NotFoundException('Lección no encontrada')
    if (lesson.teachingAssignment.teacherId !== teacherId) {
      throw new ForbiddenException('Esta lección no te pertenece')
    }
    return lesson
  }

  /** Valida que una tarea pertenezca a una asignación del profesor */
  private async assertOwnsTask(teacherId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { teachingAssignment: { select: { teacherId: true } } }
    })
    if (!task) throw new NotFoundException('Tarea no encontrada')
    if (task.teachingAssignment.teacherId !== teacherId) {
      throw new ForbiddenException('Esta tarea no te pertenece')
    }
    return task
  }

  async updateLessonByTeacher(
    teacherId: number,
    lessonId: number,
    dto: Partial<CreateLessonByTeacherDto>
  ) {
    await this.assertOwnsLesson(teacherId, lessonId)
    const { teachingAssignmentId, ...data } = dto
    return this.prisma.lesson.update({ where: { id: lessonId }, data })
  }

  async deleteLessonByTeacher(teacherId: number, lessonId: number) {
    await this.assertOwnsLesson(teacherId, lessonId)
    return this.prisma.lesson.delete({ where: { id: lessonId } })
  }

  async updateTaskByTeacher(
    teacherId: number,
    taskId: number,
    dto: Partial<CreateTaskByTeacherDto>
  ) {
    await this.assertOwnsTask(teacherId, taskId)
    const { teachingAssignmentId, lessonId, dueDate, type, questions, ...data } = dto
    const payload: any = { ...data }
    if (lessonId !== undefined) payload.lessonId = lessonId
    if (dueDate !== undefined) {
      payload.dueDate = dueDate ? new Date(dueDate) : null
    }
    if (type !== undefined) payload.type = type

    // Si el profesor edita las preguntas del examen, reconstruirlas
    if (type === 'examen' && questions !== undefined) {
      // Borrar preguntas existentes y recrear
      await this.prisma.question.deleteMany({ where: { taskId } })
      if (questions.length > 0) {
        payload.questions = {
          create: questions.map((q, qi) => ({
            text: q.text,
            order: qi,
            options: {
              create: q.options.map((o, oi) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: oi
              }))
            }
          }))
        }
      }
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: payload,
      include:
        type === 'examen'
          ? { questions: { include: { options: true }, orderBy: { order: 'asc' } } }
          : undefined
    })
  }

  async deleteTaskByTeacher(teacherId: number, taskId: number) {
    await this.assertOwnsTask(teacherId, taskId)
    return this.prisma.task.delete({ where: { id: taskId } })
  }

  // ============================================================
  //  ANUNCIOS (tablón del curso)
  // ============================================================

  /** Anuncios de los paralelos del alumno */
  async findMyAnnouncements(studentId: number) {
    const myClassGroups = await this.prisma.enrollment.findMany({
      where: { studentId, state: true },
      select: { classGroupId: true }
    })
    const classGroupIds = myClassGroups.map((e) => e.classGroupId)
    if (classGroupIds.length === 0) return []

    const assignments = await this.prisma.teachingAssignment.findMany({
      where: { classGroupId: { in: classGroupIds }, state: true },
      select: { id: true }
    })
    const assignmentIds = assignments.map((a) => a.id)

    return this.prisma.announcement.findMany({
      where: { teachingAssignmentId: { in: assignmentIds }, state: true },
      include: {
        teachingAssignment: {
          select: {
            id: true,
            subject: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /** Anuncios de una asignación del profesor */
  async findTeacherAnnouncements(teacherId: number, assignmentId: number) {
    await this.assertOwnsAssignment(teacherId, assignmentId)
    return this.prisma.announcement.findMany({
      where: { teachingAssignmentId: assignmentId, state: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  async createAnnouncementByTeacher(
    teacherId: number,
    dto: CreateAnnouncementByTeacherDto
  ) {
    await this.assertOwnsAssignment(teacherId, dto.teachingAssignmentId)
    return this.prisma.announcement.create({
      data: {
        teachingAssignmentId: dto.teachingAssignmentId,
        title: dto.title,
        content: dto.content
      }
    })
  }

  /** Valida que un anuncio pertenezca a una asignación del profesor */
  private async assertOwnsAnnouncement(teacherId: number, announcementId: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: { teachingAssignment: { select: { teacherId: true } } }
    })
    if (!announcement) throw new NotFoundException('Anuncio no encontrado')
    if (announcement.teachingAssignment.teacherId !== teacherId) {
      throw new ForbiddenException('Este anuncio no te pertenece')
    }
    return announcement
  }

  async updateAnnouncementByTeacher(
    teacherId: number,
    announcementId: number,
    dto: Partial<CreateAnnouncementByTeacherDto>
  ) {
    await this.assertOwnsAnnouncement(teacherId, announcementId)
    const { teachingAssignmentId, ...data } = dto
    return this.prisma.announcement.update({
      where: { id: announcementId },
      data
    })
  }

  async deleteAnnouncementByTeacher(teacherId: number, announcementId: number) {
    await this.assertOwnsAnnouncement(teacherId, announcementId)
    return this.prisma.announcement.delete({ where: { id: announcementId } })
  }
}
