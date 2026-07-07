'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { getSubjectColor } from '@/constants/subjectColors'
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Inbox,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend
} from 'recharts'
import { Avatar } from '../components/Avatar'
import { StatCard } from '../components/StatCard'
import { TaskStatusBadge } from '../components/TaskStatusBadge'
import { EmptyState } from '../components/EmptyState'
import { AnimatedGrid, AnimatedItem } from '../components/AnimatedGrid'
import { MyTask } from '@/modules/academic/domain/academic'

const academicApi = apiAcademic()

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#f59e0b',
  entregada: '#3b82f6',
  calificada: '#10b981'
}

export function StudentDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<MyTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academicApi
      .getMyTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  const pending = tasks.filter(
    (t) => t.submissions.length === 0 || t.submissions[0].status !== 'calificada'
  )
  const delivered = tasks.filter(
    (t) => t.submissions.length > 0 && t.submissions[0].status === 'entregada'
  )
  const graded = tasks.filter(
    (t) => t.submissions.length > 0 && t.submissions[0].status === 'calificada'
  )

  // Datos para la dona: distribución por estado
  const pieData = useMemo(
    () => [
      { name: 'Pendientes', value: pending.length, key: 'pendiente' },
      { name: 'Entregadas', value: delivered.length, key: 'entregada' },
      { name: 'Calificadas', value: graded.length, key: 'calificada' }
    ].filter((d) => d.value > 0),
    [pending, delivered, graded]
  )

  const firstName = user?.name?.split(' ')[0] ?? ''
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  // Próximas entregas: ordenadas por dueDate asc, no calificadas
  const upcoming = useMemo(
    () =>
      [...pending]
        .filter((t) => t.dueDate)
        .sort(
          (a, b) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
        )
        .slice(0, 4),
    [pending]
  )

  return (
    <div className='space-y-6'>
      {/* Saludo */}
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
            Este es el resumen de tus materias y tareas
          </p>
        </div>
      </motion.div>

      {/* StatCards animadas */}
      <AnimatedGrid className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <AnimatedItem>
          <StatCard
            icon={ClipboardList}
            label='Pendientes'
            value={pending.length}
            tone='warning'
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon={Inbox}
            label='En revisión'
            value={delivered.length}
            tone='info'
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon={GraduationCap}
            label='Calificadas'
            value={graded.length}
            tone='success'
          />
        </AnimatedItem>
        <AnimatedItem>
          <StatCard
            icon={BookOpen}
            label='Tareas totales'
            value={tasks.length}
            tone='primary'
          />
        </AnimatedItem>
      </AnimatedGrid>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Dona de distribución */}
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle className='text-lg'>Tus tareas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className='text-muted-foreground text-sm'>Cargando...</p>
            ) : pieData.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title='Sin tareas'
                description='Aún no tienes tareas asignadas.'
              />
            ) : (
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend
                    iconType='circle'
                    wrapperStyle={{ fontSize: '0.8rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Próximas entregas */}
        <Card className='lg:col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Clock className='w-5 h-5 text-warning' />
              Próximas entregas
            </CardTitle>
            <Link
              href='/lms/my-courses'
              className='text-sm text-primary hover:underline'
            >
              Ver mis cursos →
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className='text-muted-foreground text-sm'>Cargando...</p>
            ) : upcoming.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title='No tienes entregas próximas'
                description='Cuando se asignen tareas con fecha, aparecerán aquí.'
              />
            ) : (
              <div className='space-y-3'>
                {upcoming.map((task) => {
                  const due = new Date(task.dueDate!)
                  const days = Math.ceil(
                    (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                  const urgent = days <= 1
                  const soon = days <= 3
                  const color = getSubjectColor(
                    task.teachingAssignment.subject.name
                  )
                  return (
                    <Link
                      key={task.id}
                      href={`/lms/my-courses/${task.teachingAssignmentId}`}
                      className='flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/40 transition-colors'
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <div
                          className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${color.tile}`}
                        >
                          <BookOpen className='w-4 h-4' />
                        </div>
                        <div className='min-w-0'>
                          <span className='font-medium text-foreground block truncate'>
                            {task.title}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {task.teachingAssignment.subject.name}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            urgent
                              ? 'bg-rose-100 text-rose-700'
                              : soon
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {urgent && <AlertCircle className='w-3 h-3' />}
                          {days <= 0
                            ? 'Hoy'
                            : days === 1
                              ? 'Mañana'
                              : `${days}d`}
                        </span>
                      </div>
                    </Link>
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
