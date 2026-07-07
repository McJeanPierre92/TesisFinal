import { RoleRepository } from '../../domain/roleRepository'

export const deleteRole = (roleRepository: RoleRepository) => {
  return async (id: number) => {
    return await roleRepository.delete(id)
  }
}
