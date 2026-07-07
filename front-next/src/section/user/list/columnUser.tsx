import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { deleteUser } from '@/modules/user/application/delete/deleteUser'
import { updateUser } from '@/modules/user/application/update/updateUser'
import { User } from '@/modules/user/domain/user'
import { apiUser } from '@/modules/user/infrastructure/apiUser'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const userRepository = apiUser()

type Props = {
  row: Row<User>
  onEditUser: (user: User) => void
  onRefresh: () => void
}

const updateUserStatus = async (user: User, onRefresh: () => void) => {
  updateUser(userRepository)({ id: user.id, state: !user.state })
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
}

const handleDelete = async (user: User, onRefresh: () => void) => {
  deleteUser(userRepository)(user.id)
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
}

const ActionCell = ({ row, onEditUser, onRefresh }: Props) => {
  const user = row.original
  const [isDialogOpen, openDialog, closeDialog] = useToggleState()

  return (
    <div className='flex gap-4 justify-center'>
      <Tooltip>
        <TooltipTrigger onClick={() => onEditUser(user)}>
          <Edit
            size={16}
            className='text-blue-600 hover:text-blue-800 dark:text-blue-400'
          />
        </TooltipTrigger>
        <TooltipContent>Editar usuario</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger onClick={() => openDialog()}>
          <Trash2
            size={16}
            className='text-red-600 hover:text-red-800 dark:text-red-600'
          />
        </TooltipTrigger>
        <TooltipContent>Eliminar usuario</TooltipContent>
      </Tooltip>
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
            <Button
              variant='destructive'
              onClick={() => handleDelete(user, onRefresh)}
            >
              Eliminar
            </Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnUsers = (
  onRefresh: () => void,
  onEditUser: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: 'Nombres'
  },
  {
    accessorKey: 'userName',
    header: 'Usuario'
  },
  {
    accessorKey: 'password',
    header: 'Contraseña',
    cell: () => '**********'
  },
  {
    accessorKey: 'roleId',
    header: 'Rol',
    cell: ({ row }) => row.original.role?.name ?? ''
  },
  {
    accessorKey: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge
        variant={row.original.state ? 'default' : 'outline'}
        className='cursor-pointer'
        onClick={() => updateUserStatus(row.original, onRefresh)}
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
      <ActionCell row={row} onEditUser={onEditUser} onRefresh={onRefresh} />
    ),
    size: 12
  }
]
