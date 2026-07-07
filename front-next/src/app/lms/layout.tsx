'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRouter'
import { AppSidebar } from '@/components/navigation/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function LmsLayout({
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
      <div className='flex w-full min-h-screen'>
        <AppSidebar />
        <div className='flex-1 flex flex-col overflow-auto'>
          <header className='sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 backdrop-blur-md w-full px-8'>
            <SidebarTrigger />
            <div className='h-5 w-px bg-border' />
            <span className='text-base font-bold text-foreground tracking-tight'>
              ULEAM LMS
            </span>
          </header>
          <main className='flex-1 p-8 bg-background'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
