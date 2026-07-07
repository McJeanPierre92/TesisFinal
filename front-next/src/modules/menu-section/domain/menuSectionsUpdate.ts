import { z } from 'zod'
import { MenuSectionCreateSchema } from './menuSectionsCreate'

export const MenuSectionUpdateSchema = MenuSectionCreateSchema.partial()

export type MenuSectionUpdate = z.infer<typeof MenuSectionUpdateSchema>
