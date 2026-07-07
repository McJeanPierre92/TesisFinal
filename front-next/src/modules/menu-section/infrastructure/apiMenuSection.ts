import { MenuSection } from '../domain/menuSections'
import { MenuSectionCreate } from '../domain/menuSectionsCreate'
import { MenuSectionRepository } from '../domain/menuSectionsRepository'
import { MenuSectionUpdate } from '../domain/menuSectionsUpdate'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = {
  'Content-Type': 'application/json'
}

export const apiMenuSection = (): MenuSectionRepository => {
  const getAll = async (state = true) => {
    let url = []
    if (state) url.push('state=true')

    return fetch(`${API}/menu-section?${url.join('&')}`, {
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

  const getByUser = async () => {
    return fetch(`${API}/menu-section/find-by-user`, {
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

  const getOne = async (id: number) => {
    if (!id) throw new Error('Id is required')
    return fetch(`${API}/menu-section/${id}`, {
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

  const create = async (menuSection: MenuSectionCreate) => {
    return fetch(`${API}/menu-section`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(menuSection)
    })
      .then((res) => res.json())
      .then((data) => data)
      .catch((err) => {
        throw err
      })
  }

  const update = async (id: number, data: MenuSectionUpdate) => {
    return fetch(`${API}/menu-section/${id}`, {
      method: 'PATCH',
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

  const getById = async (id: number): Promise<MenuSection> => {
    if (!id) throw new Error('Id is required')
    return fetch(`${API}/menu-section/${id}`, {
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

  const remove = async (id: number) => {
    if (!id) throw new Error('Id is required')
    return fetch(`${API}/menu-section/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete')
        return res.json()
      })
      .catch((err) => err)
  }

  return { getAll, getOne, create, update, getById, delete: remove, getByUser }
}
