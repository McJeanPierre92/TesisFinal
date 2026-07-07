'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ITEMS_IN_SELECT } from '@/constants/const'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'

type SelectOptions = {
  key: string
  label: string | null
  triggerLabel?: string
}

type ClassNames = {
  label?: string
  content?: string
  buttonLabel?: string
  trigger?: string
  contentTrigger?: string
}

type PropsAutoComplete = {
  data: SelectOptions[]
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
  classNames?: ClassNames
  customPlaceholder?: string
  disabled?: boolean
  isLoading?: boolean
}

export function AutoComplete({
  data,
  value: propValue,
  type = 'text',
  classNames,
  customPlaceholder,
  disabled = false,
  isLoading = false,
  ...props
}: Readonly<PropsAutoComplete>) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | number | null>(propValue || null)
  const [visibleOptions, setVisibleOptions] = useState<SelectOptions[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    const initialOptions = data.slice(0, ITEMS_IN_SELECT)
    const selectedOption = data.find((option) => option.key === propValue)

    if (
      selectedOption &&
      !initialOptions.some((option) => option.key === selectedOption.key)
    ) {
      setVisibleOptions([selectedOption, ...initialOptions])
    } else {
      setVisibleOptions(initialOptions)
    }
  }, [data, propValue])

  useEffect(() => {
    setValue(propValue)
  }, [propValue])

  useEffect(() => {
    const filteredOptions = data.filter((option) =>
      (option.label ?? '').toLowerCase().includes(input.toLowerCase())
    )
    setVisibleOptions(filteredOptions.slice(0, ITEMS_IN_SELECT))
  }, [input, data])

  const loadMoreItems = () => {
    const filteredOptions = data.filter((option) =>
      (option.label ?? '').toLowerCase().includes(input.toLowerCase())
    )
    setVisibleOptions((prev) => [
      ...prev,
      ...filteredOptions.slice(prev.length, prev.length + ITEMS_IN_SELECT)
    ])
  }

  const selectedOption = data.find((option) => option.key === String(value))
  const selectedLabel = (selectedOption?.triggerLabel ?? selectedOption?.label)
    ? selectedOption?.triggerLabel ?? selectedOption?.label
    : (customPlaceholder ?? 'Seleccionar...')

  const handleSelect = (label: string) => {
    const selectedOption = data.find((option) => option.label === label)
    if (selectedOption) {
      const isSame = selectedOption.key === value

      if (isSame) {
        setValue('')
        props.onChange('')
      } else {
        setValue(
          type === 'number' ? Number(selectedOption.key) : selectedOption.key
        )
        props.onChange(selectedOption.key)
      }
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full min-h-9 h-auto flex items-center justify-between gap-2 text-left px-3 py-2',
            classNames?.buttonLabel
          )}
        >
          <div
            className={cn(
              'flex-1 break-words whitespace-pre-wrap',
              classNames?.label
            )}
          >
            {selectedLabel}
          </div>
          <ChevronsUpDown className='h-4 w-4 opacity-50 shrink-0' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0 m-0 z-50 w-[var(--radix-popover-trigger-width)]'>
        <Command>
          <CommandInput
            placeholder='Buscar...'
            value={input}
            onValueChange={setInput}
          />
          <CommandList className='max-h-64 overflow-auto'>
            <CommandEmpty>{'No se encontraron resultados.'}</CommandEmpty>
            <CommandGroup>
              {visibleOptions.map((option) => (
                <CommandItem
                  key={option.key}
                  value={option.label ?? ''}
                  onSelect={() => handleSelect(option.label ?? '')}
                  className='dark:hover:bg-gray-600 hover:bg-slate-400'
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.key ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label ?? ''}
                </CommandItem>
              ))}
            </CommandGroup>
            {visibleOptions.length <
              data.filter((option) =>
                (option.label ?? '').toLowerCase().includes(input.toLowerCase())
              ).length && (
                <div className='text-center my-2'>
                  <Button onClick={loadMoreItems} size='sm'>
                    Cargar mas
                  </Button>
                </div>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
