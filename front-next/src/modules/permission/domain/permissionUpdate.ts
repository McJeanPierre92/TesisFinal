import { z } from 'zod'
import { PermissionCreateSchema } from './permissionCreate'

export const PermissionUpdateSchema = PermissionCreateSchema.extend({
  id: z.number().int()
}).partial()

export type PermissionUpdate = z.infer<typeof PermissionUpdateSchema>
