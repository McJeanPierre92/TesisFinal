import { UserRepository } from '../../domain/userRepository'

export const deleteUser = (userRepository: UserRepository) => {
  return async (id: number) => {
    return userRepository.delete(id)
  }
}
