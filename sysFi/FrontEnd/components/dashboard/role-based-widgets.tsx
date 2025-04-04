"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserWidget, RevenueWidget, OrdersWidget, ActivityWidget, PerformanceWidget, SecurityWidget } from "./widgets"

export function RoleBasedWidgets() {
  const { user } = useAuth()

  if (!user) return null

  // Define widgets for each role
  const roleWidgets = {
    admin: [
      <UserWidget key="users" />,
      <RevenueWidget key="revenue" />,
      <OrdersWidget key="orders" />,
      <SecurityWidget key="security" />,
    ],
    manager: [
      <PerformanceWidget key="performance" />,
      <OrdersWidget key="orders" />,
      <ActivityWidget key="activity" />,
    ],
    customer: [<OrdersWidget key="orders" />, <ActivityWidget key="activity" />],
  }

  // Get widgets for current user role
  const widgets = roleWidgets[user.role as keyof typeof roleWidgets] || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets}

      {/* Fallback if no widgets for role */}
      {widgets.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No dashboard widgets available for your role.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

