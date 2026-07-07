'use client'

import { useAuth } from '@/context/AuthContext'
import { AdminDashboard } from '@/section/lms/dashboard/AdminDashboard'
import { StudentDashboard } from '@/section/lms/dashboard/StudentDashboard'
import { TeacherDashboard } from '@/section/lms/dashboard/TeacherDashboard'

export default function LmsHomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  const roleName = user.role?.name?.toLowerCase() ?? ''

  if (roleName === 'admin') return <AdminDashboard />
  if (roleName === 'profesor') return <TeacherDashboard />
  // Por defecto y para 'alumno'
  return <StudentDashboard />
}
