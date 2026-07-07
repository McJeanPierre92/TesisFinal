import { Auth, AuthLogin } from './auth'

export type AuthRepository = {
  login: (auth: AuthLogin) => Promise<{ message: string; error: string }>
  getAuth: () => Promise<Auth | null>
  logout: () => Promise<void>
}
