'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useCrud } from '@/hooks/useAcademicCrud'
import { Level } from '@/modules/academic/domain/academic'
import { apiLevel } from '@/modules/academic/infrastructure/apiCrud'
import { Layers, Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateLevel } from '@/section/admin/levels/create/CreateLevel'
import { getColumnsLevel } from '@/section/admin/levels/list/columnsLevel'
import { PageHeader } from '@/section/lms/components/PageHeader'

const repo = apiLevel()

export default function LevelsPage() {
  const { data, refetch } = useCrud<Level>(repo)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Level | null>(null)

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Layers}
        title='Niveles'
        subtitle='Gestiona los niveles (7mo, 8vo, 9no...)'
        tone='info'
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className='w-4 h-4 mr-2' />
          Nuevo Nivel
        </Button>
        }
      />

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Nivel`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateLevel
          itemToEdit={editing ?? undefined}
          onSuccess={() => { refetch(); setShowForm(false) }}
        />
      </DrawerDialog>

      <DataTable columns={getColumnsLevel(refetch, (i) => { setEditing(i); setShowForm(true) })} data={data} getPagination />
    </div>
  )
}
