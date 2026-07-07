import { RolePermission } from '@/modules/rolePermission/domain/rolePermission'
import { User } from '@/modules/user/domain/user'

export type Role = {
  id: number
  name: string
  state: boolean
  updatedAt: Date
  permissions: RolePermission[]
  users?: User[]
}
