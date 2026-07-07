import { Role } from './role'
import { RoleCreate, RoleUpdate } from './roleCreate'

export interface RoleRepository {
  create: (
    role: RoleCreate
  ) => Promise<{ message: string | string[]; error: string }>
  getAll: () => Promise<Role[]>
  getOne: (id: number) => Promise<Role>
  update: (
    role: RoleUpdate
  ) => Promise<{ message: string | string[]; error: string }>
  delete: (id: number) => Promise<{ message: string | string[]; error: string }>
}
