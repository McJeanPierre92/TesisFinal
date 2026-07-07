import { RolePermission } from '@/modules/rolePermission/domain/rolePermission'

export type Permission = {
  id: number
  name: string
  state: boolean
  updatedAt: Date
  roles: RolePermission[]
}
