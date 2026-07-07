'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormManagement } from '@/hooks/useFormManagement'
import { Institution, Subject } from '@/modules/academic/domain/academic'
import { apiInstitution, apiSubject } from '@/modules/academic/infrastructure/apiCrud'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const repo = apiSubject()
const instRepo = apiInstitution()

const Schema = z.object({
  name: z.string().min(1, 'Requerido'),
  institutionId: z.number().int().min(1, 'Selecciona una institución')
})
type FormData = z.infer<typeof Schema>

const DEFAULT_VALUES: FormData = { name: '', institutionId: 0 }

export function CreateSubject({
  onSuccess,
  itemToEdit
}: {
  onSuccess: () => void
  itemToEdit?: Subject
}) {
  const [institutions, setInstitutions] = useState<Institution[]>([])

  const { form } = useFormManagement<FormData>({
    schema: Schema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form

  useEffect(() => {
    instRepo.getAll().then(setInstitutions).catch(() => {})
  }, [])

  useEffect(() => {
    if (itemToEdit) {
      reset({ name: itemToEdit.name, institutionId: itemToEdit.institutionId })
    }
  }, [itemToEdit])

  const onSubmit = async (data: FormData) => {
    try {
      if (itemToEdit?.id) {
        await repo.update(itemToEdit.id, data)
        toast.success('Materia actualizada')
      } else {
        await repo.create(data)
        toast.success('Materia creada')
      }
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <ControllerFormField form={form} name='institutionId' label='Institución'>
          {({ value, onChange }) => (
            <AutoComplete
              data={institutions.map((val) => ({
                key: String(val.id),
                label: val.name
              }))}
              value={String(value || '')}
              onChange={(val) => onChange(Number(val))}
              type='number'
              customPlaceholder='Selecciona una institución'
            />
          )}
        </ControllerFormField>

        <ControllerFormField form={form} name='name' label='Nombre'>
          {({ value, onChange }) => (
            <Input value={value} onChange={onChange} placeholder='Matemáticas' />
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
