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
import { paymentService, Payment as ApiPayment } from "@/lib/api/payment-service"
import { customerService } from "@/lib/api/customer-service"
import { toast } from "@/components/ui/use-toast"
import Swal from 'sweetalert2'

// Customer interface definition
interface Customer {
  _id: string;
  customerName?: string;
  companyName?: string;
}

// Payment interface with company name field
interface Payment {
  id: string
  paymentId: string
  invoiceId: string
  customer: string
  companyName?: string
  amount: number
  status: "successful" | "pending" | "failed" | "refunded"
  method: "cash" | "credit_card" | "bank_transfer" | "check" | "paypal"
  date: string
  reference?: string
}

// Add this to your imports at the top
import { PaymentDetailsModal } from "@/components/payments/payment-details-modal"

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  // Add these two new state variables
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Load data from API when the page loads
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)
        const apiPayments = await paymentService.getAllPayments()
        
        //@ts-ignore
        const formattedPayments: Payment[] = apiPayments.map((payment: ApiPayment) => {
          // Extract customer information correctly
          let customerName = "Unknown Customer";
          let companyName = "";
          
          try {
            if (payment.customerId) {
              if (typeof payment.customerId === 'object') {
                // Convert type to Customer
                const customerObj = payment.customerId as unknown as Customer;
                
                if (customerObj.customerName) {
                  customerName = customerObj.customerName;
                }
                
                if (customerObj.companyName) {
                  companyName = customerObj.companyName;
                }
              } else {
                customerName = `Customer ID: ${payment.customerId}`;
              }
            }
          } catch(error) {
            console.error("Error processing customerId in payment page: " + error)
          }
          
          return {
            id: payment._id,
            paymentId: payment.paymentId,
            //@ts-ignore
            invoiceId: payment.invoiceId,
            customer: customerName,
            companyName: companyName,
            amount: payment.amount,
            status: payment.status || "successful",
            method: payment.method as any,
            date: payment.date,
            reference: payment.cheques?.length ? "Cheque payment" : undefined
          };
        });
        
        setPayments(formattedPayments)
      } catch (error) {
        console.error("Failed to fetch payments:", error)
        toast({
          title: "Error",
          description: "Failed to load payments. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      (typeof payment.customer === 'string' ? payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      payment.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    return matchesSearch && payment.status === activeTab
  })

  const handleCreatePayment = async (newPaymentData: any) => {
    try {
      // Prepare payment data for API with all required fields from the model
      const paymentInput = {
        customerId: newPaymentData.customerId,
        invoiceId: newPaymentData.invoiceId,
        amount: typeof newPaymentData.amount === 'string' 
          ? parseFloat(newPaymentData.amount) 
          : newPaymentData.amount,
        method: newPaymentData.method,
        status: newPaymentData.status || "successful",
        date: new Date().toISOString().split('T')[0],
        // Add paymentId if not provided (generate a temporary one)
        paymentId: newPaymentData.paymentId || `PAY-${Date.now()}`,
        // Add createdBy field which is required in the model
        createdBy: "64f8b8e77571f9001cfa7d98",
        // Initialize empty cheques array if not using check payment method
        cheques: []
      }
      
      // Add cheque data if present for check payments
      if (newPaymentData.method === "check" && newPaymentData.cheques && newPaymentData.cheques.length > 0) {
        // If we have the full cheque objects, just use their IDs
        if (typeof newPaymentData.cheques[0] === 'object' && newPaymentData.cheques[0]._id) {
          paymentInput.cheques = newPaymentData.cheques.map((cheque: any) => cheque._id || cheque.id);
        } else {
          // Otherwise use the cheques array as is (might be already IDs)
          paymentInput.cheques = newPaymentData.cheques;
        }
      }
      
      // If this is a check payment and we need to create a cheque first
      if (newPaymentData.method === "check" && newPaymentData.chequeDetails) {
        try {
          // Check if chequeDetails is an array (multiple cheques) or a single object
          const chequeDetailsArray = Array.isArray(newPaymentData.chequeDetails) 
            ? newPaymentData.chequeDetails 
            : [newPaymentData.chequeDetails];
          
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
              amount: typeof newPaymentData.amount === 'string' 
                ? parseFloat(newPaymentData.amount) / chequeDetailsArray.length
                : newPaymentData.amount / chequeDetailsArray.length,
              customerId: newPaymentData.customerId,
              status: "pending",
              type: "received" // Since this is a payment received from customer
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
          
          // Add all created cheque IDs to the payment
          if (createdChequeIds.length > 0) {
            //@ts-ignore
            paymentInput.cheques = createdChequeIds;
          }
        } catch (chequeError) {
          console.error("Failed to create cheques:", chequeError);
        }
      }
      
      // Log the data being sent to help with debugging
      console.log("Payment data being sent to API:", JSON.stringify(paymentInput, null, 2));
      
      // Try direct fetch instead of using the service if we're getting 500 errors
      try {
        console.log("Attempting to create payment...");
        
        // First try using the service
        let createdPayment;
        try {
          createdPayment = await paymentService.createPayment(paymentInput);
        } catch (serviceError) {
          console.error("Service-based payment creation failed:", serviceError);
          
          // Fall back to direct API call
          console.log("Falling back to direct API call");
          const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentInput),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Payment creation failed: ${response.status}. Details: ${errorText}`);
          }
          
          createdPayment = await response.json();
        }
        
        console.log("Payment created successfully:", createdPayment);
        
        // After successfully creating the payment, add it to the customer's payment list
        try {
          // Use customer service to add the payment to the customer's payment list
          console.log(`Adding payment ${createdPayment._id} to customer ${paymentInput.customerId}`);
          
          // Send complete payment data to ensure the backend has all necessary information
          await customerService.addPaymentToCustomer(
            paymentInput.customerId, 
            createdPayment._id
          );
          console.log("Payment successfully added to customer's paymentList using customerService");
          
        } catch (customerError: any) {
          console.error("Failed to add payment to customer's paymentList:", customerError);
          
          // Try an alternative approach if the main method fails
          try {
            console.log("Trying alternative approach to update customer's payment list");
            // Get the current customer
            const customer = await customerService.getCustomerById(paymentInput.customerId);
            
            // Check if the customer already has this payment in their list
            if (!customer.paymentList.includes(createdPayment._id)) {
              // Create a new payment list with the new payment added
              const updatedPaymentList = [...customer.paymentList, createdPayment._id];
              
              // Update the customer directly
              await customerService.updateCustomer(paymentInput.customerId, {
                // Only send the fields we want to update
                paymentList: updatedPaymentList
              } as any); // Use 'as any' because updateCustomer expects CustomerInput
              
              console.log("Successfully updated customer's payment list using alternative approach");
            } else {
              console.log("Payment already exists in customer's payment list");
            }
          } catch (alternativeError) {
            console.error("Alternative approach also failed:", alternativeError);
          
            toast({
              title: "Warning",
              description: "Payment was created but failed to add it to the customer's record",
              variant: "destructive",
            });
          }
        }
        
        // Transform the response for display
        const newPayment: Payment = {
          id: createdPayment._id || "", // Use _id instead of id
          paymentId: createdPayment.paymentId || "",
          invoiceId: createdPayment.invoiceId || "",
          customer: (() => {
            if (typeof createdPayment.customer === 'object' && createdPayment.customer) {
              return createdPayment.customer.customerName || "Unknown Customer";
            } else if (createdPayment.customer) {
              return createdPayment.customer;
            } else if (typeof createdPayment.customerId === 'object' && createdPayment.customerId) {
              const customerObj = createdPayment.customerId as any;
              return customerObj.customerName || "Unknown Customer";
            } else {
              return createdPayment.customerId?.toString() || "Unknown Customer";
            }
          })(),
          companyName: (() => {
            if (typeof createdPayment.customer === 'object' && createdPayment.customer) {
              return createdPayment.customer.companyName || "";
            } else if (typeof createdPayment.customerId === 'object' && createdPayment.customerId) {
              const customerObj = createdPayment.customerId as any;
              return customerObj.companyName || "";
            }
            return "";
          })(),
          amount: createdPayment.amount || 0,
          status: (createdPayment.status as "successful" | "pending" | "failed" | "refunded") || "successful",
          method: (createdPayment.method as "cash" | "credit_card" | "bank_transfer" | "check" | "paypal") || "cash",
          date: createdPayment.date || new Date().toISOString().split('T')[0],
          reference: createdPayment.cheques?.length ? "Cheque payment" : undefined
        }
        
        setPayments([...payments, newPayment])
        setIsCreateDialogOpen(false)
        
        // Show success message with SweetAlert2
        Swal.fire({
          title: 'Success!',
          text: 'Payment has been successfully recorded',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (apiError: any) {
        // More detailed API error logging
        console.error("API Error Details:", apiError);
        
        // Show more specific error message based on error type
        let errorMessage = "Failed to record payment. Please try again.";
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
      console.error("Client-side error in payment creation:", error)
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
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push("/payments/create")}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search payments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>View and manage all your payment transactions.</CardDescription>
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
                <span className="ml-2">Loading payments...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{payment.paymentId}</div>
                            
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div>{payment.companyName}</div>
                            {payment.companyName && (
                              <div className="text-sm text-muted-foreground">{payment.customer}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "successful"
                                ? "default"
                                : payment.status === "pending"
                                  ? "secondary"
                                  : payment.status === "refunded"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getMethodIcon(payment.method)}</span>
                            <span className="capitalize">{payment.method.replace("_", " ")}</span>
                          </div>
                          {payment.reference && (
                            <div className="text-xs text-muted-foreground">{payment.reference}</div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
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
                                setSelectedPaymentId(payment.id)
                                setIsDetailsModalOpen(true)
                              }}>
                                <ReceiptIcon className="mr-2 h-4 w-4" />
                                View Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/invoices/${payment.invoiceId}`}>
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
      {selectedPaymentId && (
        <PaymentDetailsModal
          paymentId={selectedPaymentId}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedPaymentId(null)
          }}
        />
      )}
    </div>
  )
}

