'use client'

import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { Subject } from '@/modules/academic/domain/academic'
import { apiSubject } from '@/modules/academic/infrastructure/apiCrud'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiSubject()

type Props = { row: Row<Subject>; onEdit: (i: Subject) => void; onRefresh: () => void }

const ActionCell = ({ row, onEdit, onRefresh }: Props) => {
  const item = row.original
  const [isOpen, open, close] = useToggleState()
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
            <Button variant='destructive' onClick={async () => {
              try { await repo.delete(item.id); toast.success('Materia eliminada'); onRefresh() }
              catch (e: any) { toast.error(e.message || 'Error') }
            }}>Eliminar</Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsSubject = (
  onRefresh: () => void,
  onEdit: (i: Subject) => void
): ColumnDef<Subject>[] => [
  { accessorKey: 'name', header: 'Nombre' },
  {
    accessorKey: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={row.original.state ? 'default' : 'outline'}>
        {row.original.state ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  },
  { id: 'actions', header: 'Acciones', cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onRefresh={onRefresh} /> }
]
