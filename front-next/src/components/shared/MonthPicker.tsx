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

interface MonthPickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const months = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
]

function generateYears(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear()
  const years = []

  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push({ value: year.toString(), label: year.toString() })
  }

  return years
}

export const MonthPicker = ({
  value,
  onChange,
  placeholder = 'Seleccionar mes',
  className
}: Readonly<MonthPickerProps>) => {
  const [supportsNativeMonth, setSupportsNativeMonth] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  useEffect(() => {
    setSupportsNativeMonth(supportsInput('month'))

    if (value) {
      const [year, month] = value.split('-')
      setSelectedYear(year || '')
      setSelectedMonth(month || '')
    }
  }, [value])

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    if (selectedYear && month) {
      onChange(`${selectedYear}-${month}`)
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    if (year && selectedMonth) {
      onChange(`${year}-${selectedMonth}`)
    }
  }

  if (supportsNativeMonth) {
    return (
      <div className='relative'>
        <Input
          type='month'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={placeholder}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-nowrap items-center gap-2 ${className || ''}`}
      style={{ minWidth: '280px' }}
    >
      <Select value={selectedMonth} onValueChange={handleMonthChange}>
        <SelectTrigger className='min-w-40 flex-1'>
          <div className='flex flex-row items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <SelectValue placeholder='Mes' />
          </div>
        </SelectTrigger>
        <SelectContent className='max-h-60 overflow-y-auto'>
          <SelectItem value='all'>Todos los meses</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className='min-w-20 w-24'>
          <SelectValue placeholder='Año' />
        </SelectTrigger>
        <SelectContent className='max-h-60 overflow-y-auto'>
          <SelectItem value='all'>Todos los años</SelectItem>
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
