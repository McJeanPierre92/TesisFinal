import { Injectable } from '@nestjs/common'
import { extname } from 'node:path'

export const ALLOWED_SUBMISSION_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain'
]

export const MAX_SUBMISSION_SIZE = 10 * 1024 * 1024 // 10MB

@Injectable()
export class UploadsService {
  /**
   * Construye un nombre de archivo único y seguro a partir del usuario y el original.
   * Devuelve solo el nombre (sin ruta absoluta); el archivo se guarda en uploads/.
   */
  buildSubmissionFileName(userId: number, originalName: string): string {
    const ext = extname(originalName).toLowerCase() || '.bin'
    const sanitizedBase = originalName
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 30)
    const timestamp = Date.now()
    return `${userId}-${timestamp}-${sanitizedBase}${ext}`
  }

  /**
   * Construye la URL pública relativa que se almacenará en submission.fileUrl.
   * ServeStatic sirve uploads/ bajo /uploads (configurado en app.module.ts).
   */
  buildPublicUrl(fileName: string): string {
    return `/uploads/${fileName}`
  }
}
