'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge
}: StatCardProps) {
  return (
    <Card className='bg-gray-50/50 dark:bg-gray-800'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle>{title}</CardTitle>
        <CardDescription className='flex items-center gap-2'>
          {badge && (
            <Badge variant={badge.variant || 'outline'}>{badge.text}</Badge>
          )}
          <Icon className='h-4 w-4 text-muted-foreground' />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {description && (
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        )}
        {trend && (
          <div className='flex items-center mt-2'>
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}
            </span>
            <span className='text-xs text-muted-foreground ml-1'>
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
