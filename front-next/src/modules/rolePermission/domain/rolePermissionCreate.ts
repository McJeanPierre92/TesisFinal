import { z } from 'zod'

export const RolePermissionCreateSchema = z.object({
  id: z.number().optional(),
  roleId: z.number().optional(),
  permissionId: z.number()
})
