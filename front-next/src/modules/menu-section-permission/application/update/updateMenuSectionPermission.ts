import { MenuSectionPermissionRepository } from '../../domain/menuSectionPermissionsRepository'
import { MenuSectionPermissionUpdate } from '../../domain/menuSectionPermissionsUpdate'

export const updateMenuSectionPermission = (
  menuSectionPermissionRepository: MenuSectionPermissionRepository
) => {
  return async (id: number, data: MenuSectionPermissionUpdate) => {
    return await menuSectionPermissionRepository.update(id, data)
  }
}
