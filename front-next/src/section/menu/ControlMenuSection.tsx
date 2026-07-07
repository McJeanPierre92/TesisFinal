import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createMenuSectionPermission } from '@/modules/menu-section-permission/application/create/createMenuSectionPermission'
import { deleteMenuSectionPermission } from '@/modules/menu-section-permission/application/delete/deleteMenuSectionPermission'
import { getAllMenuSectionPermission } from '@/modules/menu-section-permission/application/getAll/getAllMenuSectionPermission'
import { MenuSectionPermission } from '@/modules/menu-section-permission/domain/menuSectionPermissions'
import { apiMenuSectionPermission } from '@/modules/menu-section-permission/infrastructure/apiMenuSectionPermission'
import { getAllMenuSection } from '@/modules/menu-section/application/getAll/getAllMenuSections'
import { MenuSection } from '@/modules/menu-section/domain/menuSections'
import { apiMenuSection } from '@/modules/menu-section/infrastructure/apiMenuSection'
import { useEffect, useState } from 'react'

type ControlMenuSectionProps = {
  roleId: number
}

const menuSectionRepository = apiMenuSection()
const menuSectionPermissionRepository = apiMenuSectionPermission()

export default function ControlMenuSection({
  roleId
}: ControlMenuSectionProps) {
  const [menuSections, setMenuSections] = useState<MenuSection[]>([])
  const [permissions, setPermissions] = useState<MenuSectionPermission[]>([])
  const [loading, setLoading] = useState(false)
  const [localPermissions, setLocalPermissions] = useState<Set<number>>(
    new Set()
  )

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [menuSections, permissions] = await Promise.all([
        getAllMenuSection(menuSectionRepository)(),
        getAllMenuSectionPermission(menuSectionPermissionRepository)()
      ])
      setMenuSections(menuSections)
      setPermissions(permissions)

      // Initialize local permissions state
      const currentPerms = new Set(
        permissions
          .filter((p) => p.roleId === roleId)
          .map((p) => p.menuSectionId)
      )
      setLocalPermissions(currentPerms)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleToggle = async (menuSectionId: number, checked: boolean) => {
    // Update local state immediately for responsive UI
    setLocalPermissions((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(menuSectionId)
      } else {
        next.delete(menuSectionId)
      }
      return next
    })

    try {
      if (checked) {
        await createMenuSectionPermission(menuSectionPermissionRepository)({
          menuSectionId,
          roleId
        })
      } else {
        const perm = permissions.find(
          (p) => p.roleId === roleId && p.menuSectionId === menuSectionId
        )
        if (perm) {
          await deleteMenuSectionPermission(menuSectionPermissionRepository)(
            perm.id
          )
        }
      }
      // Refresh permissions after successful API call
      const newPermissions = await getAllMenuSectionPermission(
        menuSectionPermissionRepository
      )()
      setPermissions(newPermissions)
    } catch (error) {
      // Revert local state on error
      setLocalPermissions((prev) => {
        const next = new Set(prev)
        if (checked) {
          next.delete(menuSectionId)
        } else {
          next.add(menuSectionId)
        }
        return next
      })
      console.error('Error updating permission:', error)
    }
  }

  return (
    <div className='flex flex-col gap-4 rounded shadow '>
      <div className='max-h-[50vh] overflow-y-auto'>
        {menuSections.length === 0 ? (
          <div className='text-gray-500 text-sm text-center'>
            No hay menús registrados
          </div>
        ) : (
          menuSections.map((menu) => (
            <div
              key={menu.id}
              className='flex justify-between items-center gap-3 py-2 px-1 border-b'
            >
              <Label className='break-words flex-1 text-sm leading-relaxed'>
                {menu.label}
              </Label>
              <Switch
                checked={localPermissions.has(menu.id)}
                disabled={loading}
                onCheckedChange={(checked) => handleToggle(menu.id, checked)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
