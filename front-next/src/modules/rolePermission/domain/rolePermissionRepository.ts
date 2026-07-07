import { RolePermission } from './rolePermission'

export interface RolePermissionRepository {
  getAll: () => Promise<RolePermission[]>
  update: (
    roleId: number,
    permissionId: number,
    data: Partial<RolePermission>
  ) => Promise<RolePermission>
}
