'use client'

import { Badge } from '@/components/ui/badge'
import { ModalDialog } from '@/components/shared/ModalDialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { Enrollment } from '@/modules/academic/domain/academic'
import { apiEnrollment } from '@/modules/academic/infrastructure/apiCrud'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiEnrollment()

type Props = { row: Row<Enrollment>; onEdit: (i: Enrollment) => void; onRefresh: () => void }

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
        description='¿Eliminar esta matrícula?'
        isOpen={isOpen}
        onClose={close}
        footer={
          <>
            <Button variant='secondary' onClick={close}>Cancelar</Button>
            <Button variant='destructive' onClick={async () => {
              try { await repo.delete(item.id); toast.success('Matrícula eliminada'); onRefresh() }
              catch (e: any) { toast.error(e.message || 'Error') }
            }}>Eliminar</Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsEnrollment = (
  onRefresh: () => void,
  onEdit: (i: Enrollment) => void
): ColumnDef<Enrollment>[] => [
  {
    accessorKey: 'student',
    header: 'Alumno',
    cell: ({ row }) => {
      const s = row.original.student
      return s ? (
        <div className='flex flex-col'>
          <span className='font-medium'>{s.name}</span>
          <span className='text-xs text-muted-foreground'>@{s.userName}</span>
        </div>
      ) : (
        '—'
      )
    }
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
