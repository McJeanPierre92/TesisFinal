import { ModalDialog } from '@/components/shared/ModalDialog'
import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAllMenuSection } from '@/modules/menu-section/application/getAll/getAllMenuSections'
import { MenuSection } from '@/modules/menu-section/domain/menuSections'
import { apiMenuSection } from '@/modules/menu-section/infrastructure/apiMenuSection'
import { CreateUpdateMenuSection } from '@/section/menu/create/CreateUpdateMenu'
import { getColumnMenu } from '@/section/menu/list/columnsMenu'
import { Plus } from 'lucide-react'
import { Suspense, useEffect, useMemo, useState } from 'react'

const menuRepository = apiMenuSection()

export const MenuSectionManagement = () => {
  const [menuSections, setMenuSections] = useState<MenuSection[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMenuSection, setEditingMenuSection] =
    useState<MenuSection | null>(null)

  const fetchMenuSections = async () => {
    try {
      const response = await getAllMenuSection(menuRepository)(false)
      setMenuSections(response)
    } catch (error) {
      console.error('Error al obtener secciones:', error)
    }
  }

  const filteredMenuSections = useMemo(
    () =>
      menuSections.filter(
        (menuSection) =>
          menuSection.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          menuSection.href.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [menuSections, searchTerm]
  )

  const handleCreateMenuSection = () => {
    setEditingMenuSection(null)
    setIsDialogOpen(true)
  }

  const handleEditMenu = (menuSection: MenuSection) => {
    setEditingMenuSection(menuSection)
    setIsDialogOpen(true)
  }

  useEffect(() => {
    fetchMenuSections()
  }, [])

  return (
    <div className='space-y-6 p-3'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>Gestión de Menú</h2>
          <p className='text-muted-foreground'>
            Administra las secciones del menú y su estructura jerárquica
          </p>
        </div>
        <Button onClick={handleCreateMenuSection} variant='secondary'>
          <Plus className='h-4 w-4' />
          Nueva Sección
        </Button>
      </div>

      <Input
        type='search'
        placeholder='Buscar secciones...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='py-2'
      />
      <Suspense fallback={<div>Cargando...</div>}>
        <DataTable
          columns={getColumnMenu(fetchMenuSections, handleEditMenu)}
          data={filteredMenuSections}
          getPagination
        />
      </Suspense>

      <ModalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingMenuSection ? 'Editar Sección' : 'Crear Nueva Sección'}
      >
        <CreateUpdateMenuSection
          menuToEdit={editingMenuSection ? editingMenuSection : undefined}
          onSuccess={() => {
            fetchMenuSections()
            setIsDialogOpen(false)
          }}
        />
      </ModalDialog>
    </div>
  )
}
