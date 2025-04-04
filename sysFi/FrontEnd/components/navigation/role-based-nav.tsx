"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { usePermissions } from "@/hooks/use-permissions"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Settings, ShoppingCart, FileText, BarChart, Shield, HelpCircle } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  requiredPermission?: string
  roles?: string[]
}

export function RoleBasedNav() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const pathname = usePathname()

  // Define navigation items with role/permission requirements
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["admin", "customer", "manager"],
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: Users,
      requiredPermission: "users:read",
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      requiredPermission: "orders:read",
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: FileText,
      roles: ["admin", "manager"],
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
      roles: ["admin"],
    },
    {
      title: "Security",
      href: "/admin/security",
      icon: Shield,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin", "customer", "manager"],
    },
    {
      title: "Help",
      href: "/dashboard/help",
      icon: HelpCircle,
      roles: ["admin", "customer", "manager"],
    },
  ]

  // Filter items based on user role and permissions
  const filteredNavItems = navItems.filter((item) => {
    // If no user, don't show any items
    if (!user) return false

    // Check permission-based access
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false
    }

    // Check role-based access
    if (item.roles && !item.roles.includes(user.role)) {
      return false
    }

    return true
  })

  return (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center px-3 py-2 text-sm rounded-md transition-colors
              ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

