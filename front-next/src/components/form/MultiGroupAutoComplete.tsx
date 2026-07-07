import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useState } from 'react'

type GroupOption = { group: string; options: { key: string; value: string }[] }

export function MultiGroupAutocomplete({
  options,
  value,
  onChange,
  placeholder
}: {
  options: GroupOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  const handleSelect = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-full min-h-[40px] flex items-center justify-start text-sm gap-2 bg-background border-muted overflow-hidden'
        >
          {value.length > 0 ? (
            <div className='flex items-center gap-2 overflow-hidden'>
              {value.map((v) => {
                const element = (
                  <Badge
                    key={v}
                    variant='default'
                    className='text-sm px-2 py-0.5 rounded-lg bg-primary text-primary-foreground truncate max-w-[150px] shrink-0'
                  >
                    {v.split('-')[1]}
                  </Badge>
                )
                return element
              })}
            </div>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full max-w-[300px] min-w-[200px] max-h-[350px] overflow-y-auto p-4 bg-popover border border-border shadow-lg'>
        <div className='flex flex-col gap-4'>
          {options.map(({ group, options }) => (
            <div key={group}>
              <div className='font-bold text-xs mb-2 text-foreground'>
                {group}
              </div>
              <div className='flex flex-wrap gap-2'>
                {options.map((option) => {
                  const isSelected = value.includes(`${group}-${option.key}`)
                  return (
                    <Badge
                      key={`${group}-${option.key}`}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => handleSelect(`${group}-${option.key}`)}
                      className={`cursor-pointer select-none text-sm px-3 py-1 rounded-lg transition-all truncate shrink-0 overflow-hidden whitespace-nowrap
                        ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground'
                        }`}
                      style={{
                        minWidth: 60,
                        minHeight: 32,
                        fontSize: 14
                      }}
                    >
                      {option.value}
                    </Badge>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
