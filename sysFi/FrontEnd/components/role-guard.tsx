"use client"

import type { ReactNode } from "react"
import { useAuth } from "./auth-provider"

interface RoleGuardProps {
  allowedRoles: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  // If no user or user's role is not in the allowed roles, show fallback
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  // Otherwise, show the children
  return <>{children}</>
}

