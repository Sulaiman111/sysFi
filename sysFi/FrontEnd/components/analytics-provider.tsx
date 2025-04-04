"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "./auth-provider"

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    // Add user role to all events
    const eventWithRole = {
      ...properties,
      userRole: user?.role || "unauthenticated",
    }

    // Send to your analytics service
    console.log(`[Analytics] ${eventName}`, eventWithRole)

    // In production, you would send this to your analytics service
    // Example: mixpanel.track(eventName, eventWithRole);
  }

  return <AnalyticsContext.Provider value={{ trackEvent }}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}

