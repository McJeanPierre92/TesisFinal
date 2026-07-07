'use client'

import { ControllerFormField } from '@/components/form/ControllerFormField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormManagement } from '@/hooks/useFormManagement'
import { apiUser } from '@/modules/user/infrastructure/apiUser'
import { fetchUsers } from '@/modules/academic/infrastructure/apiCrud'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Teacher } from '../list/columnsTeacher'

const API = process.env.NEXT_PUBLIC_URL_API
const repo = apiUser()

const TeacherSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  userName: z.string().min(1, 'El usuario es requerido'),
  password: z.string().optional(),
  state: z.boolean().optional().default(true)
})

type TeacherForm = z.infer<typeof TeacherSchema>

const DEFAULT_VALUES: TeacherForm = {
  name: '',
  userName: '',
  password: '',
  state: true
}

interface Props {
  onSuccess: () => void
  teacherToEdit?: Teacher
}

export function CreateTeacher({ onSuccess, teacherToEdit }: Props) {
  const { form } = useFormManagement<TeacherForm>({
    schema: TeacherSchema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form
  const [profesorRoleId, setProfesorRoleId] = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
      .then((users) => {
        const u = users.find((x) => x.role?.name === 'profesor')
        if (u) setProfesorRoleId(u.roleId)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (teacherToEdit) {
      form.setValue('name', teacherToEdit.name)
      form.setValue('userName', teacherToEdit.userName)
      form.setValue('state', teacherToEdit.state)
    } else {
      reset()
    }
  }, [teacherToEdit])

  const onSubmit = async (data: TeacherForm) => {
    try {
      if (teacherToEdit?.id) {
        const payload = { ...data, id: Number(teacherToEdit.id) }
        if (!payload.password) delete (payload as any).password
        await fetch(`${API}/user/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        })
        toast.success('Profesor actualizado')
      } else {
        if (!profesorRoleId) {
          toast.error('No se pudo resolver el rol de profesor')
          return
        }
        await repo.create({ ...data, roleId: profesorRoleId })
        toast.success('Profesor creado')
        reset()
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-4'>
          <div className='space-y-4'>
            <ControllerFormField form={form} name='name' label='Nombres'>
              {({ value, onChange }) => (
                <Input value={value} onChange={onChange} placeholder='Nombre completo' />
              )}
            </ControllerFormField>
            <ControllerFormField form={form} name='userName' label='Usuario'>
              {({ value, onChange }) => (
                <Input value={value} onChange={onChange} placeholder='usuario' />
              )}
            </ControllerFormField>
            <ControllerFormField
              form={form}
              name='password'
              label={
                teacherToEdit
                  ? 'Nueva contraseña (dejar vacío para no cambiar)'
                  : 'Contraseña'
              }
            >
              {({ value, onChange }) => (
                <Input
                  value={value}
                  onChange={onChange}
                  type='password'
                  placeholder='••••••'
                />
              )}
            </ControllerFormField>
          </div>
          <div>
            <Button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='w-full'
            >
              {form.formState.isSubmitting
                ? 'Guardando...'
                : teacherToEdit?.id
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
