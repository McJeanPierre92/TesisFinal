import { RolePermissionCreateSchema } from '@/modules/rolePermission/domain/rolePermissionCreate'
import { z } from 'zod'

export const RoleCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  state: z.boolean().optional(),
  permissions: z.array(RolePermissionCreateSchema).optional()
})

export const RoleUpdateSchema = RoleCreateSchema.extend({
  id: z.number()
}).partial()

export type RoleCreate = z.infer<typeof RoleCreateSchema>
export type RoleUpdate = z.infer<typeof RoleUpdateSchema>
