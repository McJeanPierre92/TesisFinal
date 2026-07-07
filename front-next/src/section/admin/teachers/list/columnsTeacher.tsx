'use client'

import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { apiUser } from '@/modules/user/infrastructure/apiUser'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiUser()

export type Teacher = {
  id: number
  name: string
  userName: string
  roleId: number
  role?: { id: number; name: string }
  state: boolean
  assignmentCount?: number
}

type Props = {
  row: Row<Teacher>
  onEdit: (t: Teacher) => void
  onRefresh: () => void
}

const handleDelete = async (t: Teacher, onRefresh: () => void) => {
  try {
    await repo.delete(t.id)
    toast.success('Profesor eliminado')
    onRefresh()
  } catch (err: any) {
    toast.error(err?.message || 'Error al eliminar')
  }
}

const toggleState = async (t: Teacher, onRefresh: () => void) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL_API}/user/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: t.id, state: !t.state })
    })
    toast.success(t.state ? 'Desactivado' : 'Activado')
    onRefresh()
  } catch {
    toast.error('Error al cambiar estado')
  }
}

const ActionCell = ({ row, onEdit, onRefresh }: Props) => {
  const t = row.original
  const [isOpen, open, close] = useToggleState()

  return (
    <div className='flex gap-4 justify-center'>
      <Tooltip>
        <TooltipTrigger onClick={() => onEdit(t)}>
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
        description={`¿Eliminar al profesor "${t.name}"?`}
        isOpen={isOpen}
        onClose={close}
        footer={
          <>
            <Button variant='secondary' onClick={close}>
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={() => handleDelete(t, onRefresh)}
            >
              Eliminar
            </Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsTeacher = (
  onRefresh: () => void,
  onEdit: (t: Teacher) => void
): ColumnDef<Teacher>[] => [
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'userName', header: 'Usuario' },
  {
    id: 'assignments',
    header: 'Asignaturas',
    cell: ({ row }) =>
      row.original.assignmentCount ? `${row.original.assignmentCount} materia(s)` : '—'
  },
  {
    accessorKey: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge
        variant={row.original.state ? 'default' : 'outline'}
        className='cursor-pointer'
        onClick={() => toggleState(row.original, onRefresh)}
      >
        {row.original.state ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ActionCell row={row} onEdit={onEdit} onRefresh={onRefresh} />
    )
  }
]
