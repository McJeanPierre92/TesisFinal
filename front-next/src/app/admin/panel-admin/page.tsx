'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardAdmin } from '@/section/panelAdmin/DashboardAdmin'
import { MenuSectionManagement } from '@/section/panelAdmin/menu/MenuManagement'
import { PermissionManagement } from '@/section/panelAdmin/permission/PermissionManagement.'
import RolesManagement from '@/section/panelAdmin/role/RoleManagement'
import { UserManagement } from '@/section/panelAdmin/user/UserManagement'

const tabs = [
  { value: 'panel', label: 'Panel Admin', component: <DashboardAdmin /> },
  { value: 'users', label: 'Usuarios', component: <UserManagement /> },
  { value: 'roles', label: 'Roles', component: <RolesManagement /> },
  {
    value: 'menu-section',
    label: 'Menu',
    component: <MenuSectionManagement />
  },
  {
    value: 'permission',
    label: 'Permisos',
    component: <PermissionManagement />
  }
]

export default function PanelAdmin() {
  return (
    <Tabs defaultValue='panel' className='pt-2'>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className='text-xs'>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(({ value, component }) => (
        <TabsContent key={value} value={value}>
          {component}
        </TabsContent>
      ))}
    </Tabs>
  )
}
