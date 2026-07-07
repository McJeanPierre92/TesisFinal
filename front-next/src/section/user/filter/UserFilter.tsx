'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllRole } from '@/modules/role/application/getAll/getAllRole'
import { Role } from '@/modules/role/domain/role'
import { apiRole } from '@/modules/role/infrastructure/apiRole'
import { UserFilters } from '@/modules/user/domain/user'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: Partial<UserFilters>) => void
  onClearFilters: () => void
}

const roleRepository = apiRole()

export const UserFiltersContainer = ({
  filters,
  onFiltersChange,
  onClearFilters
}: UserFiltersProps) => {
  const [roles, setRoles] = useState<Role[]>([])

  const fetchRoles = async () => {
    const roles = await getAllRole(roleRepository)()
    setRoles(roles)
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const hasActiveFilters =
    filters.search !== '' || filters.roleId !== null || filters.state !== null

  return (
    <Card className='p-2'>
      <div>
        <div className='flex items-center gap-3'>
          <div className='space-y-2 w-full'>
            <Label className='font-bold'>Buscar</Label>
            <Input
              type='search'
              placeholder='Nombre o usuario...'
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
            />
          </div>

          {/* Filtro por rol */}
          <div className='space-y-2 w-full'>
            <Label className='font-bold'>Rol</Label>
            <AutoComplete
              data={roles.map((val) => ({
                key: String(val.id),
                label: val.name
              }))}
              value={filters.roleId?.toString() || 'all'}
              onChange={(value) =>
                onFiltersChange({
                  roleId: value === 'all' ? null : Number.parseInt(value)
                })
              }
            />
          </div>

          {/* Filtro por estado */}
          <div className='space-y-2 w-full'>
            <Label className='font-bold'>Estado</Label>
            <AutoComplete
              data={[
                { key: 'true', label: 'Activo' },
                { key: 'false', label: 'Inactivo' }
              ]}
              value={
                filters.state === null
                  ? 'all'
                  : filters.state === true
                  ? 'true'
                  : 'false'
              }
              onChange={(value) =>
                onFiltersChange({
                  state:
                    value === 'all' ? null : value === 'true' ? true : false
                })
              }
            />
          </div>

          <div className='space-y-2 w-full'>
            <Label>&nbsp;</Label>
            <Button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className='w-full'
            >
              <X className='h-4 w-4 mr-2' />
              Limpiar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
