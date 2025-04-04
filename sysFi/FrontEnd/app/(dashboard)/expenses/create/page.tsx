"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { expenseService } from "@/lib/api/expense-service"
import { supplierService } from "@/lib/api/supplier-service"
import { invoiceService, Invoice as ServiceInvoice } from "@/lib/api/invoice-service"
import { chequeService } from "@/lib/api/cheque-service"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, MinusIcon, LoaderIcon } from "lucide-react"
import Swal from 'sweetalert2'
import { METHODS } from "http"


interface Supplier {
  _id: string;
  supplierName: string;
  companyName?: string;
  balanceDue: number;  // Changed from Number to number
}

// Interface for invoice data - extending from service interface
interface Invoice extends Partial<ServiceInvoice> {
  _id: string;
  invoiceNumber: string;
  amount: number;
  remainingAmount: number;
  supplierId: string;
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

export default function CreateExpensePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierInvoices, setSupplierInvoices] = useState<Invoice[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [loadingInvoices, setLoadingInvoices] = useState(false)


  const [formData, setFormData] = useState({
    supplierId: "",
    invoiceId: "",
    amount: "",
    method: "cash",
    status: "completed",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  })

  const [isCheckExpense, setIsCheckExpense] = useState(false)
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
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true)
        const response = await supplierService.getAllSuppliers()
        setSuppliers(response)
      } catch (error) {
        console.error("Failed to fetch suppliers:", error)
        toast({
          title: "Error",
          description: "Failed to load suppliers. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoadingSuppliers(false)
      }
    }

    fetchSuppliers()
  }, [])

  // جلب الفواتير الخاصة بالعميل المحدد - استخدام نمط من expense-form.tsx
  const fetchSupplierInvoices = async (supplierId: string) => {
    if (!supplierId) {
      setSupplierInvoices([])
      console.log("No supplier selected")
      return
    }
    
    try {
      setLoadingInvoices(true)
      const data = await invoiceService.getInvoicesBySupplierId(supplierId)
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
      console.log('Supplier Invoices Details:');
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
      
      setSupplierInvoices(unpaidInvoices)
      
      if (unpaidInvoices.length === 0) {
        toast({
          title: "Information",
          description: "No outstanding invoices found for this supplier.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Failed to fetch invoices for supplier:", error)
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
    if (formData.supplierId) {
      fetchSupplierInvoices(formData.supplierId)
    } else {
      setSupplierInvoices([])
    }
  }, [formData.supplierId])

  useEffect(() => {
    if (formData.invoiceId) {
      const selectedInvoice = supplierInvoices.find(invoice => invoice._id === formData.invoiceId)
      if (selectedInvoice) {
        setFormData(prev => ({
          ...prev,
          amount: (selectedInvoice.remainingAmount).toString()
        }))
      }
    }
  }, [formData.invoiceId, supplierInvoices])

  useEffect(() => {
    setIsCheckExpense(formData.method === "check")
    
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
      // When switching to check expense method
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
        const selectedInvoice = supplierInvoices.find(inv => inv._id === formData.invoiceId);
        if (selectedInvoice && totalAmount > selectedInvoice.remainingAmount) {
          toast({
            title: "Warning",
            description: `Total cheque amount (${totalAmount}₪) exceeds remaining invoice amount (${selectedInvoice.remainingAmount}₪)`,
            variant: "destructive",
          });
        }
      }
    }
  }, [cheques, formData.method, formData.invoiceId, supplierInvoices]);



useEffect(() => {
  if (formData.supplierId && formData.amount) {
    const selectedSupplier = suppliers.find(c => c._id === formData.supplierId);
    const expenseAmount = parseFloat(formData.amount);
    
    if (selectedSupplier && !isNaN(expenseAmount)) {
      const originalBalance = selectedSupplier.balanceDue;
      const remainingBalance = originalBalance - expenseAmount;
      let autoNote = "";
      
      // إضافة معلومات الرصيد
      if (remainingBalance === 0) {
        autoNote = `تم تصفير حساب العميل بالكامل. الرصيد السابق: ${originalBalance}₪\n`;
      } else if (remainingBalance > 0) {
        autoNote = `دفعة جزئية - الرصيد السابق: ${originalBalance}₪ - المدفوع: ${expenseAmount}₪ - المتبقي: ${remainingBalance}₪\n`;
      }

      // إضافة نوع الدفعة
      const expenseMethod = formData.method === 'cash' ? 'نقداً' : 'شيكات';
      autoNote += `نوع الدفعة: ${expenseMethod}\n`;

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
}, [formData.amount, formData.supplierId, formData.method, suppliers, cheques]); // 

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!formData.supplierId) {
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

      const selectedSupplier = suppliers.find(c => c._id === formData.supplierId);
      const expenseAmount = parseFloat(formData.amount);

      // التحقق من مبلغ الدفعة النقدية
      if (formData.method === "cash" && selectedSupplier) {
        if (expenseAmount > selectedSupplier.balanceDue) {
          Swal.fire({
            title: 'Error!',
            html: `
              <div dir="rtl">
                <p>مبلغ الدفعة (${expenseAmount}₪) أكبر من الرصيد المستحق (${selectedSupplier.balanceDue}₪)</p>
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
        const selectedInvoice = supplierInvoices.find(inv => inv._id === formData.invoiceId);
        const expenseAmount = parseFloat(formData.amount);
        
        if (selectedInvoice) {
          // Calculate total paid including current expense
          const totalPaid = (selectedInvoice.amount - selectedInvoice.remainingAmount) + expenseAmount;
          const isFullyPaid = totalPaid >= selectedInvoice.amount;

          if (expenseAmount > selectedInvoice.remainingAmount && formData.method !== "cash") {
            const extraAmount = expenseAmount - selectedInvoice.remainingAmount;
            
            const result = await Swal.fire({
              title: 'تحذير!',
              html: `
                <div dir="rtl">
                  <p>مبلغ الدفعة (${expenseAmount}₪) أكبر من المبلغ المتبقي للفاتورة (${selectedInvoice.remainingAmount}₪)</p>
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
      interface ExpenseInput {
        supplierId: string;
        invoiceId?: string;
        amount: number;
        method: string;
        status: string;
        date: string;
        notes: string;
        expenseId: string;
        createdBy: string;
        cheques: string[];
      }


      // Create the expense input object with the final notes
      const expenseInput: ExpenseInput = {
        supplierId: formData.supplierId,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        date: formData.date,
        notes: formData.notes, // Now using the updated notes from formData
        expenseId: `PAY-${Date.now()}`,
        createdBy: "64f8b8e77571f9001cfa7d98",
        cheques: [],
      };

      // Only add invoiceId if it exists and is not empty
      if (formData.invoiceId && formData.invoiceId.trim() !== "") {
        expenseInput.invoiceId = formData.invoiceId;
      }

      console.log("Initial expense data:", expenseInput);

      // If expense method is check, create cheques first
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
              supplierId: formData.supplierId,
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
          
          // Add all created cheque IDs to the expense
          if (createdChequeIds.length > 0) {
            expenseInput.cheques = createdChequeIds;
          }
          
          console.log("Expense data with cheques:", expenseInput);
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
      console.log("Creating expense with final data:", expenseInput);
      //@ts-ignore
      const createdExpense = await expenseService.createExpense(expenseInput);
      console.log("Expense created successfully:", createdExpense);
      try {
        const expenseAmount = parseFloat(formData.amount);
        const selectedSupplier = suppliers.find(c => c._id === formData.supplierId);
        if (selectedSupplier) {
          const newBalance = Number(selectedSupplier.balanceDue) - expenseAmount;
          await supplierService.updateSupplier(formData.supplierId, {
            balanceDue: newBalance
          });
          console.log(`Updated supplier balance: New balance is ${newBalance}₪`);
        }
////////////////////////////////////
const sortedInvoices = supplierInvoices
    .filter(inv => inv.remainingAmount > 0)
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

  let remainingExpense = parseFloat(formData.amount);
  
  // توزيع المبلغ على الفواتير
  for (const invoice of sortedInvoices) {
    if (remainingExpense <= 0) break;

    const currentInvoiceRemaining = invoice.remainingAmount;
    const expenseForThisInvoice = Math.min(remainingExpense, currentInvoiceRemaining);

    if (expenseForThisInvoice > 0) {
      try {
        const invoiceExpense = {
          expenseId: createdExpense._id,
          amount: expenseForThisInvoice,
          date: formData.date,
          method: formData.method,
          reference: formData.notes || undefined
        };

        await invoiceService.addExpenseToInvoice(invoice._id, invoiceExpense);
        console.log(`Added expense of ${expenseForThisInvoice}₪ to invoice ${invoice.invoiceNumber}`);

        remainingExpense -= expenseForThisInvoice;
      } catch (error) {
        console.error(`Error adding expense to invoice ${invoice._id}:`, error);
      }
    }
  }

////////////////////////////////////


      } catch (balanceError) {
        console.error("Error updating supplier balance:", balanceError);
        // نستمر في العملية حتى لو فشل تحديث الرصيد
      }

      // Update cheques with the expense ID
      if (formData.method === "check" && createdExpense._id) {
        try {
          // Update all cheques with the expense ID
          await Promise.all(expenseInput.cheques.map(chequeId => 
            chequeService.updateCheque(chequeId, { expenseId: createdExpense._id })
          ));
          console.log("Updated all cheques with expense ID");
        } catch (updateError) {
          console.error("Error updating cheques with expense ID:", updateError);
          // Continue with the process as this is not a critical error
        }
      }

      console.log("Supplier ID to add expense to:", formData.supplierId);

      // إضافة الدفعة إلى قائمة مدفوعات العميل
      if (createdExpense && createdExpense._id) {
        try {
          console.log(`BEFORE ADDING: Attempting to add expense ID [${createdExpense._id}] to supplier ID [${formData.supplierId}]`);
          
          const apiUrl = 'http://localhost:5002/api/suppliers';
          const url = `${apiUrl}/${formData.supplierId}/expenses`;
          console.log(`Making direct fetch request to: ${url}`);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expenseId: createdExpense._id }),
          });
          
          console.log(`Fetch response status: ${response.status}`);
          
          
          if ( formData.invoiceId) {
            try {
            
              const invoiceExpense = {
                expenseId: createdExpense._id,
                amount: parseFloat(formData.amount),
                date: formData.date,
                method: formData.method,
                reference: formData.notes || undefined
              };

              await invoiceService.addExpenseToInvoice(formData.invoiceId, invoiceExpense);
              console.log("Expense added to invoice successfully");
              
            } catch (error) {
              console.error("Error updating invoice with expense:", error);

            }
          }


          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error response: ${errorText}`);
            throw new Error(`Server returned ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          console.log("AFTER ADDING: Expense added to supplier successfully");
          console.log("API Response from adding expense to supplier:", result);
          
          // التحقق من تحديث قائمة المدفوعات
          if (result && result.expenseList) {
            console.log("Updated supplier expense list:", result.expenseList);
            console.log("Does expense list include new expense?", result.expenseList.includes(createdExpense._id));
          } else {
            console.warn("Supplier response doesn't contain expenseList or is empty");
          }
          Swal.fire({
            title: 'Success!',
            text: 'Expense has been successfully recorded',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
          setTimeout(() => {
            window.location.href = "/expenses";
          }, 1500);
          
        } catch (addError: any) {
          console.error("Error adding expense to supplier:", addError);       
          setIsLoading(false);
          return; 
        }
      }

      Swal.fire({
        title: 'Success!',
        text: 'Expense has been successfully recorded',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      setTimeout(() => {
        window.location.href = "/expenses";
      }, 2100);
    } catch (error: any) {
      console.error("Error creating expense:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Record New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex w-100 justify-center" >
            <div className="space-y-2  px-2 flex-grow">
              <Label htmlFor="supplierId">Supplier</Label>
              {loadingSuppliers ? (
                <div className="flex items-center space-x-2">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  <span>Loading suppliers...</span>
                </div>
              ) : (
                <>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.companyName ? `${supplier.companyName} (${supplier.supplierName})` : supplier.supplierName}
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
                  value={Number(suppliers.find(c => c._id === formData.supplierId)?.balanceDue) || 0}
                  
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
                  Original Amount: {supplierInvoices.find(inv => inv._id === formData.invoiceId)?.amount}₪ - 
                  Paid: {(supplierInvoices.find(inv => inv._id === formData.invoiceId)?.amount || 0) - 
                        (supplierInvoices.find(inv => inv._id === formData.invoiceId)?.remainingAmount || 0)}₪ = 
                  Required: {supplierInvoices.find(inv => inv._id === formData.invoiceId)?.remainingAmount || 0}₪
                </p>
              )}
            </div>

            <div className="space-y-2  px-2 flex-grow">
              <Label htmlFor="method">Expense Method</Label>
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
              <Label htmlFor="date">Expense Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            </div>

            {/* Cheque details section - only shown when expense method is check */}
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
                    <span className="text-sm text-gray-500">Expense Amount: {formData.amount}</span>
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
                placeholder="Add any additional notes about this expense"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/expenses")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Record Expense"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );}
