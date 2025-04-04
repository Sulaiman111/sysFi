"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/components/language-provider"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status, isLoading } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, isLoading, router])

  // Show loading state
  if (isLoading || !isMounted) {
    return (
      <div className="flex min-h-screen flex-col ">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <Skeleton className="h-8 w-40" />
            <div className="flex items-center gap-2 ">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col ">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div
          className={`container flex h-16 items-center justify-between py-4 ${language === "ar" ? "flex-row-reverse" : ""} `}
        >
          <div className={`flex items-center gap-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
            <MainNav />
            <MobileNav />
          </div>
          <div className={`flex items-center gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}>
            <ThemeToggle />
            <LanguageToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1" dir={language === "ar" ? "rtl" : "ltr"}>
        {children}
      </main>
    </div>
  )
}

