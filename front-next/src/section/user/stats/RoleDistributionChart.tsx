'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface RoleDistributionProps {
  usersByRole: Record<
    string,
    { total: number; active: number; inactive: number }
  >
  totalUsers: number
}

export function RoleDistributionChart({
  usersByRole,
  totalUsers
}: RoleDistributionProps) {
  const roleEntries = Object.entries(usersByRole).sort(
    (a, b) => b[1].total - a[1].total
  )

  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <Card className='bg-gray-50/50 dark:bg-gray-800'>
      <CardHeader>
        <CardTitle>Distribución por Roles</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {roleEntries.map(([role, data], index) => {
          const percentage =
            totalUsers > 0 ? Math.round((data.total / totalUsers) * 100) : 0

          return (
            <div key={role} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-3 h-3 rounded-full ${getColorClass(index)}`}
                  />
                  <span className='text-sm font-medium'>{role}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    {data.total} usuarios
                  </Badge>
                  <span className='text-sm text-muted-foreground'>
                    {percentage}%
                  </span>
                </div>
              </div>
              <Progress value={percentage} className='h-2' />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Activos: {data.active}</span>
                <span>Inactivos: {data.inactive}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
