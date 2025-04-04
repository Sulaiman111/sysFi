import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, SearchIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface Delivery {
  id: string
  orderId: string
  customer: string
  address: string
  status: "pending" | "in_transit" | "delivered" | "failed" | "returned"
  dispatchDate: string
  estimatedDelivery: string
  carrier: string
  trackingNumber: string
}

const deliveries: Delivery[] = [
  {
    id: "DEL-2305-1001",
    orderId: "ORD-2305-1001",
    customer: "Olivia Martin",
    address: "123 Main St, Anytown, CA 12345",
    status: "in_transit",
    dispatchDate: "2023-05-04",
    estimatedDelivery: "2023-05-06",
    carrier: "Express Logistics",
    trackingNumber: "EL123456789",
  },
  {
    id: "DEL-2305-1002",
    orderId: "ORD-2305-1002",
    customer: "Jackson Lee",
    address: "456 Oak Ave, Somewhere, NY 67890",
    status: "pending",
    dispatchDate: "2023-05-05",
    estimatedDelivery: "2023-05-07",
    carrier: "Swift Delivery",
    trackingNumber: "SD987654321",
  },
  {
    id: "DEL-2305-1003",
    orderId: "ORD-2305-1003",
    customer: "Isabella Nguyen",
    address: "789 Pine Rd, Elsewhere, TX 54321",
    status: "delivered",
    dispatchDate: "2023-05-02",
    estimatedDelivery: "2023-05-04",
    carrier: "Express Logistics",
    trackingNumber: "EL567891234",
  },
  {
    id: "DEL-2305-1004",
    orderId: "ORD-2305-1004",
    customer: "William Kim",
    address: "321 Cedar Ln, Nowhere, FL 13579",
    status: "failed",
    dispatchDate: "2023-05-01",
    estimatedDelivery: "2023-05-03",
    carrier: "Swift Delivery",
    trackingNumber: "SD432156789",
  },
  {
    id: "DEL-2305-1005",
    orderId: "ORD-2305-1005",
    customer: "Sofia Davis",
    address: "654 Maple Dr, Anywhere, WA 97531",
    status: "returned",
    dispatchDate: "2023-04-30",
    estimatedDelivery: "2023-05-02",
    carrier: "Express Logistics",
    trackingNumber: "EL789123456",
  },
]

export default function DeliveriesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Delivery Tracking</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Delivery
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search deliveries..." className="pl-8" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Management</CardTitle>
          <CardDescription>Track and manage all your deliveries in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dispatch Date</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{delivery.customer}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{delivery.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
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
                  </TableCell>
                  <TableCell>{formatDate(delivery.dispatchDate)}</TableCell>
                  <TableCell>{formatDate(delivery.estimatedDelivery)}</TableCell>
                  <TableCell>{delivery.carrier}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/deliveries/${delivery.id}`}>Track</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

