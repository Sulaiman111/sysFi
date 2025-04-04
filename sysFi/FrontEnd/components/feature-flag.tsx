"use client"

import type { ReactNode } from "react"
import { useAuth } from "./auth-provider"

interface FeatureFlagProps {
  feature: string
  roles: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureFlag({ feature, roles, children, fallback = null }: FeatureFlagProps) {
  const { user } = useAuth()

  // Check if user has required role for this feature
  const hasAccess = user && roles.includes(user.role)

  // You could extend this to check a feature flag service
  // const isFeatureEnabled = useFeatureFlags(feature);

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

