import { MenuSectionRepository } from '../../domain/menuSectionsRepository'
import { MenuSectionUpdate } from '../../domain/menuSectionsUpdate'

export const updateMenuSection = (
  menuSectionRepository: MenuSectionRepository
) => {
  return async (id: number, data: MenuSectionUpdate) => {
    return await menuSectionRepository.update(id, data)
  }
}
