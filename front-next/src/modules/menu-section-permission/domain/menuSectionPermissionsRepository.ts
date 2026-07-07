import { MenuSectionPermission } from './menuSectionPermissions'
import { MenuSectionPermissionCreate } from './menuSectionPermissionsCreate'

export interface MenuSectionPermissionRepository {
  getAll(): Promise<MenuSectionPermission[]>
  getById(id: number): Promise<MenuSectionPermission | null>
  create(
    menuSectionPermission: MenuSectionPermissionCreate
  ): Promise<MenuSectionPermission>
  update(
    id: number,
    menuSectionPermission: Partial<MenuSectionPermissionCreate>
  ): Promise<MenuSectionPermission | null>
  delete(id: number): Promise<void>
}
