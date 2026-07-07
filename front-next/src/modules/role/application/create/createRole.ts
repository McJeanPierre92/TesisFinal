import { RoleCreate } from '../../domain/roleCreate'
import { RoleRepository } from '../../domain/roleRepository'

export const createRole = (roleRepository: RoleRepository) => {
  return async (data: RoleCreate) => {
    return await roleRepository.create(data)
  }
}
