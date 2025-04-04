"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { CreditCard } from "@/components/payments/credit-card"
import { CheckForm } from "@/components/payments/check-form"
import { toast } from "@/components/ui/use-toast"
import { LoaderIcon } from "lucide-react"
// Import services
import { customerService } from "@/lib/api/customer-service"
import { invoiceService, Invoice as ServiceInvoice } from "@/lib/api/invoice-service"
import { chequeService, Cheque } from "@/lib/api/cheque-service"


// Updated schema without status field
const formSchema = z.object({
  invoiceId: z.string().min(1, { message: "Invoice ID is required" }),
  customerId: z.string().min(1, { message: "Customer is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  method: z.enum(["credit_card", "bank_transfer", "paypal", "cash", "check"]),
})

interface PaymentFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

interface Customer {
  _id: string;
  customerName: string;
  companyName?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  balanceDue: number;
}

export function PaymentForm({ onSubmit, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [chequeDetails, setChequeDetails] = useState({
    chequeNumber: "",
    bankName: "",
    branchName: "",
    chequeDate: "",
    accountNumber: "",
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceId: "",
      customerId: "",
      amount: "",
      method: "credit_card",
    },
  })

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true)
        // Use customer service instead of direct fetch
        const data = await customerService.getAllCustomers()
        setCustomers(data)
      } catch (error) {
        console.error("Failed to fetch customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  // Fetch unpaid invoices when customer changes
  // Update the import to use the Invoice interface from the service

  // Update your local Invoice interface to extend the service one
  interface Invoice extends Partial<ServiceInvoice> {
    _id: string;
    invoiceNumber: string;
    totalAmount: number;
    balanceDue: number;
  }
  
  // Then in the handleCustomerChange function, map the service invoices to your local format
  const handleCustomerChange = async (customerId: string) => {
    form.setValue("customerId", customerId)
    form.setValue("invoiceId", "")
    setSelectedInvoice(null)
    
    if (!customerId) return
    
    try {
      setLoadingInvoices(true)
      // Use invoice service instead of direct fetch
      const data = await invoiceService.getInvoicesByCustomerId(customerId)
      // Filter to only show unpaid invoices and map to local Invoice format
      const unpaidData = data
        .filter(invoice => 
          invoice.status === 'pending' || invoice.status === 'overdue' || invoice.status === 'draft'
        )
        .map(invoice => ({
          _id: invoice._id || invoice.id || '',
          invoiceNumber: invoice.invoiceId || '',
          totalAmount: invoice.amount || 0,
          balanceDue: invoice.amount || 0, // Assuming balanceDue is the same as amount if not provided
          ...invoice
        }));
      
      setUnpaidInvoices(unpaidData)
    } catch (error) {
      console.error("Failed to fetch unpaid invoices:", error)
      toast({
        title: "Error",
        description: "Failed to load unpaid invoices. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingInvoices(false)
    }
  }

  // Handle invoice selection
  const handleInvoiceChange = (invoiceId: string) => {
    form.setValue("invoiceId", invoiceId)
    
    const invoice = unpaidInvoices.find(inv => inv._id === invoiceId)
    if (invoice) {
      setSelectedInvoice(invoice)
      form.setValue("amount", invoice.balanceDue.toString())
    }
  }

  // Handle cheque details update
  const handleChequeDetailsChange = (details: any) => {
    setChequeDetails(details)
  }

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Prepare payment data with proper typing
      const paymentData: Payment = {
        ...values,
        amount: Number.parseFloat(values.amount),
        status: "successful", // Default status
      }
  
      // If payment method is check, create a cheque record
      if (values.method === "check") {
        try {
          // Create cheque record using cheque service with proper typing
          const chequeData: Omit<Cheque, "_id"> = {
            chequeNumber: chequeDetails.chequeNumber,
            bankName: chequeDetails.bankName,
            branchName: chequeDetails.branchName,
            chequeDate: chequeDetails.chequeDate,
            accountNumber: chequeDetails.accountNumber,
            amount: Number.parseFloat(values.amount),
            customerId: values.customerId,
            status: "pending", // Use a specific status from the enum
          }
          
          const createdCheque = await chequeService.createCheque(chequeData)
          
          // Add cheque info to payment data
          paymentData.cheques = [createdCheque]
        } catch (error) {
          console.error("Failed to create cheque record:", error)
          toast({
            title: "Warning",
            description: "Payment recorded but failed to create cheque record.",
            variant: "destructive",
          })
        }
      }

      // Submit the payment
      onSubmit(paymentData)
    } catch (error) {
      console.error("Failed to process payment:", error)
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Customer Selection */}
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Customer</FormLabel>
                <Select
                  disabled={loadingCustomers}
                  onValueChange={(value) => handleCustomerChange(value)}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {loadingCustomers ? (
                        <div className="flex items-center">
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          <span>Loading customers...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a customer" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.customerName} {customer.companyName ? `(${customer.companyName})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invoice Selection - Read-only field that gets populated based on customer */}
          <FormField
            control={form.control}
            name="invoiceId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Invoice</FormLabel>
                <Select
                  disabled={loadingInvoices || !form.getValues("customerId")}
                  onValueChange={handleInvoiceChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      {loadingInvoices ? (
                        <div className="flex items-center">
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          <span>Loading invoices...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select an invoice" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unpaidInvoices.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No unpaid invoices found
                      </div>
                    ) : (
                      unpaidInvoices.map((invoice) => (
                        <SelectItem key={invoice._id} value={invoice._id}>
                          {invoice.invoiceNumber} - ${invoice.balanceDue.toFixed(2)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount - Read-only when invoice is selected */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                    readOnly={!!selectedInvoice}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setPaymentMethod(value)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment method specific forms */}
        {paymentMethod === "credit_card" && (
          <div className="border rounded-md p-4">
            <CreditCard />
          </div>
        )}

        {paymentMethod === "bank_transfer" && (
          <div className="border rounded-md p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormLabel>Bank Name</FormLabel>
                <Input placeholder="Bank of America" />
              </div>
              <div>
                <FormLabel>Account Number</FormLabel>
                <Input placeholder="XXXX-XXXX-XXXX-XXXX" />
              </div>
            </div>
            <div>
              <FormLabel>Routing Number</FormLabel>
              <Input placeholder="XXXXXXXXX" />
            </div>
          </div>
        )}

        {paymentMethod === "paypal" && (
          <div className="border rounded-md p-4">
            <div>
              <FormLabel>PayPal Email</FormLabel>
              <Input placeholder="email@example.com" />
            </div>
          </div>
        )}

        {paymentMethod === "check" && (
          <div className="border rounded-md p-4">
            <CheckForm onChange={handleChequeDetailsChange} />
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

interface Payment {
  invoiceId: string
  customerId: string
  amount: number
  method: "credit_card" | "bank_transfer" | "paypal" | "cash" | "check"
  status: string
  cheques?: Cheque[] // Add optional cheques property
}

