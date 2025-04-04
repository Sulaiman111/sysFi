"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  FileTextIcon,
  DownloadIcon,
  SendIcon,
  EyeIcon,
  CreditCardIcon,
  Printer ,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderView } from "@/components/orders/order-view"
import { Checkbox } from "@/components/ui/checkbox"

interface OrderItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  total: number
  bonus?: number // إضافة خانة للبونص
}

interface Order {
  id: string
  customer: string
  email: string
  amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  date: string
  dueDate: string
  orderType: "online" | "offline"
  paymentStatus: "paid" | "unpaid"
  items: OrderItem[] // إضافة الأصناف المطلوبة
}

const initialOrders: Order[] = [
  {
    id: "ORD-2305-1001",
    customer: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: 1999.0,
    status: "processing",
    date: "2023-05-04",
    dueDate: "2023-05-11",
    orderType: "online",
    paymentStatus: "paid",
    items: [
      {
        id: 1,
        description: "Product A",
        quantity: 2,
        unitPrice: 500.0,
        total: 1000.0,
        bonus: 5,
      },
      {
        id: 2,
        description: "Product B",
        quantity: 1,
        unitPrice: 999.0,
        total: 999.0,
      },
    ],
  },
  {
    id: "ORD-2305-1002",
    customer: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: 39.0,
    status: "pending",
    date: "2023-05-03",
    dueDate: "2023-05-10",
    orderType: "offline",
    paymentStatus: "unpaid",
    items: [
      {
        id: 3,
        description: "Product C",
        quantity: 3,
        unitPrice: 100.0,
        total: 300.0,
      },
    ],
  },
  {
    id: "ORD-2305-1003",
    customer: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: 299.0,
    status: "shipped",
    date: "2023-05-02",
    dueDate: "2023-05-09",
    orderType: "online",
    paymentStatus: "paid",
    items: [
      {
        id: 4,
        description: "Product D",
        quantity: 1,
        unitPrice: 299.0,
        total: 299.0,
      },
    ],
  },
  {
    id: "ORD-2305-1004",
    customer: "William Kim",
    email: "will@email.com",
    amount: 99.0,
    status: "cancelled",
    date: "2023-04-28",
    dueDate: "2023-05-05",
    orderType: "online",
    paymentStatus: "unpaid",
    items: [
      {
        id: 5,
        description: "Product E",
        quantity: 2,
        unitPrice: 49.5,
        total: 99.0,
      },
    ],
  },
  {
    id: "ORD-2305-1005",
    customer: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: 450.0,
    status: "delivered",
    date: "2023-04-26",
    dueDate: "2023-05-03",
    orderType: "offline",
    paymentStatus: "paid",
    items: [
      {
        id: 6,
        description: "Product F",
        quantity: 3,
        unitPrice: 150.0,
        total: 450.0,
      },
    ],
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  // Filter orders based on search query and active tab
  const filteredOrders = orders.filter((order) => {
    // Filter by search query
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    return matchesSearch && order.status === activeTab
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortBy === "dueDate") {
      return sortOrder === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    } else if (sortBy === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
    } else {
      // Sort by customer name
      return sortOrder === "asc" ? a.customer.localeCompare(b.customer) : b.customer.localeCompare(a.customer)
    }
  })

  // Handle order selection
  const handleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
    )
  }

  // Handle printing selected orders
  const handlePrintSelectedOrders = () => {
    const selected = orders.filter((order) => selectedOrders.includes(order.id))
    console.log("Printing selected orders:", selected)
    // هنا يمكنك إضافة منطق الطباعة
  }

  // Handle printing all quantities
  const handlePrintAllQuantities = () => {
    const allItems = orders.flatMap((order) => order.items)
    const quantities = allItems.reduce((acc, item) => {
      acc[item.description] = (acc[item.description] || 0) + item.quantity
      return acc
    }, {} as Record<string, number>)
    console.log("Printing all quantities:", quantities)
    // هنا يمكنك إضافة منطق الطباعة
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/orders/create">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Order Date</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Create, view, and manage your orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrintSelectedOrders}
                disabled={selectedOrders.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Selected Orders
              </Button>
              <Button variant="outline" onClick={handlePrintAllQuantities}>
                <Printer className="mr-2 h-4 w-4" />
                Print All Quantities
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selectedOrders.length === sortedOrders.length}
                    onCheckedChange={() => {
                      if (selectedOrders.length === sortedOrders.length) {
                        setSelectedOrders([])
                      } else {
                        setSelectedOrders(sortedOrders.map((order) => order.id))
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => handleSelectOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div>{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{formatDate(order.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "processing"
                              ? "secondary"
                              : order.status === "shipped"
                                ? "outline"
                                : order.status === "cancelled"
                                  ? "destructive"
                                  : "pending"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.paymentStatus === "paid" ? "default" : "destructive"}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.orderType === "online" ? "default" : "secondary"}>
                        {order.orderType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setViewOrder(order)}>
                            <EyeIcon className="mr-2 h-4 w-4 " />
                            View Order
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/orders/${order.id}/edit`}>
                              <FileTextIcon className="mr-2 h-4 w-4" />
                              Edit Order
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <SendIcon className="mr-2 h-4 w-4" />
                            Send Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/payments/create?order=${order.id}`}>
                              <CreditCardIcon className="mr-2 h-4 w-4" />
                              Record Payment
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order View Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[800px] h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Order {viewOrder?.id}</DialogTitle>
            <DialogDescription>View order details and download as PDF.</DialogDescription>
          </DialogHeader>
          {viewOrder && <OrderView order={viewOrder} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}