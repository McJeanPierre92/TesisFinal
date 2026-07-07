'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormManagement } from '@/hooks/useFormManagement'
import { Institution, Level } from '@/modules/academic/domain/academic'
import { apiInstitution, apiLevel } from '@/modules/academic/infrastructure/apiCrud'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const repo = apiLevel()
const instRepo = apiInstitution()

const Schema = z.object({
  name: z.string().min(1, 'Requerido'),
  order: z.number().int().min(0),
  institutionId: z.number().int().min(1, 'Selecciona una institución')
})
type FormData = z.infer<typeof Schema>

const DEFAULT_VALUES: FormData = {
  name: '',
  order: 0,
  institutionId: 0
}

export function CreateLevel({
  onSuccess,
  itemToEdit
}: {
  onSuccess: () => void
  itemToEdit?: Level
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
      reset({
        name: itemToEdit.name,
        order: itemToEdit.order,
        institutionId: itemToEdit.institutionId
      })
    }
  }, [itemToEdit])

  const onSubmit = async (data: FormData) => {
    try {
      if (itemToEdit?.id) {
        await repo.update(itemToEdit.id, data)
        toast.success('Nivel actualizado')
      } else {
        await repo.create(data)
        toast.success('Nivel creado')
      }
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
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
            <Input value={value} onChange={onChange} placeholder='8vo' />
          )}
        </ControllerFormField>

        <ControllerFormField form={form} name='order' label='Orden'>
          {({ value, onChange }) => (
            <Input
              type='number'
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
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
