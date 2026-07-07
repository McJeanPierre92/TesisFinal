'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalDialog } from '@/components/shared/ModalDialog'
import { Textarea } from '@/components/ui/textarea'
import { getSubjectColor } from '@/constants/subjectColors'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import { Lesson, Task, TeacherAssignment } from '@/modules/academic/domain/academic'
import { BookOpen, Edit, FileText, Layers, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/section/lms/components/EmptyState'
import { PageHeader } from '@/section/lms/components/PageHeader'

const academicApi = apiAcademic()

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TeacherAssignment | null>(null)

  const load = () => {
    academicApi
      .getTeacherAssignments()
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={BookOpen}
        title='Mis Clases'
        subtitle='Gestiona el contenido de tus asignaciones'
        tone='info'
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title='No tienes clases asignadas'
          description='El administrador debe asignarte materias y paralelos.'
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {assignments.map((a) => {
            const color = getSubjectColor(a.subject.name)
            return (
              <motion.div key={a.id} whileHover={{ y: -4 }}>
                <Card className='overflow-hidden hover:shadow-lg transition-shadow h-full'>
                  <div className={`h-2 ${color.solid}`} />
                  <CardContent className='p-5'>
                    <div className='flex items-start gap-3'>
                      <div
                        className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${color.tile}`}
                      >
                        <BookOpen className='w-5 h-5' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h3 className='font-semibold text-foreground truncate'>
                          {a.subject.name}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {a.classGroup.level.name} {a.classGroup.parallel}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-4 mt-4 text-xs text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Layers className='w-3.5 h-3.5' />
                        {a._count.lessons} lecciones
                      </span>
                      <span className='flex items-center gap-1'>
                        <FileText className='w-3.5 h-3.5' />
                        {a._count.tasks} tareas
                      </span>
                    </div>
                    <Button
                      className='w-full mt-4'
                      size='sm'
                      onClick={() => setSelected(a)}
                    >
                      Gestionar contenido
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {selected && (
        <ManageContentDialog
          assignment={selected}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </div>
  )
}

// ============================================================
//  Diálogo de gestión: listas + crear + editar + eliminar
// ============================================================

function ManageContentDialog({
  assignment,
  onClose,
  onChanged
}: {
  assignment: TeacherAssignment
  onClose: () => void
  onChanged: () => void
}) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'lesson' | 'task'
    id: number
    title: string
  } | null>(null)

  const loadContent = async () => {
    try {
      const [ls, ts] = await Promise.all([
        academicApi.getTeacherLessons(assignment.id),
        academicApi.getTeacherTasks(assignment.id)
      ])
      setLessons(ls)
      setTasks(ts)
    } catch {
      setLessons([])
      setTasks([])
    }
  }

  useEffect(() => {
    loadContent()
  }, [assignment.id])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'lesson') {
        await academicApi.deleteLesson(deleteTarget.id)
        toast.success('Lección eliminada')
      } else {
        await academicApi.deleteTask(deleteTarget.id)
        toast.success('Tarea eliminada')
      }
      loadContent()
      onChanged()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {assignment.subject.name} — {assignment.classGroup.level.name}{' '}
            {assignment.classGroup.parallel}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-2'>
          {/* SECCIÓN LECCIONES */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-foreground flex items-center gap-2'>
                <Layers className='w-4 h-4 text-primary' />
                Lecciones ({lessons.length})
              </h3>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setEditingLesson(null)
                  setShowLessonForm(true)
                }}
              >
                <Plus className='w-4 h-4 mr-1' /> Nueva
              </Button>
            </div>
            {lessons.length === 0 ? (
              <p className='text-sm text-muted-foreground py-2'>
                Sin lecciones todavía.
              </p>
            ) : (
              <div className='space-y-2'>
                {lessons.map((l) => (
                  <div
                    key={l.id}
                    className='flex items-center justify-between p-3 rounded-lg border border-border'
                  >
                    <div className='min-w-0'>
                      <p className='font-medium text-foreground truncate'>
                        {l.title}
                      </p>
                      {l.content && (
                        <p className='text-xs text-muted-foreground line-clamp-1'>
                          {l.content}
                        </p>
                      )}
                    </div>
                    <div className='flex gap-3 shrink-0'>
                      <Edit
                        size={15}
                        className='text-primary cursor-pointer'
                        onClick={() => {
                          setEditingLesson(l)
                          setShowLessonForm(true)
                        }}
                      />
                      <Trash2
                        size={15}
                        className='text-destructive cursor-pointer'
                        onClick={() =>
                          setDeleteTarget({
                            type: 'lesson',
                            id: l.id,
                            title: l.title
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN TAREAS */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-foreground flex items-center gap-2'>
                <FileText className='w-4 h-4 text-primary' />
                Tareas ({tasks.length})
              </h3>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setEditingTask(null)
                  setShowTaskForm(true)
                }}
              >
                <Plus className='w-4 h-4 mr-1' /> Nueva
              </Button>
            </div>
            {tasks.length === 0 ? (
              <p className='text-sm text-muted-foreground py-2'>
                Sin tareas todavía.
              </p>
            ) : (
              <div className='space-y-2'>
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className='flex items-center justify-between p-3 rounded-lg border border-border'
                  >
                    <div className='min-w-0'>
                      <p className='font-medium text-foreground truncate'>
                        {t.title}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Máx: {t.maxScore}
                        {t.dueDate &&
                          ` · Entrega: ${new Date(t.dueDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className='flex gap-3 shrink-0'>
                      <Edit
                        size={15}
                        className='text-primary cursor-pointer'
                        onClick={() => {
                          setEditingTask(t)
                          setShowTaskForm(true)
                        }}
                      />
                      <Trash2
                        size={15}
                        className='text-destructive cursor-pointer'
                        onClick={() =>
                          setDeleteTarget({
                            type: 'task',
                            id: t.id,
                            title: t.title
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Formularios modales */}
      {showLessonForm && (
        <LessonFormDialog
          assignmentId={assignment.id}
          lesson={editingLesson}
          onClose={() => setShowLessonForm(false)}
          onSaved={() => {
            loadContent()
            onChanged()
            setShowLessonForm(false)
          }}
        />
      )}
      {showTaskForm && (
        <TaskFormDialog
          assignmentId={assignment.id}
          lessons={lessons}
          task={editingTask}
          onClose={() => setShowTaskForm(false)}
          onSaved={() => {
            loadContent()
            onChanged()
            setShowTaskForm(false)
          }}
        />
      )}

      {/* Confirmación de borrado */}
      <ModalDialog
        title='Confirmar eliminación'
        description={`¿Eliminar "${deleteTarget?.title}"?`}
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant='secondary' onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Eliminar
            </Button>
          </>
        }
      />
    </Dialog>
  )
}

// ============================================================
//  Formularios
// ============================================================

function LessonFormDialog({
  assignmentId,
  lesson,
  onClose,
  onSaved
}: {
  assignmentId: number
  lesson: Lesson | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(lesson?.title ?? '')
  const [content, setContent] = useState(lesson?.content ?? '')
  const [order, setOrder] = useState(String(lesson?.order ?? 0))
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      if (lesson?.id) {
        await academicApi.editLesson(lesson.id, {
          title,
          content: content || undefined,
          order: Number(order) || 0
        })
        toast.success('Lección actualizada')
      } else {
        await academicApi.createLesson({
          teachingAssignmentId: assignmentId,
          title,
          content: content || undefined,
          order: Number(order) || 0
        })
        toast.success('Lección creada')
      }
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lesson ? 'Editar lección' : 'Nueva lección'}</DialogTitle>
        </DialogHeader>
        <div className='space-y-3 py-2'>
          <div className='space-y-2'>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className='space-y-2'>
            <Label>Contenido (opcional)</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          </div>
          <div className='space-y-2'>
            <Label>Orden</Label>
            <Input type='number' value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={saving || !title.trim()} className='w-full'>
            {saving ? 'Guardando...' : lesson ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TaskFormDialog({
  assignmentId,
  lessons,
  task,
  onClose,
  onSaved
}: {
  assignmentId: number
  lessons: Lesson[]
  task: Task | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [taskType, setTaskType] = useState<'documento' | 'examen'>(task?.type ?? 'documento')
  const [maxScore, setMaxScore] = useState(String(task?.maxScore ?? 10))
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
  )
  const [lessonId, setLessonId] = useState(String(task?.lessonId ?? ''))
  const [saving, setSaving] = useState(false)

  // Estado del constructor de preguntas (para tipo examen)
  type DraftOption = { text: string; isCorrect: boolean }
  type DraftQuestion = { text: string; options: DraftOption[] }
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    task?.questions
      ? task.questions.map((q) => ({
          text: q.text,
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect ?? false }))
        }))
      : [{ text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]
  )

  const addQuestion = () =>
    setQuestions([
      ...questions,
      { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
    ])

  const removeQuestion = (qi: number) =>
    setQuestions(questions.filter((_, i) => i !== qi))

  const addOption = (qi: number) =>
    setQuestions(
      questions.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q
      )
    )

  const removeOption = (qi: number, oi: number) =>
    setQuestions(
      questions.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.filter((_, j) => j !== oi) }
          : q
      )
    )

  const setOptionCorrect = (qi: number, oi: number) =>
    setQuestions(
      questions.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.map((o, j) => ({
                ...o,
                isCorrect: j === oi
              }))
            }
          : q
      )
    )

  const submit = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const payload: any = {
        title,
        description: description || undefined,
        type: taskType,
        maxScore: Number(maxScore) || 10,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        lessonId: lessonId ? Number(lessonId) : null
      }

      // Si es examen, validar y enviar preguntas
      if (taskType === 'examen') {
        const validQuestions = questions
          .filter((q) => q.text.trim())
          .map((q) => ({
            text: q.text.trim(),
            options: q.options
              .filter((o) => o.text.trim())
              .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
          }))
          .filter((q) => q.options.length >= 2)

        if (validQuestions.length === 0) {
          toast.error('Agrega al menos una pregunta con 2 o más opciones')
          setSaving(false)
          return
        }
        payload.questions = validQuestions
      }

      if (task?.id) {
        await academicApi.editTask(task.id, payload)
        toast.success('Tarea actualizada')
      } else {
        await academicApi.createTask({ teachingAssignmentId: assignmentId, ...payload })
        toast.success('Tarea creada')
      }
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{task ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
        </DialogHeader>
        <div className='space-y-3 py-2'>
          {/* Selector de tipo */}
          <div className='space-y-2'>
            <Label>Tipo de tarea</Label>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setTaskType('documento')}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition ${
                  taskType === 'documento'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                📄 Documento
                <span className='block text-xs font-normal opacity-70'>Subir archivo</span>
              </button>
              <button
                type='button'
                onClick={() => setTaskType('examen')}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition ${
                  taskType === 'examen'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                ✍️ Cuestionario
                <span className='block text-xs font-normal opacity-70'>Auto-calificable</span>
              </button>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className='space-y-2'>
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label>Nota máxima</Label>
              <Input
                type='number'
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label>Fecha de entrega</Label>
              <Input type='date' value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Lección (opcional)</Label>
            <AutoComplete
              data={lessons.map((l) => ({ key: String(l.id), label: l.title }))}
              value={lessonId}
              onChange={setLessonId}
              type='number'
              customPlaceholder='Sin lección asignada'
            />
          </div>

          {/* Constructor de preguntas (solo si es examen) */}
          {taskType === 'examen' && (
            <div className='space-y-3 pt-2 border-t border-border'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-bold'>
                  Preguntas ({questions.length})
                </Label>
                <Button type='button' size='sm' variant='outline' onClick={addQuestion}>
                  <Plus className='w-3 h-3 mr-1' /> Pregunta
                </Button>
              </div>
              {questions.map((q, qi) => (
                <div key={qi} className='p-3 border border-border rounded-lg space-y-2 bg-muted/20'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold text-muted-foreground'>
                      Pregunta {qi + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type='button'
                        onClick={() => removeQuestion(qi)}
                        className='text-destructive text-xs hover:underline'
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder='Escribe la pregunta...'
                    value={q.text}
                    onChange={(e) =>
                      setQuestions(
                        questions.map((qq, i) =>
                          i === qi ? { ...qq, text: e.target.value } : qq
                        )
                      )
                    }
                  />
                  <div className='space-y-1.5 pl-2'>
                    {q.options.map((o, oi) => (
                      <div key={oi} className='flex items-center gap-2'>
                        <input
                          type='radio'
                          name={`correct-${qi}`}
                          checked={o.isCorrect}
                          onChange={() => setOptionCorrect(qi, oi)}
                          className='w-4 h-4 accent-success shrink-0'
                          title='Marcar como correcta'
                        />
                        <Input
                          placeholder={`Opción ${oi + 1}`}
                          value={o.text}
                          onChange={(e) =>
                            setQuestions(
                              questions.map((qq, i) =>
                                i === qi
                                  ? {
                                      ...qq,
                                      options: qq.options.map((oo, j) =>
                                        j === oi ? { ...oo, text: e.target.value } : oo
                                      )
                                    }
                                  : qq
                              )
                            )
                          }
                          className='text-sm h-8'
                        />
                        {q.options.length > 2 && (
                          <button
                            type='button'
                            onClick={() => removeOption(qi, oi)}
                            className='text-destructive shrink-0 px-1'
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type='button'
                      onClick={() => addOption(qi)}
                      className='text-xs text-primary hover:underline pl-6'
                    >
                      + Añadir opción
                    </button>
                  </div>
                </div>
              ))}
              <p className='text-xs text-muted-foreground'>
                💡 Marca con el círculo verde la respuesta correcta de cada pregunta.
                El sistema calificará automáticamente al alumno.
              </p>
            </div>
          )}

          <Button onClick={submit} disabled={saving || !title.trim()} className='w-full'>
            {saving ? 'Guardando...' : task ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
