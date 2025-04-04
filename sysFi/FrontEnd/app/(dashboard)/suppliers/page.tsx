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
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Update Supplier interface to match database schema
interface Supplier {
  _id: string;
  supplierName: string;
  companyName: string;
  supplierType: string;
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
  avgExpense?: number;
  lastInvoice?: string;
  lastExpense?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [filterField, setFilterField] = useState<"all" | "name" | "company" | "receivables" | "credits" | "created" | "modified">("all")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Fetch suppliers from the database
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${API_BASE_URL}/suppliers`)
        
        // Process suppliers with financial data
        // Import invoice service at the top of the file
      
        
        // Inside the fetchSuppliers function
        const suppliersWithFinancialData = await Promise.all(
          response.data.map(async (supplier: Supplier) => {
            try {
              // Get supplier invoices using invoice service
              const invoices = await invoiceService.getInvoicesBySupplierId(supplier._id);
              console.log(`Invoices for supplier ${supplier._id}:`, invoices);
              
              // Get supplier expenses
              const expensesResponse = await axios.get(`${API_BASE_URL}/suppliers/${supplier._id}/expenses`);
              const expenses = expensesResponse.data;
              
              // Calculate financial metrics
              const totalSpent = invoices.reduce((sum: number, invoice: any) => 
                sum + (invoice.amount || 0), 0);
              
              const totalExpenses = expenses.reduce((sum: number, expense: any) => 
                sum + (expense.amount || 0), 0)
              
              const avgInvoice = invoices.length > 0 
                ? totalSpent / invoices.length 
                : 0
              
              const avgExpense = expenses.length > 0 
                ? totalExpenses / expenses.length 
                : 0
              
              // Get dates for last invoice and expense
              const lastInvoice = invoices.length > 0 
                ? invoices.sort((a: any, b: any) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0].date 
                : null
              
              const lastExpense = expenses.length > 0 
                ? expenses.sort((a: any, b: any) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0].date 
                : null
              
              // Calculate balance due (total invoices - total expenses)
              const balanceDue = totalSpent - totalExpenses
              
              return {
                ...supplier,
                totalSpent,
                balanceDue,
                avgInvoice,
                avgExpense,
                lastInvoice,
                lastExpense
              }
            } catch (err) {
              console.error(`Error fetching financial data for supplier ${supplier._id}:`, err)
              return {
                ...supplier,
                totalSpent: 0,
                balanceDue: 0,
                avgInvoice: 0,
                avgExpense: 0,
                lastInvoice: null,
                lastExpense: null
              }
            }
          })
        )
        
        setSuppliers(suppliersWithFinancialData)
        setError(null)
      } catch (err) {
        console.error("Error fetching suppliers:", err)
        setError("Failed to load suppliers. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuppliers()
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
  const filteredSuppliers = suppliers
    .filter((supplier) => {
      // Apply search filter
      const matchesSearch = 
        (supplier.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (supplier.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      // Apply status filter
      const matchesStatus = 
        filterStatus === "all" || 
        supplier.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (filterField === "all") return 0;
      
      let valueA, valueB;
      
      switch (filterField) {
        case "name":
          valueA = a.supplierName || '';
          valueB = b.supplierName || '';
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

  // Create a new supplier
  const handleCreateSupplier = async (data: any) => {
    try {
      setIsLoading(true)
      
      // Create supplier data structure according to the form fields
      const supplierData = {
        // Combine salutation, first name and last name for supplierName
        supplierName: `${data.salutation || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim(),
        // Store individual name components
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        salutation: data.salutation || '',
        // Store supplier type directly
        supplierType: data.supplierType || 'Individual',
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
      if (!supplierData.supplierName) supplierData.supplierName = 'New Supplier';
      if (!supplierData.location) supplierData.location = 'Not specified';
      if (!supplierData.geographicalLocation) supplierData.geographicalLocation = '0,0';
      
      console.log("Sending supplier data:", JSON.stringify(supplierData, null, 2));
      
      try {
        const response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/suppliers`,
          data: supplierData,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log("Server response success:", response.data);
        setSuppliers([...suppliers, response.data]);
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
        
        throw new Error(`Server error: ${axiosError.response?.data?.message || axiosError.message || "Failed to create supplier"}`);
      }
    } catch (err: any) {
      console.error("Error creating supplier:", err);
      alert(`Failed to create supplier: ${err.message}. Please check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  }

  // Update an existing supplier
  const handleEditSupplier = async (data: any) => {
    if (currentSupplier) {
      try {
        setIsLoading(true)
        // Format the data to match the API expectations
        const supplierData = {
          // Combine salutation, first name and last name for supplierName
          supplierName: `${data.salutation || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim(),
          // Store individual name components
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          salutation: data.salutation || '',
          // Store supplier type directly
          supplierType: data.supplierType || 'Individual',
          // Store phone number
          phone: data.phone || '',
          // Store ID number
          idNumber: data.idNumber || currentSupplier.idNumber,
          // Store location from address field
          location: data.address || currentSupplier.location,
          // Store geographical location from map coordinates
          geographicalLocation: data.geographicalLocation || currentSupplier.geographicalLocation,
          // Store notes
          notes: data.notes || currentSupplier.notes,
          // Set company name
          companyName: data.supplierType === "Company" ? data.company || `Default Company` : currentSupplier.companyName,
          // Keep email if available
          email: data.email || currentSupplier.email,
          // Keep contact person if available
          contactPerson: data.contactPerson || currentSupplier.contactPerson
        }
        
        const response = await axios.put(`${API_BASE_URL}/suppliers/${currentSupplier._id}`, supplierData)
        setSuppliers(suppliers.map((c) => (c._id === response.data._id ? response.data : c)))
        setIsEditDialogOpen(false)
        setCurrentSupplier(null)
      } catch (err) {
        console.error("Error updating supplier:", err)
        alert("Failed to update supplier. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Delete a supplier
  const handleDeleteSupplier = async () => {
    if (currentSupplier) {
      try {
        setIsLoading(true)
        await axios.delete(`${API_BASE_URL}/suppliers/${currentSupplier._id}`)
        setSuppliers(suppliers.filter((c) => c._id !== currentSupplier._id))
        setIsDeleteDialogOpen(false)
        setCurrentSupplier(null)
      } catch (err) {
        console.error("Error deleting supplier:", err)
        alert("Failed to delete supplier. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const openEditDialog = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  const toggleSupplierSelection = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    )
  }

  const printAllSuppliers = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>All Suppliers</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>All Suppliers</h1>
            <table>
              <thead>
                <tr>
                  <th>Supplier Info</th>
                  <th>Total Spent</th>
                  <th>Balance</th>
                  <th>Avg. Invoice</th>
                  <th>Avg. Expense</th>
                  <th>Last Invoice</th>
                  <th>Last Expense</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSuppliers.map(supplier => `
                  <tr>
                    <td>
                      <div><strong>${supplier.supplierName}</strong></div>
                      <div>${supplier.companyName}</div>
                      <div>${supplier.phone}</div>
                    </td>
                    <td>${formatCurrency(supplier.totalSpent || 0)}</td>
                    <td>${formatCurrency(supplier.balanceDue || 0)}</td>
                    <td>${formatCurrency(supplier.avgInvoice || 0)}</td>
                    <td>${formatCurrency(supplier.avgExpense || 0)}</td>
                    <td>${supplier.lastInvoice ? formatDate(supplier.lastInvoice) : 'N/A'}</td>
                    <td>${supplier.lastExpense ? formatDate(supplier.lastExpense) : 'N/A'}</td>
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

  const printSelectedSuppliers = () => {
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier to print')
      return
    }

    const selectedSuppliersData = filteredSuppliers.filter(supplier => 
      selectedSuppliers.includes(supplier._id)
    )

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Selected Suppliers</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Selected Suppliers</h1>
            <table>
              <thead>
                <tr>
                  <th>Supplier Info</th>
                  <th>Total Spent</th>
                  <th>Balance</th>
                  <th>Avg. Invoice</th>
                  <th>Avg. Expense</th>
                  <th>Last Invoice</th>
                  <th>Last Expense</th>
                </tr>
              </thead>
              <tbody>
                ${selectedSuppliersData.map(supplier => `
                  <tr>
                    <td>
                      <div><strong>${supplier.supplierName}</strong></div>
                      <div>${supplier.companyName}</div>
                      <div>${supplier.phone}</div>
                    </td>
                    <td>${formatCurrency(supplier.totalSpent || 0)}</td>
                    <td>${formatCurrency(supplier.balanceDue || 0)}</td>
                    <td>${formatCurrency(supplier.avgInvoice || 0)}</td>
                    <td>${formatCurrency(supplier.avgExpense || 0)}</td>
                    <td>${supplier.lastInvoice ? formatDate(supplier.lastInvoice) : 'N/A'}</td>
                    <td>${supplier.lastExpense ? formatDate(supplier.lastExpense) : 'N/A'}</td>
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
  if (isLoading && suppliers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 pt-6 md:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && suppliers.length === 0) {
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
        <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
      </div>
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0 md:space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
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
            Add Supplier
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={printAllSuppliers}>
                Print All Suppliers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={printSelectedSuppliers}>
                Print Selected Suppliers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>All Suppliers</CardTitle>
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
                        setSelectedSuppliers(filteredSuppliers.map(c => c._id))
                      } else {
                        setSelectedSuppliers([])
                      }
                    }}
                    checked={selectedSuppliers.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                  />
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Avg. Invoice</TableHead>
                <TableHead>Avg. Expense</TableHead>
                <TableHead>Last Invoice</TableHead>
                <TableHead>Last Expense</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No suppliers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier._id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selectedSuppliers.includes(supplier._id)}
                        onChange={() => toggleSupplierSelection(supplier._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.supplierName}</div>
                        <div className="text-sm text-muted-foreground">{supplier.companyName}</div>
                        <div className="text-sm text-muted-foreground">{supplier.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(supplier.totalSpent || 0)}</TableCell>
                    <TableCell>{formatCurrency(supplier.balanceDue || 0)}</TableCell>
                    <TableCell>{formatCurrency(supplier.avgInvoice || 0)}</TableCell>
                    <TableCell>{formatCurrency(supplier.avgExpense || 0)}</TableCell>
                    <TableCell>{supplier.lastInvoice ? formatDate(supplier.lastInvoice) : 'N/A'}</TableCell>
                    <TableCell>{supplier.lastExpense ? formatDate(supplier.lastExpense) : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          supplier.status === "active"
                            ? "default"
                            : supplier.status === "inactive"
                              ? "secondary"
                              : supplier.status === "overdue"
                                ? "destructive"
                                : supplier.status === "unpaid"
                                  ? "outline"
                                  : "outline"
                        }
                      >
                        {supplier.status || "active"}
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
                            <Link href={`/suppliers/${supplier._id}`}>
                              <UserIcon className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices?supplier=${supplier._id}`}>
                              <FileTextIcon className="mr-2 h-4 w-4" />
                              View Invoices
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/expenses?supplier=${supplier._id}`}>
                              <CreditCardIcon className="mr-2 h-4 w-4" />
                              View Expenses
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(supplier)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(supplier)}
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

      {/* Create Supplier Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]  max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>Enter the supplier details below to create a new supplier.</DialogDescription>
          </DialogHeader>
          <SupplierForm onSubmit={handleCreateSupplier} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>Update the supplier details below.</DialogDescription>
          </DialogHeader>
          {currentSupplier && (
            <SupplierForm
              supplier={{
                id: currentSupplier._id,
                firstName: currentSupplier.firstName || '',
                lastName: currentSupplier.lastName || '',
                name: currentSupplier.supplierName,
                email: currentSupplier.email || '',
                phone: currentSupplier.phone,
                idNumber: currentSupplier.idNumber || '',
                salutation: currentSupplier.salutation as any || 'Mr.',
                supplierType: currentSupplier.supplierType as any,
                company: currentSupplier.companyName,
                status: currentSupplier.status as any || 'active',
                address: currentSupplier.location,
                notes: currentSupplier.notes || '',
                totalSpent: 0,
                balance: currentSupplier.balanceDue || 0,
                avgInvoice: 0,
                avgExpense: 0,
                lastInvoice: '',
                lastExpense: '',
                createdAt: currentSupplier.createdAt
              }}
              onSubmit={handleEditSupplier}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Supplier Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSupplier}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

