import { PermissionRepository } from '../../domain/permissionRepository'

export const createPermission = (
  permissionRepository: PermissionRepository
) => {
  return async (data: { name: string; state?: boolean }) => {
    return await permissionRepository.create(data)
  }
}
