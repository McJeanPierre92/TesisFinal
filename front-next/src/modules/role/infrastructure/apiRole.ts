import { Role } from '../domain/role'
import { RoleCreate, RoleUpdate } from '../domain/roleCreate'
import { RoleRepository } from '../domain/roleRepository'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = {
  'Content-Type': 'application/json'
}

export const apiRole = (): RoleRepository => {
  const getAll = async (): Promise<Role[]> => {
    return fetch(`${API}/role`, {
      method: 'GET',
      headers
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const getOne = async (id: number): Promise<Role> => {
    if (!id) throw new Error('Id is required')
    return fetch(`${API}/role/${id}`, {
      method: 'GET',
      headers
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const create = async (role: RoleCreate) => {
    return fetch(`${API}/role`, {
      method: 'POST',
      headers,
      body: JSON.stringify(role)
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const update = async (role: RoleUpdate) => {
    const { id, ...rest } = role
    return fetch(`${API}/role/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(rest)
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const _delete = async (id: number) => {
    return fetch(`${API}/role/${id}`, {
      method: 'DELETE',
      headers
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  return {
    getAll,
    getOne,
    create,
    update,
    delete: _delete
  }
}
