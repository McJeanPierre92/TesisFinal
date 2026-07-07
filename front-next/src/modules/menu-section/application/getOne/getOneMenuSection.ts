import { MenuSectionRepository } from '../../domain/menuSectionsRepository'

export const getOneMenuSection = (
  menuSectionRepository: MenuSectionRepository
) => {
  return async (id: number) => {
    return await menuSectionRepository.getOne(id)
  }
}
