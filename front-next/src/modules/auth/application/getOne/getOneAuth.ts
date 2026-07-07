import { AuthRepository } from '../../domain/authRepository'

export const getOneAuth = (authRepository: AuthRepository) => {
  return async () => {
    return authRepository.getAuth()
  }
}
