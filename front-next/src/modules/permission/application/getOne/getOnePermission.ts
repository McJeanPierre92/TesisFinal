import { PermissionRepository } from '../../domain/permissionRepository'

export const getOnePermission = (
  permissionRepository: PermissionRepository
) => {
  return async (id: number) => {
    return await permissionRepository.getOne(id)
  }
}
