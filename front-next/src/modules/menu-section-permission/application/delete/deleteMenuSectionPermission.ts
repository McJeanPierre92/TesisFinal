import { MenuSectionPermissionRepository } from '../../domain/menuSectionPermissionsRepository'

export const deleteMenuSectionPermission = (
  menuSectionPermissionRepository: MenuSectionPermissionRepository
) => {
  return async (id: number) => {
    return await menuSectionPermissionRepository.delete(id)
  }
}
