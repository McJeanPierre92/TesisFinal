import { PermissionRepository } from '../../domain/permissionRepository'

export const deletePermission = (
  permissionRepository: PermissionRepository
) => {
  return async (id: number) => {
    return await permissionRepository.delete(id)
  }
}
