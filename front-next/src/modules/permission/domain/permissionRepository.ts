import { Permission } from './permission'
import { PermissionUpdate } from './permissionUpdate'

export interface PermissionRepository {
  create: (permission: {
    name: string
    state?: boolean
  }) => Promise<{ message: string | string[]; error: string }>
  getAll: () => Promise<Permission[]>
  getOne: (id: number) => Promise<Permission>
  update: (
    permission: PermissionUpdate
  ) => Promise<{ message: string | string[]; error: string }>
  delete: (id: number) => Promise<{ message: string | string[]; error: string }>
}
