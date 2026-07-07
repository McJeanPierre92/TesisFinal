import { RolePermission } from '../domain/rolePermission'
import { RolePermissionRepository } from '../domain/rolePermissionRepository'

const API = process.env.NEXT_PUBLIC_URL_API

const headers = {
  'Content-Type': 'application/json'
}

export const apiRolePermission = (): RolePermissionRepository => {
  const getRolePermissions = async () => {
    return fetch(`${API}/role-permission`, {
      method: 'GET',
      headers
    })
      .then((res) => res.json())
      .catch((err) => {
        throw err
      })
  }

  const updatePermissionState = async (
    roleId: number,
    permissionId: number,
    data: Partial<RolePermission>
  ) => {
    return fetch(`${API}/role-permission/${roleId}/${permissionId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ data }),
      credentials: 'include'
    })
      .then((res) => res.json())
      .catch((err) => {
        throw err
      })
  }

  return {
    getAll: getRolePermissions,
    update: updatePermissionState
  }
}
