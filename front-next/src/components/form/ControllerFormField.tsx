import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn
} from 'react-hook-form'

type ControllerFormFieldProps<
  T extends FieldValues,
  TName extends FieldPath<T>
> = {
  form: UseFormReturn<T>
  name: TName
  children: (field: ControllerRenderProps<T, TName>) => ReactNode
  label?: string
  className?: string
  required?: boolean
}

export const ControllerFormField = <
  T extends FieldValues,
  TName extends FieldPath<T>
>({
  form,
  label,
  children,
  className,
  required,
  ...props
}: ControllerFormFieldProps<T, TName>) => {
  return (
    <div className={`${className || 'w-auto'}`}>
      <FormField
        control={form.control}
        {...props}
        render={({ field }) => (
          <FormItem className='flex flex-col space-y-1.5'>
            {label && (
              <FormLabel
                className={cn('font-bold text-xs whitespace-nowrap')}
                htmlFor={field.name}
              >
                {label}
              </FormLabel>
            )}
            <FormControl>{children(field)}</FormControl>
            <FormMessage className='text-red-700 text-xs' />
          </FormItem>
        )}
      />
    </div>
  )
}
