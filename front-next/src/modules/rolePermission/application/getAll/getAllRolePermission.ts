import { RolePermissionRepository } from '../../domain/rolePermissionRepository'

export const getAllRolePermission = (
  rolePermissionRepository: RolePermissionRepository
) => {
  return async () => {
    return rolePermissionRepository.getAll()
  }
}
