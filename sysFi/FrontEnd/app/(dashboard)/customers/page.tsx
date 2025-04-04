"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { invoiceService } from "@/lib/api/invoice-service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  FileTextIcon,
  CreditCardIcon,
  UserIcon,
  TrashIcon,
  PencilIcon,
  PrinterIcon,
  FilterIcon,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { CustomerForm } from "@/components/customers/customer-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Update Customer interface to match database schema
interface Customer {
  _id: string;
  customerName: string;
  companyName: string;
  customerType: string;
  phone: string;
  email?: string;
  location: string;
  geographicalLocation?: string;
  notes?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  balanceDue?: number;
  contactPerson?: string;
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  salutation?: string;
  // New financial fields
  totalSpent?: number;
  avgInvoice?: number;
  avgPayment?: number;
  lastInvoice?: string;
  lastPayment?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [filterField, setFilterField] = useState<"all" | "name" | "company" | "receivables" | "credits" | "created" | "modified">("all")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Fetch customers from the database
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${API_BASE_URL}/customers`)
        
        // Process customers with financial data
        // Import invoice service at the top of the file
      
        
        // Inside the fetchCustomers function
        const customersWithFinancialData = await Promise.all(
          response.data.map(async (customer: Customer) => {
            try {
              // Get customer invoices using invoice service
              const invoices = await invoiceService.getInvoicesByCustomerId(customer._id);
              console.log(`Invoices for customer ${customer._id}:`, invoices);
              
              // Get customer payments
              const paymentsResponse = await axios.get(`${API_BASE_URL}/customers/${customer._id}/payments`);
              const payments = paymentsResponse.data;
              
              // Calculate financial metrics
              const totalSpent = invoices.reduce((sum: number, invoice: any) => 
                sum + (invoice.amount || 0), 0);
              
              const totalPayments = payments.reduce((sum: number, payment: any) => 
                sum + (payment.amount || 0), 0)
              
              const avgInvoice = invoices.length > 0 
                ? totalSpent / invoices.length 
                : 0
              
              const avgPayment = payments.length > 0 
                ? totalPayments / payments.length 
                : 0
              
              // Get dates for last invoice and payment
              const lastInvoice = invoices.length > 0 
                ? invoices.sort((a: any, b: any) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0].date 
                : null
              
              const lastPayment = payments.length > 0 
                ? payments.sort((a: any, b: any) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0].date 
                : null
              
              // Calculate balance due (total invoices - total payments)
              const balanceDue = totalSpent - totalPayments
              
              return {
                ...customer,
                totalSpent,
                balanceDue,
                avgInvoice,
                avgPayment,
                lastInvoice,
                lastPayment
              }
            } catch (err) {
              console.error(`Error fetching financial data for customer ${customer._id}:`, err)
              return {
                ...customer,
                totalSpent: 0,
                balanceDue: 0,
                avgInvoice: 0,
                avgPayment: 0,
                lastInvoice: null,
                lastPayment: null
              }
            }
          })
        )
        
        setCustomers(customersWithFinancialData)
        setError(null)
      } catch (err) {
        console.error("Error fetching customers:", err)
        setError("Failed to load customers. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Helper function to get the display label for filter fields
  const getFilterFieldLabel = (field: string): string => {
    switch (field) {
      case "name": return "Name";
      case "company": return "Company Name";
      case "receivables": return "Receivables";
      case "credits": return "Unused Credits";
      case "created": return "Created Time";
      case "modified": return "Last Modified Time";
      default: return "All";
    }
  }

  // Apply both search filter and field-specific sorting
  const filteredCustomers = customers
    .filter((customer) => {
      // Apply search filter
      const matchesSearch = 
        (customer.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (customer.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      // Apply status filter
      const matchesStatus = 
        filterStatus === "all" || 
        customer.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (filterField === "all") return 0;
      
      let valueA, valueB;
      
      switch (filterField) {
        case "name":
          valueA = a.customerName || '';
          valueB = b.customerName || '';
          break;
        case "company":
          valueA = a.companyName || '';
          valueB = b.companyName || '';
          break;
        case "receivables":
          valueA = a.balanceDue || 0;
          valueB = b.balanceDue || 0;
          break;
        case "credits":
          // Assuming unused credits is the negative of balance for this example
          valueA = -(a.balanceDue || 0);
          valueB = -(b.balanceDue || 0);
          break;
        case "created":
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case "modified":
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }
      
      // For string comparisons
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === "asc" 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // For number comparisons
      return sortDirection === "asc" 
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

  // Create a new customer
  const handleCreateCustomer = async (data: any) => {
    try {
      setIsLoading(true)
      
      // Create customer data structure according to the form fields
      const customerData = {
        // Combine salutation, first name and last name for customerName
        customerName: `${data.salutation || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim(),
        // Store individual name components
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        salutation: data.salutation || '',
        // Store customer type directly
        customerType: data.customerType || 'Individual',
        // Store phone number
        phone: data.phone || '',
        // Store ID number
        idNumber: data.idNumber || '',
        // Store location from address field
        location: data.address || '',
        // Store geographical location from map coordinates
        geographicalLocation: data.geographicalLocation || '',
        // Store notes
        notes: data.notes || '',
        // Set default company name - this is required by the backend
        companyName: data.company || 'Default Company',
        // Set active status by default
        status: 'active'
      }
      
      // Ensure all required fields have values to prevent 500 errors
      if (!customerData.customerName) customerData.customerName = 'New Customer';
      if (!customerData.location) customerData.location = 'Not specified';
      if (!customerData.geographicalLocation) customerData.geographicalLocation = '0,0';
      
      console.log("Sending customer data:", JSON.stringify(customerData, null, 2));
      
      try {
        const response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/customers`,
          data: customerData,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log("Server response success:", response.data);
        setCustomers([...customers, response.data]);
        setIsCreateDialogOpen(false);
      } catch (axiosError: any) {
        console.error("Error details:", axiosError);
        
        if (axiosError.response) {
          console.error("Status:", axiosError.response.status);
          console.error("Data:", axiosError.response.data);
          console.error("Headers:", axiosError.response.headers);
        } else if (axiosError.request) {
          console.error("Request was made but no response received:", axiosError.request);
        } else {
          console.error("Error setting up request:", axiosError.message);
        }
        
        throw new Error(`Server error: ${axiosError.response?.data?.message || axiosError.message || "Failed to create customer"}`);
      }
    } catch (err: any) {
      console.error("Error creating customer:", err);
      alert(`Failed to create customer: ${err.message}. Please check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  }

  // Update an existing customer
  const handleEditCustomer = async (data: any) => {
    if (currentCustomer) {
      try {
        setIsLoading(true)
        // Format the data to match the API expectations
        const customerData = {
          // Combine salutation, first name and last name for customerName
          customerName: `${data.salutation || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim(),
          // Store individual name components
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          salutation: data.salutation || '',
          // Store customer type directly
          customerType: data.customerType || 'Individual',
          // Store phone number
          phone: data.phone || '',
          // Store ID number
          idNumber: data.idNumber || currentCustomer.idNumber,
          // Store location from address field
          location: data.address || currentCustomer.location,
          // Store geographical location from map coordinates
          geographicalLocation: data.geographicalLocation || currentCustomer.geographicalLocation,
          // Store notes
          notes: data.notes || currentCustomer.notes,
          // Set company name
          companyName: data.customerType === "Company" ? data.company || `Default Company` : currentCustomer.companyName,
          // Keep email if available
          email: data.email || currentCustomer.email,
          // Keep contact person if available
          contactPerson: data.contactPerson || currentCustomer.contactPerson
        }
        
        const response = await axios.put(`${API_BASE_URL}/customers/${currentCustomer._id}`, customerData)
        setCustomers(customers.map((c) => (c._id === response.data._id ? response.data : c)))
        setIsEditDialogOpen(false)
        setCurrentCustomer(null)
      } catch (err) {
        console.error("Error updating customer:", err)
        alert("Failed to update customer. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Delete a customer
  const handleDeleteCustomer = async () => {
    if (currentCustomer) {
      try {
        setIsLoading(true)
        await axios.delete(`${API_BASE_URL}/customers/${currentCustomer._id}`)
        setCustomers(customers.filter((c) => c._id !== currentCustomer._id))
        setIsDeleteDialogOpen(false)
        setCurrentCustomer(null)
      } catch (err) {
        console.error("Error deleting customer:", err)
        alert("Failed to delete customer. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const openEditDialog = (customer: Customer) => {
    setCurrentCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (customer: Customer) => {
    setCurrentCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const printAllCustomers = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>All Customers</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>All Customers</h1>
            <table>
              <thead>
                <tr>
                  <th>Customer Info</th>
                  <th>Total Spent</th>
                  <th>Balance</th>
                  <th>Avg. Invoice</th>
                  <th>Avg. Payment</th>
                  <th>Last Invoice</th>
                  <th>Last Payment</th>
                </tr>
              </thead>
              <tbody>
                ${filteredCustomers.map(customer => `
                  <tr>
                    <td>
                      <div><strong>${customer.customerName}</strong></div>
                      <div>${customer.companyName}</div>
                      <div>${customer.phone}</div>
                    </td>
                    <td>${formatCurrency(customer.totalSpent || 0)}</td>
                    <td>${formatCurrency(customer.balanceDue || 0)}</td>
                    <td>${formatCurrency(customer.avgInvoice || 0)}</td>
                    <td>${formatCurrency(customer.avgPayment || 0)}</td>
                    <td>${customer.lastInvoice ? formatDate(customer.lastInvoice) : 'N/A'}</td>
                    <td>${customer.lastPayment ? formatDate(customer.lastPayment) : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const printSelectedCustomers = () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer to print')
      return
    }

    const selectedCustomersData = filteredCustomers.filter(customer => 
      selectedCustomers.includes(customer._id)
    )

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Selected Customers</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Selected Customers</h1>
            <table>
              <thead>
                <tr>
                  <th>Customer Info</th>
                  <th>Total Spent</th>
                  <th>Balance</th>
                  <th>Avg. Invoice</th>
                  <th>Avg. Payment</th>
                  <th>Last Invoice</th>
                  <th>Last Payment</th>
                </tr>
              </thead>
              <tbody>
                ${selectedCustomersData.map(customer => `
                  <tr>
                    <td>
                      <div><strong>${customer.customerName}</strong></div>
                      <div>${customer.companyName}</div>
                      <div>${customer.phone}</div>
                    </td>
                    <td>${formatCurrency(customer.totalSpent || 0)}</td>
                    <td>${formatCurrency(customer.balanceDue || 0)}</td>
                    <td>${formatCurrency(customer.avgInvoice || 0)}</td>
                    <td>${formatCurrency(customer.avgPayment || 0)}</td>
                    <td>${customer.lastInvoice ? formatDate(customer.lastInvoice) : 'N/A'}</td>
                    <td>${customer.lastPayment ? formatDate(customer.lastPayment) : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Loading state
  if (isLoading && customers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 pt-6 md:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && customers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 pt-6 md:p-8">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-md">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0 md:space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setFilterStatus}>
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={printAllCustomers}>
                Print All Customers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={printSelectedCustomers}>
                Print Selected Customers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>All Customers</CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterField("name")}>
                  Name {filterField === "name" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterField("company")}>
                  Company Name {filterField === "company" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterField("receivables")}>
                  Receivables {filterField === "receivables" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterField("credits")}>
                  Unused Credits {filterField === "credits" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterField("created")}>
                  Created Time {filterField === "created" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterField("modified")}>
                  Last Modified Time {filterField === "modified" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setFilterField("all")
                  setSortDirection("asc")
                }}>
                  Reset Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {filterField !== "all" && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{getFilterFieldLabel(filterField)}</Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setFilterField("all")
                  setSortDirection("asc")
                }}
              >
                <span className="sr-only">Clear filter</span>
                ×
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers(filteredCustomers.map(c => c._id))
                      } else {
                        setSelectedCustomers([])
                      }
                    }}
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Avg. Invoice</TableHead>
                <TableHead>Avg. Payment</TableHead>
                <TableHead>Last Invoice</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selectedCustomers.includes(customer._id)}
                        onChange={() => toggleCustomerSelection(customer._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-sm text-muted-foreground">{customer.companyName}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(customer.totalSpent || 0)}</TableCell>
                    <TableCell>{formatCurrency(customer.balanceDue || 0)}</TableCell>
                    <TableCell>{formatCurrency(customer.avgInvoice || 0)}</TableCell>
                    <TableCell>{formatCurrency(customer.avgPayment || 0)}</TableCell>
                    <TableCell>{customer.lastInvoice ? formatDate(customer.lastInvoice) : 'N/A'}</TableCell>
                    <TableCell>{customer.lastPayment ? formatDate(customer.lastPayment) : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "active"
                            ? "default"
                            : customer.status === "inactive"
                              ? "secondary"
                              : customer.status === "overdue"
                                ? "destructive"
                                : customer.status === "unpaid"
                                  ? "outline"
                                  : "outline"
                        }
                      >
                        {customer.status || "active"}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer._id}`}>
                              <UserIcon className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices?customer=${customer._id}`}>
                              <FileTextIcon className="mr-2 h-4 w-4" />
                              View Invoices
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/payments?customer=${customer._id}`}>
                              <CreditCardIcon className="mr-2 h-4 w-4" />
                              View Payments
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(customer)}
                            className="text-destructive focus:text-destructive"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
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

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]  max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter the customer details below to create a new customer.</DialogDescription>
          </DialogHeader>
          <CustomerForm onSubmit={handleCreateCustomer} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update the customer details below.</DialogDescription>
          </DialogHeader>
          {currentCustomer && (
            <CustomerForm
              customer={{
                id: currentCustomer._id,
                firstName: currentCustomer.firstName || '',
                lastName: currentCustomer.lastName || '',
                name: currentCustomer.customerName,
                email: currentCustomer.email || '',
                phone: currentCustomer.phone,
                idNumber: currentCustomer.idNumber || '',
                salutation: currentCustomer.salutation as any || 'Mr.',
                customerType: currentCustomer.customerType as any,
                company: currentCustomer.companyName,
                status: currentCustomer.status as any || 'active',
                address: currentCustomer.location,
                notes: currentCustomer.notes || '',
                // These fields might not be available in your database schema
                // but are required by the form component
                totalSpent: 0,
                balance: currentCustomer.balanceDue || 0,
                avgInvoice: 0,
                avgPayment: 0,
                lastInvoice: '',
                lastPayment: '',
                createdAt: currentCustomer.createdAt
              }}
              onSubmit={handleEditCustomer}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

