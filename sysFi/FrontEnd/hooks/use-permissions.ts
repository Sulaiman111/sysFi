"use client"

import { useAuth } from "@/components/auth-provider"

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // For now, we'll use role-based permissions
    // Later you can extend this to check the permissions array
    switch (permission) {
      case "create:users":
      case "read:users":
      case "update:users":
      case "delete:users":
        return user.role === "admin"

      case "read:orders":
        return ["admin", "customer"].includes(user.role)

      case "create:orders":
      case "update:orders":
      case "delete:orders":
        return user.role === "admin"

      default:
        return false
    }
  }

  return { hasPermission }
}

