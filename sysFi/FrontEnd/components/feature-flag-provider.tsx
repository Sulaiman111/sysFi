"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import { useAuth } from "./auth-provider"

interface FeatureFlags {
  [key: string]: boolean
}

interface FeatureFlagContextType {
  isFeatureEnabled: (featureName: string) => boolean
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [flags, setFlags] = useState<FeatureFlags>({})

  useEffect(() => {
    // In a real app, you would fetch this from your API
    const roleBasedFlags: Record<string, FeatureFlags> = {
      admin: {
        "advanced-analytics": true,
        "bulk-user-management": true,
        "export-data": true,
      },
      customer: {
        "advanced-analytics": false,
        "bulk-user-management": false,
        "export-data": true,
      },
    }

    if (user) {
      setFlags(roleBasedFlags[user.role] || {})
    } else {
      setFlags({})
    }
  }, [user])

  const isFeatureEnabled = (featureName: string): boolean => {
    return flags[featureName] || false
  }

  return <FeatureFlagContext.Provider value={{ isFeatureEnabled }}>{children}</FeatureFlagContext.Provider>
}

export function useFeatureFlag() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error("useFeatureFlag must be used within a FeatureFlagProvider")
  }
  return context
}

