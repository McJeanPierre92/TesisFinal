'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { uploadSubmissionFile } from '@/modules/uploads/infrastructure/apiUploads'
import { apiAcademic } from '@/modules/academic/infrastructure/apiAcademic'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  FileText,
  Layers,
  Paperclip,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/section/lms/components/EmptyState'
import { TaskStatusBadge } from '@/section/lms/components/TaskStatusBadge'
import { MyLesson, MyTask } from '@/modules/academic/domain/academic'

const academicApi = apiAcademic()

export default function CourseDetailPage() {
  const params = useParams<{ assignmentId: string }>()
  const assignmentId = Number(params.assignmentId)

  const [lessons, setLessons] = useState<MyLesson[]>([])
  const [tasks, setTasks] = useState<MyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [submitTaskId, setSubmitTaskId] = useState<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState('')
  const [uploading, setUploading] = useState(false)
  // Estado de respuestas del cuestionario: { questionId: optionId }
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})

  const loadContent = () => {
    Promise.all([
      academicApi
        .getMyLessons()
        .then((all) =>
          setLessons(all.filter((l) => l.teachingAssignmentId === assignmentId))
        )
        .catch(() => setLessons([])),
      academicApi
        .getMyTasks()
        .then((all) =>
          setTasks(all.filter((t) => t.teachingAssignmentId === assignmentId))
        )
        .catch(() => setTasks([]))
    ]).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  const handleUpload = async () => {
    if (!submitTaskId) return
    setUploading(true)
    try {
      const isExam = currentTask?.type === 'examen'
      if (isExam) {
        // Enviar respuestas del cuestionario
        await academicApi.submitTask(submitTaskId, { answers: quizAnswers })
        toast.success('Cuestionario enviado. Calificado automáticamente.')
      } else {
        // Enviar documento
        let fileUrl: string | undefined
        if (file) {
          const result = await uploadSubmissionFile(file)
          fileUrl = result.fileUrl
        }
        await academicApi.submitTask(submitTaskId, { fileUrl, comment })
        toast.success('Entrega registrada correctamente')
      }
      setSubmitTaskId(null)
      setFile(null)
      setComment('')
      setQuizAnswers({})
      loadContent()
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar la entrega')
    } finally {
      setUploading(false)
    }
  }

  const currentTask = tasks.find((t) => t.id === submitTaskId)
  const courseName =
    lessons[0]?.teachingAssignment.subject.name ??
    tasks[0]?.teachingAssignment.subject.name ??
    'Curso'

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Link href='/lms/my-courses'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>{courseName}</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            Lecciones y tareas del curso
          </p>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      ) : lessons.length === 0 && tasks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title='Sin contenido publicado'
          description='Tu profesor aún no ha publicado lecciones ni tareas para este curso.'
        />
      ) : (
        <div className='space-y-6'>
          {/* SECCIÓN LECCIONES (acordeón) */}
          {lessons.length > 0 && (
            <div className='space-y-3'>
              <h2 className='text-lg font-semibold text-foreground flex items-center gap-2 font-serif tracking-tight'>
                <Layers className='w-5 h-5 text-primary' />
                Lecciones ({lessons.length})
              </h2>
              <div className='space-y-2'>
                {lessons.map((lesson) => (
                  <LessonAccordion key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN TAREAS */}
          {tasks.length > 0 && (
            <div className='space-y-3'>
              <h2 className='text-lg font-semibold text-foreground flex items-center gap-2 font-serif tracking-tight'>
                <FileText className='w-5 h-5 text-primary' />
                Tareas ({tasks.length})
              </h2>
              <div className='space-y-3'>
                {tasks.map((task) => {
                  const status = task.submissions[0]?.status ?? 'pendiente'
                  const grade = task.submissions[0]?.grade
                  return (
                    <Card key={task.id}>
                      <CardContent className='p-5'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex items-start gap-3 min-w-0 flex-1'>
                            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0'>
                              <FileText className='w-5 h-5' />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <h3 className='font-semibold text-foreground'>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                  {task.description}
                                </p>
                              )}
                              <div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground'>
                                <span>Nota máx: {task.maxScore}</span>
                                {task.dueDate && (
                                  <span>
                                    Entrega:{' '}
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {grade && (
                                  <span className='text-primary font-semibold'>
                                    Calificación: {grade.score}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex flex-col items-end gap-2 shrink-0'>
                            <TaskStatusBadge status={status} />
                            <Button
                              size='sm'
                              variant={
                                status === 'calificada' ? 'secondary' : 'default'
                              }
                              onClick={() => setSubmitTaskId(task.id)}
                            >
                              {status === 'pendiente'
                                ? 'Entregar'
                                : status === 'entregada'
                                  ? 'Re-entregar'
                                  : 'Ver entrega'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de entrega */}
      <Dialog
        open={submitTaskId !== null}
        onOpenChange={(open) => !open && setSubmitTaskId(null)}
      >
        <DialogContent className='max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {currentTask?.type === 'examen' ? '📝 Resolver cuestionario' : 'Entregar tarea'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            {currentTask && (
              <p className='text-sm font-medium text-foreground'>
                {currentTask.title}
              </p>
            )}

            {/* Si ya fue calificado, mostrar nota */}
            {currentTask?.submissions?.[0]?.grade && (
              <div className='p-4 rounded-lg bg-success/10 border border-success/30 text-center'>
                <p className='text-sm text-muted-foreground'>Tu calificación</p>
                <p className='text-3xl font-bold text-success'>
                  {currentTask.submissions[0].grade.score}
                  <span className='text-base text-muted-foreground'>
                    /{currentTask.maxScore}
                  </span>
                </p>
                {currentTask.submissions[0].grade.feedback && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    {currentTask.submissions[0].grade.feedback}
                  </p>
                )}
              </div>
            )}

            {/* Cuestionario (tipo examen) */}
            {currentTask?.type === 'examen' &&
              !currentTask?.submissions?.[0]?.grade &&
              currentTask.questions?.map((q, qi) => (
                <div key={q.id} className='p-4 border border-border rounded-lg space-y-3'>
                  <p className='font-semibold text-sm text-foreground'>
                    {qi + 1}. {q.text}
                  </p>
                  <div className='space-y-2 pl-2'>
                    {q.options.map((o) => (
                      <label
                        key={o.id}
                        className='flex items-center gap-3 p-2 rounded-lg border border-border cursor-pointer hover:bg-accent/30 transition'
                      >
                        <input
                          type='radio'
                          name={`q-${q.id}`}
                          checked={quizAnswers[q.id] === o.id}
                          onChange={() =>
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: o.id }))
                          }
                          className='w-4 h-4 accent-primary shrink-0'
                        />
                        <span className='text-sm text-foreground'>{o.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

            {/* Documento (tipo documento) */}
            {currentTask?.type !== 'examen' && !currentTask?.submissions?.[0]?.grade && (
              <>
                <div className='space-y-2'>
                  <Label>Archivo</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='file'
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className='cursor-pointer'
                    />
                    {file && <Paperclip className='w-4 h-4 text-primary shrink-0' />}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    PDF, DOCX, JPG o PNG (máx. 10MB)
                  </p>
                </div>
                <div className='space-y-2'>
                  <Label>Comentario (opcional)</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder='Notas para tu profesor...'
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Botón de envío */}
            {!currentTask?.submissions?.[0]?.grade && (
              <Button
                onClick={handleUpload}
                disabled={
                  uploading ||
                  (currentTask?.type === 'examen'
                    ? Object.keys(quizAnswers).length !==
                      (currentTask.questions?.length ?? 0)
                    : !file && !comment)
                }
                className='w-full'
              >
                {uploading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2' />
                    Enviando...
                  </>
                ) : currentTask?.type === 'examen' ? (
                  <>✍️ Enviar respuestas</>
                ) : (
                  <>
                    <Upload className='w-4 h-4 mr-2' />
                    Entregar
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Acordeón individual de lección
function LessonAccordion({ lesson }: { lesson: MyLesson }) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className='w-full text-left'>
            <CardContent className='p-4 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3 min-w-0'>
                <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-info/15 text-info shrink-0'>
                  <Layers className='w-4 h-4' />
                </div>
                <div className='min-w-0'>
                  <p className='font-medium text-foreground truncate'>
                    {lesson.title}
                  </p>
                  {lesson.content && !open && (
                    <p className='text-xs text-muted-foreground line-clamp-1'>
                      {lesson.content}
                    </p>
                  )}
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </CardContent>
          </button>
        </CollapsibleTrigger>
        {lesson.content && (
          <CollapsibleContent>
            <div className='px-4 pb-4 pt-1 text-sm text-foreground whitespace-pre-wrap border-t border-border mt-1'>
              {lesson.content}
            </div>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  )
}

