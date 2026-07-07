import { PermissionRepository } from '../../domain/permissionRepository'
import {
  PermissionUpdate,
  PermissionUpdateSchema
} from '../../domain/permissionUpdate'

export const updatePermission = (
  permissionRepository: PermissionRepository
) => {
  return async (permission: PermissionUpdate) => {
    const validation = validateUpdatePermission(permission)
    if (!validation.success) {
      throw new Error(validation.error.message)
    }

    return await permissionRepository.update(permission)
  }
}

export const validateUpdatePermission = (permission: PermissionUpdate) => {
  return PermissionUpdateSchema.safeParse(permission)
}
