export class MenuSectionPermission {
  id: number
  menuSectionId: number
  roleId: number
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<MenuSectionPermission>) {
    Object.assign(this, partial)
  }
}
