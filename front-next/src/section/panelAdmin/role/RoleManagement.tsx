'use client'

import { ModalDialog } from '@/components/shared/ModalDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getAllRole } from '@/modules/role/application/getAll/getAllRole'
import { Role } from '@/modules/role/domain/role'
import { apiRole } from '@/modules/role/infrastructure/apiRole'
import { CreateUpdateRole } from '@/section/role/create/CreateRole'
import { getColumnRoles } from '@/section/role/list/columnsRoles'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

const roleRepository = apiRole()

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const fetchRoles = async () => {
    try {
      const response = await getAllRole(roleRepository)()
      setRoles(response)
    } catch (error) {
      console.error('Error al obtener roles:', error)
    }
  }

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateRole = () => {
    setEditingRole(null)
    setIsDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return (
    <div className='space-y-6 p-3'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>Gestión de Roles</h2>
          <p className='text-muted-foreground'>
            Administra los roles y permisos del sistema
          </p>
        </div>
        <Button onClick={handleCreateRole} variant='secondary'>
          <Plus className='h-4 w-4' />
          Nuevo Rol
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Roles Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {roles.filter((r) => r.state).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {roles.reduce((acc, val) => acc + (val.users || []).length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        type='search'
        placeholder='Buscar roles...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      <DataTable
        data={filteredRoles}
        columns={getColumnRoles(fetchRoles, handleEditRole)}
        getPagination
      />

      {/* Create/Edit Dialog */}
      <ModalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
        className='w-[95vw] max-w-2xl sm:w-full'
      >
        <CreateUpdateRole
          roleToEdit={editingRole ? editingRole : null}
          onSuccess={() => {
            fetchRoles()
            setIsDialogOpen(false)
          }}
        />
      </ModalDialog>
    </div>
  )
}
