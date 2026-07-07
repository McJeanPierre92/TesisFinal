import { z } from 'zod'

export const UserCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  userName: z.string().min(1, 'El usuario es requerido'),
  password: z.string().optional(),
  roleId: z.number(),
  state: z.boolean().optional()
})

export const UserUpdateSchema = UserCreateSchema.partial().extend({
  id: z.number()
})

export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
