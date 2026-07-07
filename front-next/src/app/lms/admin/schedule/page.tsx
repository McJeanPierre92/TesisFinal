'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useCrud } from '@/hooks/useAcademicCrud'
import { CalendarDays, Plus } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/section/lms/components/PageHeader'
import { CreateSchedule } from '@/section/admin/schedule/create/CreateSchedule'
import {
  getColumnsSchedule,
  ScheduleRow
} from '@/section/admin/schedule/list/columnsSchedule'
import { apiSchedule } from '@/modules/academic/infrastructure/apiCrud'

const repo = apiSchedule()

export default function ScheduleAdminPage() {
  const { data, refetch } = useCrud<ScheduleRow>(repo)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ScheduleRow | null>(null)

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CalendarDays}
        title='Horarios'
        subtitle='Gestiona los bloques de clases (días y horas)'
        tone='info'
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className='w-4 h-4 mr-2' /> Nuevo Bloque
          </Button>
        }
      />

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Bloque de Horario`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateSchedule
          itemToEdit={editing ?? undefined}
          onSuccess={() => {
            refetch()
            setShowForm(false)
          }}
        />
      </DrawerDialog>

      <DataTable
        columns={getColumnsSchedule(refetch, (s) => {
          setEditing(s)
          setShowForm(true)
        })}
        data={data}
        getPagination
      />
    </div>
  )
}
