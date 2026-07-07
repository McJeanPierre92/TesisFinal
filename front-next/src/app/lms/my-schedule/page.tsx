'use client'

import { CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { MyEnrollment } from '@/modules/academic/domain/academic'
import { PageHeader } from '@/section/lms/components/PageHeader'
import { EmptyState } from '@/section/lms/components/EmptyState'
import {
  WeeklyTimetable,
  TimetableEntry
} from '@/section/lms/components/WeeklyTimetable'

const academicApi = apiAcademic()

export default function MySchedulePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academicApi
      .getMyClasses()
      .then((enrollments: MyEnrollment[]) => {
        // Aplanar todas las materias y sus horarios
        const flat: TimetableEntry[] = []
        enrollments.forEach((e) => {
          e.classGroup.teachingAssignments.forEach((ta) => {
            ;(ta.schedules ?? []).forEach((s) => {
              flat.push({
                ...s,
                subjectName: ta.subject.name,
                parallel: e.classGroup.parallel,
                levelName: e.classGroup.level?.name,
                teacherName: ta.teacher?.name
              })
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
        subtitle='Clases de la semana (Lunes a Viernes)'
        tone='info'
      />

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title='No tienes horario asignado'
          description='Tus profesores aún no tienen horarios de clase configurados.'
        />
      ) : (
        <div className='bg-card rounded-xl border border-border p-4 shadow-sm'>
          <WeeklyTimetable entries={entries} showTeacher />
        </div>
      )}
    </div>
  )
}
