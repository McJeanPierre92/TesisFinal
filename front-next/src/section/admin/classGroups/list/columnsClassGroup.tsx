'use client'

import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { ClassGroup } from '@/modules/academic/domain/academic'
import { apiClassGroup } from '@/modules/academic/infrastructure/apiCrud'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiClassGroup()

type Props = { row: Row<ClassGroup>; onEdit: (i: ClassGroup) => void; onRefresh: () => void }

const ActionCell = ({ row, onEdit, onRefresh }: Props) => {
  const item = row.original
  const [isOpen, open, close] = useToggleState()
  return (
    <div className='flex gap-4 justify-center'>
      <Tooltip>
        <TooltipTrigger onClick={() => onEdit(item)}><Edit size={16} className='text-primary' /></TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger onClick={() => open()}><Trash2 size={16} className='text-destructive' /></TooltipTrigger>
        <TooltipContent>Eliminar</TooltipContent>
      </Tooltip>
      <ModalDialog
        title='Confirmar eliminación'
        description={`¿Eliminar el paralelo "${item.parallel}"?`}
        isOpen={isOpen}
        onClose={close}
        footer={
          <>
            <Button variant='secondary' onClick={close}>Cancelar</Button>
            <Button variant='destructive' onClick={async () => {
              try { await repo.delete(item.id); toast.success('Paralelo eliminado'); onRefresh() }
              catch (e: any) { toast.error(e.message || 'Error') }
            }}>Eliminar</Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsClassGroup = (
  onRefresh: () => void,
  onEdit: (i: ClassGroup) => void
): ColumnDef<ClassGroup>[] => [
  { accessorKey: 'parallel', header: 'Paralelo' },
  {
    accessorKey: 'level',
    header: 'Nivel',
    cell: ({ row }) => row.original.level?.name ?? '—'
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
  { id: 'actions', header: 'Acciones', cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onRefresh={onRefresh} /> }
]
