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
import type { Student } from '../list/columnsStudent'

const API = process.env.NEXT_PUBLIC_URL_API
const repo = apiUser()

// Schema del formulario. roleId se fija automáticamente al rol 'alumno'.
const StudentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  userName: z.string().min(1, 'El usuario es requerido'),
  password: z.string().optional(),
  state: z.boolean().optional().default(true)
})

type StudentForm = z.infer<typeof StudentSchema>

const DEFAULT_VALUES: StudentForm = {
  name: '',
  userName: '',
  password: '',
  state: true
}

interface Props {
  onSuccess: () => void
  studentToEdit?: Student
}

export function CreateStudent({ onSuccess, studentToEdit }: Props) {
  const { form } = useFormManagement<StudentForm>({
    schema: StudentSchema,
    defaultValues: DEFAULT_VALUES
  })
  const { handleSubmit, reset } = form
  const [alumnoRoleId, setAlumnoRoleId] = useState<number | null>(null)

  // Descubre el id del rol 'alumno' una vez (para fijarlo en el alta).
  useEffect(() => {
    fetchUsers()
      .then((users) => {
        const u = users.find((x) => x.role?.name === 'alumno')
        if (u) setAlumnoRoleId(u.roleId)
      })
      .catch(() => {})
  }, [])

  // Precargar al editar
  useEffect(() => {
    if (studentToEdit) {
      form.setValue('name', studentToEdit.name)
      form.setValue('userName', studentToEdit.userName)
      form.setValue('state', studentToEdit.state)
    } else {
      reset()
    }
  }, [studentToEdit])

  const onSubmit = async (data: StudentForm) => {
    try {
      if (studentToEdit?.id) {
        // El endpoint /user/update requiere el id en el body
        const payload = { ...data, id: Number(studentToEdit.id) }
        // No enviamos password vacío en update
        if (!payload.password) delete (payload as any).password
        await fetch(`${API}/user/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        })
        toast.success('Estudiante actualizado')
      } else {
        if (!alumnoRoleId) {
          toast.error('No se pudo resolver el rol de alumno')
          return
        }
        await repo.create({ ...data, roleId: alumnoRoleId })
        toast.success('Estudiante creado')
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
                <Input
                  value={value}
                  onChange={onChange}
                  placeholder='usuario'
                />
              )}
            </ControllerFormField>
            <ControllerFormField
              form={form}
              name='password'
              label={
                studentToEdit
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
                : studentToEdit?.id
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
