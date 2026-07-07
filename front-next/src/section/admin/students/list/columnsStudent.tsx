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
import { apiUser } from '@/modules/user/infrastructure/apiUser'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiUser()

// Tipo local del alumno (subset de User). El endpoint /user devuelve estos campos.
export type Student = {
  id: number
  name: string
  userName: string
  roleId: number
  role?: { id: number; name: string }
  state: boolean
  classGroup?: { parallel: string; levelName?: string }
}

type Props = {
  row: Row<Student>
  onEdit: (s: Student) => void
  onRefresh: () => void
}

const handleDelete = async (s: Student, onRefresh: () => void) => {
  try {
    await repo.delete(s.id)
    toast.success('Estudiante eliminado')
    onRefresh()
  } catch (err: any) {
    toast.error(err?.message || 'Error al eliminar')
  }
}

const toggleState = async (s: Student, onRefresh: () => void) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL_API}/user/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: s.id, state: !s.state })
    })
    toast.success(s.state ? 'Desactivado' : 'Activado')
    onRefresh()
  } catch {
    toast.error('Error al cambiar estado')
  }
}

const ActionCell = ({ row, onEdit, onRefresh }: Props) => {
  const s = row.original
  const [isOpen, open, close] = useToggleState()

  return (
    <div className='flex gap-4 justify-center'>
      <Tooltip>
        <TooltipTrigger onClick={() => onEdit(s)}>
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
        description={`¿Eliminar al estudiante "${s.name}"?`}
        isOpen={isOpen}
        onClose={close}
        footer={
          <>
            <Button variant='secondary' onClick={close}>
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={() => handleDelete(s, onRefresh)}
            >
              Eliminar
            </Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsStudent = (
  onRefresh: () => void,
  onEdit: (s: Student) => void
): ColumnDef<Student>[] => [
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    accessorKey: 'userName',
    header: 'Usuario'
  },
  {
    id: 'classGroup',
    header: 'Paralelo',
    cell: ({ row }) => {
      const cg = row.original.classGroup
      return cg ? `${cg.levelName ?? ''} ${cg.parallel}`.trim() : '—'
    }
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
