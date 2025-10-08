import Dashboard from '@/components/dashboard/Dashboard'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

function page() {
  return (
    <SidebarProvider>
      <Dashboard />
    </SidebarProvider>
  )
}

export default page