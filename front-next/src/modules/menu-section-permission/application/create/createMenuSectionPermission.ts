import { MenuSectionPermissionCreate } from '../../domain/menuSectionPermissionsCreate'
import { MenuSectionPermissionRepository } from '../../domain/menuSectionPermissionsRepository'

export const createMenuSectionPermission = (
  menuSectionPermissionRepository: MenuSectionPermissionRepository
) => {
  return async (
    menuSectionPermission: MenuSectionPermissionCreate
  ): Promise<MenuSectionPermissionCreate> => {
    if (!menuSectionPermission.menuSectionId) {
      throw new Error('Menu Section ID is required')
    }
    if (
      menuSectionPermission.roleId === undefined ||
      menuSectionPermission.roleId === null
    ) {
      throw new Error('Role ID is required')
    }

    return await menuSectionPermissionRepository.create(menuSectionPermission)
  }
}
