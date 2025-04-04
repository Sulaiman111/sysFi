"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, CreditCard, FileText, Home, Package, Settings, Truck, Users, Receipt, Building2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

// Add Image import at the top
import Image from "next/image"

export function MainNav() {
  const pathname = usePathname()
  const { t, language } = useLanguage()

  const routes = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: <Home className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/dashboard",
    },
    {
      href: "/invoices",
      label: t("invoices"),
      icon: <FileText className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/invoices",
    },
    {
      href: "/products",
      label: t("products"),
      icon: <Package className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/products",
    },
    {
      href: "/payments",
      label: t("payments"),
      icon: <CreditCard className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/payments",
    },
    {
      href: "/expenses",
      label: t("expenses"),
      icon: <Receipt className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/expenses",
    },
    {
      href: "/customers",
      label: t("customers"),
      icon: <Users className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/customers",
    },
    {
      href: "/suppliers",
      label: t("suppliers"),
      icon: <Building2 className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/suppliers",
    },
    {
      href: "/reports",
      label: t("reports"),
      icon: <BarChart3 className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/reports",
    },
    {
      href: "/settings",
      label: t("settings"),
      icon: <Settings className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname === "/settings",
    },
    {
      href: "/delivery/dashboard",
      label: t("delivery"),
      icon: <Truck className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
      active: pathname.startsWith("/delivery"),
    },
  ]

  return (
    <nav className={`hidden md:flex items-center  ${language === "ar" ? "space-x-reverse" : ""} space-x-4 lg:space-x-6`}>
      <Link href="/" className="flex items-center">
        <Image 
          src="/logo.png"
          alt="FinMastr Logo"
          width={24}
          height={24}
          className="text-primary"
        />
        <span className={`${language === "ar" ? "ml-4" : "mr-4"} text-xl font-bold`}>inMastr</span>
      </Link>
      <div
        className={`flex items-center ${language === "ar" ? "space-x-reverse" : ""} space-x-4 lg:space-x-6 ${language === "ar" ? "mr-6" : "ml-6"}`}
      >
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {route.icon}
            {route.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

