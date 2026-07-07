import { PermissionRepository } from '../../domain/permissionRepository'

export const getAllPermission = (
  permissionRepository: PermissionRepository
) => {
  return async () => {
    return await permissionRepository.getAll()
  }
}
