'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useCrud } from '@/hooks/useAcademicCrud'
import { Enrollment } from '@/modules/academic/domain/academic'
import { apiEnrollment } from '@/modules/academic/infrastructure/apiCrud'
import { GraduationCap, Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateEnrollment } from '@/section/admin/enrollments/create/CreateEnrollment'
import { getColumnsEnrollment } from '@/section/admin/enrollments/list/columnsEnrollment'
import { PageHeader } from '@/section/lms/components/PageHeader'

const repo = apiEnrollment()

export default function EnrollmentsPage() {
  const { data, refetch } = useCrud<Enrollment>(repo)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Enrollment | null>(null)

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={GraduationCap}
        title='Matrículas'
        subtitle='Asigna alumnos a paralelos'
        tone='success'
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className='w-4 h-4 mr-2' /> Nueva Matrícula
          </Button>
        }
      />

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Matrícula`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateEnrollment
          itemToEdit={editing ?? undefined}
          onSuccess={() => { refetch(); setShowForm(false) }}
        />
      </DrawerDialog>

      <DataTable columns={getColumnsEnrollment(refetch, (i) => { setEditing(i); setShowForm(true) })} data={data} getPagination />
    </div>
  )
}
