'use client'

import { DataTable } from '@/components/table/DataTable'
import { getAllMenuSection } from '@/modules/menu-section/application/getAll/getAllMenuSections'
import { MenuSection } from '@/modules/menu-section/domain/menuSections'
import { apiMenuSection } from '@/modules/menu-section/infrastructure/apiMenuSection'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { date } from 'zod'
import { getColumnMenu } from './columnsMenu'

const menuRepository = apiMenuSection()

export const ListMenuSection = ({
  onEditMenu
}: {
  onEditMenu: (menu: MenuSection) => void
}) => {
  const [menuSections, setMenuSections] = useState<MenuSection[]>([])

  const fetchAll = async () => {
    try {
      const data = await getAllMenuSection(menuRepository)()
      setMenuSections(data)
    } catch (error) {
      toast.error('Error al obtener secciones de menu:')
    }
  }

  useEffect(() => {
    fetchAll()
  }, [date])

  return (
    <div className='mx-3'>
      <DataTable
        columns={getColumnMenu(fetchAll, onEditMenu)}
        data={menuSections}
        getPagination
      />
    </div>
  )
}
