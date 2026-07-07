import { Role } from '@/modules/role/domain/role'

export type Auth = {
  id: number
  name: string
  userName: string
  roleId: number
  role: Role
  state: boolean
  statusCode?: number
}

export type AuthLogin = {
  userName: string
  password: string
}
