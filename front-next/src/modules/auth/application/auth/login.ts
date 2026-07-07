import { AuthLogin } from '../../domain/auth'
import { AuthRepository } from '../../domain/authRepository'

export const login = (authRepository: AuthRepository) => {
  return async (auth: AuthLogin) => {
    return authRepository.login(auth)
  }
}
