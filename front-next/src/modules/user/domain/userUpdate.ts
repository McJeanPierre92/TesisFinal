import { z } from 'zod'
import { UserUpdateSchema } from './userCreate'

export const UserUpdate = UserUpdateSchema

export type UserUpdate = z.infer<typeof UserUpdateSchema>
