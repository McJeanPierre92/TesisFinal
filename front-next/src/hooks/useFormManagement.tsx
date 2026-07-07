import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrayPath,
  DefaultValues,
  FieldValues,
  Path,
  useFieldArray,
  useForm
} from 'react-hook-form'
import { ZodType } from 'zod'

type Props<T extends FieldValues> = {
  defaultValues?: DefaultValues<T>
  schema: ZodType<any, any>
  name?: ArrayPath<T>
}

type ControlledField<T> = T & {
  /** id interno de React Hook Form (string). Usar SOLO para operaciones de useFieldArray (remove/update por índice o por id interno). */
  rhfId: string
  /** id real de la base de datos (número) si el detail ya existe; undefined para detalles nuevos. */
  id: number | string | undefined
}

export const useFormManagement = <T extends FieldValues>({
  name,
  defaultValues,
  ...props
}: Props<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(props.schema),
    defaultValues: defaultValues
  })

  const { fields, append, remove, update, replace } = useFieldArray({
    control: form.control,
    name: name as ArrayPath<T>
  })

  const watchFieldArray = form.watch(name as readonly Path<T>[])

  // Devuelve cada fila con:
  //   - `id`: el id real de la DB si existe (número > 0). Si no, cae al id interno de RHF
  //     (string) para mantener unicidad en el render. Esto evita que un re-render momentáneo
  //     pierda el id real y termine creando un duplicado en el backend.
  //   - `rhfId`: el id interno de RHF (string), siempre presente. Útil para llamadas a
  //     `useFieldArray.remove()` o `useFieldArray.update()` que requieren el id de RHF.
  const controlledFields = fields.map((field, index): ControlledField<any> => {
    const watchValue = watchFieldArray?.[index] as
      | { id?: number | string }
      | undefined
    const dbId = watchValue?.id
    const isDbId = typeof dbId === 'number' && dbId > 0

    return {
      ...field,
      ...watchValue,
      rhfId: field.id,
      id: isDbId ? dbId : field.id
    }
  })

  return {
    form,
    controlledFields,
    append,
    remove,
    update,
    replace,
    watchFieldArray
  }
}
