import { z } from 'zod'

export const MenuSectionCreateSchema = z.object({
  id: z.number().optional(),
  key: z.string(),
  label: z.string(),
  href: z.string(),
  icon: z.string(),
  order: z.number(),
  state: z.boolean().optional()
})
export type MenuSectionCreate = z.infer<typeof MenuSectionCreateSchema>
