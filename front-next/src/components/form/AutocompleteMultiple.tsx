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
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
// import { ITEMS_IN_SELECT } from '@/constants/const'
const ITEMS_IN_SELECT = 20 // Set this to the appropriate value

type SelectOptions = {
  key: string
  label: string | null
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
  value: string[]
  onChange: (value: string[]) => void
  classNames?: ClassNames
}

export function AutocompleteMultiple({
  data,
  value: propValue = [],
  classNames,
  ...props
}: Readonly<PropsAutoComplete>) {
  const [open, setOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState<string[]>(propValue)
  const [visibleOptions, setVisibleOptions] = useState<SelectOptions[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    const initialOptions = data.slice(0, ITEMS_IN_SELECT)
    const selectedOptions = data.filter((opt) => propValue.includes(opt.key))

    const notInInitial = selectedOptions.filter(
      (opt) => !initialOptions.some((i) => i.key === opt.key)
    )

    setVisibleOptions([...notInInitial, ...initialOptions])
  }, [data, propValue])

  useEffect(() => {
    setSelectedValues(propValue)
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

  const handleSelect = (key: string) => {
    let updated: string[]

    if (selectedValues.includes(key)) {
      updated = selectedValues.filter((v) => v !== key)
    } else {
      updated = [...selectedValues, key]
    }

    setSelectedValues(updated)
    props.onChange(updated)
  }

  // Mostrar solo el número de máquinas seleccionadas si hay más de una
  const selectedLabelsArr = selectedValues
    .map((v) => data.find((opt) => opt.key === v)?.label)
    .filter(Boolean)
  let selectedLabels: string
  let tooltip: string | undefined = undefined
  if (selectedLabelsArr.length > 1) {
    selectedLabels = `${selectedLabelsArr.length} items seleccionadas`
    tooltip = selectedLabelsArr.join(', ')
  } else {
    selectedLabels = selectedLabelsArr.join(', ') || 'Select...'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full flex items-center justify-between gap-2 text-left p-2',
            '',
            classNames?.buttonLabel
          )}
        >
          <div
            className={cn(
              'flex-1 break-words whitespace-pre-wrap',
              classNames?.label
            )}
            {...(tooltip ? { title: tooltip } : {})}
          >
            {selectedLabels}
          </div>
          <ChevronsUpDown className='h-4 w-4 opacity-50 shrink-0' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0 m-0 z-50 w-auto'>
        <Command>
          <CommandInput
            placeholder='Search...'
            value={input}
            onValueChange={setInput}
          />
          <CommandList className='max-h-64 overflow-auto'>
            <CommandEmpty>{'No options found.'}</CommandEmpty>
            <CommandGroup>
              {visibleOptions.map((option) => (
                <CommandItem
                  key={option.key}
                  value={option.label ?? ''}
                  onSelect={() => handleSelect(option.key)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedValues.includes(option.key)
                        ? 'opacity-100'
                        : 'opacity-0'
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
                  Cargar más
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
