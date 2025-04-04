"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, Building, CreditCard, Edit, FileText, Mail, MapPin, Phone, User } from "lucide-react"
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ViewOnlyMap from "@/components/map/view-only-map"

//import { console } from "inspector"
// Define API base URL - update this to match your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Define interfaces for the data
// تعديل واجهة Supplier لتتوافق مع هيكل البيانات الخاص بك
interface Supplier {
  _id: string;
  supplierName: string;
  companyName: string;
  supplierType: "Super Market" | "Mall" | "Individual" | "Company" | "Government" | "Hospital" | "organization";
  phone: string;
  email?: string;
  location: string;
  geographicalLocation: string;
  notes: string;
  status?: "active" | "inactive" | "pending" | "overdue" | "unpaid";
  createdAt: string;
  updatedAt: string;
  balanceDue?: number;
  contactPerson?: string;
}

interface Invoice {
  _id: string;
  supplierId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  items: any[];
}

interface Payment {
  _id: string;
  supplierId: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: "credit_card" | "bank_transfer" | "cash";
  notes: string;
}

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = params.id as string

  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${API_BASE_URL}/suppliers/${supplierId}`)
        setSupplier(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching supplier:", err)
        setError("Failed to load supplier data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupplierData()
  }, [supplierId])

  // Fetch invoices and payments
  useEffect(() => {
    const fetchInvoicesAndPayments = async () => {
      try {
        // Fetch invoices
        //const invoicesResponse = await axios.get(`${API_BASE_URL}/suppliers/${supplierId}/invoices`)
        const invoicesResponse = await axios.get(`${API_BASE_URL}/invoices/supplier/${supplierId}`)
        console.log("Invoices response:", invoicesResponse.data) // Changed from console.error to console.log

        setInvoices(invoicesResponse.data)
     
        // Fetch payments
        const paymentsResponse = await axios.get(`${API_BASE_URL}/suppliers/${supplierId}/payments`)
        setPayments(paymentsResponse.data)
      } catch (err) {
        console.error("Error fetching invoices or payments:", err)
        // We don't set the main error state here to still show supplier data
      }
    }

    if (supplier) {
      fetchInvoicesAndPayments()
    }
  }, [supplierId, supplier])

  // Calculate statistics
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balanceDue = totalInvoiced - totalPaid
  const averageInvoiceAmount = invoices.length > 0 ? totalInvoiced / invoices.length : 0

  const handleEditSupplier = async (updatedSupplierData: any) => {
    setIsLoading(true)
    try {
      const response = await axios.put(`${API_BASE_URL}/suppliers/${supplierId}`, updatedSupplierData)
      setSupplier(response.data)
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error("Error updating supplier:", err)
      alert("Failed to update supplier. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (isLoading && !supplier) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 pt-6 md:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading supplier data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 pt-6 md:p-8">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-md">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // If supplier is null but not loading or error, something went wrong
  if (!supplier) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 pt-6 md:p-8">
        <div className="text-center">
          <div className="bg-amber-100 text-amber-800 p-4 rounded-md">
            <h3 className="font-bold">Supplier Not Found</h3>
            <p>The requested supplier could not be found.</p>
          </div>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // استخدام supplierName مباشرة بدلاً من firstName و lastName
  const fullName = supplier.supplierName || 'Supplier';

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Supplier Details</h2>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Supplier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
            <CardDescription>View and manage supplier details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`}
                  alt={fullName}
                />
                <AvatarFallback>
                  {supplier.supplierName ? supplier.supplierName[0] : 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{supplier.companyName}</p>
                <div className="mt-2">
                  <Badge
                    variant={
                      supplier.status === "active"
                        ? "default"
                        : supplier.status === "inactive"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {supplier.status || "active"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              {supplier.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{supplier.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{supplier.companyName}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{supplier.location}</p>
                </div>
              </div>
              {supplier.contactPerson && (
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contact Person</p>
                    <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Location Map */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Location</h4>
              <div className="h-[200px] w-full rounded-md overflow-hidden border">
                {supplier.geographicalLocation ? (
                  <ViewOnlyMap 
                    value={
                      typeof supplier.geographicalLocation === 'string' 
                        ? (() => {
                            try {
                              // For debugging
                              console.log("Raw geographical location:", supplier.geographicalLocation);
                              
                              // If it's already a valid location object in string form
                              if (supplier.geographicalLocation.includes("lat") && 
                                  supplier.geographicalLocation.includes("lng")) {
                                return JSON.parse(supplier.geographicalLocation);
                              }
                              
                              // If it's a comma-separated lat,lng format
                              const parts = supplier.geographicalLocation.split(',');
                              if (parts.length === 2) {
                                const lat = parseFloat(parts[0].trim());
                                const lng = parseFloat(parts[1].trim());
                                if (!isNaN(lat) && !isNaN(lng)) {
                                  return { lat, lng };
                                }
                              }
                              
                              // If we can't parse it, return null
                              return null;
                            } catch (error) {
                              console.error("Error handling geographical location:", error);
                              return null;
                            }
                          })()
                        : supplier.geographicalLocation
                    } 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <p className="text-sm text-muted-foreground">No location data available</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {supplier.location}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{supplier.notes || "No notes available"}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Supplier Since</h4>
              <p className="text-sm">{formatDate(supplier.createdAt)}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Last Updated</h4>
              <p className="text-sm">{formatDate(supplier.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Supplier Overview</CardTitle>
            <CardDescription>Financial summary and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="p-4">
                  <CardDescription>Supplier Type</CardDescription>
                  <CardTitle className="text-2xl">{supplier.supplierType}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardDescription>Balance Due</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(balanceDue)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardDescription>Total Invoiced</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(totalInvoiced)}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="p-4">
                  <CardDescription>Total Paid</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(totalPaid)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardDescription>Average Invoice</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(averageInvoiceAmount)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardDescription>Invoice Count</CardDescription>
                  <CardTitle className="text-2xl">{invoices.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Tabs defaultValue="invoices">
              <TabsList className="mb-4">
                <TabsTrigger value="invoices">
                  <FileText className="mr-2 h-4 w-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invoices" className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Recent Invoices</h3>
                  <Button variant="outline" asChild>
                    <Link href={`/invoices/create?supplier=${supplierId}`}>Create Invoice</Link>
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "pending"
                                  ? "secondary"
                                  : invoice.status === "draft"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/invoices/${invoice._id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href={`/invoices?supplier=${supplierId}`}>View All Invoices</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Recent Payments</h3>
                  <Button variant="outline" asChild>
                    <Link href={`/payments/create?supplier=${supplierId}`}>Record Payment</Link>
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-medium">{payment._id}</TableCell>
                        <TableCell>{payment.invoiceId}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>
                              {payment.method === "credit_card"
                                ? "💳"
                                : payment.method === "bank_transfer"
                                  ? "🏦"
                                  : "🅿️"}
                            </span>
                            <span className="capitalize">{payment.method.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/payments/${payment._id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href={`/payments?supplier=${supplierId}`}>View All Payments</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>Update the supplier details below.</DialogDescription>
          </DialogHeader>
          <SupplierForm
            supplier={supplier}
            onSubmit={handleEditSupplier}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

