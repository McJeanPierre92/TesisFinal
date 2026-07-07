'use client'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { DynamicIcon } from '@/constants/iconMapping'
import { useAuth } from '@/context/AuthContext'
import { LogOut, UserCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { ModalDialog } from '../shared/ModalDialog'
import { Separator } from '../ui/separator'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathName = usePathname()
  const { user, isLoading: loading, menuSections, logout } = useAuth()
  const [showModal, setShowModal] = React.useState(false)

  const sections = React.useMemo(
    () => (Array.isArray(menuSections) ? menuSections : []),
    [menuSections]
  )

  // Determina el item de menú activo:
  //  1. Coincidencia exacta de ruta (prioritaria).
  //  2. Si no, el ancestro más largo (para subrutas tipo /lms/my-courses/5
  //     resalten "Mis Cursos" y no "Dashboard").
  const activePath = React.useMemo(() => {
    const exact = sections.find((s) => s.href === pathName)
    if (exact) return exact.href

    const ancestors = sections
      .filter((s) => pathName.startsWith(s.href + '/'))
      .sort((a, b) => b.href.length - a.href.length)
    return ancestors[0]?.href ?? null
  }, [pathName, sections])

  const isActive = React.useCallback(
    (path: string) => path === activePath,
    [activePath]
  )

  const renderLogo = (
    <SidebarHeader className='px-3 py-4 flex items-center justify-center'>
      <Link href='/lms' className='block'>
        <Image
          src='/logo-new.png'
          alt='logo'
          width={150}
          height={150}
          className='object-contain h-auto w-auto max-h-24'
          priority
        />
      </Link>
    </SidebarHeader>
  )

  return (
    <Sidebar
      {...props}
      className='bg-sidebar text-sidebar-foreground border-r border-sidebar-border'
      collapsible='icon'
    >
      {renderLogo}
      <SidebarContent>
        <SidebarGroup className='pt-0'>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-1'>
              {loading || sections.length === 0 ? (
                <SidebarMenuItem>
                  <Link href='#'>
                    <span className='animate-pulse text-muted-foreground'>
                      {loading
                        ? 'Cargando menú...'
                        : 'Sin secciones disponibles'}
                    </span>
                  </Link>
                </SidebarMenuItem>
              ) : (
                sections.map((item) => (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <SidebarMenuItem className='font-medium'>
                        <SidebarMenuButton
                          isActive={isActive(item.href)}
                          asChild
                        >
                          <Link
                            href={item.href}
                            aria-label={`Ir a ${item.label}`}
                          >
                            <DynamicIcon
                              iconName={item.icon}
                              className='w-4 h-4'
                            />
                            <div>
                              <p>{item.label}</p>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>{item.label}</TooltipContent>
                  </Tooltip>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <SidebarMenuItem className='py-2'>
          <SidebarMenuButton asChild>
            <div className='flex items-center gap-3 text-sm w-full min-w-0'>
              <Link href='/lms/profile' className='flex items-center gap-3 min-w-0 flex-1' aria-label='Ver mi perfil'>
                <UserCircle className='w-5 h-5 shrink-0' />
                <div className='flex flex-col m-2 min-w-0 flex-1'>
                  <span className='font-medium truncate'>
                    {user?.name || 'Desconocido'}
                  </span>
                  <span className='text-xs truncate'>
                    <Tooltip>
                      <TooltipTrigger>
                        {user?.role?.name || 'Desconocido'}
                      </TooltipTrigger>
                      <TooltipContent>
                        {user?.role?.name || 'Desconocido'}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </div>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    onClick={() => setShowModal(true)}
                    className='p-2 shrink-0'
                  >
                    <span className='hover:text-primary transition'>
                      <LogOut className='w-2 h-2' />
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='z-50'>Cerrar Sesion</TooltipContent>
              </Tooltip>
            </div>
            {/* Optional logout button */}
          </SidebarMenuButton>

          <ModalDialog
            title='Cerrar sesión'
            onClose={() => setShowModal(false)}
            isOpen={showModal}
            description='¿Deseas cerrar sesión?'
            footer={
              <>
                <Button
                  type='button'
                  onClick={() => {
                    logout()
                    setShowModal(false)
                  }}
                  className='bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1 rounded font-semibold flex items-center gap-2'
                >
                  <LogOut size={16} />
                  Sí, cerrar sesión
                </Button>
                <Button
                  type='button'
                  onClick={() => setShowModal(false)}
                  variant='secondary'
                  className='px-4 py-1 rounded'
                >
                  Cancelar
                </Button>
              </>
            }
          />
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  )
}
