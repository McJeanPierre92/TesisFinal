import { UserRepository } from '../../domain/userRepository'

export const getOneUser = (userRepository: UserRepository) => {
  return async (id: number) => {
    return await userRepository.getOne(id)
  }
}
