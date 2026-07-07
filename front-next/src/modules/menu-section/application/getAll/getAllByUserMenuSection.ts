import { MenuSectionRepository } from '../../domain/menuSectionsRepository'

export const getAllByUserMenuSection = (
  menuSectionRepository: MenuSectionRepository
) => {
  return async () => {
    return await menuSectionRepository.getByUser()
  }
}
