import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

// Mapeo de tablas/modelos de Prisma a nombres legibles en español
const MODEL_LABELS: Record<string, string> = {
  user: 'usuario',
  role: 'rol',
  permission: 'permiso',
  rolePermission: 'asignación de permiso',
  menuSection: 'sección de menú',
  menuSectionPermission: 'permiso de menú',
  institution: 'institución',
  level: 'nivel',
  subject: 'materia',
  classGroup: 'paralelo',
  enrollment: 'matrícula',
  teachingAssignment: 'asignación académica',
  lesson: 'lección',
  task: 'tarea',
  schedule: 'horario',
  submission: 'entrega',
  grade: 'calificación',
  termGrade: 'nota de parcial'
}

// Mapeo de campos a nombres legibles en español
const FIELD_LABELS: Record<string, string> = {
  userName: 'nombre de usuario',
  name: 'nombre',
  email: 'correo electrónico',
  password: 'contraseña',
  roleId: 'rol',
  institutionId: 'institución',
  levelId: 'nivel',
  subjectId: 'materia',
  classGroupId: 'paralelo',
  teacherId: 'profesor',
  studentId: 'alumno',
  teachingAssignmentId: 'asignación',
  taskId: 'tarea',
  lessonId: 'lección',
  parallel: 'paralelo',
  dayOfWeek: 'día',
  term: 'parcial',
  submissionId: 'entrega'
}

function getLabel(modelOrField: string | undefined): string {
  if (!modelOrField) return ''
  return MODEL_LABELS[modelOrField] || FIELD_LABELS[modelOrField] || modelOrField
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const statusMap: Record<string, number> = {
      BadRequestException: HttpStatus.BAD_REQUEST,
      NotFoundException: HttpStatus.NOT_FOUND,
      ForbiddenException: HttpStatus.FORBIDDEN,
      UnauthorizedException: HttpStatus.UNAUTHORIZED,
      ConflictException: HttpStatus.CONFLICT,
      InternalServerErrorException: HttpStatus.INTERNAL_SERVER_ERROR
    }

    const exceptionName = exception.constructor.name
    const status = statusMap[exceptionName] || HttpStatus.INTERNAL_SERVER_ERROR

    // ---------- Errores conocidos de Prisma ----------
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
      let message = 'Ocurrió un error inesperado en la base de datos.'

      switch (exception.code) {
        case 'P2002': {
          // Unique constraint violation
          httpStatus = HttpStatus.BAD_REQUEST
          const meta = exception.meta as any
          const targets: string[] = meta?.target || []
          const model = meta?.model ? getLabel(meta.model) : 'registro'
          const fields = targets
            .map((t) => getLabel(t))
            .filter(Boolean)
            .join(', ')
          if (fields) {
            message = `Ya existe un ${model} con esos datos (${fields}). Verifica que no esté duplicado.`
          } else {
            message = `Ya existe un ${model} con esos datos. No se pueden duplicar registros.`
          }
          break
        }
        case 'P2003': {
          // Foreign key constraint failed
          httpStatus = HttpStatus.BAD_REQUEST
          const meta = exception.meta as any
          const field = meta?.field_name
            ? meta.field_name.replace(/_id$/, '').replace(/_fkey$/, '')
            : ''
          const label = getLabel(field) || 'un registro relacionado'
          message = `No se puede completar la operación porque el ${label} referenciado no existe. Asegúrate de seleccionar un valor válido.`
          break
        }
        case 'P2004':
          httpStatus = HttpStatus.BAD_REQUEST
          message =
            'Los datos proporcionados violan una restricción de la base de datos. Revisa la información e intenta nuevamente.'
          break
        case 'P2025': {
          // Record not found
          httpStatus = HttpStatus.NOT_FOUND
          const meta = exception.meta as any
          const model = meta?.model ? getLabel(meta.model) : 'registro'
          message = `No se encontró el ${model} solicitado. Es posible que haya sido eliminado.`
          break
        }
        case 'P2014':
          httpStatus = HttpStatus.BAD_REQUEST
          message =
            'Hay una relación inválida entre los datos. Revisa los campos seleccionados.'
          break
        case 'P2016':
          httpStatus = HttpStatus.BAD_REQUEST
          message = 'Uno de los valores proporcionados no es válido.'
          break
        case 'P2018': {
          httpStatus = HttpStatus.NOT_FOUND
          const meta = exception.meta as any
          const model = meta?.model ? getLabel(meta.model) : 'registro relacionado'
          message = `No se encontraron los ${model}s necesarios para completar la operación.`
          break
        }
      }

      this.logger.error({
        message,
        prismaCode: exception.code,
        meta: exception.meta
      })
      return response.status(httpStatus).json({
        statusCode: httpStatus,
        message,
        error: message
      })
    }

    // ---------- HttpExceptions (NestJS: Forbidden, Unauthorized, etc.) ----------
    if (exception instanceof HttpException) {
      const res = exception.getResponse()
      this.logger.error(typeof res === 'string' ? { message: res } : res)

      // Si la respuesta es un objeto con message, lo pasamos tal cual
      // (los servicios ya lanzan mensajes en español como ForbiddenException)
      if (typeof res === 'object' && res !== null) {
        const resObj = res as any
        // Caso especial: errores de validación del ValidationPipe (array de messages)
        if (Array.isArray(resObj.message)) {
          const first = resObj.message[0]
          return response.status(exception.getStatus()).json({
            statusCode: exception.getStatus(),
            message: first,
            error: 'Validación'
          })
        }
        return response.status(exception.getStatus()).json(resObj)
      }
      return response
        .status(exception.getStatus())
        .json({ message: String(res) })
    }

    // ---------- Error no controlado ----------
    this.logger.error('Unhandled error:', exception)
    return response.status(status).json({
      statusCode: status,
      message: 'Ocurrió un error inesperado. Inténtalo nuevamente.',
      error: 'Error del servidor'
    })
  }
}
