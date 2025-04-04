"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon, TruckIcon } from "lucide-react"
import { DeliveryMap } from "@/components/delivery/delivery-map"
import { DeliveryTimeline } from "@/components/delivery/delivery-timeline"
import { DeliveryDetails } from "@/components/delivery/delivery-details"

// Using the same mock data from the delivery tracking page
const mockDeliveryData = {
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

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [delivery, setDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber) {
      setError("Please enter a tracking number")
      return
    }

    setLoading(true)
    setError("")

    // Simulate API call to fetch tracking information
    setTimeout(() => {
      // For demo purposes, we'll accept any tracking number that starts with "EL"
      if (trackingNumber.startsWith("EL")) {
        setDelivery(mockDeliveryData)
      } else {
        setError("No delivery found with that tracking number")
        setDelivery(null)
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      <header className="bg-background border-b py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BillFlow Delivery Tracking</span>
          </div>
          <Button variant="outline" asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Track Your Delivery</CardTitle>
            <CardDescription>Enter your tracking number to get real-time updates on your delivery.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., EL123456789)"
                  className="pl-8"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Track"}
              </Button>
            </form>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {delivery && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
                <CardDescription>Tracking information for {delivery.trackingNumber}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <DeliveryDetails delivery={delivery} />
                  </div>
                  <div className="h-[300px] md:h-auto">
                    <DeliveryMap delivery={delivery} />
                  </div>
                </div>
              </CardContent>
            </Card>

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
        )}
      </main>

      <footer className="bg-background border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2023 BillFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

