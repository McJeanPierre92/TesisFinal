'use client'

import { User } from '@/modules/user/domain/user'
import { useMemo } from 'react'

export function useUserStats(users: User[]) {
  const stats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter((user) => user.state).length
    const inactiveUsers = totalUsers - activeUsers

    // Estadísticas por rol
    const usersByRole = users.reduce((acc, user) => {
      const roleName = user.role?.name || 'N/A'
      if (!acc[roleName]) {
        acc[roleName] = { total: 0, active: 0, inactive: 0 }
      }
      acc[roleName].total++
      if (user.state) {
        acc[roleName].active++
      } else {
        acc[roleName].inactive++
      }
      return acc
    }, {} as Record<string, { total: number; active: number; inactive: number }>)

    // Usuarios creados en los últimos 30 días
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentUsers = users.filter(
      (user) => new Date(user.createdAt) >= thirtyDaysAgo
    ).length

    // Usuarios creados en los últimos 7 días
    const sevenDaysAgo = new Date()
    const today = new Date()
    const yesterday = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    today.setHours(0, 0, 0, 0)
    yesterday.setDate(yesterday.getDate() - 1)

    const weeklyUsers = users.filter(
      (user) => new Date(user.createdAt) >= sevenDaysAgo
    ).length

    // Usuarios actualizados recientemente (últimos 7 días)
    const recentlyUpdated = users.filter(
      (user) => new Date(user.updatedAt) >= sevenDaysAgo
    ).length

    const todayUsers = users.filter(
      (user) => new Date(user.createdAt) >= today
    ).length

    const yesterdayUsers = users.filter(
      (user) =>
        new Date(user.createdAt) >= yesterday &&
        new Date(user.createdAt) < today
    ).length

    // Porcentajes
    const activePercentage =
      totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
    const inactivePercentage =
      totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0

    // Rol más común
    const mostCommonRole = Object.entries(usersByRole).reduce(
      (max, [role, data]) =>
        data.total > max.count ? { role, count: data.total } : max,
      { role: 'N/A', count: 0 }
    )

    // Actividad reciente (simulada)
    const activityData = [
      { period: 'Hoy', users: todayUsers },
      { period: 'Ayer', users: yesterdayUsers },
      { period: 'Esta semana', users: weeklyUsers },
      { period: 'Este mes', users: recentUsers }
    ]

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      activePercentage,
      inactivePercentage,
      usersByRole,
      recentUsers,
      weeklyUsers,
      recentlyUpdated,
      mostCommonRole,
      activityData
    }
  }, [users])

  return stats
}
