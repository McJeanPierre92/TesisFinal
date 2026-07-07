'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useFormManagement } from '@/hooks/useFormManagement'
import { ClassGroup, Enrollment } from '@/modules/academic/domain/academic'
import {
  apiClassGroup,
  apiEnrollment,
  fetchUsers
} from '@/modules/academic/infrastructure/apiCrud'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const repo = apiEnrollment()
const cgRepo = apiClassGroup()

const Schema = z.object({
  classGroupId: z.number().int().min(1, 'Selecciona un paralelo'),
  studentId: z.number().int().min(1, 'Selecciona un alumno')
})
type FormData = z.infer<typeof Schema>

const DEFAULT_VALUES: FormData = { classGroupId: 0, studentId: 0 }

export function CreateEnrollment({
  onSuccess,
  itemToEdit
}: {
  onSuccess: () => void
  itemToEdit?: Enrollment
}) {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [students, setStudents] = useState<any[]>([])

  const { form } = useFormManagement<FormData>({
    schema: Schema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form

  useEffect(() => {
    cgRepo.getAll().then(setClassGroups).catch(() => {})
    fetchUsers()
      .then((users) => setStudents(users.filter((u) => u.role?.name === 'alumno')))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (itemToEdit) {
      reset({
        classGroupId: itemToEdit.classGroupId,
        studentId: itemToEdit.studentId
      })
    }
  }, [itemToEdit])

  const onSubmit = async (data: FormData) => {
    try {
      if (itemToEdit?.id) {
        await repo.update(itemToEdit.id, data)
        toast.success('Matrícula actualizada')
      } else {
        await repo.create(data)
        toast.success('Alumno matriculado')
      }
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <ControllerFormField form={form} name='classGroupId' label='Paralelo'>
          {({ value, onChange }) => (
            <AutoComplete
              data={classGroups.map((cg) => ({
                key: String(cg.id),
                label: `${cg.level?.name ?? `CG#${cg.id}`} ${cg.parallel}`
              }))}
              value={String(value || '')}
              onChange={(val) => onChange(Number(val))}
              type='number'
              customPlaceholder='Selecciona un paralelo'
            />
          )}
        </ControllerFormField>

        <ControllerFormField form={form} name='studentId' label='Alumno'>
          {({ value, onChange }) => (
            <AutoComplete
              data={students.map((s) => ({
                key: String(s.id),
                label: `${s.name} (@${s.userName})`
              }))}
              value={String(value || '')}
              onChange={(val) => onChange(Number(val))}
              type='number'
              customPlaceholder='Selecciona un alumno'
            />
          )}
        </ControllerFormField>

        <Button type='submit' disabled={form.formState.isSubmitting} className='w-full'>
          {form.formState.isSubmitting
            ? 'Guardando...'
            : itemToEdit?.id
              ? 'Actualizar'
              : 'Matricular'}
        </Button>
      </form>
    </Form>
  )
}
