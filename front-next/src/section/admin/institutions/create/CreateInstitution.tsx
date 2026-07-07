'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useFormManagement } from '@/hooks/useFormManagement'
import { Institution } from '@/modules/academic/domain/academic'
import { apiInstitution } from '@/modules/academic/infrastructure/apiCrud'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

const repo = apiInstitution()

const Schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional()
})

type FormData = z.infer<typeof Schema>

interface Props {
  onSuccess: () => void
  itemToEdit?: Institution
}

export function CreateInstitution({ onSuccess, itemToEdit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { name: '', description: '' }
  })

  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        name: itemToEdit.name,
        description: itemToEdit.description ?? ''
      })
    }
  }, [itemToEdit])

  const onSubmit = async (data: FormData) => {
    try {
      if (itemToEdit?.id) {
        await repo.update(itemToEdit.id, data)
        toast.success('Institución actualizada')
      } else {
        await repo.create(data)
        toast.success('Institución creada')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Nombre</label>
          <Input {...form.register('name')} placeholder='ULEAM' />
          {form.formState.errors.name && (
            <p className='text-xs text-destructive'>
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Descripción (opcional)</label>
          <Textarea {...form.register('description')} rows={3} />
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
