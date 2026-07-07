import { MenuSectionRepository } from '../../domain/menuSectionsRepository'

export const deleteMenuSection = (
  menuSectionRepository: MenuSectionRepository
) => {
  return async (id: number) => {
    return await menuSectionRepository.delete(id)
  }
}
