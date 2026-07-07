import { useUsers } from '@/hooks/useUser'
import { UserStatsOverview } from '../user/stats/UserStats'

export const DashboardAdmin = () => {
  const { allUsers, loading } = useUsers()

  return (
    <div className='p-2'>
      <UserStatsOverview users={allUsers} loading={loading} />
    </div>
  )
}
