'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { getSubjectColor } from '@/constants/subjectColors'
import {
  BookOpen,
  ClipboardCheck,
  Layers,
  CalendarDays,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Avatar } from '../components/Avatar'
import { StatCard } from '../components/StatCard'
import { EmptyState } from '../components/EmptyState'
import { AnimatedGrid, AnimatedItem } from '../components/AnimatedGrid'
import { TeacherAssignment, WeekDay } from '@/modules/academic/domain/academic'

const academicApi = apiAcademic()

// Mapeo JS Day (0=Dom..6=Sáb) → enum weekDay
const JS_TO_WEEKDAY: Record<number, WeekDay> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado'
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return iso
  }
}

export function TeacherDashboard() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academicApi
      .getTeacherAssignments()
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false))
  }, [])

  const totalTasks = assignments.reduce((s, a) => s + a._count.tasks, 0)
  const totalLessons = assignments.reduce((s, a) => s + a._count.lessons, 0)

  // Clases de HOY
  const todayWeekday = JS_TO_WEEKDAY[new Date().getDay()]
  const todayClasses = useMemo(() => {
    return assignments
      .flatMap((a) =>
        (a.schedules ?? []).map((s) => ({
          ...s,
          subjectName: a.subject.name,
          parallel: a.classGroup.parallel,
          levelName: a.classGroup.level.name,
          assignmentId: a.id
        }))
      )
      .filter((s) => s.dayOfWeek === todayWeekday)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [assignments, todayWeekday])

  const firstName = user?.name?.split(' ')[0] ?? ''
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center gap-4'
      >
        <Avatar name={user?.name ?? ''} size='lg' />
        <div>
          <h1 className='text-2xl font-bold text-foreground font-serif tracking-tight'>
            {greeting}, {firstName} 👋
          </h1>
          <p className='text-muted-foreground text-sm mt-1'>
            Panel de tus asignaciones académicas
          </p>
        </div>
      </motion.div>

      <AnimatedGrid className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <AnimatedItem>
          <StatCard
            icon={Layers}
            label='Asignaciones'
            value={assignments.length}
            tone='primary'
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard icon={BookOpen} label='Lecciones' value={totalLessons} tone='info' />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon={ClipboardCheck}
            label='Tareas'
            value={totalTasks}
            tone='warning'
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon={CalendarDays}
            label='Clases hoy'
            value={todayClasses.length}
            tone='success'
          />
        </AnimatedItem>
      </AnimatedGrid>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Clases de hoy */}
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Clock className='w-5 h-5 text-primary' />
              Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title='Sin clases hoy'
                description='No tienes clases programadas para hoy.'
              />
            ) : (
              <div className='space-y-2'>
                {todayClasses.map((c) => {
                  const color = getSubjectColor(c.subjectName)
                  return (
                    <div
                      key={c.id}
                      className='flex items-center gap-3 p-2 rounded-lg border border-border'
                    >
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${color.tile}`}
                      >
                        <BookOpen className='w-4 h-4' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='font-medium text-foreground text-sm truncate'>
                          {c.subjectName}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {c.levelName} {c.parallel}
                        </p>
                      </div>
                      <span className='text-xs font-medium text-muted-foreground shrink-0'>
                        {formatTime(c.startTime)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            <Link
              href='/lms/teacher/schedule'
              className='block text-center text-sm text-primary hover:underline mt-3'
            >
              Ver horario completo →
            </Link>
          </CardContent>
        </Card>

        {/* Mis asignaciones */}
        <Card className='lg:col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-lg'>Mis asignaciones</CardTitle>
            <Link
              href='/lms/teacher/assignments'
              className='text-sm text-primary hover:underline'
            >
              Ver todas →
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className='text-muted-foreground text-sm'>Cargando...</p>
            ) : assignments.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title='No tienes asignaciones'
                description='Cuando te asignen materias, aparecerán aquí.'
              />
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {assignments.map((a) => {
                  const color = getSubjectColor(a.subject.name)
                  return (
                    <div
                      key={a.id}
                      className='p-4 rounded-lg border border-border hover:border-primary/40 transition-colors'
                    >
                      <div className='flex items-start gap-3'>
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${color.tile}`}
                        >
                          <BookOpen className='w-5 h-5' />
                        </div>
                        <div className='min-w-0'>
                          <h3 className='font-semibold text-foreground'>
                            {a.subject.name}
                          </h3>
                          <p className='text-sm text-muted-foreground'>
                            {a.classGroup.level.name} {a.classGroup.parallel}
                          </p>
                        </div>
                      </div>
                      <div className='flex gap-4 mt-3 text-xs text-muted-foreground'>
                        <span>{a._count.lessons} lecciones</span>
                        <span>{a._count.tasks} tareas</span>
                      </div>
                      <div className='flex gap-3 mt-3'>
                        <Link
                          href={`/lms/teacher/assignments?assignment=${a.id}`}
                          className='text-xs text-primary hover:underline'
                        >
                          Gestionar →
                        </Link>
                        <Link
                          href='/lms/teacher/grading'
                          className='text-xs text-primary hover:underline'
                        >
                          Calificar →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
