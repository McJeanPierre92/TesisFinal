import { RolePermission } from 'src/role-permission/entities/role-permission.entity'

export class Role {
  id: number
  name: string
  state: boolean
  updatedAt: Date
  permissions?: RolePermission[] // Relación con la tabla pivote
}
