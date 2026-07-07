import { AuthRepository } from '../../domain/authRepository'

export const logout = (authRepository: AuthRepository) => {
  return async () => {
    return authRepository.logout()
  }
}
