"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/components/auth-provider"
import { Header } from "./header"
import { AdminSidebar } from "./admin-sidebar"
import { CustomerSidebar } from "./customer-sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAdmin, isCustomer } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen">
      {/* Render different sidebar based on role */}
      {isAdmin() && <AdminSidebar />}
      {isCustomer() && <CustomerSidebar />}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header userName={user.name} userRole={user.role} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}

