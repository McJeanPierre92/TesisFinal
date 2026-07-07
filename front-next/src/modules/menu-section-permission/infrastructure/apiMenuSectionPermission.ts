import { MenuSectionPermission } from '../domain/menuSectionPermissions'
import { MenuSectionPermissionCreate } from '../domain/menuSectionPermissionsCreate'
import { MenuSectionPermissionRepository } from '../domain/menuSectionPermissionsRepository'
import { MenuSectionPermissionUpdate } from '../domain/menuSectionPermissionsUpdate'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = {
  'Content-Type': 'application/json'
}

export const apiMenuSectionPermission = (): MenuSectionPermissionRepository => {
  const getAll = async (): Promise<MenuSectionPermission[]> => {
    return fetch(`${API}/menu-section-permission`, {
      method: 'GET',
      headers,
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const getById = async (id: number): Promise<MenuSectionPermission | null> => {
    if (!id) throw new Error('Id is required')
    return fetch(`${API}/menu-section-permission/${id}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const create = async (
    menuSectionPermission: MenuSectionPermissionCreate
  ): Promise<MenuSectionPermission> => {
    return fetch(`${API}/menu-section-permission`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(menuSectionPermission)
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const update = async (
    id: number,
    data: MenuSectionPermissionUpdate
  ): Promise<MenuSectionPermission> => {
    return fetch(`${API}/menu-section-permission/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(data)
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const deleteById = async (id: number): Promise<void> => {
    await fetch(`${API}/menu-section-permission/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    })
  }

  return { getAll, getById, create, update, delete: deleteById }
}
