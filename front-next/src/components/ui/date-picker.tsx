import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

type DatePickerProps = {
  readonly id?: string
  readonly value: string | undefined | null
  readonly onChange?: (date: string | undefined) => void
  readonly onSelect?: (date: string | undefined) => void
  readonly showTimePicker?: boolean
  readonly disabled?: boolean
}

export function DatePicker({
  value,
  id,
  onChange,
  onSelect,
  showTimePicker = false,
  disabled = false
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (value) {
      setVisibleMonth(new Date(value))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined)
      onSelect?.(undefined)
      return
    }

    let finalDate = new Date(selectedDate)

    if (showTimePicker && value) {
      const prev = new Date(value)
      finalDate.setHours(prev.getHours(), prev.getMinutes())
    } else if (showTimePicker) {
      const now = new Date()
      finalDate.setHours(now.getHours(), now.getMinutes())
    }
    if (!showTimePicker) {
      finalDate.setHours(0, 0, 0, 0)
    }

    const isoString = finalDate.toISOString()
    onChange?.(isoString)
    onSelect?.(isoString)
  }

  const handleTimeChange = (hours: number, minutes: number) => {
    if (!value) return
    const d = new Date(value)
    d.setHours(hours, minutes)
    onChange?.(d.toISOString())
    onSelect?.(d.toISOString())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          disabled={disabled}
          className={cn(
            'w-full justify-start truncate max-w-full',
            !value && 'text-muted-foreground'
          )}
        >
          {value ? (
            format(new Date(value), showTimePicker ? 'PPP HH:mm' : 'PPP', {
              locale: es
            })
          ) : (
            <span>
              {showTimePicker
                ? 'Seleccionar fecha y hora'
                : 'Seleccionar fecha'}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          id={id}
          mode='single'
          captionLayout='dropdown'
          selected={value ? new Date(value) : undefined}
          onSelect={handleDateSelect}
          defaultMonth={visibleMonth}
          onMonthChange={setVisibleMonth}
          showTimePicker={showTimePicker}
          timeValue={value ? new Date(value) : null}
          onTimeChange={handleTimeChange}
          toYear={new Date().getFullYear() + 10}
          fromYear={new Date().getFullYear() - 5}
        />
      </PopoverContent>
    </Popover>
  )
}
