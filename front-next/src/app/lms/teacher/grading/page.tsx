'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { fetchList } from '@/modules/academic/infrastructure/apiCrud'
import { getSubjectColor } from '@/constants/subjectColors'
import {
  ClipboardCheck,
  Save,
  GraduationCap,
  CheckCircle2,
  BookOpen
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { PageHeader } from '@/section/lms/components/PageHeader'
import { Avatar } from '@/section/lms/components/Avatar'
import { EmptyState } from '@/section/lms/components/EmptyState'
import {
  TeacherAssignment,
  TeacherSubmission,
  Term,
  Task
} from '@/modules/academic/domain/academic'

const academicApi = apiAcademic()

// Color según porcentaje de la nota vs máximo
function scoreTone(pct: number): { bar: string; text: string } {
  if (pct >= 70) return { bar: 'bg-success', text: 'text-success' }
  if (pct >= 50) return { bar: 'bg-warning', text: 'text-warning-foreground' }
  return { bar: 'bg-rose-500', text: 'text-rose-600' }
}

export default function GradingPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [assignmentId, setAssignmentId] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskId, setTaskId] = useState<string>('')
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([])
  const [grades, setGrades] = useState<
    Record<number, { score: string; feedback: string }>
  >({})
  const [loadingAss, setLoadingAss] = useState(true)
  const [loadingSubs, setLoadingSubs] = useState(false)

  // Nota de parcial
  const [term, setTerm] = useState<Term>('primerParcial')

  useEffect(() => {
    academicApi
      .getTeacherAssignments()
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoadingAss(false))
  }, [])

  const selectedAssignment = assignments.find((a) => a.id === Number(assignmentId))

  // Cargar tareas de la asignación seleccionada
  useEffect(() => {
    if (!assignmentId) {
      setTasks([])
      return
    }
    fetchList<Task>('task')
      .then((all) => setTasks(all.filter((t) => t.teachingAssignmentId === Number(assignmentId))))
      .catch(() => setTasks([]))
    setTaskId('')
    setSubmissions([])
  }, [assignmentId])

  // Cargar entregas de la tarea seleccionada
  useEffect(() => {
    if (!taskId) {
      setSubmissions([])
      return
    }
    setLoadingSubs(true)
    academicApi
      .getSubmissionsForTask(Number(taskId))
      .then((data) => {
        setSubmissions(data)
        const init: Record<number, { score: string; feedback: string }> = {}
        data.forEach((s) => {
          init[s.id] = {
            score: s.grade ? String(s.grade.score) : '',
            feedback: s.grade?.feedback ?? ''
          }
        })
        setGrades(init)
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoadingSubs(false))
  }, [taskId])

  const maxScore = useMemo(() => {
    const t = tasks.find((tk) => tk.id === Number(taskId))
    return t?.maxScore ?? 10
  }, [tasks, taskId])

  const gradedCount = submissions.filter((s) => s.grade).length

  const handleGrade = async (submissionId: number) => {
    const g = grades[submissionId]
    if (!g || !g.score) {
      toast.error('Ingresa una nota')
      return
    }
    try {
      await academicApi.gradeSubmission(submissionId, {
        score: Number(g.score),
        feedback: g.feedback || undefined
      })
      toast.success('Calificación guardada')
      // Refrescar
      const data = await academicApi.getSubmissionsForTask(Number(taskId))
      setSubmissions(data)
    } catch (err: any) {
      toast.error(err.message || 'Error al calificar')
    }
  }

  if (loadingAss) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={ClipboardCheck}
        title='Calificar'
        subtitle='Revisa entregas y registra notas de parciales'
        tone='warning'
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title='No tienes clases para calificar'
          description='Primero debes tener asignaciones académicas.'
        />
      ) : (
        <>
          {/* Selectores en cascada */}
          <Card>
            <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4 p-5'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Asignación</label>
                <AutoComplete
                  data={assignments.map((a) => ({
                    key: String(a.id),
                    label: `${a.subject.name} — ${a.classGroup.level.name} ${a.classGroup.parallel}`
                  }))}
                  value={assignmentId}
                  onChange={setAssignmentId}
                  customPlaceholder='Selecciona una clase...'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Tarea</label>
                <AutoComplete
                  data={tasks.map((t) => ({
                    key: String(t.id),
                    label: `${t.title} (máx ${t.maxScore})`
                  }))}
                  value={taskId}
                  onChange={setTaskId}
                  customPlaceholder='Selecciona una tarea...'
                />
              </div>
            </CardContent>
          </Card>

          {taskId && (
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-lg'>
                  Entregas ({gradedCount}/{submissions.length} calificadas)
                </CardTitle>
                <Badge variant={gradedCount === submissions.length && submissions.length > 0 ? 'default' : 'secondary'}>
                  {gradedCount === submissions.length && submissions.length > 0
                    ? 'Completo'
                    : 'Pendiente'}
                </Badge>
              </CardHeader>
              <CardContent>
                {loadingSubs ? (
                  <p className='text-muted-foreground text-sm'>Cargando...</p>
                ) : submissions.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title='Sin entregas'
                    description='Ningún alumno ha entregado esta tarea aún.'
                  />
                ) : (
                  <div className='space-y-3'>
                    {submissions.map((s) => {
                      const currentScore = grades[s.id]?.score
                        ? Number(grades[s.id].score)
                        : s.grade?.score ?? 0
                      const pct = Math.min((currentScore / maxScore) * 100, 100)
                      const tone = scoreTone(pct)
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className='p-4 rounded-lg border border-border space-y-3'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='flex items-center gap-3 min-w-0'>
                              <Avatar name={s.student.name} size='md' />
                              <div className='min-w-0'>
                                <p className='font-medium text-foreground truncate'>
                                  {s.student.name}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  @{s.student.userName} ·{' '}
                                  {new Date(s.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {s.grade && (
                              <Badge variant='default' className='shrink-0'>
                                <CheckCircle2 className='w-3 h-3 mr-1' />
                                Calificada
                              </Badge>
                            )}
                          </div>

                          {s.comment && (
                            <p className='text-sm text-muted-foreground italic bg-muted/40 rounded p-2'>
                              “{s.comment}”
                            </p>
                          )}
                          {s.fileUrl && (
                            <a
                              href={s.fileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-xs text-primary hover:underline'
                            >
                              Ver archivo adjunto →
                            </a>
                          )}

                          {/* Barra de nota */}
                          <div className='flex items-center gap-3'>
                            <div className='flex-1'>
                              <div className='h-2 rounded-full bg-muted overflow-hidden'>
                                <motion.div
                                  className={`h-full ${tone.bar}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.4 }}
                                />
                              </div>
                            </div>
                            <span className={`text-sm font-semibold tabular-nums ${tone.text}`}>
                              {currentScore}/{maxScore}
                            </span>
                          </div>

                          <div className='flex gap-2'>
                            <Input
                              type='number'
                              placeholder='Nota'
                              className='w-24'
                              max={maxScore}
                              min={0}
                              value={grades[s.id]?.score ?? ''}
                              onChange={(e) =>
                                setGrades((prev) => ({
                                  ...prev,
                                  [s.id]: {
                                    score: e.target.value,
                                    feedback: prev[s.id]?.feedback ?? ''
                                  }
                                }))
                              }
                            />
                            <Input
                              placeholder='Retroalimentación...'
                              className='flex-1'
                              value={grades[s.id]?.feedback ?? ''}
                              onChange={(e) =>
                                setGrades((prev) => ({
                                  ...prev,
                                  [s.id]: {
                                    score: prev[s.id]?.score ?? '',
                                    feedback: e.target.value
                                  }
                                }))
                              }
                            />
                            <Button size='sm' onClick={() => handleGrade(s.id)}>
                              <Save className='w-4 h-4' />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Nota de parcial */}
          {selectedAssignment && (
            <TermGradePanel
              assignmentId={selectedAssignment.id}
              subjectName={selectedAssignment.subject.name}
              term={term}
              setTerm={setTerm}
            />
          )}
        </>
      )}
    </div>
  )
}

function TermGradePanel({
  assignmentId,
  subjectName,
  term,
  setTerm
}: {
  assignmentId: number
  subjectName: string
  term: Term
  setTerm: (t: Term) => void
}) {
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [score, setScore] = useState('')
  const [observations, setObservations] = useState('')
  const [saving, setSaving] = useState(false)
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    fetchList<any>('enrollment')
      .then((enrolls) => {
        // Para simplificar, mostramos todos los usuarios con rol alumno.
        // En una versión más fina se filtraría por los matriculados en este paralelo.
      })
      .catch(() => {})
  }, [assignmentId])

  useEffect(() => {
    import('@/modules/academic/infrastructure/apiCrud').then(({ fetchUsers }) =>
      fetchUsers()
        .then((users) => setStudents(users.filter((u) => u.role?.name === 'alumno')))
        .catch(() => {})
    )
  }, [])

  const submit = async () => {
    if (!studentId || !score) {
      toast.error('Completa el alumno y la nota')
      return
    }
    setSaving(true)
    try {
      await academicApi.createTermGrade({
        teachingAssignmentId: assignmentId,
        studentId: Number(studentId),
        term,
        score: Number(score),
        observations: observations || undefined
      })
      toast.success('Nota de parcial registrada')
      setStudentId('')
      setStudentName('')
      setScore('')
      setObservations('')
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar la nota')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg flex items-center gap-2'>
          <GraduationCap className='w-5 h-5 text-primary' />
          Nota de parcial — {subjectName}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Alumno</label>
            <AutoComplete
              data={students.map((s) => ({
                key: String(s.id),
                label: `${s.name} (@${s.userName})`
              }))}
              value={studentId}
              onChange={(v) => {
                setStudentId(v)
                const s = students.find((x) => String(x.id) === v)
                setStudentName(s?.name ?? '')
              }}
              type='number'
              customPlaceholder='Selecciona un alumno...'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Parcial</label>
            <AutoComplete
              data={[
                { key: 'primerParcial', label: 'Primer Parcial' },
                { key: 'segundoParcial', label: 'Segundo Parcial' },
                { key: 'tercerParcial', label: 'Tercer Parcial' },
                { key: 'final', label: 'Final' }
              ]}
              value={term}
              onChange={(v) => setTerm(v as Term)}
              customPlaceholder='Selecciona un parcial...'
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Nota (0-100)</label>
            <Input
              type='number'
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder='Ej: 8.5'
              min={0}
              max={100}
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Observaciones</label>
            <Input
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder='Opcional'
            />
          </div>
        </div>
        <Button onClick={submit} disabled={saving} className='w-full'>
          {saving ? 'Guardando...' : 'Registrar nota de parcial'}
        </Button>
      </CardContent>
    </Card>
  )
}
