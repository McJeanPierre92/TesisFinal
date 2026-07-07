import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { DynamicIcon } from '@/constants/iconMapping'
import { useToggleState } from '@/hooks/useToggleState'
import { deleteMenuSection } from '@/modules/menu-section/application/delete/deleteMenuSection'
import { updateMenuSection } from '@/modules/menu-section/application/update/updateMenuSection'
import { MenuSection } from '@/modules/menu-section/domain/menuSections'
import { apiMenuSection } from '@/modules/menu-section/infrastructure/apiMenuSection'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  row: Row<MenuSection>
  onRefresh: () => void
  onEditMenu: (menu: MenuSection) => void
}

const menuRepository = apiMenuSection()

const updateMenuStatus = async (menu: MenuSection, onRefresh: () => void) => {
  updateMenuSection(menuRepository)(menu.id, { state: !menu.state })
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

const ActionCell = ({ row, onRefresh, onEditMenu }: Props) => {
  const role = row.original
  const [isDialogOpen, openDialog, closeDialog] = useToggleState()

  const handleDelete = async () => {
    deleteMenuSection(menuRepository)(role.id)
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
        // throw err
      })
      .finally(() => closeDialog())
  }

  return (
    <div>
      <div className='flex gap-2 justify-center'>
        <Tooltip>
          <TooltipTrigger onClick={() => onEditMenu(role)}>
            <Edit
              size={16}
              className='text-blue-600 hover:text-blue-800 dark:text-blue-600'
            />
          </TooltipTrigger>
          <TooltipContent>Editar Menu</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger onClick={() => openDialog()}>
            <Trash2
              size={16}
              className='text-red-600 hover:text-red-800 dark:text-red-600'
            />
          </TooltipTrigger>
          <TooltipContent>Eliminar Menu</TooltipContent>
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

export const getColumnMenu = (
  onRefresh: () => void,
  onEditMenu: (role: MenuSection) => void
): ColumnDef<MenuSection>[] => [
  {
    accessorKey: 'label',
    header: 'Nombre Menu',
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-x-2.5 justify-center'>
          <DynamicIcon iconName={row.original.icon} className='h-4 w-4' />
          {row.original.label}
        </div>
      )
    }
  },
  {
    accessorKey: 'href',
    header: 'URL'
  },
  {
    accessorKey: 'order',
    header: 'Orden',
    maxSize: 12
  },
  {
    accessorKey: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge
        variant={row.original.state ? 'default' : 'outline'}
        className='cursor-pointer'
        onClick={() => updateMenuStatus(row.original, onRefresh)}
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
      <ActionCell row={row} onRefresh={onRefresh} onEditMenu={onEditMenu} />
    ),
    maxSize: 12
  }
]
