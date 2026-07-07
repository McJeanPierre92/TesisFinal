import { Role } from '@/modules/role/domain/role'

export type User = {
  id: number
  name: string
  userName: string
  password: string
  roleId: number
  role?: Role
  state: boolean
  createdAt: string
  updatedAt: string
}

export type UserFilters = {
  search: string
  roleId: number | null
  state: boolean | null
}
