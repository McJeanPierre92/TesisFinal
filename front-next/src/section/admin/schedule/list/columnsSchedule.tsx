'use client'

import { ModalDialog } from '@/components/shared/ModalDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToggleState } from '@/hooks/useToggleState'
import { Schedule, WeekDay } from '@/modules/academic/domain/academic'
import { apiSchedule } from '@/modules/academic/infrastructure/apiCrud'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const repo = apiSchedule()

const DAY_LABELS: Record<WeekDay, string> = {
  domingo: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado'
}

// El backend devuelve startTime/endTime como ISO epoch (1970-01-01T07:00:00...)
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return iso
  }
}

// Schedule del findAll incluye teachingAssignment + subject + classGroup
export type ScheduleRow = Schedule & {
  teachingAssignment?: {
    id: number
    subject?: { id: number; name: string }
    classGroup?: { id: number; parallel: string; level?: { id: number; name: string } }
  }
}

type Props = {
  row: Row<ScheduleRow>
  onEdit: (s: ScheduleRow) => void
  onRefresh: () => void
}

const ActionCell = ({ row, onEdit, onRefresh }: Props) => {
  const item = row.original
  const [isOpen, open, close] = useToggleState()

  const del = async () => {
    try {
      await repo.delete(item.id)
      toast.success('Bloque eliminado')
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
        description='¿Eliminar este bloque de horario?'
        isOpen={isOpen}
        onClose={close}
        footer={
          <>
            <Button variant='secondary' onClick={close}>
              Cancelar
            </Button>
            <Button variant='destructive' onClick={del}>
              Eliminar
            </Button>
          </>
        }
      />
    </div>
  )
}

export const getColumnsSchedule = (
  onRefresh: () => void,
  onEdit: (s: ScheduleRow) => void
): ColumnDef<ScheduleRow>[] => [
  {
    accessorKey: 'teachingAssignment',
    header: 'Asignación',
    cell: ({ row }) => {
      const ta = row.original.teachingAssignment
      if (!ta) return '—'
      return `${ta.subject?.name ?? ''} · ${ta.classGroup?.level?.name ?? ''} ${ta.classGroup?.parallel ?? ''}`
    }
  },
  {
    accessorKey: 'dayOfWeek',
    header: 'Día',
    cell: ({ row }) => (
      <Badge variant='secondary'>
        {DAY_LABELS[row.original.dayOfWeek] ?? row.original.dayOfWeek}
      </Badge>
    )
  },
  {
    id: 'startTime',
    header: 'Inicio',
    cell: ({ row }) => formatTime(row.original.startTime)
  },
  {
    id: 'endTime',
    header: 'Fin',
    cell: ({ row }) => formatTime(row.original.endTime)
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ActionCell row={row} onEdit={onEdit} onRefresh={onRefresh} />
    )
  }
]
