import { UserRepository } from '../../domain/userRepository'
import { UserUpdate } from '../../domain/userUpdate'

export const updateUser = (userRepository: UserRepository) => {
  return async (data: UserUpdate) => {
    return await userRepository.update(data)
  }
}
