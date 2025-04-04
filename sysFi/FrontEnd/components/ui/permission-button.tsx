"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import type { ReactNode } from "react"

interface PermissionButtonProps extends ButtonProps {
  permission: string
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionButton({ permission, fallback = null, children, ...props }: PermissionButtonProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <Button {...props}>{children}</Button>
}

