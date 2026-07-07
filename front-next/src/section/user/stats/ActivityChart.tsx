'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

interface ActivityData {
  period: string
  users: number
}

interface ActivityChartProps {
  activityData: ActivityData[]
}

export function ActivityChart({ activityData }: ActivityChartProps) {
  const maxUsers = Math.max(...activityData.map((d) => d.users))

  const getBarHeight = (users: number) => {
    if (maxUsers === 0) return 0
    return Math.max((users / maxUsers) * 100, 5)
  }

  const getBarColor = (users: number) => {
    if (users === 0) return 'bg-gray-200 dark:bg-gray-700'
    if (users <= maxUsers * 0.3) return 'bg-red-400'
    if (users <= maxUsers * 0.7) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  return (
    <Card className='bg-gray-50/50 dark:bg-gray-800'>
      <CardHeader>
        <CardTitle>Actividad de Usuarios</CardTitle>
        <CardDescription className='text-sm text-gray-500 dark:text-gray-400'>
          Participación por período
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {activityData.length === 0 ? (
          <p className='text-sm text-center text-muted-foreground'>
            Sin datos de actividad.
          </p>
        ) : (
          activityData.map(({ period, users }, index) => {
            const percentage = getBarHeight(users)
            const color = getBarColor(users)

            return (
              <div key={index} className='flex items-center gap-4'>
                <div className='w-20 text-sm text-right text-muted-foreground shrink-0 dark:text-white'>
                  {period}
                </div>
                <div className='flex-1 flex items-center gap-2'>
                  <div className='w-full bg-white dark:bg-gray-800 rounded-full h-5 overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <Badge
                    variant='default'
                    className='text-xs min-w-[60px] justify-center'
                  >
                    {users} usuarios
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
