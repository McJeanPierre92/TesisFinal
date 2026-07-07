'use client'

import { DataTable } from '@/components/table/DataTable'
import { Input } from '@/components/ui/input'
import { getAllPermission } from '@/modules/permission/application/getAll/getAllPermission'
import { Permission } from '@/modules/permission/domain/permission'
import { apiPermission } from '@/modules/permission/infrastructure/apiPermission'
import { useEffect, useState } from 'react'
import { getColumnPermission } from './columnPermission'

type Props = {
  handleEdit: (permission: Permission) => void
}

const permissionRepository = apiPermission()

export function PermissionsTable({ handleEdit }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPermissions = permissions.filter((permission) =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchPermissions = async () => {
    const permissions = await getAllPermission(permissionRepository)()
    setPermissions(permissions)
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-2'>
        <Input
          type='search'
          placeholder='Buscar permisos...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='py-2'
        />
      </div>

      <DataTable
        data={filteredPermissions}
        columns={getColumnPermission(fetchPermissions, handleEdit)}
        getPagination
      />
    </div>
  )
}
