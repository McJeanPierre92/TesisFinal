'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useCrud } from '@/hooks/useAcademicCrud'
import { ClassGroup } from '@/modules/academic/domain/academic'
import { apiClassGroup } from '@/modules/academic/infrastructure/apiCrud'
import { Network, Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateClassGroup } from '@/section/admin/classGroups/create/CreateClassGroup'
import { getColumnsClassGroup } from '@/section/admin/classGroups/list/columnsClassGroup'
import { PageHeader } from '@/section/lms/components/PageHeader'

const repo = apiClassGroup()

export default function ClassGroupsPage() {
  const { data, refetch } = useCrud<ClassGroup>(repo)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ClassGroup | null>(null)

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Network}
        title='Paralelos'
        subtitle='Gestiona los paralelos (8vo A, 8vo B...)'
        tone='warning'
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className='w-4 h-4 mr-2' /> Nuevo Paralelo
          </Button>
        }
      />

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Paralelo`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateClassGroup
          itemToEdit={editing ?? undefined}
          onSuccess={() => { refetch(); setShowForm(false) }}
        />
      </DrawerDialog>

      <DataTable columns={getColumnsClassGroup(refetch, (i) => { setEditing(i); setShowForm(true) })} data={data} getPagination />
    </div>
  )
}
