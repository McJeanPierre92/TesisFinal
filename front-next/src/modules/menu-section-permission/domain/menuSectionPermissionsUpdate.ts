import { z } from 'zod'
import { MenuSectionPermissionCreate } from './menuSectionPermissionsCreate'

export const MenuSectionPermissionUpdateSchema =
  MenuSectionPermissionCreate.partial()

export type MenuSectionPermissionUpdate = z.infer<
  typeof MenuSectionPermissionUpdateSchema
>
export type MenuSectionPermissionUpdateInput = Omit<
  MenuSectionPermissionUpdate,
  'createdAt' | 'updatedAt'
>
