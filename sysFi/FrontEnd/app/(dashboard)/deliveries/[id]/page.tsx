"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, TruckIcon } from "lucide-react"
import Link from "next/link"
import { DeliveryMap } from "@/components/delivery/delivery-map"
import { DeliveryTimeline } from "@/components/delivery/delivery-timeline"
import { DeliveryDetails } from "@/components/delivery/delivery-details"

interface DeliveryEvent {
  id: string
  timestamp: string
  status: string
  location: string
  description: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface DeliveryData {
  id: string
  orderId: string
  customer: {
    name: string
    email: string
    phone: string
  }
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  status: "pending" | "in_transit" | "delivered" | "failed" | "returned"
  dispatchDate: string
  estimatedDelivery: string
  carrier: string
  trackingNumber: string
  events: DeliveryEvent[]
  currentLocation: {
    lat: number
    lng: number
  }
}

// Mock data for a single delivery
const mockDeliveryData: DeliveryData = {
  id: "DEL-2305-1001",
  orderId: "ORD-2305-1001",
  customer: {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    phone: "(555) 123-4567",
  },
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
    country: "USA",
  },
  status: "in_transit",
  dispatchDate: "2023-05-04",
  estimatedDelivery: "2023-05-06",
  carrier: "Express Logistics",
  trackingNumber: "EL123456789",
  currentLocation: {
    lat: 37.7749,
    lng: -122.4194,
  },
  events: [
    {
      id: "evt-001",
      timestamp: "2023-05-04T08:00:00Z",
      status: "Order Processed",
      location: "Warehouse, San Francisco, CA",
      description: "Order has been processed and is ready for dispatch",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    {
      id: "evt-002",
      timestamp: "2023-05-04T10:30:00Z",
      status: "Picked Up",
      location: "Warehouse, San Francisco, CA",
      description: "Package has been picked up by carrier",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    {
      id: "evt-003",
      timestamp: "2023-05-04T14:45:00Z",
      status: "In Transit",
      location: "Distribution Center, Oakland, CA",
      description: "Package has arrived at distribution center",
      coordinates: {
        lat: 37.8044,
        lng: -122.2712,
      },
    },
    {
      id: "evt-004",
      timestamp: "2023-05-05T09:15:00Z",
      status: "In Transit",
      location: "Distribution Center, Sacramento, CA",
      description: "Package is in transit to the next facility",
      coordinates: {
        lat: 38.5816,
        lng: -121.4944,
      },
    },
    {
      id: "evt-005",
      timestamp: "2023-05-05T16:30:00Z",
      status: "Out for Delivery",
      location: "Local Delivery Facility, Anytown, CA",
      description: "Package is out for delivery",
      coordinates: {
        lat: 38.7749,
        lng: -121.2194,
      },
    },
  ],
}

export default function DeliveryTrackingPage() {
  const params = useParams()
  const [delivery, setDelivery] = useState<DeliveryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, you would fetch the delivery data from an API
    // For this example, we'll use the mock data
    setTimeout(() => {
      setDelivery(mockDeliveryData)
      setLoading(false)
    }, 500)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <TruckIcon className="h-8 w-8 animate-pulse" />
          <p>Loading delivery information...</p>
        </div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/deliveries">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Deliveries
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p>Delivery not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/deliveries">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Deliveries
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tracking Details</h2>
          <p className="text-muted-foreground">
            Tracking ID: {delivery.id} | Order: {delivery.orderId}
          </p>
        </div>
        <Badge
          className="text-sm px-3 py-1"
          variant={
            delivery.status === "delivered"
              ? "default"
              : delivery.status === "in_transit"
                ? "secondary"
                : delivery.status === "pending"
                  ? "outline"
                  : "destructive"
          }
        >
          {delivery.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>Details about the current delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <DeliveryDetails delivery={delivery} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Real-time Tracking</CardTitle>
            <CardDescription>Current location and delivery route</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] w-full">
              <DeliveryMap delivery={delivery} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Timeline</CardTitle>
          <CardDescription>Track the progress of your delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryTimeline events={delivery.events} />
        </CardContent>
      </Card>
    </div>
  )
}

