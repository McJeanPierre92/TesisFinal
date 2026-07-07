import { monthEnd, monthStart } from '@formkit/tempo'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formattedDate, parseDate } from './formattedDate'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const supportsInput = (type: 'month' | 'week'): boolean => {
  if (typeof window === 'undefined') return false
  const input = document.createElement('input')
  input.setAttribute('type', type)
  return input.type === type
}

export const getWeek = (date: Date) => {
  const d = parseDate(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
    'full'
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

type MonthYearAndWeek = {
  monthYear: string
  week: string
  initialDate: string
  finalDate: string
}

export const getDateTimeInfo = (date?: Date): MonthYearAndWeek => {
  const now = parseDate(date ?? new Date(), 'full')
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const week = getWeek(now)
  const monthYear = `${year}-${month}`

  const initialDate = monthStart(now).toISOString()
  const finalDate = monthEnd(now).toISOString()

  return {
    monthYear,
    week: `${year}-W${String(week).padStart(2, '0')}`,
    initialDate,
    finalDate
  }
}
