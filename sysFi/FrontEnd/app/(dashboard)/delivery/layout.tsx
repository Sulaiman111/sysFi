"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Package, Truck, Users } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useState, useEffect } from "react"

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const deliveryTabs = [
    {
      value: "dashboard",
      label: t("delivery.dashboard"),
      href: "/delivery/dashboard",
      icon: <Truck className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
    },
    {
      value: "assign",
      label: t("delivery.assign"),
      href: "/delivery/assign",
      icon: <Package className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
    },
    {
      value: "map",
      label: t("delivery.map"),
      href: "/delivery/map",
      icon: <MapPin className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
    },
    {
      value: "drivers",
      label: t("delivery.drivers"),
      href: "/delivery/drivers",
      icon: <Users className={language === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />,
    },
  ]

  // Determine active tab based on pathname
  const getActiveTab = () => {
    const path = pathname.split("/").pop()
    return deliveryTabs.find((tab) => tab.value === path)?.value || "dashboard"
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("delivery.management")}</h2>
        <p className="text-muted-foreground">{t("delivery.trackDeliveries")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("delivery.operations")}</CardTitle>
          <CardDescription>{t("delivery.assignOrders")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={getActiveTab()} className="w-full">
            <TabsList className={`grid grid-cols-4 mb-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
              {deliveryTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center" asChild>
                  <Link href={tab.href}>
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-4">{children}</div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

