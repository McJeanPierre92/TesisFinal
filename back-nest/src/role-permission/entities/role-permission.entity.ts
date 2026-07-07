import { Permission } from 'src/permission/entities/permission.entity'

export class RolePermission {
  id: number
  roleId: number
  permissionId: number
  permission?: Permission
}
