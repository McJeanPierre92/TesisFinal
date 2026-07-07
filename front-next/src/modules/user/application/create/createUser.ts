import { UserCreate } from '../../domain/userCreate'
import { UserRepository } from '../../domain/userRepository'

export const createUser = (userRepository: UserRepository) => {
  return async (data: UserCreate) => {
    return await userRepository.create(data)
  }
}
