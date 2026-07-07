import { Permission } from '@/modules/permission/domain/permission'
import { Role } from '@/modules/role/domain/role'

export type RolePermission = {
  roleId: number
  permissionId: number
  state: boolean
  role: Role
  permission: Permission
}
