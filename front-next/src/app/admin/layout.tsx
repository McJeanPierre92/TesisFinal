'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRouter'
import { AppSidebar } from '@/components/navigation/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <InnerLayout>{children}</InnerLayout>
    </ProtectedRoute>
  )
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className='flex w-full'>
        <AppSidebar />
        <div className='flex-1 flex flex-col overflow-auto'>
          <header className='fixed top-0 z-10 flex h-10 shrink-0 items-center gap-2 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 w-full'>
            <SidebarTrigger />
            <div className='h-4 w-px bg-gray-200 dark:bg-gray-800' />
            {/* <Suspense fallback={<span>Loading...</span>}>
              <Breadcrumbs />
            </Suspense> */}
          </header>
          <section className='pt-10'>{children}</section>
        </div>
      </div>
    </SidebarProvider>
  )
}
