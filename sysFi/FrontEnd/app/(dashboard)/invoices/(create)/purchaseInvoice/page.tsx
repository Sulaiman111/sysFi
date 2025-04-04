"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Save, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { supplierService, Supplier } from "@/lib/api/supplier-service"
import { invoiceService } from "@/lib/api/invoice-service"
import { expenseService } from "@/lib/api/expense-service" // Add this import

// في بداية الملف، أضف استيراد Sweetalert2
import Swal from 'sweetalert2'

// Update the form schema
const formSchema = z.object({
  supplier: z.string().min(1, { message: "Supplier is required" }),
  issueDate: z.date(),
  notes: z.string().optional(),
  invoiceType: z.enum(["sales", "purchase"]),
  terms: z.string().optional(),
  expenseMethod: z.enum(["paid", "unpaid"]), // Keep these values consistent
})

interface InvoiceItem {
  id: string
  description: string
  productName: string // Add product name field
  quantity: number
  freeQuantity: number // Add free quantity field
  unitPrice: number
  total: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supplierId = searchParams.get("supplier")
  const invoiceType = searchParams.get("type") || "sales" // Get invoice type from URL or default to sales
  const { toast } = useToast()

  // Importa el tipo Supplier
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([]) // Especifica el tipo Supplier[]
  const [items, setItems] = useState<InvoiceItem[]>([
    { 
      id: uuidv4(), 
      description: "", 
      productName: "", 
      quantity: 1, 
      freeQuantity: 0, 
      unitPrice: 0, 
      total: 0 
    },
  ])

  // Fetch suppliers from the database
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getAllSuppliers()
        setSuppliers(data)
      } catch (error) {
        console.error("Error fetching suppliers:", error)
        toast({
          title: "Error",
          description: "Failed to load suppliers. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchSuppliers()
  }, [toast])

  // قائمة بالشروط المشهورة للفواتير
  const commonTerms = [
    "الدفع خلال 30 يوم من تاريخ الفاتورة",
    "الدفع عند الاستلام",
    "الدفع مقدمًا",
    "الدفع خلال 15 يوم من تاريخ الفاتورة",
    "الدفع خلال 60 يوم من تاريخ الفاتورة",
    "الدفع على دفعات: 50% مقدم و50% عند التسليم",
    "جميع المبيعات نهائية ولا يمكن استردادها",
    "ضمان لمدة سنة واحدة على جميع المنتجات",
  ]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: supplierId || "",
      issueDate: new Date(),
      notes: "",
      terms: "",
      expenseMethod: "unpaid", 
      invoiceType: (invoiceType as "sales" | "purchase"),
    },
  })

  // Calculate subtotal, tax, and total
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxRate = 0.1 // 10%
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const addItem = () => {
    setItems([...items, { 
      id: uuidv4(), 
      description: "", 
      productName: "", 
      quantity: 1, 
      freeQuantity: 0, 
      unitPrice: 0, 
      total: 0 
    }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // Recalculate total if quantity or unitPrice changes
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // التحقق من اختيار العميل
      if (!values.supplier) {
        Swal.fire({
          title: 'خطأ!',
          text: 'يرجى اختيار العميل',
          icon: 'error',
          confirmButtonText: 'حسناً'
        });
        setIsLoading(false);
        return;
      }

      // التحقق من وجود عناصر في الفاتورة
      if (items.length === 0) {
        Swal.fire({
          title: 'خطأ!',
          text: 'يجب إضافة عنصر واحد على الأقل',
          icon: 'error',
          confirmButtonText: 'حسناً'
        });
        setIsLoading(false);
        return;
      }

      // Find the selected supplier to get their details
      const selectedSupplier = suppliers.find(c => c._id === values.supplier)
      console.log("Selected supplier:", selectedSupplier)
      
      // Validate items before submission
      if (items.some(item => !item.productName && !item.description)) {
        Swal.fire({
          title: 'خطأ!',
          text: 'جميع العناصر يجب أن تحتوي على اسم المنتج أو وصف',
          icon: 'error',
          confirmButtonText: 'حسناً'
        });
        setIsLoading(false);
        return;
      }
      
      // Format items for API
      const formattedItems = items.map(item => ({
        productId: "000000000000000000000000",
        productName: item.productName || item.description,
        quantity: item.quantity,
        freeQuantity: item.freeQuantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total + (item.total * taxRate) // إضافة الضريبة لكل عنصر
      }))
      
      // Create invoice object for API
      const invoiceData = {
        invoiceId: `INV-${Date.now()}`,
        supplierId: values.supplier,
        supplier: selectedSupplier?._id || "",
        date: values.issueDate.toISOString().split('T')[0],
        dueDate: values.expenseMethod === "unpaid" ? 
          new Date(values.issueDate.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
          "",
        status: values.expenseMethod,
        amount: total,
        items: formattedItems,
        issuedBy: "000000000000000000000000",
        type: "purchase", // Always set to purchase for this page
        terms: values.terms || values.notes || ""
      };
      
      // Save invoice
      const createdInvoice = await invoiceService.createInvoice(invoiceData);
      
      // Add invoice to supplier's invoice list
      if (selectedSupplier && createdInvoice._id) {
        await supplierService.addInvoiceToSupplier(selectedSupplier._id, createdInvoice._id);
      }
      
      // If expense is made, handle expense
      if (values.expenseMethod === "paid" && createdInvoice._id) {
        try {
          // Create expense data
          const expenseData = {
            supplierId: values.supplier,
            invoiceId: createdInvoice._id,
            amount: Number(total.toFixed(2)),
            method: "cash",
            date: values.issueDate.toISOString().split('T')[0],
            createdBy: "000000000000000000000000"
          };
      
          // Create expense
          const expense = await expenseService.createExpense(expenseData);
          
          if (!expense || !expense._id) {
            throw new Error('Expense creation failed');
          }
      
          // Add expense to supplier's expense list
          await supplierService.addExpenseToSupplier(values.supplier, expense._id);
      
          // Add expense to invoice
          await invoiceService.addExpenseToInvoice(createdInvoice._id, {
            expenseId: expense._id,
            amount: expense.amount,
            date: expense.date,
            method: expense.method
          });
      
          console.log('Expense added to supplier expense list:', expense._id);
        } catch (error) {
          console.error('Expense processing error:', error);
          throw error;
        }
      }
      
      // Update supplier balance after expense
      if (selectedSupplier && values.expenseMethod !== "paid") {
        const updatedBalance = (selectedSupplier.balanceDue || 0) + total;
        await supplierService.updateSupplier(selectedSupplier._id, {
          balanceDue: updatedBalance
        });
      }
      
      // Show success message and redirect
      Swal.fire({
        title: 'نجاح!',
        text: 'تم إنشاء الفاتورة بنجاح',
        icon: 'success',
        confirmButtonText: 'حسناً'
      }).then(() => {
        router.push("/invoices");
      });
      
    } catch (error) {
      console.error("Error creating invoice:", error)
      Swal.fire({
        title: 'خطأ!',
        text: 'فشل في إنشاء الفاتورة. يرجى المحاولة مرة أخرى.',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Create {invoiceType === "sales" ? "Sales" : "Purchase"} Invoice
          </h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Enter the basic invoice information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Remove invoice type selector */}
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier._id} value={supplier._id}>
                              {supplier.companyName ? `${supplier.companyName} (${supplier.supplierName})` : supplier.supplierName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} setDate={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  
                </div>
                <FormField
                  control={form.control}
                  name="expenseMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expense method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Cash</SelectItem>
                          <SelectItem value="unpaid">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* إضافة حقل اختيار الشروط */}
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commonTerms.map((term, index) => (
                            <SelectItem key={index} value={term}>
                              {term}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes for the supplier" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>Add products or services to this invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Product Name</TableHead>
                      <TableHead className="w-[20%]">Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Free Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            placeholder="Product name"
                            value={item.productName}
                            onChange={(e) => updateItem(item.id, "productName", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.freeQuantity}
                            onChange={(e) => updateItem(item.id, "freeQuantity", Number.parseInt(e.target.value) || 0)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

