'use client'

import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormManagement } from '@/hooks/useFormManagement'
import { getAllPermission } from '@/modules/permission/application/getAll/getAllPermission'
import { Permission } from '@/modules/permission/domain/permission'
import { apiPermission } from '@/modules/permission/infrastructure/apiPermission'
import { createRole } from '@/modules/role/application/create/createRole'
import { updateRole } from '@/modules/role/application/update/updateRole'
import { Role } from '@/modules/role/domain/role'
import { RoleCreate, RoleCreateSchema } from '@/modules/role/domain/roleCreate'
import { apiRole } from '@/modules/role/infrastructure/apiRole'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DEFAULT_VALUES } from './defaultValues'

const roleRepository = apiRole()
const permissionRepository = apiPermission()

interface Props {
  onSuccess: () => void
  roleToEdit?: Role | null
}

export const CreateUpdateRole: React.FC<Props> = ({
  roleToEdit,
  onSuccess
}) => {
  const { form } = useFormManagement({
    schema: RoleCreateSchema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [allSelected, setAllSelected] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    form.setValue(
      'permissions',
      checked
        ? permissions.map((permission) => ({
            roleId: roleToEdit?.id as number,
            permissionId: permission.id
          }))
        : []
    )
  }

  const onSubmit = async (data: RoleCreate) => {
    try {
      if (roleToEdit?.id) {
        await updateRole(roleRepository)({ ...data, id: roleToEdit.id })
        toast.success('Registro actualizado correctamente')
      } else {
        await createRole(roleRepository)(data)
        toast.success('Registro guardado correctamente')
        reset()
      }
      onSuccess()
    } catch {
      toast.error('Error al guardar el rol')
    }
  }

  const getRole = async () => {
    if (!roleToEdit) return

    Object.entries(roleToEdit).forEach(([key, value]) => {
      form.setValue(key as any, value)
    })
  }

  const fetchPermissions = async () => {
    const rolePermissions = await getAllPermission(permissionRepository)()
    setPermissions(rolePermissions)
  }

  useEffect(() => {
    if (roleToEdit) {
      getRole()
    }
  }, [roleToEdit])

  useEffect(() => {
    fetchPermissions()
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-2'>
          <div className='space-y-2'>
            <ControllerFormField form={form} name='name' label='Nombre del Rol'>
              {({ value, onChange }) => (
                <Input value={value} onChange={onChange} />
              )}
            </ControllerFormField>
            <ControllerFormField form={form} name='permissions' label=''>
              {({ value, onChange }) => (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-base font-semibold'>Permisos</Label>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='select-all'
                        checked={allSelected}
                        onCheckedChange={(checked) => {
                          setAllSelected(checked as boolean)
                          handleSelectAll(checked as boolean)
                        }}
                      />
                      <Label htmlFor='select-all' className='text-sm'>
                        Seleccionar todos
                      </Label>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto'>
                    {permissions.map((permission) => {
                      const isSelected = value?.some(
                        (item) => item.permissionId === permission.id
                      )
                      return (
                        <div
                          key={permission.id}
                          className='flex items-center space-x-2 '
                        >
                          <Checkbox
                            id={`permission-${permission.id}`}
                            onCheckedChange={(checked) => {
                              const newPermissions = checked
                                ? [
                                    ...(value || []),
                                    {
                                      roleId: roleToEdit?.id || 0,
                                      permissionId: permission.id
                                    }
                                  ]
                                : value?.filter(
                                    (item) =>
                                      item.permissionId !== permission.id
                                  ) || []
                              onChange(newPermissions)
                            }}
                            checked={isSelected}
                          />
                          <Label
                            htmlFor={`permission-${permission.id}`}
                            className='text-sm font-normal cursor-pointer'
                          >
                            {permission.name}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                  {(value || []).length > 0 && (
                    <div className='text-sm text-muted-foreground'>
                      {value?.length} de {permissions.length} permisos
                      seleccionados
                    </div>
                  )}
                </div>
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
                : roleToEdit?.id
                ? 'Actualizar'
                : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
