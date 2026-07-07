'use client'

import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { Level } from '@/modules/academic/domain/academic'
import { apiLevel } from '@/modules/academic/infrastructure/apiCrud'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiLevel()

type Props = { row: Row<Level>; onEdit: (i: Level) => void; onRefresh: () => void }

const ActionCell = ({ row, onEdit, onRefresh }: Props) => {
  const item = row.original
  const [isOpen, open, close] = useToggleState()

  const del = async () => {
    try {
      await repo.delete(item.id)
      toast.success('Nivel eliminado')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    }
  }

  return (
    <div className='flex gap-4 justify-center'>
      <Tooltip>
        <TooltipTrigger onClick={() => onEdit(item)}>
          <Edit size={16} className='text-primary' />
        </TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger onClick={() => open()}>
          <Trash2 size={16} className='text-destructive' />
        </TooltipTrigger>
        <TooltipContent>Eliminar</TooltipContent>
      </Tooltip>
      <ModalDialog
        title='Confirmar eliminación'
        description={`¿Eliminar "${item.name}"?`}
        isOpen={isOpen}
        onClose={close}
        footer={
          <>
            <Button variant='secondary' onClick={close}>Cancelar</Button>
            <Button variant='destructive' onClick={del}>Eliminar</Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsLevel = (
  onRefresh: () => void,
  onEdit: (i: Level) => void
): ColumnDef<Level>[] => [
  { accessorKey: 'name', header: 'Nombre' },
  {
    accessorKey: 'order',
    header: 'Orden',
    cell: ({ row }) => row.original.order
  },
  {
    accessorKey: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={row.original.state ? 'default' : 'outline'}>
        {row.original.state ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onRefresh={onRefresh} />
  }
]
