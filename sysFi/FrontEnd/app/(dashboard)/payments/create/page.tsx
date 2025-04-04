"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { paymentService } from "@/lib/api/payment-service"
import { customerService } from "@/lib/api/customer-service"
import { invoiceService, Invoice as ServiceInvoice } from "@/lib/api/invoice-service"
import { chequeService } from "@/lib/api/cheque-service"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, MinusIcon, LoaderIcon } from "lucide-react"
import Swal from 'sweetalert2'
import { METHODS } from "http"


interface Customer {
  _id: string;
  customerName: string;
  companyName?: string;
  balanceDue: number;  // Changed from Number to number
}

// Interface for invoice data - extending from service interface
interface Invoice extends Partial<ServiceInvoice> {
  _id: string;
  invoiceNumber: string;
  amount: number;
  remainingAmount: number;
  customerId: string;
}

// Interface for cheque details
interface ChequeDetail {
  chequeNumber: string;
  bankName: string;
  branchName: string;
  chequeDate: string;
  accountNumber: string;
  amount: string;
  holderName: string; 
  holderPhone: string; 
}

export default function CreatePaymentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingInvoices, setLoadingInvoices] = useState(false)


  const [formData, setFormData] = useState({
    customerId: "",
    invoiceId: "",
    amount: "",
    method: "cash",
    status: "completed",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  })

  const [isCheckPayment, setIsCheckPayment] = useState(false)
  const [cheques, setCheques] = useState<ChequeDetail[]>([{
    chequeNumber: "",
    bankName: "",
    branchName: "",
    chequeDate: new Date().toISOString().split('T')[0],
    accountNumber: "",
    amount: "",
    holderName: "", 
    holderPhone: "", 
  }])

  // تحميل العملاء عند تحميل الصفحة
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true)
        const response = await customerService.getAllCustomers()
        setCustomers(response)
      } catch (error) {
        console.error("Failed to fetch customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  // جلب الفواتير الخاصة بالعميل المحدد - استخدام نمط من payment-form.tsx
  const fetchCustomerInvoices = async (customerId: string) => {
    if (!customerId) {
      setCustomerInvoices([])
      console.log("No customer selected")
      return
    }
    
    try {
      setLoadingInvoices(true)
      const data = await invoiceService.getInvoicesByCustomerId(customerId)
      const unpaidInvoices = data
        .filter(invoice => {
          const remainingAmount = invoice.remainingAmount ?? invoice.amount ?? 0;
          return (invoice.status === 'unpaid' || invoice.status === 'overdue' || invoice.status === 'partially_paid') &&
                 remainingAmount > 0;
        })
        .map(invoice => ({
          _id: invoice._id || invoice.id || '',
          invoiceNumber: invoice.invoiceId || `INV-${invoice._id?.substring(0, 8)}`,
          remainingAmount: invoice.remainingAmount || invoice.amount || 0,
          ...invoice
        }));
      
      // طباعة معلومات الفواتير
      console.log('Customer Invoices Details:');
      unpaidInvoices.forEach(invoice => {
        console.log({
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.amount,
          remainingAmount: invoice.remainingAmount,
          status: invoice.status,
          date: invoice.date
        });
      });
      console.log('Total unpaid invoices:', unpaidInvoices.length);
      
      setCustomerInvoices(unpaidInvoices)
      
      if (unpaidInvoices.length === 0) {
        toast({
          title: "Information",
          description: "No outstanding invoices found for this customer.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Failed to fetch invoices for customer:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoadingInvoices(false)
    }
  }

  useEffect(() => {
    if (formData.customerId) {
      fetchCustomerInvoices(formData.customerId)
    } else {
      setCustomerInvoices([])
    }
  }, [formData.customerId])

  useEffect(() => {
    if (formData.invoiceId) {
      const selectedInvoice = customerInvoices.find(invoice => invoice._id === formData.invoiceId)
      if (selectedInvoice) {
        setFormData(prev => ({
          ...prev,
          amount: (selectedInvoice.remainingAmount).toString()
        }))
      }
    }
  }, [formData.invoiceId, customerInvoices])

  useEffect(() => {
    setIsCheckPayment(formData.method === "check")
    
    if (formData.method !== "check") {
      setCheques([{
        chequeNumber: "",
        bankName: "",
        branchName: "",
        chequeDate: new Date().toISOString().split('T')[0],
        accountNumber: "",
        amount: "",
        holderName: "", 
        holderPhone: "" 
      }])
    } else {
      // When switching to check payment method
      if (cheques.length === 1) {
        const updatedCheques = [...cheques]
        updatedCheques[0].amount = formData.amount
        setCheques(updatedCheques)
      }
    }
  }, [formData.method])

  // Add new useEffect to update total amount when cheques change
  useEffect(() => {
    if (formData.method === "check") {
      const totalAmount = cheques.reduce((sum, cheque) => 
        sum + (parseFloat(cheque.amount) || 0), 0
      );
      setFormData(prev => ({
        ...prev,
        amount: totalAmount.toString()
      }));
      if (formData.invoiceId) {
        const selectedInvoice = customerInvoices.find(inv => inv._id === formData.invoiceId);
        if (selectedInvoice && totalAmount > selectedInvoice.remainingAmount) {
          toast({
            title: "Warning",
            description: `Total cheque amount (${totalAmount}₪) exceeds remaining invoice amount (${selectedInvoice.remainingAmount}₪)`,
            variant: "destructive",
          });
        }
      }
    }
  }, [cheques, formData.method, formData.invoiceId, customerInvoices]);



useEffect(() => {
  if (formData.customerId && formData.amount) {
    const selectedCustomer = customers.find(c => c._id === formData.customerId);
    const paymentAmount = parseFloat(formData.amount);
    
    if (selectedCustomer && !isNaN(paymentAmount)) {
      const originalBalance = selectedCustomer.balanceDue;
      const remainingBalance = originalBalance - paymentAmount;
      let autoNote = "";
      
      // إضافة معلومات الرصيد
      if (remainingBalance === 0) {
        autoNote = `تم تصفير حساب العميل بالكامل. الرصيد السابق: ${originalBalance}₪\n`;
      } else if (remainingBalance > 0) {
        autoNote = `دفعة جزئية - الرصيد السابق: ${originalBalance}₪ - المدفوع: ${paymentAmount}₪ - المتبقي: ${remainingBalance}₪\n`;
      }

      // إضافة نوع الدفعة
      const paymentMethod = formData.method === 'cash' ? 'نقداً' : 'شيكات';
      autoNote += `نوع الدفعة: ${paymentMethod}\n`;

      // إضافة تفاصيل الشيكات فقط إذا كانت الدفعة بالشيكات
      if (formData.method === 'check' && cheques.length > 0) {
        const validCheques = cheques.filter(cheque => cheque.chequeNumber && cheque.amount);
        if (validCheques.length > 0) {
          autoNote += 'تفاصيل الشيكات:\n';
          validCheques.forEach((cheque, index) => {
            autoNote += `شيك ${index + 1}: رقم ${cheque.chequeNumber} - تاريخ ${cheque.chequeDate} - القيمة ${cheque.amount}₪\n`;
          });
          const totalAmount = validCheques.reduce((sum, cheque) => sum + (parseFloat(cheque.amount) || 0), 0);
          autoNote += `المجموع الكلي للشيكات: ${totalAmount}₪`;
        }
      }

      // احتفظ بالملاحظات اليدوية إذا وجدت
      const userNotes = formData.notes.split('\n').filter(note => 
        !note.includes('الرصيد السابق') && 
        !note.includes('دفعة جزئية') &&
        !note.includes('نوع الدفعة') &&
        !note.includes('تفاصيل الشيكات') &&
        !note.includes('شيك') &&
        !note.includes('المجموع الكلي للشيكات')
      ).join('\n');

      setFormData(prev => ({
        ...prev,
        notes: userNotes ? `${userNotes}\n${autoNote}` : autoNote
      }));
    }
  }
}, [formData.amount, formData.customerId, formData.method, customers, cheques]); // 

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!formData.customerId) {
        Swal.fire({
          title: 'خطأ!',
          html: `
            <div dir="rtl">
              <p>الرجاء اختيار العميل</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#d33'
        });
        setIsLoading(false);
        return;
      }
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        Swal.fire({
          title: 'خطأ!',
          html: `
            <div dir="rtl">
              <p>الرجاء إدخال مبلغ صحيح للدفعة</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#d33'
        });
        setIsLoading(false);
        return;
      }

      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      const paymentAmount = parseFloat(formData.amount);

      // التحقق من مبلغ الدفعة النقدية
      if (formData.method === "cash" && selectedCustomer) {
        if (paymentAmount > selectedCustomer.balanceDue) {
          Swal.fire({
            title: 'Error!',
            html: `
              <div dir="rtl">
                <p>مبلغ الدفعة (${paymentAmount}₪) أكبر من الرصيد المستحق (${selectedCustomer.balanceDue}₪)</p>
                <p>لا يمكن إتمام عملية الدفع</p>
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#d33'
          });
          setIsLoading(false);
          return;
        }
      }

      if (formData.invoiceId) {
        const selectedInvoice = customerInvoices.find(inv => inv._id === formData.invoiceId);
        const paymentAmount = parseFloat(formData.amount);
        
        if (selectedInvoice) {
          // Calculate total paid including current payment
          const totalPaid = (selectedInvoice.amount - selectedInvoice.remainingAmount) + paymentAmount;
          const isFullyPaid = totalPaid >= selectedInvoice.amount;

          if (paymentAmount > selectedInvoice.remainingAmount && formData.method !== "cash") {
            const extraAmount = paymentAmount - selectedInvoice.remainingAmount;
            
            const result = await Swal.fire({
              title: 'تحذير!',
              html: `
                <div dir="rtl">
                  <p>مبلغ الدفعة (${paymentAmount}₪) أكبر من المبلغ المتبقي للفاتورة (${selectedInvoice.remainingAmount}₪)</p>
                  <p>هل تريد المتابعة؟</p>
                </div>
              `,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'نعم، متابعة',
              cancelButtonText: 'إلغاء',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33'
            });

            if (!result.isConfirmed) {
              setIsLoading(false);
              return;
            }
          }

          // Prepare invoice update data with correct type
          const invoiceUpdateData = {
            status: isFullyPaid ? 'paid' as const : 'partially_paid' as const,
            dueDate: isFullyPaid ? formData.date : undefined
          };

          // Update invoice status and dueDate
          await invoiceService.updateInvoice(formData.invoiceId, invoiceUpdateData);
        }
      }

      // Define the interface first
      interface PaymentInput {
        customerId: string;
        invoiceId?: string;
        amount: number;
        method: string;
        status: string;
        date: string;
        notes: string;
        paymentId: string;
        createdBy: string;
        cheques: string[];
      }


      // Create the payment input object with the final notes
      const paymentInput: PaymentInput = {
        customerId: formData.customerId,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        date: formData.date,
        notes: formData.notes, // Now using the updated notes from formData
        paymentId: `PAY-${Date.now()}`,
        createdBy: "64f8b8e77571f9001cfa7d98",
        cheques: [],
      };

      // Only add invoiceId if it exists and is not empty
      if (formData.invoiceId && formData.invoiceId.trim() !== "") {
        paymentInput.invoiceId = formData.invoiceId;
      }

      console.log("Initial payment data:", paymentInput);

      // If payment method is check, create cheques first
      if (formData.method === "check" && cheques.length > 0) {
        try {
          const createdChequeIds: string[] = []; // Explicitly type as string array
          
          // Process each cheque
          for (const chequeDetail of cheques) {
            // Validate cheque data
            if (!chequeDetail.chequeNumber || !chequeDetail.bankName || !chequeDetail.chequeDate || !chequeDetail.amount) {
              throw new Error("Please fill all required cheque fields");
            }
            
            // Create cheque data
            const chequeData = {
              chequeNumber: chequeDetail.chequeNumber,
              bankName: chequeDetail.bankName,
              branchName: chequeDetail.branchName || "",
              chequeDate: chequeDetail.chequeDate,
              accountNumber: chequeDetail.accountNumber || "",
              amount: parseFloat(chequeDetail.amount),
              customerId: formData.customerId,
              status: "pending" as "pending", 
              type: "received", 
              holderName: chequeDetail.holderName || "",
              holderPhone: chequeDetail.holderPhone || ""
            };
            
            console.log("Creating cheque with data:", chequeData);
            
          
            const createdCheque = await chequeService.createCheque(chequeData);
            console.log("Cheque created successfully:", createdCheque);
            if (createdCheque && (createdCheque._id || createdCheque.id)) {
              const chequeId = createdCheque._id || createdCheque.id;
              // Ensure we only add the ID if it's a valid string
              if (typeof chequeId === 'string') {
                createdChequeIds.push(chequeId);
              }

            }
          }
          
          // Add all created cheque IDs to the payment
          if (createdChequeIds.length > 0) {
            paymentInput.cheques = createdChequeIds;
          }
          
          console.log("Payment data with cheques:", paymentInput);
        } catch (chequeError: any) {
          console.error("Failed to create cheques:", chequeError);
          toast({
            title: "Error",
            description: chequeError.message || "Failed to create cheques",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // إنشاء الدفعة
      console.log("Creating payment with final data:", paymentInput);
      //@ts-ignore
      const createdPayment = await paymentService.createPayment(paymentInput);
      console.log("Payment created successfully:", createdPayment);
      try {
        const paymentAmount = parseFloat(formData.amount);
        const selectedCustomer = customers.find(c => c._id === formData.customerId);
        if (selectedCustomer) {
          const newBalance = Number(selectedCustomer.balanceDue) - paymentAmount;
          await customerService.updateCustomer(formData.customerId, {
            balanceDue: newBalance
          });
          console.log(`Updated customer balance: New balance is ${newBalance}₪`);
        }
////////////////////////////////////
const sortedInvoices = customerInvoices
    .filter(inv => inv.remainingAmount > 0)
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

  let remainingPayment = parseFloat(formData.amount);
  
  // توزيع المبلغ على الفواتير
  for (const invoice of sortedInvoices) {
    if (remainingPayment <= 0) break;

    const currentInvoiceRemaining = invoice.remainingAmount;
    const paymentForThisInvoice = Math.min(remainingPayment, currentInvoiceRemaining);

    if (paymentForThisInvoice > 0) {
      try {
        const invoicePayment = {
          paymentId: createdPayment._id,
          amount: paymentForThisInvoice,
          date: formData.date,
          method: formData.method,
          reference: formData.notes || undefined
        };

        await invoiceService.addPaymentToInvoice(invoice._id, invoicePayment);
        console.log(`Added payment of ${paymentForThisInvoice}₪ to invoice ${invoice.invoiceNumber}`);

        remainingPayment -= paymentForThisInvoice;
      } catch (error) {
        console.error(`Error adding payment to invoice ${invoice._id}:`, error);
      }
    }
  }

////////////////////////////////////


      } catch (balanceError) {
        console.error("Error updating customer balance:", balanceError);
        // نستمر في العملية حتى لو فشل تحديث الرصيد
      }

      // Update cheques with the payment ID
      if (formData.method === "check" && createdPayment._id) {
        try {
          // Update all cheques with the payment ID
          await Promise.all(paymentInput.cheques.map(chequeId => 
            chequeService.updateCheque(chequeId, { paymentId: createdPayment._id })
          ));
          console.log("Updated all cheques with payment ID");
        } catch (updateError) {
          console.error("Error updating cheques with payment ID:", updateError);
          // Continue with the process as this is not a critical error
        }
      }

      console.log("Customer ID to add payment to:", formData.customerId);

      // إضافة الدفعة إلى قائمة مدفوعات العميل
      if (createdPayment && createdPayment._id) {
        try {
          console.log(`BEFORE ADDING: Attempting to add payment ID [${createdPayment._id}] to customer ID [${formData.customerId}]`);
          
          const apiUrl = 'http://localhost:5002/api/customers';
          const url = `${apiUrl}/${formData.customerId}/payments`;
          console.log(`Making direct fetch request to: ${url}`);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentId: createdPayment._id }),
          });
          
          console.log(`Fetch response status: ${response.status}`);
          
          
          if ( formData.invoiceId) {
            try {
            
              const invoicePayment = {
                paymentId: createdPayment._id,
                amount: parseFloat(formData.amount),
                date: formData.date,
                method: formData.method,
                reference: formData.notes || undefined
              };

              await invoiceService.addPaymentToInvoice(formData.invoiceId, invoicePayment);
              console.log("Payment added to invoice successfully");
              
            } catch (error) {
              console.error("Error updating invoice with payment:", error);

            }
          }


          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error response: ${errorText}`);
            throw new Error(`Server returned ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          console.log("AFTER ADDING: Payment added to customer successfully");
          console.log("API Response from adding payment to customer:", result);
          
          // التحقق من تحديث قائمة المدفوعات
          if (result && result.paymentList) {
            console.log("Updated customer payment list:", result.paymentList);
            console.log("Does payment list include new payment?", result.paymentList.includes(createdPayment._id));
          } else {
            console.warn("Customer response doesn't contain paymentList or is empty");
          }
          Swal.fire({
            title: 'Success!',
            text: 'Payment has been successfully recorded',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
          setTimeout(() => {
            window.location.href = "/payments";
          }, 1500);
          
        } catch (addError: any) {
          console.error("Error adding payment to customer:", addError);       
          setIsLoading(false);
          return; 
        }
      }

      Swal.fire({
        title: 'Success!',
        text: 'Payment has been successfully recorded',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      setTimeout(() => {
        window.location.href = "/payments";
      }, 2100);
    } catch (error: any) {
      console.error("Error creating payment:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Record New Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex w-100 justify-center" >
            <div className="space-y-2  px-2 flex-grow">
              <Label htmlFor="customerId">Customer</Label>
              {loadingCustomers ? (
                <div className="flex items-center space-x-2">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  <span>Loading customers...</span>
                </div>
              ) : (
                <>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.companyName ? `${customer.companyName} (${customer.customerName})` : customer.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            
            
            <div className="space-y-2  px-2 flex-grow">
              <Label htmlFor="balanceDue">Balance Due</Label>
              <div className="relative">
                <Input
                  id="balanceDue"
                  type="number"
                  value={Number(customers.find(c => c._id === formData.customerId)?.balanceDue) || 0}
                  
                  readOnly
                  className="cursor-not-allowed pr-8"
                  
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₪</span>
              </div>
            </div>
            </div>
            <div className="flex w-100 " >
            <div className="space-y-2  px-2 flex-grow ">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  readOnly={formData.method === "check"}
                  className={`${formData.method === "check" ? "cursor-not-allowed" : ""} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₪</span>
              </div>
              {formData.method === "check" && (
                <p className="text-sm text-gray-500 mt-1">Amount is calculated from total cheque amounts</p>
              )}
              {formData.invoiceId && (
                <p className="text-sm text-gray-500 mt-1">
                  Original Amount: {customerInvoices.find(inv => inv._id === formData.invoiceId)?.amount}₪ - 
                  Paid: {(customerInvoices.find(inv => inv._id === formData.invoiceId)?.amount || 0) - 
                        (customerInvoices.find(inv => inv._id === formData.invoiceId)?.remainingAmount || 0)}₪ = 
                  Required: {customerInvoices.find(inv => inv._id === formData.invoiceId)?.remainingAmount || 0}₪
                </p>
              )}
            </div>

            <div className="space-y-2  px-2 flex-grow">
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => {
                  setFormData({ ...formData, method: value });
                  // Reset cheque fields if method is not check
                  if (value !== "check") {
                    setCheques([{
                      chequeNumber: "",
                      bankName: "",
                      branchName: "",
                      chequeDate: new Date().toISOString().split('T')[0],
                      accountNumber: "",
                      amount: formData.amount,
                      holderName: "", // إضافة الحقل المفقود
                      holderPhone: "" // إضافة الحقل المفقود
                    }]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2  px-2 flex-grow">
              <Label htmlFor="date">Payment Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            </div>

            {/* Cheque details section - only shown when payment method is check */}
            {formData.method === "check" && (
              <div className="space-y-4 border rounded-md p-4 bg-slate-400">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Cheque Details</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newCheque = {
                        chequeNumber: "",
                        bankName: "",
                        branchName: "",
                        chequeDate: new Date().toISOString().split('T')[0],
                        accountNumber: "",
                        amount: "",
                        holderName: "", // إضافة الحقل المفقود
                        holderPhone: "" // إضافة الحقل المفقود
                      };
                      setCheques([...cheques, newCheque]);
                    }}
                  >
                    Add Another Cheque
                  </Button>
                </div>
                
                {cheques.map((cheque, index) => (
                  <div key={index} className="space-y-3 border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Cheque #{index + 1}</h4>
                      {cheques.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedCheques = cheques.filter((_, i) => i !== index);
                            setCheques(updatedCheques);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`chequeNumber-${index}`}>Cheque Number</Label>
                        <Input
                          id={`chequeNumber-${index}`}
                          value={cheque.chequeNumber}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].chequeNumber = e.target.value;
                            setCheques(updatedCheques);
                          }}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`bankName-${index}`}>Bank Name</Label>
                        <Input
                          id={`bankName-${index}`}
                          value={cheque.bankName}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].bankName = e.target.value;
                            setCheques(updatedCheques);
                          }}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`branchName-${index}`}>Branch Name</Label>
                        <Input
                          id={`branchName-${index}`}
                          value={cheque.branchName}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].branchName = e.target.value;
                            setCheques(updatedCheques);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`chequeDate-${index}`}>Cheque Date</Label>
                        <Input
                          id={`chequeDate-${index}`}
                          type="date"
                          value={cheque.chequeDate}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].chequeDate = e.target.value;
                            setCheques(updatedCheques);
                          }}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`accountNumber-${index}`}>Account Number</Label>
                        <Input
                          id={`accountNumber-${index}`}
                          value={cheque.accountNumber}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].accountNumber = e.target.value;
                            setCheques(updatedCheques);
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${index}`}>Amount</Label>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          value={cheque.amount}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].amount = e.target.value;
                            setCheques(updatedCheques);
                          }}
                          required
                        />
                      </div>
                      
                      {/* إضافة حقل اسم حامل الشيك */}
                      <div className="space-y-2">
                        <Label htmlFor={`holderName-${index}`}>Cheque Holder Name</Label>
                        <Input
                          id={`holderName-${index}`}
                          value={cheque.holderName}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].holderName = e.target.value;
                            setCheques(updatedCheques);
                          }}
                        />
                      </div>
                      
                      {/* إضافة حقل رقم هاتف حامل الشيك */}
                      <div className="space-y-2">
                        <Label htmlFor={`holderPhone-${index}`}>Cheque Holder Phone</Label>
                        <Input
                          id={`holderPhone-${index}`}
                          value={cheque.holderPhone}
                          onChange={(e) => {
                            const updatedCheques = [...cheques];
                            updatedCheques[index].holderPhone = e.target.value;
                            setCheques(updatedCheques);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {cheques.length > 1 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-500">Total Cheque Amount: {
                      cheques.reduce((sum, cheque) => sum + (parseFloat(cheque.amount) || 0), 0).toFixed(2)
                    }</span>
                    <span className="text-sm text-gray-500">Payment Amount: {formData.amount}</span>
                  </div>
                )}
              </div>
            )}

          

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this payment"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/payments")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );}
