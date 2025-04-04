"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Truck, User } from "lucide-react"

// Mock data for drivers
const initialDrivers = [
  {
    id: "driver-1",
    name: "Ahmed Hassan",
    vehicle: "Toyota Hilux",
    status: "active",
    phone: "+20 123 456 7890",
    location: "Cairo",
    deliveries: 12,
  },
  {
    id: "driver-2",
    name: "Mohammed Ali",
    vehicle: "Ford Transit",
    status: "active",
    phone: "+20 123 456 7891",
    location: "Giza",
    deliveries: 8,
  },
  {
    id: "driver-3",
    name: "Khaled Omar",
    vehicle: "Isuzu NPR",
    status: "inactive",
    phone: "+20 123 456 7892",
    location: "Alexandria",
    deliveries: 0,
  },
  {
    id: "driver-4",
    name: "Samir Nabil",
    vehicle: "Mitsubishi Fuso",
    status: "active",
    phone: "+20 123 456 7893",
    location: "Cairo",
    deliveries: 5,
  },
]

export default function DriversPage() {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [filter, setFilter] = useState("all")

  const filteredDrivers = filter === "all" ? drivers : drivers.filter((driver) => driver.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
            Active
          </Button>
          <Button variant={filter === "inactive" ? "default" : "outline"} onClick={() => setFilter("inactive")}>
            Inactive
          </Button>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{driver.name}</CardTitle>
                <Badge variant={driver.status === "active" ? "default" : "secondary"}>{driver.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{driver.phone}</p>
                    <div className="flex items-center mt-1">
                      <Truck className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span className="text-sm">{driver.vehicle}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-muted rounded-md text-center">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{driver.location}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-md text-center">
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                    <p className="font-medium">{driver.deliveries}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Assign Orders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

