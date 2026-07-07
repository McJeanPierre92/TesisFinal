import { Role } from 'src/role/entities/role.entity'

export class User {
  id: number
  name: string
  userName: string
  roleId: number
  role: Role
  state: boolean
  createdAt: Date
  updatedAt: Date
}
