'use client'

import { Badge } from '@/components/ui/badge'
import { ModalDialog } from '@/components/shared/ModalDialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { TeachingAssignment } from '@/modules/academic/domain/academic'
import { apiTeachingAssignment } from '@/modules/academic/infrastructure/apiCrud'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiTeachingAssignment()

type Props = { row: Row<TeachingAssignment>; onEdit: (i: TeachingAssignment) => void; onRefresh: () => void }

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
        description='¿Eliminar esta asignación?'
        isOpen={isOpen}
        onClose={close}
        footer={
          <>
            <Button variant='secondary' onClick={close}>Cancelar</Button>
            <Button variant='destructive' onClick={async () => {
              try { await repo.delete(item.id); toast.success('Asignación eliminada'); onRefresh() }
              catch (e: any) { toast.error(e.message || 'Error') }
            }}>Eliminar</Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsTeachingAssignment = (
  onRefresh: () => void,
  onEdit: (i: TeachingAssignment) => void
): ColumnDef<TeachingAssignment>[] => [
  {
    accessorKey: 'subject',
    header: 'Materia',
    cell: ({ row }) => row.original.subject?.name ?? '—'
  },
  {
    accessorKey: 'classGroup',
    header: 'Paralelo',
    cell: ({ row }) => {
      const cg = row.original.classGroup
      return cg ? `${cg.level?.name ?? ''} ${cg.parallel}` : '—'
    }
  },
  {
    accessorKey: 'teacher',
    header: 'Profesor',
    cell: ({ row }) => row.original.teacher?.name ?? '—'
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
