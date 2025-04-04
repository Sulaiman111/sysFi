"use client"

import { useEffect, useState } from "react"
import { MapView, type MapMarker, type MapRoute } from "@/components/delivery/map-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Clock, MapPin, Navigation, Package, RotateCw, Truck } from "lucide-react"

interface Driver {
  id: string
  name: string
  vehicle: string
  status: "active" | "inactive" | "busy"
  location: [number, number]
  lastUpdated: string
}

interface Delivery {
  id: string
  orderId: string
  customer: string
  address: string
  location: [number, number]
  status: "pending" | "in_transit" | "delivered" | "failed"
  priority: "high" | "medium" | "low"
}

interface DriverTrackerProps {
  driverId?: string
  initialDeliveries?: Delivery[]
  className?: string
}

export function DriverTracker({ driverId, initialDeliveries = [], className }: DriverTrackerProps) {
  const { toast } = useToast()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedRoute, setOptimizedRoute] = useState<MapRoute | null>(null)
  const [activeTab, setActiveTab] = useState("map")
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch driver data
  useEffect(() => {
    if (!isMounted) return

    const fetchDriverData = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate it
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock driver data
        setDriver({
          id: driverId || "driver-1",
          name: "Ahmed Hassan",
          vehicle: "Toyota Hilux",
          status: "active",
          location: [31.2357, 30.0444], // Cairo
          lastUpdated: new Date().toISOString(),
        })

        // If no initial deliveries, fetch them
        if (initialDeliveries.length === 0) {
          // Mock deliveries data
          setDeliveries([
            {
              id: "del-1",
              orderId: "ord-1",
              customer: "Acme Corporation",
              address: "123 Business St, Cairo",
              location: [31.2457, 30.0544],
              status: "pending",
              priority: "high",
            },
            {
              id: "del-2",
              orderId: "ord-2",
              customer: "Tech Solutions Inc",
              address: "456 Tech Ave, Giza",
              location: [31.2157, 30.0244],
              status: "pending",
              priority: "medium",
            },
            {
              id: "del-3",
              orderId: "ord-3",
              customer: "Global Traders",
              address: "789 Market Rd, Cairo",
              location: [31.2257, 30.0344],
              status: "pending",
              priority: "low",
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching driver data:", error)
        toast({
          title: "Error",
          description: "Failed to load driver data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDriverData()

    // Set up interval to simulate driver movement
    const interval = setInterval(() => {
      setDriver((prev) => {
        if (!prev) return prev

        // Simulate small movement
        const newLat = prev.location[0] + (Math.random() - 0.5) * 0.001
        const newLng = prev.location[1] + (Math.random() - 0.5) * 0.001

        return {
          ...prev,
          location: [newLat, newLng],
          lastUpdated: new Date().toISOString(),
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [driverId, toast, initialDeliveries, isMounted])

  // Prepare map markers
  const mapMarkers: MapMarker[] = [
    // Driver marker
    ...(driver
      ? [
          {
            id: `driver-${driver.id}`,
            position: driver.location,
            title: `${driver.name} (${driver.vehicle})`,
            description: `Last updated: ${new Date(driver.lastUpdated).toLocaleTimeString()}`,
            icon: "driver",
          },
        ]
      : []),

    // Delivery markers
    ...deliveries.map((delivery) => ({
      id: delivery.id,
      position: delivery.location,
      title: delivery.customer,
      description: delivery.address,
      icon: "delivery",
    })),
  ]

  // Handle marker click
  const handleMarkerClick = (marker: MapMarker) => {
    const delivery = deliveries.find((d) => d.id === marker.id)
    if (delivery) {
      setSelectedDelivery(delivery)
    }
  }

  // Optimize route
  const handleOptimizeRoute = async () => {
    if (!driver || deliveries.length === 0) return

    setIsOptimizing(true)

    try {
      // In a real app, this would call a routing API
      // For demo purposes, we'll simulate it
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create a simple route (in a real app, this would be optimized)
      const waypoints = [
        driver.location,
        ...deliveries
          .sort((a, b) => {
            // Simple distance-based sorting
            const distA = calculateDistance(driver.location, a.location)
            const distB = calculateDistance(driver.location, b.location)
            return distA - distB
          })
          .map((d) => d.location),
      ]

      setOptimizedRoute({
        id: "optimized-route",
        waypoints,
        color: "#6366F1",
      })

      toast({
        title: "Route Optimized",
        description: `Optimized route with ${deliveries.length} stops`,
      })
    } catch (error) {
      console.error("Error optimizing route:", error)
      toast({
        title: "Error",
        description: "Failed to optimize route. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371 // Earth's radius in km
    const dLat = ((point2[0] - point1[0]) * Math.PI) / 180
    const dLon = ((point2[1] - point1[1]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1[0] * Math.PI) / 180) *
        Math.cos((point2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Don't render anything until mounted to avoid hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <div className={className}>
      <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">Delivery List</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <div className="space-y-4">
            {driver && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                      </div>
                    </div>
                    <Badge variant={driver.status === "active" ? "default" : "secondary"} className="capitalize">
                      {driver.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Delivery Route</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimizeRoute}
                disabled={isOptimizing || !driver || deliveries.length === 0}
              >
                {isOptimizing ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Optimize Route
                  </>
                )}
              </Button>
            </div>

            <MapView
              markers={mapMarkers}
              routes={optimizedRoute ? [optimizedRoute] : []}
              driverLocation={driver?.location}
              onMarkerClick={handleMarkerClick}
              className="h-[500px] w-full"
              optimizeRoute={true}
            />

            {selectedDelivery && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{selectedDelivery.customer}</CardTitle>
                    <Badge
                      variant={
                        selectedDelivery.priority === "high"
                          ? "destructive"
                          : selectedDelivery.priority === "medium"
                            ? "default"
                            : "outline"
                      }
                    >
                      {selectedDelivery.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{selectedDelivery.address}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>Order ID: {selectedDelivery.orderId}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>
                        Status:{" "}
                        <Badge variant="outline" className="capitalize">
                          {selectedDelivery.status.replace("_", " ")}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {deliveries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No deliveries assigned</p>
                  ) : (
                    deliveries.map((delivery) => (
                      <Card
                        key={delivery.id}
                        className={`cursor-pointer hover:bg-accent/50 transition-colors ${selectedDelivery?.id === delivery.id ? "border-primary" : ""}`}
                        onClick={() => {
                          setSelectedDelivery(delivery)
                          setActiveTab("map")
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{delivery.customer}</h4>
                              <p className="text-sm text-muted-foreground">{delivery.address}</p>
                            </div>
                            <Badge
                              variant={
                                delivery.priority === "high"
                                  ? "destructive"
                                  : delivery.priority === "medium"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {delivery.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-sm">
                            <span>Order ID: {delivery.orderId}</span>
                            <Badge variant="outline" className="capitalize">
                              {delivery.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

