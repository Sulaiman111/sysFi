"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Truck, User } from "lucide-react"

// Mock data for drivers
const drivers = [
  {
    id: "driver-1",
    name: "Ahmed Hassan",
    vehicle: "Toyota Hilux",
    status: "active",
    deliveries: 12,
    location: "Cairo",
  },
  { id: "driver-2", name: "Mohammed Ali", vehicle: "Ford Transit", status: "active", deliveries: 8, location: "Giza" },
  {
    id: "driver-3",
    name: "Khaled Omar",
    vehicle: "Isuzu NPR",
    status: "inactive",
    deliveries: 0,
    location: "Alexandria",
  },
  {
    id: "driver-4",
    name: "Samir Nabil",
    vehicle: "Mitsubishi Fuso",
    status: "active",
    deliveries: 5,
    location: "Cairo",
  },
]

// Mock data for deliveries
const deliveries = [
  {
    id: "del-1",
    driver: "Ahmed Hassan",
    customer: "Acme Corporation",
    status: "in-progress",
    items: 5,
    location: "Cairo",
  },
  {
    id: "del-2",
    driver: "Mohammed Ali",
    customer: "Tech Solutions Inc",
    status: "in-progress",
    items: 3,
    location: "Giza",
  },
  { id: "del-3", driver: "Samir Nabil", customer: "Pharma Plus", status: "pending", items: 2, location: "Cairo" },
  {
    id: "del-4",
    driver: "Ahmed Hassan",
    customer: "Global Traders",
    status: "completed",
    items: 7,
    location: "Alexandria",
  },
  {
    id: "del-5",
    driver: "Mohammed Ali",
    customer: "Food Distributors Ltd",
    status: "completed",
    items: 10,
    location: "Giza",
  },
]

export default function DeliveryDashboardPage() {
  // Count active drivers
  const activeDrivers = drivers.filter((d) => d.status === "active").length

  // Count deliveries by status
  const inProgressDeliveries = deliveries.filter((d) => d.status === "in-progress").length
  const pendingDeliveries = deliveries.filter((d) => d.status === "pending").length
  const completedDeliveries = deliveries.filter((d) => d.status === "completed").length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrivers}</div>
            <p className="text-xs text-muted-foreground">{drivers.length} total drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressDeliveries}</div>
            <p className="text-xs text-muted-foreground">Deliveries in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeliveries}</div>
            <p className="text-xs text-muted-foreground">Deliveries pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeliveries}</div>
            <p className="text-xs text-muted-foreground">Deliveries completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers
                .filter((driver) => driver.status === "active")
                .slice(0, 3)
                .map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{driver.deliveries} deliveries</Badge>
                  </div>
                ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/delivery/drivers">View All Drivers</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliveries.slice(0, 3).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between space-x-4">
                  <div>
                    <p className="text-sm font-medium leading-none">{delivery.customer}</p>
                    <p className="text-sm text-muted-foreground">Driver: {delivery.driver}</p>
                  </div>
                  <Badge
                    variant={
                      delivery.status === "completed"
                        ? "default"
                        : delivery.status === "in-progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {delivery.status === "in-progress"
                      ? "In Progress"
                      : delivery.status === "completed"
                        ? "Completed"
                        : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" asChild>
                <Link href="/delivery/map">View Map</Link>
              </Button>
              <Button asChild>
                <Link href="/delivery/assign">
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

