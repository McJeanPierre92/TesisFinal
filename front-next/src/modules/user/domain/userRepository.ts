import { User } from './user'
import { UserCreate } from './userCreate'
import { UserUpdate } from './userUpdate'

export interface UserRepository {
  updatePermissionState(
    permissionId: number,
    newState: boolean
  ): { message: any; error: any } | PromiseLike<{ message: any; error: any }>
  create: (
    user: UserCreate
  ) => Promise<{ message: string | string[]; error: string }>
  update: (
    user: UserUpdate
  ) => Promise<{ message: string | string[]; error: string }>
  getAll: () => Promise<User[]>
  getOne: (id: number) => Promise<User>
  delete: (id: number) => Promise<{ message: string | string[]; error: string }>
}
