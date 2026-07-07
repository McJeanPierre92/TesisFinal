import { RoleRepository } from '../../domain/roleRepository'

export const getOneRole = (roleRepository: RoleRepository) => {
  return async (id: number) => {
    return await roleRepository.getOne(id)
  }
}
