"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { safeLocalStorage } from "@/lib/browser-utils"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  // Don't set state during initial render to avoid hydration issues
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  // Only run once on mount
  useEffect(() => {
    setMounted(true)

    // Get stored theme
    const savedTheme = safeLocalStorage.getItem(storageKey)
    if (savedTheme && ["dark", "light", "system"].includes(savedTheme)) {
      setTheme(savedTheme as Theme)
    }
  }, [storageKey])

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("light", "dark")

    // Add the appropriate class based on the theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, mounted])

  // Handle system theme changes
  useEffect(() => {
    if (!mounted || theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    // Initial check
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(mediaQuery.matches ? "dark" : "light")

    // Watch for changes
    const listener = (event: MediaQueryListEvent) => {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(event.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", listener)
    return () => mediaQuery.removeEventListener("change", listener)
  }, [mounted, theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Only update if mounted and theme is different
      if (mounted && newTheme !== theme) {
        safeLocalStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

