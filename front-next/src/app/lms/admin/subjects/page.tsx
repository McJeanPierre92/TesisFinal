'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useCrud } from '@/hooks/useAcademicCrud'
import { Subject } from '@/modules/academic/domain/academic'
import { apiSubject } from '@/modules/academic/infrastructure/apiCrud'
import { BookOpen, Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateSubject } from '@/section/admin/subjects/create/CreateSubject'
import { getColumnsSubject } from '@/section/admin/subjects/list/columnsSubject'
import { PageHeader } from '@/section/lms/components/PageHeader'

const repo = apiSubject()

export default function SubjectsPage() {
  const { data, refetch } = useCrud<Subject>(repo)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={BookOpen}
        title='Materias'
        subtitle='Gestiona las materias'
        tone='success'
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className='w-4 h-4 mr-2' /> Nueva Materia
          </Button>
        }
      />

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Materia`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateSubject
          itemToEdit={editing ?? undefined}
          onSuccess={() => { refetch(); setShowForm(false) }}
        />
      </DrawerDialog>

      <DataTable columns={getColumnsSubject(refetch, (i) => { setEditing(i); setShowForm(true) })} data={data} getPagination />
    </div>
  )
}
