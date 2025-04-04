"use client"

import { useAuth } from "../components/auth-provider"

// Define permission types
type Permission =
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "orders:read"
  | "orders:create"
  | "orders:update"
  | "orders:delete"

// Define role-based permissions
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "orders:read",
    "orders:create",
    "orders:update",
    "orders:delete",
  ],
  manager: ["users:read", "orders:read", "orders:create", "orders:update"],
  customer: ["orders:read", "orders:create"],
}

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false

    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes(permission)
  }

  return { hasPermission }
}

