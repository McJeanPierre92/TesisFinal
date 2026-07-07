'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { supportsInput } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WeekPickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function generateYears(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push({ value: year.toString(), label: year.toString() })
  }
  return years
}

function generateWeeks(): { value: string; label: string }[] {
  const weeks = []
  for (let week = 1; week <= 52; week++) {
    const weekStr = week.toString().padStart(2, '0')
    weeks.push({ value: weekStr, label: `Semana ${weekStr}` })
  }
  return weeks
}

export function WeekPicker({
  value,
  onChange,
  placeholder = 'Seleccionar semana',
  className
}: Readonly<WeekPickerProps>) {
  const [supportsNativeWeek, setSupportsNativeWeek] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  useEffect(() => {
    setSupportsNativeWeek(supportsInput('week'))
    if (value) {
      const [year, week] = value.split('-W')
      setSelectedYear(year || '')
      setSelectedWeek(week || '')
    }
  }, [value])

  const handleWeekChange = (week: string) => {
    setSelectedWeek(week)
    if (selectedYear && week) {
      onChange(`${selectedYear}-W${week}`)
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    if (year && selectedWeek) {
      onChange(`${year}-W${selectedWeek}`)
    }
  }

  if (supportsNativeWeek) {
    return (
      <div className='relative'>
        <Input
          type='week'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={placeholder}
        />
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      <Select value={selectedWeek} onValueChange={handleWeekChange}>
        <SelectTrigger className={`${className || ''}`}>
          <div className='flex flex-row gap-2'>
            <Calendar className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Semana' />
          </div>
        </SelectTrigger>
        <SelectContent className='max-h-60 overflow-y-auto'>
          <SelectItem value='all'>Todas las semanas</SelectItem>
          {generateWeeks().map((week) => (
            <SelectItem key={week.value} value={week.value}>
              {week.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className={`${className || ''}`}>
          <SelectValue placeholder='Año' />
        </SelectTrigger>
        <SelectContent className='max-h-60 overflow-y-auto'>
          <SelectItem value='all'>Año</SelectItem>
          {generateYears().map((year) => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
