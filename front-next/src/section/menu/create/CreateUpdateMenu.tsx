'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { iconMapping } from '@/constants/iconMapping'
import { useFormManagement } from '@/hooks/useFormManagement'
import { createMenuSection } from '@/modules/menu-section/application/create/createMenuSection'
import { updateMenuSection } from '@/modules/menu-section/application/update/updateMenuSection'
import { MenuSection } from '@/modules/menu-section/domain/menuSections'
import {
  MenuSectionCreate,
  MenuSectionCreateSchema
} from '@/modules/menu-section/domain/menuSectionsCreate'
import { apiMenuSection } from '@/modules/menu-section/infrastructure/apiMenuSection'
import React, { useEffect } from 'react'
import { toast } from 'sonner'
import { DEFAULT_VALUES } from './defaultValues'

const menuRepository = apiMenuSection()

interface Props {
  onSuccess: () => void
  menuToEdit?: MenuSection
}

export const CreateUpdateMenuSection: React.FC<Props> = ({
  menuToEdit,
  onSuccess
}) => {
  const { form } = useFormManagement({
    schema: MenuSectionCreateSchema,
    defaultValues: DEFAULT_VALUES
  })

  const { handleSubmit, reset } = form

  const onSubmit = async (data: MenuSectionCreate) => {
    const { id, ...rest } = data
    try {
      if (menuToEdit?.id) {
        await updateMenuSection(menuRepository)(Number(id), rest)
        toast.success('Registro actualizado correctamente')
      } else {
        await createMenuSection(menuRepository)(rest)
        toast.success('Registro guardado correctamente')
        reset()
      }
      onSuccess()
    } catch {
      toast.error('Error al guardar el registro')
    }
  }

  const getMenuSection = async () => {
    if (!menuToEdit) return

    Object.entries(menuToEdit).forEach(([key, value]) => {
      form.setValue(key as any, value)
    })
  }

  useEffect(() => {
    if (menuToEdit) {
      getMenuSection()
    }
  }, [menuToEdit])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-2'>
          <div className='space-y-2'>
            <ControllerFormField form={form} name='label' label='Nombre Menu'>
              {({ value, onChange }) => (
                <Input value={value} onChange={onChange} />
              )}
            </ControllerFormField>
            <ControllerFormField form={form} name='href' label='URL'>
              {({ value, onChange }) => (
                <Input
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value)
                    form.setValue('key', e.target.value || '')
                  }}
                />
              )}
            </ControllerFormField>
            <ControllerFormField form={form} name='icon' label='Icono'>
              {({ value, onChange }) => (
                <AutoComplete
                  data={Object.keys(iconMapping).map((key) => ({
                    key,
                    label: key
                  }))}
                  value={value}
                  onChange={onChange}
                />
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
          </div>
          <div className='flex justify-start gap-2'>
            <Button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='px-4 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            >
              {form.formState.isSubmitting
                ? 'Guardando...'
                : menuToEdit?.id
                ? 'Actualizar'
                : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
