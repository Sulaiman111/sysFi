"use client"

import { useState, useEffect } from "react"
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
  ArrowDownIcon,
  ArrowUpIcon,
  Loader2,
  Trash2,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvoiceView } from "@/components/invoices/invoice-view"
import invoiceService from "@/lib/api/invoice-service"
import { useToast } from "@/components/ui/use-toast"

// Update the Invoice interface to include the items property
// Update the Invoice interface to include the companyName property
interface Invoice {
  id: string
  invoiceId?: string
  customer: string
  companyName?: string  // Add this line
  customerId?: string
  phone?: number | string
  amount: number
  status: "paid" | "pending" | "overdue" | "draft"
  date: string
  dueDate: string
  type: "sales" | "purchase"
  items?: Array<{
    id: string | number
    description?: string
    productName?: string
    quantity: number
    freeQuantity?: number
    unitPrice: number
    total?: number
    totalPrice?: number
  }>
  email?: string
}

// إزالة البيانات الوهمية (initialInvoices)

export default function InvoicesPage() {
  const { toast } = useToast()
  
  // Improved hydration warning suppression
  useEffect(() => {
    // This suppresses the hydration warning caused by browser extensions
    const originalError = console.error;
    console.error = (...args) => {
      // More comprehensive list of messages to suppress
      const suppressedMessages = [
        'Hydration failed because the initial UI does not match',
        'Warning: Text content did not match',
        'A tree hydrated but some attributes',
        'Hydration failed because',
        'There was an error while hydrating',
        'Expected server HTML to contain',
        'did not match server-rendered HTML'
      ];
      
      // Check if the message contains any of the keywords
      if (typeof args[0] === 'string' && suppressedMessages.some(msg => args[0].includes(msg))) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [invoiceType, setInvoiceType] = useState<"sales" | "purchase" | "all">("all")

  useEffect(() => {
    fetchInvoices()
  }, [])

  // First, update the fetchInvoices function to extract both company name and customer name
  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const data = await invoiceService.getAllInvoices()
      const formattedData: Invoice[] = data.map((invoice: any) => {
      
      
        
        // Improved customer data handling
        let customerName = "No customer name";
        let companyName = "";
        let phoneNumber = "N/A";
        
        // Handle case where customerId is an object (not just an ID)
        if (typeof invoice.customerId === 'object' && invoice.customerId !== null) {
          try {
            // Extract both company name and customer name separately
            companyName = invoice.customerId.companyName || "";
            customerName = invoice.customerId.customerName || 
                          invoice.customerId.name || 
                          "No customer name";
            phoneNumber = invoice.customerId.phone || "N/A";
          } catch (error) {
            console.error("Error processing customer data:", error)
          }
        }
        // Handle case where customer is an object
        else if (typeof invoice.customer === 'object' && invoice.customer !== null) {
          companyName = invoice.customer.companyName || "";
          customerName = invoice.customer.customerName || 
                        invoice.customer.name || 
                        "No customer name";
          phoneNumber = invoice.customer.phone || "N/A";
        } else if (typeof invoice.customer === 'string' && invoice.customer.trim() !== '') {
          customerName = invoice.customer;
        }
        
        // Process items array - ensure it's properly formatted
        const processedItems = Array.isArray(invoice.items) ? invoice.items.map((item: any) => ({
          id: item._id || item.id || `item-${Date.now()}-${Math.random()}`,
          description: item.description || item.productName || 'No description',
          productName: item.productName || item.description || 'No name',
          quantity: Number(item.quantity) || 0,
          freeQuantity: Number(item.freeQuantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          total: Number(item.totalPrice) || Number(item.total) || 0
        })) : [];
        
       
        
        return {
          id: invoice._id || invoice.id || `temp-${Date.now()}-${Math.random()}`,
          invoiceId: invoice.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
          customer: customerName,
          companyName: companyName, // Add company name to the invoice object
          //customerId: typeof invoice.customerId === 'object' ? invoice.customerId._id : invoice.customerId,
          phone: phoneNumber,
          amount: Number(invoice.amount) || 0,
          status: invoice.status || "draft",
          date: invoice.date || new Date().toISOString(),
          dueDate: invoice.dueDate || new Date().toISOString(),
          type: invoice.type || "sales",
          items: processedItems, // Use the processed items
          email: invoice.email || ""
        };
      });
      
      setInvoices(formattedData)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again later.",
        variant: "destructive",
      })
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    try {
      await invoiceService.deleteInvoice(id)
      setInvoices(invoices.filter(invoice => invoice.id !== id))
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      })
    }
  }


  // Filter invoices based on search query, active tab, and invoice type
  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by search query
    const matchesSearch =
      (typeof invoice.customer === 'string' && invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    const matchesTab = activeTab === "all" || invoice.status === activeTab

    // Filter by invoice type
    const matchesType = invoiceType === "all" || invoice.type === invoiceType

    return matchesSearch && matchesTab && matchesType
  })

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc"
        ? (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB)
        : (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    } else if (sortBy === "dueDate") {
      const dueDateA = new Date(a.dueDate).getTime();
      const dueDateB = new Date(b.dueDate).getTime();
      return sortOrder === "asc"
        ? (isNaN(dueDateA) ? 0 : dueDateA) - (isNaN(dueDateB) ? 0 : dueDateB)
        : (isNaN(dueDateB) ? 0 : dueDateB) - (isNaN(dueDateA) ? 0 : dueDateA);
    } else if (sortBy === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    } else {
      // Sort by customer name with null/undefined handling
      const customerA = a.customer || "";
      const customerB = b.customer || "";
      return sortOrder === "asc" 
        ? customerA.localeCompare(customerB) 
        : customerB.localeCompare(customerA);
    }
  });

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header and buttons remain the same */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/invoices/salesInvoice?type=sales">
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Sales Invoice
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/invoices/purchaseInvoice?type=purchase">
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  Purchase Invoice
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and filters remain the same */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
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
              <SelectItem value="date">Issue Date</SelectItem>
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

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>Create, view, and manage your invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setInvoiceType("all")}>
                  All Invoices
                </TabsTrigger>
                <TabsTrigger value="sales" onClick={() => setInvoiceType("sales")}>
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Sales
                </TabsTrigger>
                <TabsTrigger value="purchase" onClick={() => setInvoiceType("purchase")}>
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  Purchases
                </TabsTrigger>
              </TabsList>

              <TabsList className="ml-auto">
                <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
                  All
                </TabsTrigger>
                <TabsTrigger value="draft" onClick={() => setActiveTab("draft")}>
                  Draft
                </TabsTrigger>
                <TabsTrigger value="pending" onClick={() => setActiveTab("pending")}>
                  Pending
                </TabsTrigger>
                <TabsTrigger value="paid" onClick={() => setActiveTab("paid")}>
                  Paid
                </TabsTrigger>
                <TabsTrigger value="overdue" onClick={() => setActiveTab("overdue")}>
                  Overdue
                </TabsTrigger>
              </TabsList>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {isLoading ? "Loading invoices..." : "No invoices found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {invoice.type === "purchase" ? (
                              <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            {invoice.invoiceId || invoice.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {/* Display company name */}
                              {invoice.companyName || 'No company name'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {/* Display customer name */}
                              {invoice.customer || 'No customer name'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
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
                        <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
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
                              <DropdownMenuItem onClick={() => setViewInvoice(invoice)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/invoices/${invoice.id}/edit?type=${invoice.type || 'sales'}`}>
                                  <FileTextIcon className="mr-2 h-4 w-4" />
                                  Edit Invoice
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
                              {invoice.type === "sales" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/payments/create?invoice=${invoice.id}`}>
                                    <CreditCardIcon className="mr-2 h-4 w-4" />
                                    Record Payment
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            </Tabs>
        </CardContent>
      </Card>

      {/* Invoice View Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="sm:max-w-[800px] overflow-y-auto  h-[90%] ">
          <DialogHeader>
            <DialogTitle>
              {viewInvoice?.type === "purchase" ? "Purchase Invoice" : "Sales Invoice"} {viewInvoice?.invoiceId || viewInvoice?.id}
            </DialogTitle>
            <DialogDescription>View invoice details and download as PDF.</DialogDescription>
          </DialogHeader>
          {viewInvoice && (
            <>
              {console.log("Full invoice data:", viewInvoice)}
              {console.log("Invoice items:", viewInvoice.items)}
              <InvoiceView 
                invoice={{
                  id: viewInvoice.id,
                  invoiceId: viewInvoice.invoiceId,
                  customer: viewInvoice.customer || 'No customer name',
                  email: viewInvoice.phone?.toString() || 'No email provided',
                  amount: viewInvoice.amount,
                  status: viewInvoice.status,
                  date: viewInvoice.date,
                  dueDate: viewInvoice.dueDate,
                  items: viewInvoice.items
                }} 
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

