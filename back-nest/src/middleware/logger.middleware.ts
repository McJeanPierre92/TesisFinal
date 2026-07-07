import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - start
      if (res.statusCode >= 400) {
        // Loguea intentos sospechosos
        this.logger.warn('Security Event:', {
          ip: req.ip,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          userAgent: req.headers['user-agent'],
          duration
        })
      }
    })
    next()
  }
}
