import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Request } from 'express'

export const PERMISSIONS_KEY = 'permissions'
export const RequirePermission = (module: string, action: string) =>
  SetMetadata(PERMISSIONS_KEY, { module, action })

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<{ module: string; action: string }>(
      PERMISSIONS_KEY,
      context.getHandler()
    )
    if (!required) {
      return true
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: Prisma.userWhereInput }>()
    const user = request.user

    // Validar que el usuario tenga la estructura adecuada
    if (!user || !user.role || !Array.isArray(user.role.permissions)) {
      throw new ForbiddenException('No permissions found')
    }

    const requiredPermission = `${required.module}:${required.action}`

    // Verificar que el permiso exista y esté activo (state: true)
    const hasActivePermission = user.role.permissions.some(
      (p: Prisma.rolePermissionWhereInput) =>
        p.permission.name === requiredPermission && p.state === true
    )

    if (!hasActivePermission) {
      throw new ForbiddenException('No permission')
    }

    return true
  }
}
