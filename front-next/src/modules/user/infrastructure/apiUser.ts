import { apiFetch, jsonBody, jsonHeaders } from '@/lib/apiFetch'
import { UserCreate } from '../domain/userCreate'
import { UserRepository } from '../domain/userRepository'
import { UserUpdate } from '../domain/userUpdate'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = jsonHeaders

export const apiUser = (): UserRepository & { updatePermissionState: any } => {
  const getAll = async () => {
    return apiFetch(`${API}/user`, { method: 'GET', headers })
  }

  const getOne = async (id: number) => {
    if (!id) throw new Error('Se requiere un ID')
    return apiFetch(`${API}/user/${id}`, { method: 'GET', headers })
  }

  const create = async (user: UserCreate) => {
    return apiFetch(`${API}/user`, {
      method: 'POST',
      headers,
      body: jsonBody(user)
    })
  }

  const update = async (user: UserUpdate) => {
    return apiFetch(`${API}/user/update`, {
      method: 'PATCH',
      headers,
      body: jsonBody(user)
    })
  }

  const _delete = async (id: number) => {
    return apiFetch(`${API}/user/${id}`, {
      method: 'DELETE',
      noJson: true
    })
  }

  const updatePermissionState = async (
    permissionId: number,
    state: boolean
  ) => {
    return apiFetch(`${API}/permission/${permissionId}`, {
      method: 'PATCH',
      headers,
      body: jsonBody({ state })
    })
  }

  return {
    getAll,
    getOne,
    create,
    update,
    delete: _delete,
    updatePermissionState
  }
}
