import { RoleRepository } from '../../domain/roleRepository'

export const getAllRole = (roleRepository: RoleRepository) => {
  return async () => {
    return await roleRepository.getAll()
  }
}
