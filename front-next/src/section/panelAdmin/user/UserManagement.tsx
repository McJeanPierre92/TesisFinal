import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useUsers } from '@/hooks/useUser'
import { User } from '@/modules/user/domain/user'
import { CreateUpdateUser } from '@/section/user/create/CreateUser'
import { UserFiltersContainer } from '@/section/user/filter/UserFilter'
import { getColumnUsers } from '@/section/user/list/columnUser'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'

export const UserManagement: React.FC = () => {
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { users, filters, updateFilters, clearFilters, refetch } = useUsers()

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowUserForm(true)
  }

  const handleEditUser = async (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  return (
    <div className='space-y-6 p-3'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Gestión de Usuarios</h1>
          <p className='text-muted-foreground'>
            Administra los usuarios del sistema
          </p>
        </div>
        <Button onClick={handleCreateUser} variant='secondary'>
          <Plus className='h-4 w-4 mr-2' />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <UserFiltersContainer
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* User Form */}
      <DrawerDialog
        title={`${editingUser ? 'Editar' : 'Crear'} Usuario`}
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        footer={undefined}
      >
        <CreateUpdateUser
          onSuccess={() => {
            refetch()
            setShowUserForm(false)
          }}
          userToEdit={editingUser ? editingUser : undefined}
        />
      </DrawerDialog>

      {/* Users Table */}
      <div className='overflow-x-auto'>
        <DataTable
          columns={getColumnUsers(refetch, handleEditUser)}
          data={users}
          getPagination
        />
      </div>
    </div>
  )
}
