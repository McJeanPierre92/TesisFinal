'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchTotal, fetchUsers } from '@/modules/academic/infrastructure/apiCrud'

type CrudRepo<T> = {
  getAll: () => Promise<T[]>
  create: (data: any) => Promise<any>
  update: (id: number, data: any) => Promise<any>
  delete: (id: number) => Promise<void>
}

/**
 * Hook CRUD genérico para las entidades académicas.
 * Reproduce el patrón de `useUsers`: data + loading + error + refetch.
 */
export function useCrud<T>(repo: CrudRepo<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const rows = await repo.getAll()
      setData(rows)
    } catch (err) {
      setError('Error al cargar los datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [repo])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

/**
 * Hook para el dashboard del admin: obtiene el `total` de cada entidad.
 * Usa ?limit=1 para traer solo el conteo (barato).
 */
export function useAdminStats() {
  const [stats, setStats] = useState({
    institutions: 0,
    levels: 0,
    subjects: 0,
    classGroups: 0,
    enrollments: 0,
    teachingAssignments: 0,
    users: 0,
    usersByRole: { admin: 0, profesor: 0, alumno: 0 } as Record<string, number>
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [
          institutions,
          levels,
          subjects,
          classGroups,
          enrollments,
          teachingAssignments,
          usersArr
        ] = await Promise.all([
          fetchTotal('institution'),
          fetchTotal('level'),
          fetchTotal('subject'),
          fetchTotal('class-group'),
          fetchTotal('enrollment'),
          fetchTotal('teaching-assignment'),
          fetchUsers()
        ])
        const users = Array.isArray(usersArr) ? usersArr : []
        // Conteo por rol
        const usersByRole: Record<string, number> = { admin: 0, profesor: 0, alumno: 0 }
        users.forEach((u: any) => {
          const rn = u.role?.name ?? 'otro'
          usersByRole[rn] = (usersByRole[rn] ?? 0) + 1
        })
        setStats({
          institutions,
          levels,
          subjects,
          classGroups,
          enrollments,
          teachingAssignments,
          users: users.length,
          usersByRole
        })
      } catch (err) {
        console.error('Error cargando stats admin:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { stats, loading }
}
