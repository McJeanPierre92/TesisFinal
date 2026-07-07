import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class AuditLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Audit')

  use(req: Request, res: Response, next: NextFunction) {
    const { method, path, ip, headers } = req
    const start = Date.now()

    // Máscara de datos sensibles en logs
    const safeBody = req.body ? this.sanitizeForLog(req.body) : undefined

    res.on('finish', () => {
      const duration = Date.now() - start
      const { statusCode } = res

      // Loggear solo eventos relevantes para seguridad
      if (statusCode >= 400) {
        this.logger.warn('Security Event', {
          method,
          path,
          status: statusCode,
          ip,
          userAgent: headers['user-agent']?.slice(0, 100),
          durationMs: duration,
          // ⚠️ Nunca loggear passwords, tokens, PII completa
          bodyPreview: safeBody
        })
      }
    })

    next()
  }

  private sanitizeForLog(obj: any): any {
    const sensitive = ['password', 'token', 'secret', 'creditCard', 'ssn']

    if (typeof obj !== 'object' || obj === null) return obj

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (sensitive.some((s) => key.toLowerCase().includes(s))) {
          return [key, '***REDACTED***']
        }
        if (typeof value === 'object') {
          return [key, this.sanitizeForLog(value)]
        }
        return [key, value]
      })
    )
  }
}
