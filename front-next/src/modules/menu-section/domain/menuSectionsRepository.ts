import type { MenuSection } from './menuSections'
import type { MenuSectionCreate } from './menuSectionsCreate'

export interface MenuSectionRepository {
  getOne(id: number): unknown
  getAll(state?: boolean): Promise<MenuSection[]>
  getById(id: number): Promise<MenuSection | null>
  getByUser(): Promise<MenuSection[]>
  create(menuSection: MenuSectionCreate): Promise<MenuSection>
  update(
    id: number,
    menuSection: Partial<MenuSectionCreate>
  ): Promise<{ message: string | string[]; error?: string }>
  delete(id: number): Promise<{ message: string | string[]; error?: string }>
}
