"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoaderIcon, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import { expenseService } from "@/lib/api/expense-service"
import { chequeService } from "@/lib/api/cheque-service"
import { customerService } from "@/lib/api/customer-service"

interface CustomerInfo {
  _id: string;
  customerName: string;
  companyName?: string;
  phone?: string;
  email?: string;
}

interface Cheque {
  _id: string;
  chequeNumber: string;
  bankName: string;
  amount: number;
  chequeDate: string;
  status: string;
  holderName: string;
  holderPhone?: string;
  type: string;
  chequeId: string;
}

interface Expense {
  _id: string;
  expenseId: string;
  customerId: CustomerInfo | string;
  amount: number;
  method: "cash" | "check";
  date: string;
  status: string;
  notes: string;
  cheques: Cheque[];
  invoiceId?: string;
  invoice?: {
    amount: number;
    status: string;
  };
}

interface ExpenseDetailsModalProps {
  expenseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseDetailsModal({ expenseId, isOpen, onClose }: ExpenseDetailsModalProps) {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      if (!isOpen || !expenseId) return;
      
      try {
        setIsLoading(true);
        //@ts-ignore
        const expenseData: Expense = await expenseService.getExpenseById(expenseId);
        setExpense(expenseData);

        if (expenseData?.customerId) {
          try {
            const customerId = typeof expenseData.customerId === 'object' 
              ? expenseData.customerId._id 
              : expenseData.customerId;
              
            const customerData = await customerService.getCustomerById(customerId);
            setCustomerDetails(customerData);
          } catch (customerError) {
            console.error('Error fetching customer details:', customerError);
          }
        }
      } catch (error) {
        console.error('Error fetching expense details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [expenseId, isOpen]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // In the handlePrint function, update the content template
    const content = `
      <html>
        <head>
          <title>Expense Details - ${expense?.expenseId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #f3f4f6; }
            .border { border: 1px solid #e5e7eb; padding: 10px; margin: 5px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Expense Details</h2>
          </div>
          <div class="grid">
            <div class="section">
              <h3>Expense Information</h3>
              <p>Expense ID: ${expense?.expenseId}</p>
              <p>Date: ${formatDate(expense?.date || '')}</p>
              <p>Amount: ${formatCurrency(expense?.amount || 0)}</p>
              <p>Method: ${expense?.method === 'cash' ? 'Cash' : 'Cheque'}</p>
              <p>Status: ${expense?.status}</p>
            </div>
            <div class="section">
              <h3>Customer Information</h3>
              <p>Name: ${customerDetails?.customerName || 'Unknown'}</p>
              ${customerDetails?.companyName ? `<p>Company: ${customerDetails.companyName}</p>` : ''}
              <p>Phone: ${customerDetails?.phone || 'N/A'}</p>
            </div>
          </div>
          ${expense?.method === 'check' && expense.cheques.length > 0 ? `
            <div class="section">
              <h3>Cheque Details</h3>
              ${expense.cheques.map(cheque => `
                <div class="border">
                  <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    <div style="flex: 1 1 45%; min-width: 200px;">
                      <p>Cheque Number: ${cheque.chequeNumber}</p>
                    </div>
                    <div style="flex: 1 1 45%; min-width: 200px;">
                      <p>Bank: ${cheque.bankName}</p>
                    </div>
                    <div style="flex: 1 1 45%; min-width: 200px;">
                      <p>Holder: ${cheque.holderName}</p>
                    </div>
                    <div style="flex: 1 1 45%; min-width: 200px;">
                      ${cheque.holderPhone ? `<p>Holder Phone: ${cheque.holderPhone}</p>` : '<p></p>'}
                    </div>
                    <div style="flex: 1 1 45%; min-width: 200px;">
                      <p>Amount: ${formatCurrency(cheque.amount)}</p>
                    </div>
                    <div style="flex: 1 1 45%; min-width: 200px;">
                      <p>Due Date: ${formatDate(cheque.chequeDate)}</p>
                    </div>
                    <div style="width: 100%; margin-top: 10px;">
                      <p>Status: ${cheque.status}</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${expense?.invoiceId ? `
            <div class="section">
              <h3>Invoice Information</h3>
              <p>Invoice ID: ${expense.invoiceId}</p>
              ${expense.invoice ? `
                <p>Invoice Amount: ${formatCurrency(expense.invoice.amount)}</p>
                <p>Invoice Status: ${expense.invoice.status}</p>
              ` : ''}
            </div>
          ` : ''}
          ${expense?.notes ? `
            <div class="section">
              <h3>Notes</h3>
              <div class="border">
                <p>${expense.notes}</p>
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90%] overflow-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Expense Details</DialogTitle>

        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoaderIcon className="h-8 w-8 animate-spin" />
          </div>
        ) : expense ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Expense Information</h3>
                <p>Expense ID: {expense.expenseId}</p>
                <p>Date: {formatDate(expense.date)}</p>
                <p>Amount: {formatCurrency(expense.amount)}</p>
                <p>Method: {expense.method}</p>
                <Badge>{expense.status}</Badge>
              </div>
              
              {/* Remove the notes from here */}
              
              <div>
                <h3 className="font-semibold">Customer Information</h3>
                <p>Name: {customerDetails?.customerName || "Unknown"}</p>
                {customerDetails?.companyName && (
                  <p>Company: {customerDetails.companyName}</p>
                )}
                <p>Phone: {customerDetails?.phone || "N/A"}</p>
              </div>
            </div>

            {expense.method === 'check' && expense.cheques && expense.cheques.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Cheque Details</h3>
                {expense.cheques.map((cheque) => (
                  <div key={cheque._id} className="border p-3 rounded-md mb-2">
                    <div className="grid grid-cols-2 gap-4">
                      <p>Cheque Number: {cheque.chequeNumber}</p>
                      <p>Bank: {cheque.bankName}</p>
                      <p>Holder: {cheque.holderName}</p>
                      {cheque.holderPhone && <p>Holder Phone: {cheque.holderPhone}</p>}
                      <p>Amount: {formatCurrency(cheque.amount)}</p>
                      <p>Due Date: {formatDate(cheque.chequeDate)}</p>
                      <div className="col-span-2">
                        <Badge variant={
                          cheque.status === 'pending' ? 'outline' :
                          cheque.status === 'completed' ? 'default' :
                          'destructive'
                        }>{cheque.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {expense.invoiceId && (
              <div>
                <h3 className="font-semibold mb-2">Invoice Information</h3>
                <p>Invoice ID: {expense.invoiceId}</p>
                {expense.invoice && (
                  <>
                    <p>Invoice Amount: {formatCurrency(expense.invoice.amount)}</p>
                    <p>Invoice Status: <Badge>{expense.invoice.status}</Badge></p>
                  </>
                )}

               
                
              </div>
            )}
             {expense.notes  !== '' && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold mb-2">Notes : </h3>
                    <div className=" p-4 rounded-lg border">
                      <p dir="rtl" className="whitespace-pre-wrap text-gray-300">{expense.notes}</p>
                    </div>
                  </div>
                )}

            {!isLoading && expense && (
            <div className="flex justify-end mt-4">
                  <Button
                    variant="default"
                    onClick={handlePrint}
                    className="flex items-center gap-2"
                  >
                    <span>Print</span>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
          )}
          </div>
        ) : (
          <div className="text-center py-4">No expense details found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}


