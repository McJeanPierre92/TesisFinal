'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormManagement } from '@/hooks/useFormManagement'
import { ClassGroup, Institution, Level } from '@/modules/academic/domain/academic'
import { apiClassGroup, apiInstitution, apiLevel } from '@/modules/academic/infrastructure/apiCrud'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const repo = apiClassGroup()
const instRepo = apiInstitution()
const levelRepo = apiLevel()

const Schema = z.object({
  parallel: z.string().min(1, 'Requerido'),
  levelId: z.number().int().min(1, 'Selecciona un nivel'),
  institutionId: z.number().int().min(1, 'Selecciona una institución')
})
type FormData = z.infer<typeof Schema>

const DEFAULT_VALUES: FormData = { parallel: '', levelId: 0, institutionId: 0 }

export function CreateClassGroup({
  onSuccess,
  itemToEdit
}: {
  onSuccess: () => void
  itemToEdit?: ClassGroup
}) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [levels, setLevels] = useState<Level[]>([])

  const { form } = useFormManagement<FormData>({
    schema: Schema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form

  useEffect(() => {
    instRepo.getAll().then(setInstitutions).catch(() => {})
    levelRepo.getAll().then(setLevels).catch(() => {})
  }, [])

  useEffect(() => {
    if (itemToEdit) {
      reset({
        parallel: itemToEdit.parallel,
        levelId: itemToEdit.levelId,
        institutionId: itemToEdit.institutionId
      })
    }
  }, [itemToEdit])

  const onSubmit = async (data: FormData) => {
    try {
      if (itemToEdit?.id) {
        await repo.update(itemToEdit.id, data)
        toast.success('Paralelo actualizado')
      } else {
        await repo.create(data)
        toast.success('Paralelo creado')
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

        <ControllerFormField form={form} name='levelId' label='Nivel'>
          {({ value, onChange }) => (
            <AutoComplete
              data={levels.map((val) => ({
                key: String(val.id),
                label: val.name
              }))}
              value={String(value || '')}
              onChange={(val) => onChange(Number(val))}
              type='number'
              customPlaceholder='Selecciona un nivel'
            />
          )}
        </ControllerFormField>

        <ControllerFormField form={form} name='parallel' label='Paralelo'>
          {({ value, onChange }) => (
            <Input value={value} onChange={onChange} placeholder='A' />
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
