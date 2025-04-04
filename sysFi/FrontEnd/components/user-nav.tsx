"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BellIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/components/language-provider"

export function UserNav() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!isMounted) {
    return null
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className={`flex items-center gap-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="h-5 w-5" />
            {hasNotifications && (
              <span
                className={`absolute ${language === "ar" ? "top-0 left-0" : "top-0 right-0"} h-2 w-2 rounded-full bg-destructive`}
              ></span>
            )}
            <span className="sr-only">{t("app.notifications")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={language === "ar" ? "start" : "end"} className="w-80">
          <DropdownMenuLabel>{t("app.notifications")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-auto">
            {/* Sample notifications */}
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{t("app.newInvoice")}</p>
                <p className="text-xs text-muted-foreground">{t("app.newInvoiceCreated")}</p>
                <p className="text-xs text-muted-foreground">10 {t("app.minutesAgo")}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{t("app.paymentReceived")}</p>
                <p className="text-xs text-muted-foreground">{t("app.paymentReceivedDetails")}</p>
                <p className="text-xs text-muted-foreground">30 {t("app.minutesAgo")}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{t("app.deliveryCompleted")}</p>
                <p className="text-xs text-muted-foreground">{t("app.deliveryCompletedDetails")}</p>
                <p className="text-xs text-muted-foreground">2 {t("app.hoursAgo")}</p>
              </div>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator />
          <div className="flex justify-between p-2">
            <Button variant="ghost" size="sm" onClick={() => setHasNotifications(false)}>
              {t("app.markAllAsRead")}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notifications">{t("app.viewAll")}</Link>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name || "User"} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align={language === "ar" ? "start" : "end"} forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || t("app.guest")}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">{t("app.profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/billing">{t("app.billing")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">{t("app.settings")}</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            {t("app.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

