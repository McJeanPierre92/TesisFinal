'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, UserCog } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchUsers, fetchList } from '@/modules/academic/infrastructure/apiCrud'
import { TeachingAssignment } from '@/modules/academic/domain/academic'
import { PageHeader } from '@/section/lms/components/PageHeader'
import {
  getColumnsTeacher,
  Teacher
} from '@/section/admin/teachers/list/columnsTeacher'
import { CreateTeacher } from '@/section/admin/teachers/create/CreateTeacher'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)

  const load = useCallback(async () => {
    try {
      const [users, assignments] = await Promise.all([
        fetchUsers(),
        fetchList<TeachingAssignment>('teaching-assignment')
      ])
      // Contar cuántas asignaciones tiene cada profesor
      const countByTeacher = new Map<number, number>()
      assignments.forEach((a) => {
        countByTeacher.set(a.teacherId, (countByTeacher.get(a.teacherId) ?? 0) + 1)
      })

      const mapped: Teacher[] = users
        .filter((u) => u.role?.name === 'profesor')
        .map((u) => ({
          id: u.id,
          name: u.name,
          userName: u.userName,
          roleId: u.roleId,
          role: u.role,
          state: u.state,
          assignmentCount: countByTeacher.get(u.id) ?? 0
        }))
      setTeachers(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (search === '') return teachers
    const q = search.toLowerCase()
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.userName.toLowerCase().includes(q)
    )
  }, [teachers, search])

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={UserCog}
        title='Profesores'
        subtitle='Gestiona las cuentas de profesores y sus asignaturas'
        tone='primary'
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className='w-4 h-4 mr-2' />
            Nuevo Profesor
          </Button>
        }
      />

      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          placeholder='Buscar por nombre o usuario...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-9'
        />
      </div>

      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Profesor`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateTeacher
          teacherToEdit={editing ?? undefined}
          onSuccess={() => {
            load()
            setShowForm(false)
          }}
        />
      </DrawerDialog>

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <DataTable
            columns={getColumnsTeacher(load, (t) => {
              setEditing(t)
              setShowForm(true)
            })}
            data={filtered}
            getPagination
          />
        </div>
      )}
    </div>
  )
}
