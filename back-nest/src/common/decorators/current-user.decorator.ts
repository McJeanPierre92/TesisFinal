import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface AuthUser {
  id: number
  name: string
  userName: string
  roleId: number
  state: boolean
  role: {
    id: number
    name: string
    permissions: {
      state: boolean
      permission: { id: number; name: string; state: boolean }
    }[]
  }
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | any => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    return data ? user?.[data] : user
  }
)
