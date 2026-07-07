'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { UserCog, Lock, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar } from '@/section/lms/components/Avatar'
import { PageHeader } from '@/section/lms/components/PageHeader'

const API = process.env.NEXT_PUBLIC_URL_API

export default function ProfilePage() {
  const { user, checkAuth } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [userName, setUserName] = useState(user?.userName ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      const res = await fetch(`${API}/user/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: user.id, name, userName })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Error al actualizar')
      }
      toast.success('Perfil actualizado')
      // Refrescar el usuario en el contexto
      await checkAuth()
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar el perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Error al cambiar la contraseña')
      }
      toast.success('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      toast.error(e.message || 'Error al cambiar la contraseña')
    } finally {
      setSavingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className='space-y-6 max-w-3xl'>
      <PageHeader
        icon={UserCog}
        title='Mi Perfil'
        subtitle='Gestiona tu información de cuenta y contraseña'
        tone='primary'
      />

      {/* Cabecera con avatar */}
      <Card className='overflow-hidden ring-1 ring-primary/20'>
        <CardContent className='flex items-center gap-4 p-6'>
          <Avatar name={user.name} size='lg' />
          <div>
            <h2 className='text-xl font-bold text-foreground'>{user.name}</h2>
            <p className='text-sm text-muted-foreground'>@{user.userName}</p>
            <p className='text-xs text-muted-foreground mt-1 capitalize'>
              Rol: {user.role?.name}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Datos personales */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Datos personales</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Nombre completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className='space-y-2'>
            <Label>Usuario</Label>
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            <Save className='w-4 h-4 mr-2' />
            {savingProfile ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* Cambio de contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Lock className='w-5 h-5 text-primary' />
            Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Contraseña actual</Label>
            <Input
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder='••••••'
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Nueva contraseña</Label>
              <Input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='••••••'
              />
            </div>
            <div className='space-y-2'>
              <Label>Confirmar nueva contraseña</Label>
              <Input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='••••••'
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword}
          >
            <Lock className='w-4 h-4 mr-2' />
            {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
