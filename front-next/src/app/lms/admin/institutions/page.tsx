'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { useCrud } from '@/hooks/useAcademicCrud'
import { Institution } from '@/modules/academic/domain/academic'
import { apiInstitution } from '@/modules/academic/infrastructure/apiCrud'
import { Building2, Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateInstitution } from '@/section/admin/institutions/create/CreateInstitution'
import { getColumnsInstitution } from '@/section/admin/institutions/list/columnsInstitution'
import { PageHeader } from '@/section/lms/components/PageHeader'

const repo = apiInstitution()

export default function InstitutionsPage() {
  const { data, refetch } = useCrud<Institution>(repo)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Institution | null>(null)

  const handleEdit = (item: Institution) => {
    setEditing(item)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Building2}
        title='Instituciones'
        subtitle='Gestiona las instituciones del sistema'
        tone='primary'
        actions={
          <Button onClick={handleCreate}>
            <Plus className='w-4 h-4 mr-2' />
            Nueva Institución
          </Button>
        }
      />

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Institución`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateInstitution
          itemToEdit={editing ?? undefined}
          onSuccess={() => {
            refetch()
            setShowForm(false)
          }}
        />
      </DrawerDialog>

      <div className='overflow-x-auto'>
        <DataTable
          columns={getColumnsInstitution(refetch, handleEdit)}
          data={data}
          getPagination
        />
      </div>
    </div>
  )
}
