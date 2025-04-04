"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, CreditCard, FileText, Home, Menu, Package, Settings, Truck, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/components/language-provider"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const routes = [
    {
      href: "/dashboard",
      label: t("app.dashboard"),
      icon: <Home className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/dashboard",
    },
    {
      href: "/invoices",
      label: t("app.invoices"),
      icon: <FileText className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/invoices",
    },
    {
      href: "/products",
      label: t("app.products"),
      icon: <Package className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/products",
    },
    {
      href: "/payments",
      label: t("app.payments"),
      icon: <CreditCard className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/payments",
    },
    {
      href: "/customers",
      label: t("app.customers"),
      icon: <Users className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/customers",
    },
    {
      href: "/reports",
      label: t("app.reports"),
      icon: <BarChart3 className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/reports",
    },
    {
      href: "/settings",
      label: t("app.settings"),
      icon: <Settings className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/settings",
    },
    {
      href: "/delivery/dashboard",
      label: t("app.delivery"),
      icon: <Truck className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname.startsWith("/delivery"),
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("app.menu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={language === "ar" ? "right" : "left"} className="w-[240px] sm:w-[300px]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <CreditCard className="h-6 w-6 text-primary" />
            <span className={`${language === "ar" ? "mr-2" : "ml-2"} text-xl font-bold`}>BillFlow</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">{t("app.closeMenu")}</span>
          </Button>
        </div>
        <div className="mt-8 flex flex-col space-y-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

