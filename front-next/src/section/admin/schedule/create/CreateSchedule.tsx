'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormManagement } from '@/hooks/useFormManagement'
import { Schedule, WeekDay } from '@/modules/academic/domain/academic'
import {
  apiSchedule,
  apiTeachingAssignment,
  fetchList
} from '@/modules/academic/infrastructure/apiCrud'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { ScheduleRow } from '../list/columnsSchedule'

const repo = apiSchedule()
const taRepo = apiTeachingAssignment()

const DAYS: { key: WeekDay; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' }
]

const Schema = z.object({
  teachingAssignmentId: z.number().int().min(1, 'Selecciona una asignación'),
  dayOfWeek: z.string().min(1, 'Selecciona un día'),
  startTime: z.string().min(1, 'Hora de inicio requerida'),
  endTime: z.string().min(1, 'Hora de fin requerida')
})
type FormData = z.infer<typeof Schema>

const DEFAULT_VALUES: FormData = {
  teachingAssignmentId: 0,
  dayOfWeek: '',
  startTime: '07:00',
  endTime: '08:30'
}

export function CreateSchedule({
  onSuccess,
  itemToEdit
}: {
  onSuccess: () => void
  itemToEdit?: ScheduleRow
}) {
  const [assignments, setAssignments] = useState<any[]>([])

  const { form } = useFormManagement<FormData>({
    schema: Schema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form

  useEffect(() => {
    fetchList<any>('teaching-assignment').then(setAssignments).catch(() => {})
  }, [])

  useEffect(() => {
    if (itemToEdit) {
      // Convertir ISO epoch a HH:mm para los inputs time
      const toHHmm = (iso: string) =>
        new Date(iso).toLocaleTimeString('es-EC', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      reset({
        teachingAssignmentId: itemToEdit.teachingAssignmentId,
        dayOfWeek: itemToEdit.dayOfWeek,
        startTime: toHHmm(itemToEdit.startTime),
        endTime: toHHmm(itemToEdit.endTime)
      })
    }
  }, [itemToEdit])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        teachingAssignmentId: data.teachingAssignmentId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime
      }
      if (itemToEdit?.id) {
        await repo.update(itemToEdit.id, payload)
        toast.success('Bloque actualizado')
      } else {
        await repo.create(payload)
        toast.success('Bloque creado')
      }
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <ControllerFormField form={form} name='teachingAssignmentId' label='Asignación'>
          {({ value, onChange }) => (
            <AutoComplete
              data={assignments.map((a) => ({
                key: String(a.id),
                label: `${a.subject?.name ?? `A#${a.id}`} · ${a.classGroup?.level?.name ?? ''} ${a.classGroup?.parallel ?? ''}`
              }))}
              value={String(value || '')}
              onChange={(val) => onChange(Number(val))}
              type='number'
              customPlaceholder='Selecciona una asignación...'
            />
          )}
        </ControllerFormField>

        <ControllerFormField form={form} name='dayOfWeek' label='Día'>
          {({ value, onChange }) => (
            <AutoComplete
              data={DAYS.map((d) => ({ key: d.key, label: d.label }))}
              value={value || ''}
              onChange={onChange}
              customPlaceholder='Selecciona un día...'
            />
          )}
        </ControllerFormField>

        <div className='grid grid-cols-2 gap-4'>
          <ControllerFormField form={form} name='startTime' label='Hora inicio'>
            {({ value, onChange }) => (
              <Input type='time' value={value} onChange={(e) => onChange(e.target.value)} />
            )}
          </ControllerFormField>
          <ControllerFormField form={form} name='endTime' label='Hora fin'>
            {({ value, onChange }) => (
              <Input type='time' value={value} onChange={(e) => onChange(e.target.value)} />
            )}
          </ControllerFormField>
        </div>

        <Button type='submit' disabled={form.formState.isSubmitting} className='w-full'>
          {form.formState.isSubmitting
            ? 'Guardando...'
            : itemToEdit?.id
              ? 'Actualizar'
              : 'Crear'}
        </Button>
      </form>
    </Form>
  )
}
