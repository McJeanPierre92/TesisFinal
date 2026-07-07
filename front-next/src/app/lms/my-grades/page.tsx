'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { GraduationCap, Award } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { PageHeader } from '@/section/lms/components/PageHeader'
import { EmptyState } from '@/section/lms/components/EmptyState'
import { MyGrades } from '@/modules/academic/domain/academic'

const academicApi = apiAcademic()

const TERM_LABELS: Record<string, string> = {
  primerParcial: 'Primer Parcial',
  segundoParcial: 'Segundo Parcial',
  tercerParcial: 'Tercer Parcial',
  final: 'Final'
}

// Color según porcentaje
function scoreColor(pct: number): string {
  if (pct >= 70) return 'text-success'
  if (pct >= 50) return 'text-warning-foreground'
  return 'text-rose-600'
}
function barColor(pct: number): string {
  if (pct >= 70) return 'bg-success'
  if (pct >= 50) return 'bg-warning'
  return 'bg-rose-500'
}

export default function MyGradesPage() {
  const [data, setData] = useState<MyGrades | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academicApi
      .getMyGrades()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const gradedSubs = useMemo(
    () => (data?.submissions ?? []).filter((s) => s.grade),
    [data]
  )

  // Promedio ponderado por nota máxima de cada tarea
  const average = useMemo(() => {
    if (gradedSubs.length === 0) return null
    let sumPct = 0
    gradedSubs.forEach((s) => {
      const pct = (s.grade!.score / s.task.maxScore) * 100
      sumPct += pct
    })
    return Math.round(sumPct / gradedSubs.length)
  }, [gradedSubs])

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!data) return null

  const hasData =
    data.submissions.length > 0 || data.termGrades.length > 0

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={GraduationCap}
        title='Mis Notas'
        subtitle='Calificaciones de tareas y parciales'
        tone='success'
      />

      {!hasData ? (
        <EmptyState
          icon={GraduationCap}
          title='Aún no tienes notas'
          description='Cuando tus profesores califiquen tus entregas, aparecerán aquí.'
        />
      ) : (
        <>
          {/* Tarjeta de promedio */}
          {average !== null && (
            <Card className='overflow-hidden ring-1 ring-primary/20'>
              <CardContent className='flex items-center gap-6 p-6'>
                <div className='flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 shrink-0'>
                  <span className='text-3xl font-bold text-primary tabular-nums'>
                    {average}
                  </span>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-foreground'>
                    Promedio general
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Sobre {gradedSubs.length} tarea
                    {gradedSubs.length !== 1 ? 's' : ''} calificada
                    {gradedSubs.length !== 1 ? 's' : ''}
                  </p>
                  <div className='mt-2 h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden'>
                    <motion.div
                      className={`h-full ${barColor(average)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${average}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas de tareas */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Award className='w-5 h-5 text-primary' />
                Notas de tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gradedSubs.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  No hay tareas calificadas todavía.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Materia</TableHead>
                      <TableHead>Tarea</TableHead>
                      <TableHead className='text-center'>Nota</TableHead>
                      <TableHead>Retroalimentación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradedSubs.map((s) => {
                      const pct = Math.min(
                        (s.grade!.score / s.task.maxScore) * 100,
                        100
                      )
                      return (
                        <TableRow key={s.id}>
                          <TableCell className='font-medium'>
                            {s.task.teachingAssignment.subject.name}
                          </TableCell>
                          <TableCell>{s.task.title}</TableCell>
                          <TableCell className='text-center'>
                            <span
                              className={`font-bold tabular-nums ${scoreColor(pct)}`}
                            >
                              {s.grade!.score}
                            </span>
                            <span className='text-muted-foreground'>
                              /{s.task.maxScore}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {s.grade!.feedback ?? '—'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Notas de parciales */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center gap-2'>
                <GraduationCap className='w-5 h-5 text-primary' />
                Notas de parciales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.termGrades.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  No hay notas de parciales registradas.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Materia</TableHead>
                      <TableHead>Parcial</TableHead>
                      <TableHead className='text-center'>Nota</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.termGrades.map((tg) => {
                      const pct = Math.min(tg.score, 100)
                      return (
                        <TableRow key={tg.id}>
                          <TableCell className='font-medium'>
                            {tg.teachingAssignment.subject.name}
                          </TableCell>
                          <TableCell>
                            {TERM_LABELS[tg.term] ?? tg.term}
                          </TableCell>
                          <TableCell className='text-center'>
                            <span
                              className={`font-bold tabular-nums ${scoreColor(pct)}`}
                            >
                              {tg.score}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {tg.observations ?? '—'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
