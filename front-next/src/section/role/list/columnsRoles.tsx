import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { deleteRole } from '@/modules/role/application/delete/deleteRole'
import { updateRole } from '@/modules/role/application/update/updateRole'
import { Role } from '@/modules/role/domain/role'
import { apiRole } from '@/modules/role/infrastructure/apiRole'
import ControlMenuSection from '@/section/menu/ControlMenuSection'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Menu, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  row: Row<Role>
  onRefresh: () => void
  onEditRole: (role: Role) => void
}

const roleRepository = apiRole()

const updateRoleStatus = async (role: Role, onRefresh: () => void) => {
  updateRole(roleRepository)({ id: role.id, state: !role.state })
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

const ActionCell = ({ row, onRefresh, onEditRole }: Props) => {
  const role = row.original
  const [isDialogOpen, openDialog, closeDialog] = useToggleState()
  const [isMenuDialogOpen, openMenuDialog, closeMenuDialog] = useToggleState()

  const handleDelete = async () => {
    deleteRole(roleRepository)(role.id)
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
      <div className='flex gap-2 justify-center'>
        <Tooltip>
          <TooltipTrigger onClick={() => onEditRole(role)}>
            <Edit
              size={16}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-600'
            />
          </TooltipTrigger>
          <TooltipContent>Editar rol</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger onClick={() => openDialog()}>
            <Trash2
              size={16}
              className='text-red-600 hover:text-red-800 dark:text-red-600'
            />
          </TooltipTrigger>
          <TooltipContent>Eliminar rol</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger onClick={() => openMenuDialog()}>
            <Menu
              size={16}
              className='text-indigo-600 hover:text-indigo-800 dark:text-indigo-300'
            />
          </TooltipTrigger>
          <TooltipContent>Menús</TooltipContent>
        </Tooltip>
      </div>
      <ModalDialog
        title={`Menús del rol: ${role?.name ?? ''}`}
        isOpen={isMenuDialogOpen}
        onClose={() => closeMenuDialog()}
        footer={undefined}
      >
        <ControlMenuSection roleId={role.id} />
      </ModalDialog>
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

export const getColumnRoles = (
  onRefresh: () => void,
  onEditRole: (role: Role) => void
): ColumnDef<Role>[] => [
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    accessorKey: 'permissions',
    header: 'Permisos',
    cell: ({ row }) => {
      const role = row.original

      return (
        <div className='flex flex-wrap gap-1'>
          {role.permissions?.slice(0, 2).map((permission) => (
            <Badge
              key={permission.permission.id}
              variant='default'
              className='text-xs'
            >
              {permission.permission.name}
            </Badge>
          ))}
          {(role.permissions || []).length > 2 ? (
            <Badge className='text-xs' variant='default'>
              +{(role.permissions || []).length - 2}
            </Badge>
          ) : (
            ''
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'users',
    header: 'Usuarios',
    cell: ({ row }) => {
      const role = row.original

      return (role.users || []).length
    }
  },
  {
    accessorKey: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge
        variant={row.original.state ? 'default' : 'outline'}
        className='cursor-pointer'
        onClick={() => updateRoleStatus(row.original, onRefresh)}
      >
        {row.original.state ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ActionCell row={row} onRefresh={onRefresh} onEditRole={onEditRole} />
    )
  }
]
