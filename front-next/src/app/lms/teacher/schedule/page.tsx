'use client'

import { CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { TeacherAssignment } from '@/modules/academic/domain/academic'
import { PageHeader } from '@/section/lms/components/PageHeader'
import { EmptyState } from '@/section/lms/components/EmptyState'
import {
  WeeklyTimetable,
  TimetableEntry
} from '@/section/lms/components/WeeklyTimetable'

const academicApi = apiAcademic()

export default function TeacherSchedulePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academicApi
      .getTeacherAssignments()
      .then((assignments: TeacherAssignment[]) => {
        const flat: TimetableEntry[] = []
        assignments.forEach((a) => {
          ;(a.schedules ?? []).forEach((s) => {
            flat.push({
              ...s,
              subjectName: a.subject.name,
              parallel: a.classGroup.parallel,
              levelName: a.classGroup.level?.name
            })
          })
        })
        setEntries(flat)
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CalendarDays}
        title='Mi Horario'
        subtitle='Tus clases de la semana (Lunes a Viernes)'
        tone='info'
      />

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title='No tienes horario configurado'
          description='Aún no se han asignado horarios a tus materas.'
        />
      ) : (
        <div className='bg-card rounded-xl border border-border p-4 shadow-sm'>
          <WeeklyTimetable entries={entries} showTeacher={false} />
        </div>
      )}
    </div>
  )
}
