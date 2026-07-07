import { z } from 'zod'

export const AuthLoginSchema = z.object({
  userName: z.string().min(1, 'El userName es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})
