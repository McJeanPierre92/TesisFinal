import { MenuSectionRepository } from '../../domain/menuSectionsRepository'

export const getAllMenuSection = (
  menuSectionRepository: MenuSectionRepository
) => {
  return async (state?: boolean) => {
    return await menuSectionRepository.getAll(state)
  }
}
