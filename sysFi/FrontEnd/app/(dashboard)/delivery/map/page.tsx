"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DriverTracker } from "@/components/delivery/driver-tracker"

// Mock data for drivers
const drivers = [
  {
    id: "driver-1",
    name: "Ahmed Hassan",
    vehicle: "Toyota Hilux",
    status: "available",
    location: [31.2357, 30.0444], // Cairo
  },
  {
    id: "driver-2",
    name: "Mohammed Ali",
    vehicle: "Ford Transit",
    status: "available",
    location: [31.2095, 30.0231], // Giza
  },
  {
    id: "driver-3",
    name: "Khaled Omar",
    vehicle: "Isuzu NPR",
    status: "busy",
    location: [29.9187, 31.2001], // Alexandria
  },
  {
    id: "driver-4",
    name: "Samir Nabil",
    vehicle: "Mitsubishi Fuso",
    status: "available",
    location: [31.229, 30.04], // Cairo
  },
]

// Mock data for orders
const orders = [
  {
    id: "order-1",
    customer: "Acme Corporation",
    address: "123 Business St, Cairo",
    items: 5,
    status: "ready",
    salesRep: "Mahmoud Ibrahim",
    location: [31.2457, 30.0544],
    priority: "high",
  },
  {
    id: "order-2",
    customer: "Tech Solutions Inc",
    address: "456 Tech Ave, Giza",
    items: 3,
    status: "ready",
    salesRep: "Amir Salah",
    location: [31.2095, 30.0231],
    priority: "medium",
  },
  {
    id: "order-3",
    customer: "Global Traders",
    address: "789 Market Rd, Alexandria",
    items: 7,
    status: "ready",
    salesRep: "Layla Ahmed",
    location: [29.9187, 31.2001],
    priority: "low",
  },
  {
    id: "order-4",
    customer: "Pharma Plus",
    address: "101 Health Blvd, Cairo",
    items: 2,
    status: "ready",
    salesRep: "Mahmoud Ibrahim",
    location: [31.229, 30.04],
    priority: "high",
  },
  {
    id: "order-5",
    customer: "Food Distributors Ltd",
    address: "202 Cuisine St, Giza",
    items: 10,
    status: "ready",
    salesRep: "Amir Salah",
    location: [31.201, 30.03],
    priority: "medium",
  },
]

export default function DeliveryMapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!isMounted) {
    return null
  }

  // Get driver and orders from URL params
  const driverId = searchParams.get("driver")
  const orderIdsParam = searchParams.get("orders")
  const orderIds = orderIdsParam ? orderIdsParam.split(",") : []

  // If we have driver and orders from URL, show the driver tracker
  if (driverId && orderIds.length > 0) {
    // Get the selected orders
    const selectedOrders = orders
      .filter((order) => orderIds.includes(order.id))
      .map((order) => ({
        id: order.id,
        orderId: order.id,
        customer: order.customer,
        address: order.address,
        location: order.location,
        status: "pending",
        priority: order.priority,
      }))

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/delivery/assign")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignment
          </Button>
        </div>

        <DriverTracker driverId={driverId} initialDeliveries={selectedOrders} />
      </div>
    )
  }

  // If no driver/orders specified, show the fleet overview
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p>View all drivers and deliveries on the map. Select a driver to see their assigned deliveries.</p>
          </div>

          <Tabs defaultValue="drivers">
            <TabsList>
              <TabsTrigger value="drivers">Drivers List</TabsTrigger>
            </TabsList>

            <TabsContent value="drivers" className="mt-4">
              <DriversList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Drivers List component
function DriversList() {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Map View Disabled</AlertTitle>
        <AlertDescription>
          The interactive map view is only available in the browser. Please assign orders to a driver to view the full
          map.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card key={driver.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{driver.name}</h3>
                <Badge variant={driver.status === "available" ? "default" : "secondary"} className="capitalize">
                  {driver.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{driver.vehicle}</p>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push(`/delivery/assign?driver=${driver.id}`)}
                disabled={driver.status !== "available"}
              >
                {driver.status === "available" ? "Assign Orders" : "Driver Busy"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

