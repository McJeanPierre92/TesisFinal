'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useFormManagement } from '@/hooks/useFormManagement'
import { ClassGroup, Subject, TeachingAssignment } from '@/modules/academic/domain/academic'
import {
  apiClassGroup,
  apiSubject,
  apiTeachingAssignment,
  fetchUsers
} from '@/modules/academic/infrastructure/apiCrud'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const repo = apiTeachingAssignment()
const subjRepo = apiSubject()
const cgRepo = apiClassGroup()

const Schema = z.object({
  subjectId: z.number().int().min(1, 'Selecciona una materia'),
  classGroupId: z.number().int().min(1, 'Selecciona un paralelo'),
  teacherId: z.number().int().min(1, 'Selecciona un profesor')
})
type FormData = z.infer<typeof Schema>

const DEFAULT_VALUES: FormData = { subjectId: 0, classGroupId: 0, teacherId: 0 }

export function CreateTeachingAssignment({
  onSuccess,
  itemToEdit
}: {
  onSuccess: () => void
  itemToEdit?: TeachingAssignment
}) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  const { form } = useFormManagement<FormData>({
    schema: Schema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form

  useEffect(() => {
    subjRepo.getAll().then(setSubjects).catch(() => {})
    cgRepo.getAll().then(setClassGroups).catch(() => {})
    fetchUsers()
      .then((users) =>
        setTeachers(users.filter((u) => u.role?.name === 'profesor'))
      )
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (itemToEdit) {
      reset({
        subjectId: itemToEdit.subjectId,
        classGroupId: itemToEdit.classGroupId,
        teacherId: itemToEdit.teacherId
      })
    }
  }, [itemToEdit])

  const onSubmit = async (data: FormData) => {
    try {
      if (itemToEdit?.id) {
        await repo.update(itemToEdit.id, data)
        toast.success('Asignación actualizada')
      } else {
        await repo.create(data)
        toast.success('Asignación creada')
      }
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <ControllerFormField form={form} name='subjectId' label='Materia'>
          {({ value, onChange }) => (
            <AutoComplete
              data={subjects.map((s) => ({
                key: String(s.id),
                label: s.name
              }))}
              value={String(value || '')}
              onChange={(val) => onChange(Number(val))}
              type='number'
              customPlaceholder='Selecciona una materia'
            />
          )}
        </ControllerFormField>

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

        <ControllerFormField form={form} name='teacherId' label='Profesor'>
          {({ value, onChange }) => (
            <AutoComplete
              data={teachers.map((t) => ({
                key: String(t.id),
                label: `${t.name} (@${t.userName})`
              }))}
              value={String(value || '')}
              onChange={(val) => onChange(Number(val))}
              type='number'
              customPlaceholder='Selecciona un profesor'
            />
          )}
        </ControllerFormField>

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
