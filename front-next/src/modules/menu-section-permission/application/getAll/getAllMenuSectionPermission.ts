import { MenuSectionPermissionRepository } from '../../domain/menuSectionPermissionsRepository'

export const getAllMenuSectionPermission = (
  menuSectionPermissionRepository: MenuSectionPermissionRepository
) => {
  return async () => {
    return await menuSectionPermissionRepository.getAll()
  }
}
