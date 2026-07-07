import { ModalDialog } from '@/components/shared/ModalDialog'
import { Button } from '@/components/ui/button'
import { Permission } from '@/modules/permission/domain/permission'
import { CreatePermissionDialog } from '@/section/permission/create/PermissionCreateUpdate'
import { PermissionsTable } from '@/section/permission/list/ListPermissions'
import { Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

export const PermissionManagement = () => {
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreatePermission = () => {
    setEditingPermission(null)
    setIsDialogOpen(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    setIsDialogOpen(true)
  }

  return (
    <div className='space-y-6 p-3'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Permisos
          </h1>
          <p className='text-muted-foreground'>
            Administra permisos y su asignación a roles
          </p>
        </div>
        <Button variant='secondary' onClick={handleCreatePermission}>
          <Plus className='h-4 w-4' />
          Crear Permiso
        </Button>
        <ModalDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title={editingPermission ? 'Editar Permiso' : 'Crear Nuevo Permiso'}
        >
          <CreatePermissionDialog
            permissionToEdit={editingPermission ? editingPermission : null}
            onSuccess={() => {
              setIsDialogOpen(false)
            }}
          />
        </ModalDialog>
      </div>
      <Suspense fallback={<div>Cargando permisos...</div>}>
        <PermissionsTable handleEdit={handleEditPermission} />
      </Suspense>
    </div>
  )
}
