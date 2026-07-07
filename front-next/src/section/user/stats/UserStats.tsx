'use client'

import { useUserStats } from '@/hooks/useUserStat'
import { User } from '@/modules/user/domain/user'
import {
  Activity,
  Calendar,
  TrendingUp,
  UserCheck,
  Users,
  UserX
} from 'lucide-react'
import { ActivityChart } from './ActivityChart'
import { RoleDistributionChart } from './RoleDistributionChart'
import { StatCard } from './StatCard'

interface UserStatsOverviewProps {
  users: User[]
  loading: boolean
}

export function UserStatsOverview({ users, loading }: UserStatsOverviewProps) {
  const stats = useUserStats(users)

  if (loading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='h-32 bg-gray-100 animate-pulse rounded-lg dark:bg-gray-800'
          />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Estadísticas principales */}
      <div className='grid gap-2 md:grid-cols-3 '>
        <StatCard
          title='Total de Usuarios'
          value={stats.totalUsers}
          description='Usuarios registrados en el sistema'
          icon={Users}
          trend={{
            value: stats.recentUsers,
            label: 'nuevos este mes',
            isPositive: stats.recentUsers > 0
          }}
        />

        <StatCard
          title='Usuarios Activos'
          value={stats.activeUsers}
          description={`${stats.activePercentage}% del total`}
          icon={UserCheck}
          badge={{
            text: `${stats.activePercentage}%`,
            variant: stats.activePercentage > 80 ? 'default' : 'outline'
          }}
        />

        <StatCard
          title='Usuarios Inactivos'
          value={stats.inactiveUsers}
          description={`${stats.inactivePercentage}% del total`}
          icon={UserX}
          badge={{
            text: `${stats.inactivePercentage}%`,
            variant: stats.inactivePercentage > 20 ? 'destructive' : 'default'
          }}
        />
      </div>
      <StatCard
        title='Nuevos Esta Semana'
        value={stats.weeklyUsers}
        description='Usuarios registrados recientemente'
        icon={TrendingUp}
        trend={{
          value: stats.weeklyUsers,
          label: 'esta semana',
          isPositive: stats.weeklyUsers > 0
        }}
      />

      {/* Estadísticas adicionales */}
      <div className='grid gap-2 md:grid-cols-3'>
        <StatCard
          title='Rol Más Común'
          value={stats.mostCommonRole.role}
          description={`${stats.mostCommonRole.count} usuarios`}
          icon={Users}
        />

        <StatCard
          title='Actualizados Recientemente'
          value={stats.recentlyUpdated}
          description='Perfiles modificados esta semana'
          icon={Activity}
        />

        <StatCard
          title='Nuevos Este Mes'
          value={stats.recentUsers}
          description='Registros de los últimos 30 días'
          icon={Calendar}
        />
      </div>

      {/* Gráficos */}
      <div className='grid gap-4 md:grid-cols-2'>
        <RoleDistributionChart
          usersByRole={stats.usersByRole}
          totalUsers={stats.totalUsers}
        />
        <ActivityChart activityData={stats.activityData} />
      </div>
    </div>
  )
}
