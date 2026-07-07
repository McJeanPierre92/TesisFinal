'use client'

import { DrawerDialog } from '@/components/shared/DrawerDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchUsers } from '@/modules/academic/infrastructure/apiCrud'
import { apiEnrollment } from '@/modules/academic/infrastructure/apiCrud'
import { Enrollment } from '@/modules/academic/domain/academic'
import { PageHeader } from '@/section/lms/components/PageHeader'
import {
  getColumnsStudent,
  Student
} from '@/section/admin/students/list/columnsStudent'
import { CreateStudent } from '@/section/admin/students/create/CreateStudent'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)

  const load = useCallback(async () => {
    try {
      const [users, enrollments] = await Promise.all([
        fetchUsers(),
        apiEnrollment().getAll() as Promise<Enrollment[]>
      ])

      // Mapea studentId -> info de paralelo
      const groupByStudent = new Map<
        number,
        { parallel: string; levelName?: string }
      >()
      enrollments.forEach((e) => {
        if (e.classGroup) {
          groupByStudent.set(e.studentId, {
            parallel: e.classGroup.parallel,
            levelName: e.classGroup.level?.name
          })
        }
      })

      const mapped: Student[] = users
        .filter((u) => u.role?.name === 'alumno')
        .map((u) => ({
          id: u.id,
          name: u.name,
          userName: u.userName,
          roleId: u.roleId,
          role: u.role,
          state: u.state,
          classGroup: groupByStudent.get(u.id)
        }))
      setStudents(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Filtro por búsqueda (cliente-side)
  const filtered = useMemo(() => {
    if (search === '') return students
    const q = search.toLowerCase()
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.userName.toLowerCase().includes(q)
    )
  }, [students, search])

  const handleEdit = (s: Student) => {
    setEditing(s)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={UsersRound}
        title='Estudiantes'
        subtitle='Gestiona los alumnos del sistema y consulta su paralelo'
        tone='info'
        actions={
          <Button onClick={handleCreate}>
            <Plus className='w-4 h-4 mr-2' />
            Nuevo Estudiante
          </Button>
        }
      />

      {/* Buscador */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          placeholder='Buscar por nombre o usuario...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-9'
        />
      </div>

      {/* Formulario crear/editar */}
      <DrawerDialog
        title={`${editing ? 'Editar' : 'Crear'} Estudiante`}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      >
        <CreateStudent
          studentToEdit={editing ?? undefined}
          onSuccess={() => {
            load()
            setShowForm(false)
          }}
        />
      </DrawerDialog>

      {/* Tabla */}
      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <DataTable
            columns={getColumnsStudent(load, handleEdit)}
            data={filtered}
            getPagination
          />
        </div>
      )}
    </div>
  )
}
