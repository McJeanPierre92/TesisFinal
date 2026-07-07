'use client'

import { AutoComplete } from '@/components/form/Autocomplete'
import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormManagement } from '@/hooks/useFormManagement'
import { getAllRole } from '@/modules/role/application/getAll/getAllRole'
import { Role } from '@/modules/role/domain/role'
import { apiRole } from '@/modules/role/infrastructure/apiRole'
import { createUser } from '@/modules/user/application/create/createUser'
import { updateUser } from '@/modules/user/application/update/updateUser'
import { User } from '@/modules/user/domain/user'
import { UserCreate, UserCreateSchema } from '@/modules/user/domain/userCreate'
import { apiUser } from '@/modules/user/infrastructure/apiUser'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DEFAULT_VALUES } from './defaultValues'

const userRepository = apiUser()
const roleRepository = apiRole()

interface Props {
  onSuccess: () => void
  userToEdit?: User
}

export const CreateUpdateUser: React.FC<Props> = ({
  userToEdit,
  onSuccess
}) => {
  const [roles, setRoles] = useState<Role[]>([])

  const { form } = useFormManagement({
    schema: UserCreateSchema,
    defaultValues: DEFAULT_VALUES
  })

  const { handleSubmit, reset } = form

  const onSubmit = async (data: UserCreate) => {
    try {
      if (userToEdit?.id) {
        await updateUser(userRepository)({ ...data, id: Number(userToEdit.id) })
        toast.success('Registro actualizado correctamente')
      } else {
        await createUser(userRepository)(data)
        toast.success('Registro guardado correctamente')
        reset()
      }
      onSuccess()
    } catch {
      toast.error('Error al guardar el registro')
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await getAllRole(roleRepository)()
      setRoles(data)
    } catch {
      toast.error('Error al obtener los datos')
    }
  }

  const getUser = async () => {
    form.setValue('name', userToEdit?.name ?? '')
    form.setValue('userName', userToEdit?.userName ?? '')
    form.setValue('roleId', userToEdit?.roleId ?? 0)
    form.setValue('state', userToEdit?.state ?? true)
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    if (userToEdit) {
      getUser()
    }
  }, [userToEdit])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-4'>
          <div className='space-y-4'>
            <ControllerFormField form={form} name='name' label='Nombres'>
              {({ value, onChange }) => (
                <Input value={value} onChange={onChange} />
              )}
            </ControllerFormField>
            <ControllerFormField form={form} name='userName' label='Usuario'>
              {({ value, onChange }) => (
                <Input value={value} onChange={onChange} />
              )}
            </ControllerFormField>
            <ControllerFormField form={form} name='password' label='Contraseña'>
              {({ value, onChange }) => (
                <Input value={value} onChange={onChange} type='password' />
              )}
            </ControllerFormField>
            <ControllerFormField form={form} name='roleId' label='Rol'>
              {({ value, onChange }) => (
                <AutoComplete
                  data={roles.map((val) => ({
                    key: String(val.id),
                    label: val.name
                  }))}
                  value={String(value)}
                  onChange={(val) => onChange(Number(val))}
                  type='number'
                />
              )}
            </ControllerFormField>
          </div>
          <div>
            <Button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='px-4 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            >
              {form.formState.isSubmitting
                ? 'Guardando...'
                : userToEdit?.id
                ? 'Actualizar'
                : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
