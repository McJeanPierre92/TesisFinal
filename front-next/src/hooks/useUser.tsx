'use client'

import { getAllUser } from '@/modules/user/application/getAll/getAllUser'
import { User, UserFilters } from '@/modules/user/domain/user'
import { apiUser } from '@/modules/user/infrastructure/apiUser'
import { useCallback, useEffect, useMemo, useState } from 'react'

const apiUserRepository = apiUser()

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    roleId: null,
    state: null
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const users = await getAllUser(apiUserRepository)()

      setUsers(users)
    } catch (err) {
      setError('Error al cargar usuarios')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        filters.search === '' ||
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.userName.toLowerCase().includes(filters.search.toLowerCase())

      const matchesRole =
        filters.roleId === null || user.roleId === filters.roleId

      const matchesState =
        filters.state === null || user.state === filters.state

      return matchesSearch && matchesRole && matchesState
    })
  }, [users, filters])

  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      roleId: null,
      state: null
    })
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchUsers
  }
}
