import { UserRepository } from '../../domain/userRepository'

export const getAllUser = (userRepository: UserRepository) => {
  return async () => {
    return await userRepository.getAll()
  }
}
