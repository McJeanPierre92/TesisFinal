import { RolePermission } from '../../domain/rolePermission'
import { RolePermissionRepository } from '../../domain/rolePermissionRepository'

export const updateRolePermission = (
  rolePermissionRepository: RolePermissionRepository
) => {
  return async (
    roleId: number,
    permissionId: number,
    data: Partial<RolePermission>
  ) => {
    return rolePermissionRepository.update(roleId, permissionId, data)
  }
}
