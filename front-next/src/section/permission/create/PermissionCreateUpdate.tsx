'use client'

import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormManagement } from '@/hooks/useFormManagement'
import { createPermission } from '@/modules/permission/application/create/createPermission'
import { updatePermission } from '@/modules/permission/application/update/updatePermission'
import { Permission } from '@/modules/permission/domain/permission'
import {
  PermissionCreate,
  PermissionCreateSchema
} from '@/modules/permission/domain/permissionCreate'
import { apiPermission } from '@/modules/permission/infrastructure/apiPermission'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { DEFAULT_VALUES } from './defaultValues'

interface CreatePermissionDialogProps {
  onSuccess: () => void
  permissionToEdit?: Permission | null
}

const permissionRepository = apiPermission()

export function CreatePermissionDialog({
  onSuccess,
  permissionToEdit
}: CreatePermissionDialogProps) {
  const { form } = useFormManagement({
    schema: PermissionCreateSchema,
    defaultValues: DEFAULT_VALUES
  })

  const onSubmit = async (values: PermissionCreate) => {
    try {
      if (permissionToEdit?.id) {
        await updatePermission(permissionRepository)({
          ...values,
          id: Number(permissionToEdit.id)
        })
        toast.success('Registro actualizado correctamente')
      } else {
        await createPermission(permissionRepository)(values)
        toast.success('Registro guardado correctamente')
        form.reset()
      }
      onSuccess()
    } catch {
      toast.error('Error al guardar el registro')
    }
  }

  const permissionTemplates = [
    { category: 'users', actions: ['create', 'read', 'update', 'delete'] }
  ]

  const generatePermissionName = (category: string, action: string) => {
    form.setValue('name', `${category}:${action}`)
  }

  const getPermission = async () => {
    if (!permissionToEdit) return

    Object.entries(permissionToEdit).forEach(([key, value]) => {
      form.setValue(key as any, value)
    })
  }

  useEffect(() => {
    getPermission()
  }, [permissionToEdit])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid gap-4 py-4'>
          <ControllerFormField form={form} name='name' label='Nombre *'>
            {({ value, onChange }) => (
              <Input
                value={value}
                onChange={onChange}
                className='col-span-3'
                placeholder='users.create'
                required
              />
            )}
          </ControllerFormField>

          <div className='flex flex-col gap-2'>
            <Label className='text-right'>Plantillas</Label>
            <div className='col-span-3 space-y-2'>
              {permissionTemplates.map((template) => (
                <div key={template.category} className='space-y-1'>
                  <div className='flex flex-wrap gap-1'>
                    {template.actions.map((action) => (
                      <Button
                        key={`${template.category}:${action}`}
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          generatePermissionName(template.category, action)
                        }
                        className='h-6 text-xs'
                      >
                        {template.category}:{action}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Button type='submit'>Crear Permiso</Button>
        </div>
      </form>
    </Form>
  )
}
