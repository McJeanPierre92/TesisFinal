import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // Prioridad: Cloudflare → Nginx proxy → Express proxy → IP directa
    return (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown'
    )
  }
}
