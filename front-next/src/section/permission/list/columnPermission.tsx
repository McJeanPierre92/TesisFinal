import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { deletePermission } from '@/modules/permission/application/delete/deletePermission'
import { updatePermission } from '@/modules/permission/application/update/updatePermission'
import { Permission } from '@/modules/permission/domain/permission'
import { apiPermission } from '@/modules/permission/infrastructure/apiPermission'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const permissionRepository = apiPermission()

type Props = {
  row: Row<Permission>
  onRefresh: () => void
  onEditPermission: (permission: Permission) => void
}

const updatePermissionStatus = async (
  permission: Permission,
  onRefresh: () => void
) => {
  updatePermission(permissionRepository)({
    id: permission.id,
    state: !permission.state
  })
    .then(({ message, error }) => {
      // if (Array.isArray(message)) {
      //   message.forEach((e) => toast.info(e))
      //   return
      // }
      // if (error) {
      //   toast.error(message)
      //   return
      // }
      // toast.info(message)
      onRefresh()
    })
    .catch((err) => {
      toast.error(err)
      throw err
    })
}

const ActionCell = ({ row, onRefresh, onEditPermission }: Props) => {
  const permission = row.original
  const [isDialogOpen, openDialog, closeDialog] = useToggleState()

  const handleDelete = async () => {
    deletePermission(permissionRepository)(permission.id)
      .then(({ message, error }) => {
        if (Array.isArray(message)) {
          message.forEach((e) => toast.info(e))
          return
        }

        if (error) {
          toast.error(message)
          return
        }
        toast.info(message)
        onRefresh()
      })
      .catch((err) => {
        toast.error(err)
        throw err
      })
      .finally(() => closeDialog())
  }

  return (
    <div>
      <div className='flex gap-2 justify-between'>
        <Tooltip>
          <TooltipTrigger onClick={() => onEditPermission(permission)}>
            <Edit
              size={16}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-600'
            />
          </TooltipTrigger>
          <TooltipContent>Editar permiso</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger onClick={() => openDialog()}>
            <Trash2
              size={16}
              className='text-red-600 hover:text-red-800 dark:text-red-600'
            />
          </TooltipTrigger>
          <TooltipContent>Eliminar permiso</TooltipContent>
        </Tooltip>
      </div>
      <ModalDialog
        title='Confirmacion de Eliminacion'
        description='¿Estas seguro de eliminarlo?'
        isOpen={isDialogOpen}
        onClose={closeDialog}
        footer={
          <>
            <Button variant='secondary' onClick={closeDialog}>
              Cancelar
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      />
    </div>
  )
}

const getPermissionCategory = (name: string) => {
  const category = name.split(':')[0]
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getPermissionAction = (name: string) => {
  const action = name.split(':')[1]
  const actionMap: Record<string, string> = {
    create: 'Crear',
    read: 'Leer',
    update: 'Actualizar',
    delete: 'Eliminar',
    manage: 'Gestionar'
  }
  return actionMap[action] || action
}

export const getColumnPermission = (
  onRefresh: () => void,
  onEditPermission: (permission: Permission) => void
): ColumnDef<Permission>[] => [
  {
    accessorKey: 'name',
    header: 'Nombres',
    cell: ({ getValue }) => (getValue() ? getValue() : '')
  },
  {
    id: 'category',
    header: 'Categoria',
    cell: ({ row }) =>
      row ? (
        <Badge variant='outline'>
          {getPermissionCategory(row.original.name)}
        </Badge>
      ) : (
        ''
      )
  },
  {
    id: 'action',
    header: 'Accion',
    cell: ({ row }) =>
      row ? (
        <Badge variant='outline'>
          {getPermissionAction(row.original.name)}
        </Badge>
      ) : (
        ''
      )
  },
  {
    id: 'role',
    header: 'Roles',
    cell: ({ row }) => {
      const permission = row.original
      const activeRoles = permission.roles

      return (
        <div className='flex items-center gap-1'>
          <div className='h-6 px-2 text-xs'>{activeRoles.length} roles</div>
          {activeRoles.slice(0, 2).map(({ role }) => (
            <Badge key={role.id} variant='default' className='text-xs'>
              {role.name}
            </Badge>
          ))}
          {activeRoles.length > 2 && (
            <Badge variant='default' className='text-xs'>
              +{activeRoles.length - 2}
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge
        variant={row.original.state ? 'default' : 'outline'}
        className='cursor-pointer'
        onClick={() => updatePermissionStatus(row.original, onRefresh)}
      >
        {row.original.state ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
    maxSize: 12
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ActionCell
        row={row}
        onRefresh={onRefresh}
        onEditPermission={onEditPermission}
      />
    ),
    maxSize: 12
  }
]
