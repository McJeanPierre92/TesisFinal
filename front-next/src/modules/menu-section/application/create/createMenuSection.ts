import { MenuSectionCreate } from '../../domain/menuSectionsCreate'
import { MenuSectionRepository } from '../../domain/menuSectionsRepository'

export const createMenuSection = (
  menuSectionRepository: MenuSectionRepository
) => {
  return async (data: MenuSectionCreate) => {
    return await menuSectionRepository.create(data)
  }
}
