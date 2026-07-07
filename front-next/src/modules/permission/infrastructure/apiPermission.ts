import { PermissionCreate } from '../domain/permissionCreate'
import { PermissionRepository } from '../domain/permissionRepository'
import { PermissionUpdate } from '../domain/permissionUpdate'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = {
  'Content-Type': 'application/json'
}

export const apiPermission = (): PermissionRepository => {
  const getAll = async () => {
    return fetch(`${API}/permission`, {
      method: 'GET',
      headers
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const getOne = async (id: number) => {
    if (!id) throw new Error('Id is required')
    return fetch(`${API}/permission/${id}`, {
      method: 'GET',
      headers
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const create = async (permission: PermissionCreate) => {
    return fetch(`${API}/permission`, {
      method: 'POST',
      headers,
      body: JSON.stringify(permission)
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const update = async (permission: PermissionUpdate) => {
    return fetch(`${API}/permission/${permission.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(permission)
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const deletePermission = async (id: number) => {
    return fetch(`${API}/permission/${id}`, {
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
    delete: deletePermission
  }
}
