import { z } from 'zod'

export const PermissionCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  state: z.boolean().optional() // Opcional, ya que puede tener valor por defecto
})

export type PermissionCreate = z.infer<typeof PermissionCreateSchema>
