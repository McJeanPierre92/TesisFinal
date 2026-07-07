import { RoleUpdate } from '../../domain/roleCreate'
import { RoleRepository } from '../../domain/roleRepository'

export const updateRole = (roleRepository: RoleRepository) => {
  return async (role: RoleUpdate) => {
    return await roleRepository.update(role)
  }
}
