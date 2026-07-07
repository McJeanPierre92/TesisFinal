import { z } from 'zod'

export const MenuSectionPermissionCreate = z.object({
    id: z.number().optional(),
    menuSectionId: z.number(),
    roleId: z.number().nullable(), // Puede ser null según tu modelo
})
export type MenuSectionPermissionCreate = z.infer<typeof MenuSectionPermissionCreate>