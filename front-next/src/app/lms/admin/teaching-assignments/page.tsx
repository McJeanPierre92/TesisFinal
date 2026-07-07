'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useCrud } from '@/hooks/useAcademicCrud'
import { TeachingAssignment } from '@/modules/academic/domain/academic'
import { apiTeachingAssignment } from '@/modules/academic/infrastructure/apiCrud'
import { ClipboardList, Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateTeachingAssignment } from '@/section/admin/teachingAssignments/create/CreateTeachingAssignment'
import { getColumnsTeachingAssignment } from '@/section/admin/teachingAssignments/list/columnsTeachingAssignment'
import { PageHeader } from '@/section/lms/components/PageHeader'

const repo = apiTeachingAssignment()

export default function TeachingAssignmentsPage() {
  const { data, refetch } = useCrud<TeachingAssignment>(repo)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TeachingAssignment | null>(null)

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={ClipboardList}
        title='Asignaciones'
        subtitle='Asigna materias y paralelos a profesores'
        tone='primary'
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className='w-4 h-4 mr-2' /> Nueva Asignación
          </Button>
        }
      />

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Asignación`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateTeachingAssignment
          itemToEdit={editing ?? undefined}
          onSuccess={() => { refetch(); setShowForm(false) }}
        />
      </DrawerDialog>

      <DataTable
        columns={getColumnsTeachingAssignment(refetch, (i) => { setEditing(i); setShowForm(true) })}
        data={data}
        getPagination
      />
    </div>
  )
}
