import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import * as crypto from 'crypto'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class DuplicateRequestInterceptor implements NestInterceptor {
  private readonly cache = new Map<string, number>()
  private readonly ttl = 5000 // 5 segundos para considerar duplicado

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const method = request.method
    const url = request.url

    // Solo controlar POST, PUT, PATCH
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return next.handle()
    }

    // Crear un hash del cuerpo + ruta
    const bodyHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(request.body) + url)
      .digest('hex')

    const now = Date.now()

    // Si ya existe y no ha pasado el TTL -> duplicado
    if (
      this.cache.has(bodyHash) &&
      now - this.cache.get(bodyHash)! < this.ttl
    ) {
      throw new ConflictException('Petición duplicada detectada')
    }

    // Guardar el hash temporalmente
    this.cache.set(bodyHash, now)

    return next.handle().pipe(
      tap(() => {
        // Limpieza del cache después de TTL
        setTimeout(() => this.cache.delete(bodyHash), this.ttl)
      })
    )
  }
}
