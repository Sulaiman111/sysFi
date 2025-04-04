"use client"

import { useEffect, useState } from "react"
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
import { PlusIcon, SearchIcon, MoreHorizontalIcon, FileTextIcon, DownloadIcon, ReceiptIcon, LoaderIcon } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { expenseService, Expense as ApiExpense } from "@/lib/api/expense-service"
import { supplierService } from "@/lib/api/supplier-service"
import { toast } from "@/components/ui/use-toast"
import Swal from 'sweetalert2'

// Supplier interface definition
interface Supplier {
  _id: string;
  supplierName?: string;
  companyName?: string;
}

// Expense interface with company name field
interface Expense {
  id: string
  expenseId: string
  invoiceId: string
  supplier: string
  companyName?: string
  amount: number
  status: "successful" | "pending" | "failed" | "refunded"
  method: "cash" | "credit_card" | "bank_transfer" | "check" | "paypal"
  date: string
  reference?: string
}

// Add this to your imports at the top
import { ExpenseDetailsModal } from "@/components/expenses/expense-details-modal"

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  // Add these two new state variables
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Load data from API when the page loads
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true)
        const apiExpenses = await expenseService.getAllExpenses()
        
        //@ts-ignore
        const formattedExpenses: Expense[] = apiExpenses.map((expense: ApiExpense) => {
          // Extract supplier information correctly
          let supplierName = "Unknown Supplier";
          let companyName = "";
          
          try {
            if (expense.supplierId) {
              if (typeof expense.supplierId === 'object') {
                // Convert type to Supplier
                const supplierObj = expense.supplierId as unknown as Supplier;
                
                if (supplierObj.supplierName) {
                  supplierName = supplierObj.supplierName;
                }
                
                if (supplierObj.companyName) {
                  companyName = supplierObj.companyName;
                }
              } else {
                supplierName = `Supplier ID: ${expense.supplierId}`;
              }
            }
          } catch(error) {
            console.error("Error processing supplierId in expense page: " + error)
          }
          
          return {
            id: expense._id,
            expenseId: expense.expenseId,
            //@ts-ignore
            invoiceId: expense.invoiceId,
            supplier: supplierName,
            companyName: companyName,
            amount: expense.amount,
            status: expense.status || "successful",
            method: expense.method as any,
            date: expense.date,
            reference: expense.cheques?.length ? "Cheque expense" : undefined
          };
        });
        
        setExpenses(formattedExpenses)
      } catch (error) {
        console.error("Failed to fetch expenses:", error)
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      (typeof expense.supplier === 'string' ? expense.supplier.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      expense.expenseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.reference && expense.reference.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    return matchesSearch && expense.status === activeTab
  })

  const handleCreateExpense = async (newExpenseData: any) => {
    try {
      // Prepare expense data for API with all required fields from the model
      const expenseInput = {
        supplierId: newExpenseData.supplierId,
        invoiceId: newExpenseData.invoiceId,
        amount: typeof newExpenseData.amount === 'string' 
          ? parseFloat(newExpenseData.amount) 
          : newExpenseData.amount,
        method: newExpenseData.method,
        status: newExpenseData.status || "successful",
        date: new Date().toISOString().split('T')[0],
        // Add expenseId if not provided (generate a temporary one)
        expenseId: newExpenseData.expenseId || `PAY-${Date.now()}`,
        // Add createdBy field which is required in the model
        createdBy: "64f8b8e77571f9001cfa7d98",
        // Initialize empty cheques array if not using check expense method
        cheques: []
      }
      
      // Add cheque data if present for check expenses
      if (newExpenseData.method === "check" && newExpenseData.cheques && newExpenseData.cheques.length > 0) {
        // If we have the full cheque objects, just use their IDs
        if (typeof newExpenseData.cheques[0] === 'object' && newExpenseData.cheques[0]._id) {
          expenseInput.cheques = newExpenseData.cheques.map((cheque: any) => cheque._id || cheque.id);
        } else {
          // Otherwise use the cheques array as is (might be already IDs)
          expenseInput.cheques = newExpenseData.cheques;
        }
      }
      
      // If this is a check expense and we need to create a cheque first
      if (newExpenseData.method === "check" && newExpenseData.chequeDetails) {
        try {
          // Check if chequeDetails is an array (multiple cheques) or a single object
          const chequeDetailsArray = Array.isArray(newExpenseData.chequeDetails) 
            ? newExpenseData.chequeDetails 
            : [newExpenseData.chequeDetails];
          
          // Array to store created cheque IDs
          const createdChequeIds = [];
          
          // Process each cheque in the array
          for (const chequeDetail of chequeDetailsArray) {
            // Create the cheque with all required fields from the model
            const chequeData = {
              chequeNumber: chequeDetail.chequeNumber,
              bankName: chequeDetail.bankName,
              branchName: chequeDetail.branchName,
              chequeDate: chequeDetail.chequeDate,
              accountNumber: chequeDetail.accountNumber,
              amount: typeof newExpenseData.amount === 'string' 
                ? parseFloat(newExpenseData.amount) / chequeDetailsArray.length
                : newExpenseData.amount / chequeDetailsArray.length,
              supplierId: newExpenseData.supplierId,
              status: "pending",
              type: "received" // Since this is a expense received from supplier
            };
            
            console.log(`Creating cheque ${chequeDetailsArray.indexOf(chequeDetail) + 1}/${chequeDetailsArray.length} with data:`, JSON.stringify(chequeData, null, 2));
            
            // Create the cheque
            const createdCheque = await fetch('/api/cheques', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(chequeData),
            }).then(res => {
              if (!res.ok) throw new Error(`Cheque creation failed: ${res.status}`);
              return res.json();
            });
            
            // Add the created cheque ID to our array
            if (createdCheque && createdCheque._id) {
              createdChequeIds.push(createdCheque._id);
            }
          }
          
          // Add all created cheque IDs to the expense
          if (createdChequeIds.length > 0) {
            //@ts-ignore
            expenseInput.cheques = createdChequeIds;
          }
        } catch (chequeError) {
          console.error("Failed to create cheques:", chequeError);
        }
      }
      
      // Log the data being sent to help with debugging
      console.log("Expense data being sent to API:", JSON.stringify(expenseInput, null, 2));
      
      // Try direct fetch instead of using the service if we're getting 500 errors
      try {
        console.log("Attempting to create expense...");
        
        // First try using the service
        let createdExpense;
        try {
          createdExpense = await expenseService.createExpense(expenseInput);
        } catch (serviceError) {
          console.error("Service-based expense creation failed:", serviceError);
          
          // Fall back to direct API call
          console.log("Falling back to direct API call");
          const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseInput),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Expense creation failed: ${response.status}. Details: ${errorText}`);
          }
          
          createdExpense = await response.json();
        }
        
        console.log("Expense created successfully:", createdExpense);
        
        // After successfully creating the expense, add it to the supplier's expense list
        try {
          // Use supplier service to add the expense to the supplier's expense list
          console.log(`Adding expense ${createdExpense._id} to supplier ${expenseInput.supplierId}`);
          
          // Send complete expense data to ensure the backend has all necessary information
          await supplierService.addExpenseToSupplier(
            expenseInput.supplierId, 
            createdExpense._id
          );
          console.log("Expense successfully added to supplier's expenseList using supplierService");
          
        } catch (supplierError: any) {
          console.error("Failed to add expense to supplier's expenseList:", supplierError);
          
          // Try an alternative approach if the main method fails
          try {
            console.log("Trying alternative approach to update supplier's expense list");
            // Get the current supplier
            const supplier = await supplierService.getSupplierById(expenseInput.supplierId);
            
            // Check if the supplier already has this expense in their list
            if (!supplier.expenseList.includes(createdExpense._id)) {
              // Create a new expense list with the new expense added
              const updatedExpenseList = [...supplier.expenseList, createdExpense._id];
              
              // Update the supplier directly
              await supplierService.updateSupplier(expenseInput.supplierId, {
                // Only send the fields we want to update
                expenseList: updatedExpenseList
              } as any); // Use 'as any' because updateSupplier expects SupplierInput
              
              console.log("Successfully updated supplier's expense list using alternative approach");
            } else {
              console.log("Expense already exists in supplier's expense list");
            }
          } catch (alternativeError) {
            console.error("Alternative approach also failed:", alternativeError);
          
            toast({
              title: "Warning",
              description: "Expense was created but failed to add it to the supplier's record",
              variant: "destructive",
            });
          }
        }
        
        // Transform the response for display
        const newExpense: Expense = {
          id: createdExpense._id || "", // Use _id instead of id
          expenseId: createdExpense.expenseId || "",
          invoiceId: createdExpense.invoiceId || "",
          supplier: (() => {
            if (typeof createdExpense.supplier === 'object' && createdExpense.supplier) {
              return createdExpense.supplier.supplierName || "Unknown Supplier";
            } else if (createdExpense.supplier) {
              return createdExpense.supplier;
            } else if (typeof createdExpense.supplierId === 'object' && createdExpense.supplierId) {
              const supplierObj = createdExpense.supplierId as any;
              return supplierObj.supplierName || "Unknown Supplier";
            } else {
              return createdExpense.supplierId?.toString() || "Unknown Supplier";
            }
          })(),
          companyName: (() => {
            if (typeof createdExpense.supplier === 'object' && createdExpense.supplier) {
              return createdExpense.supplier.companyName || "";
            } else if (typeof createdExpense.supplierId === 'object' && createdExpense.supplierId) {
              const supplierObj = createdExpense.supplierId as any;
              return supplierObj.companyName || "";
            }
            return "";
          })(),
          amount: createdExpense.amount || 0,
          status: (createdExpense.status as "successful" | "pending" | "failed" | "refunded") || "successful",
          method: (createdExpense.method as "cash" | "credit_card" | "bank_transfer" | "check" | "paypal") || "cash",
          date: createdExpense.date || new Date().toISOString().split('T')[0],
          reference: createdExpense.cheques?.length ? "Cheque expense" : undefined
        }
        
        setExpenses([...expenses, newExpense])
        setIsCreateDialogOpen(false)
        
        // Show success message with SweetAlert2
        Swal.fire({
          title: 'Success!',
          text: 'Expense has been successfully recorded',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (apiError: any) {
        // More detailed API error logging
        console.error("API Error Details:", apiError);
        
        // Show more specific error message based on error type
        let errorMessage = "Failed to record expense. Please try again.";
        if (apiError.message && apiError.message.includes("500")) {
          errorMessage = "Server error occurred. Please contact technical support.";
        }
        
        // Show error message with SweetAlert2
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error("Client-side error in expense creation:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return "💳"
      case "bank_transfer":
        return "🏦"
      case "paypal":
        return "🅿️"
      case "cash":
        return "💵"
      case "check":
        return "📝"
      default:
        return "💰"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push("/expenses/create")}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Record Expense
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Expense Management</CardTitle>
          <CardDescription>View and manage all your expense transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="successful">Successful</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading expenses...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{expense.expenseId}</div>
                            
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div>{expense.companyName}</div>
                            {expense.companyName && (
                              <div className="text-sm text-muted-foreground">{expense.supplier}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.status === "successful"
                                ? "default"
                                : expense.status === "pending"
                                  ? "secondary"
                                  : expense.status === "refunded"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getMethodIcon(expense.method)}</span>
                            <span className="capitalize">{expense.method.replace("_", " ")}</span>
                          </div>
                          {expense.reference && (
                            <div className="text-xs text-muted-foreground">{expense.reference}</div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(expense.date)}</TableCell>
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedExpenseId(expense.id)
                                setIsDetailsModalOpen(true)
                              }}>
                                <ReceiptIcon className="mr-2 h-4 w-4" />
                                View Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/invoices/${expense.invoiceId}`}>
                                  <FileTextIcon className="mr-2 h-4 w-4" />
                                  View Invoice
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
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
      {selectedExpenseId && (
        <ExpenseDetailsModal
          expenseId={selectedExpenseId}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedExpenseId(null)
          }}
        />
      )}
    </div>
  )
}

