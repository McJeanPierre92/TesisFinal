import { Permission } from 'src/permission/entities/permission.entity'

export class MenuSection {
  id: number
  key: string
  label: string
  href: string
  icon: string
  order: number
  parentId?: number | null
  state?: boolean
  createdAt: Date
  updatedAt: Date

  // Relaciones opcionales para devolver hijos o permisos asociados
  children?: MenuSection[]
  permissions?: Permission[]
}
