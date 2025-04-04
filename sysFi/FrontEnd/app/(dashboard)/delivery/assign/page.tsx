"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Package, Truck, User } from "lucide-react"

// Form schema for order assignment
const formSchema = z.object({
  driverId: z.string({
    required_error: "Please select a driver",
  }),
  orderIds: z.array(z.string()).min(1, {
    message: "Please select at least one order",
  }),
})

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

export default function AssignOrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [availableDrivers, setAvailableDrivers] = useState<typeof drivers>([])
  const [pendingOrders, setPendingOrders] = useState<typeof orders>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMapPreview, setShowMapPreview] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driverId: "",
      orderIds: [],
    },
  })

  // Set mounted state and initialize data
  useEffect(() => {
    setIsMounted(true)
    setAvailableDrivers(drivers.filter((d) => d.status === "available"))
    setPendingOrders(orders.filter((o) => o.status === "ready"))
  }, [])

  const selectedDriverId = form.watch("driverId")
  const selectedOrderIds = form.watch("orderIds")

  // Get selected driver details
  const selectedDriver = availableDrivers.find((d) => d.id === selectedDriverId)

  // Get selected orders
  const selectedOrders = pendingOrders.filter((o) => selectedOrderIds.includes(o.id))

  // Enable map preview when client-side rendering is available
  useEffect(() => {
    if (isMounted && selectedDriver && selectedOrders.length > 0) {
      setShowMapPreview(true)
    } else {
      setShowMapPreview(false)
    }
  }, [isMounted, selectedDriver, selectedOrders.length])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success message
      toast({
        title: "Orders assigned successfully",
        description: `${selectedOrders.length} orders assigned to ${selectedDriver?.name}`,
      })

      // Redirect to map view with the assigned orders and driver
      router.push(`/delivery/map?driver=${values.driverId}&orders=${values.orderIds.join(",")}`)
    } catch (error) {
      toast({
        title: "Error assigning orders",
        description: "An error occurred while assigning orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render anything until mounted to avoid hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDrivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              <div className="flex items-center">
                                <span>{driver.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">({driver.vehicle})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            {selectedDriver && (
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Driver Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedDriver.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedDriver.vehicle}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Available
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="orderIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Select Orders</FormLabel>
                      </div>
                      <ScrollArea className="h-[300px] rounded-md border p-2">
                        {pendingOrders.map((order) => (
                          <FormField
                            key={order.id}
                            control={form.control}
                            name="orderIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={order.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 p-2 mb-2 rounded-md hover:bg-muted"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(order.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, order.id])
                                          : field.onChange(field.value?.filter((value) => value !== order.id))
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none w-full">
                                    <div className="flex justify-between items-center">
                                      <FormLabel className="font-medium cursor-pointer">{order.customer}</FormLabel>
                                      <Badge
                                        variant={
                                          order.priority === "high"
                                            ? "destructive"
                                            : order.priority === "medium"
                                              ? "default"
                                              : "outline"
                                        }
                                        className="ml-auto"
                                      >
                                        {order.priority}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <MapPin className="h-3.5 w-3.5 mr-1" />
                                      {order.address}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="flex items-center">
                                        <Package className="h-3.5 w-3.5 mr-1" />
                                        {order.items} items
                                      </span>
                                      <span className="text-muted-foreground">Sales Rep: {order.salesRep}</span>
                                    </div>
                                  </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Map preview - only shown client-side */}
      {showMapPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Map Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Dynamic import of MapView component */}
            {isMounted && (
              <div className="h-[400px] w-full bg-muted flex items-center justify-center rounded-md">
                <p className="text-center text-muted-foreground">Map preview will be available after assignment</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedOrderIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Selected Driver</p>
                <p className="text-2xl font-bold">{selectedDriver?.name || "None"}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{selectedOrderIds.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{selectedOrders.reduce((sum, order) => sum + order.items, 0)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting || !selectedDriverId || selectedOrderIds.length === 0}
            >
              {isSubmitting ? "Assigning..." : "Confirm Assignment & View Map"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

