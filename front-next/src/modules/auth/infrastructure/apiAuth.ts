import { AuthLogin } from '../domain/auth'
import { AuthRepository } from '../domain/authRepository'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = {
  'Content-Type': 'application/json',
}

export const apiAuth = (): AuthRepository => {
  const getAuth = async () => {
    return fetch(`${API}/auth/me`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const login = async (auth: AuthLogin) => {
    return fetch(`${API}/auth/login`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(auth),
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        if (err.status === 401) {
          return {
            message: 'Credenciales Incorrectas',
            error: 'Credenciales Incorrectas',
          }
        }
        return err
      })
  }

  const logout = async () => {
    return fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  return {
    getAuth,
    login,
    logout,
  }
}
