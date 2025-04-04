import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DownloadIcon, PrinterIcon, SendIcon } from "lucide-react"

interface InvoiceItem {
  id: string | number
  description?: string
  productName?: string
  quantity: number
  freeQuantity?: number
  unitPrice: number
  total?: number
  totalPrice?: number
}

interface InvoiceViewProps {
  invoice: {
    id: string
    invoiceId?: string
    customer: string
    email: string
    amount: number
    status: string
    date: string
    dueDate: string
    items?: InvoiceItem[]
  }
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  // Ensure we're handling the items correctly
  const invoiceItems = Array.isArray(invoice.items) ? invoice.items : [];
  // Calculate totals based on actual items
  const subtotal = invoiceItems.reduce((sum, item) => {
    // Handle both property naming conventions (total and totalPrice)
    const itemTotal = typeof item.total !== 'undefined' ? item.total : 
                     (typeof item.totalPrice !== 'undefined' ? item.totalPrice : 
                     (item.quantity * item.unitPrice));
    return sum + itemTotal;
  }, 0);
  
  const taxRate = 0.1; // 10%
  const tax = subtotal * taxRate;
  const total = invoice.amount; // Use invoice amount directly

  // Add print function
  const handlePrint = () => {
    // Create a new window
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert("Unable to open print window. Please check your popup settings.");
      return;
    }
    
    // Write the HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceId || invoice.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .company-info, .invoice-info {
              margin-bottom: 20px;
            }
            .invoice-info {
              text-align: right;
            }
            .bill-to {
              border-top: 1px solid #ddd;
              padding-top: 20px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            th {
              background-color: #f2f2f2;
              text-align: left;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              width: 300px;
              margin-left: auto;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .grand-total {
              border-top: 1px solid #ddd;
              padding-top: 5px;
              font-weight: bold;
            }
            .status {
              font-weight: bold;
            }
            .status-paid {
              color: green;
            }
            .status-overdue {
              color: red;
            }
            .status-pending, .status-draft {
              color: orange;
            }
            .payment-info {
              border-top: 1px solid #ddd;
              padding-top: 20px;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <h2>BillFlow Inc.</h2>
                <p>123 Business Street</p>
                <p>San Francisco, CA 94107</p>
                <p>billing@billflow.com</p>
              </div>
              <div class="invoice-info">
                <h2>Invoice</h2>
                <p>Invoice Number: ${invoice.invoiceId || invoice.id}</p>
                <p>Issue Date: ${formatDate(invoice.date)}</p>
                <p>Due Date: ${formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            <div class="bill-to">
              <h3>Bill To:</h3>
              <p><strong>${invoice.customer}</strong></p>
              <p>${invoice.email}</p>
              <p>Customer Address Line 1</p>
              <p>Customer City, State, ZIP</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Free Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceItems.length > 0 ? 
                  invoiceItems.map(item => `
                    <tr>
                      <td>${item.productName || item.description || "No product name"}</td>
                      <td class="text-right">${item.quantity}</td>
                      <td class="text-right">${item.freeQuantity || 0}</td>
                      <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                      <td class="text-right">${formatCurrency(item.totalPrice || item.total || (item.quantity * item.unitPrice))}</td>
                    </tr>
                  `).join('') : 
                  `<tr><td colspan="5" style="text-align: center;">No items available for this invoice</td></tr>`
                }
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              <div class="total-row">
                <span>Tax (10%):</span>
                <span>${formatCurrency(tax)}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>${formatCurrency(total)}</span>
              </div>
              <div class="total-row">
                <span>Status:</span>
                <span class="status status-${invoice.status.toLowerCase()}">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
              </div>
            </div>

            <div class="payment-info">
              <p>Payment Terms: Net 7 days</p>
              <p>Please make payment to: BillFlow Inc.</p>
              <p>Bank: National Bank</p>
              <p>Account: 1234567890</p>
              <p>Routing: 987654321</p>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
          
          <script>
            // Automatically trigger print when the page loads
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-bold">BillFlow Inc.</h3>
          <p className="text-sm text-muted-foreground">123 Business Street</p>
          <p className="text-sm text-muted-foreground">San Francisco, CA 94107</p>
          <p className="text-sm text-muted-foreground">billing@billflow.com</p>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-bold">Invoice</h3>
          <p className="text-sm text-muted-foreground">Invoice Number: {invoice.invoiceId || invoice.id}</p>
          <p className="text-sm text-muted-foreground">Issue Date: {formatDate(invoice.date)}</p>
          <p className="text-sm text-muted-foreground">Due Date: {formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Bill To:</h4>
        <p className="font-medium">{invoice.customer}</p>
        <p className="text-sm text-muted-foreground">{invoice.email}</p>
        <p className="text-sm text-muted-foreground">Customer Address Line 1</p>
        <p className="text-sm text-muted-foreground">Customer City, State, ZIP</p>
      </div>

      <div className="border rounded-md">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-2 text-left text-sm font-medium">Product Name</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Quantity</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Free Qty</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Unit Price</th>
              <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(invoiceItems && Array.isArray(invoiceItems) && invoiceItems.length > 0) ? (
              invoiceItems.map((item) => (
                <tr key={item.id }>
                  <td className="px-4 py-2 text-sm">{item.productName || item.description || "No product name"}</td>
                  <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-right">{item.freeQuantity || 0}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    {formatCurrency(item.totalPrice || item.total || (item.quantity * item.unitPrice))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-sm text-center text-muted-foreground">
                  No items available for this invoice (Check console for details)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Subtotal:</span>
            <span className="text-sm">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Tax (10%):</span>
            <span className="text-sm">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-medium">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`text-sm font-medium ${
                invoice.status === "paid"
                  ? "text-green-500"
                  : invoice.status === "overdue"
                    ? "text-red-500"
                    : "text-yellow-500"
              }`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 text-sm text-muted-foreground">
        <p>Payment Terms: Net 7 days</p>
        <p>Please make payment to: BillFlow Inc.</p>
        <p>Bank: National Bank</p>
        <p>Account: 1234567890</p>
        <p>Routing: 987654321</p>
      </div>

      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">Thank you for your business!</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button size="sm" variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm">
            <SendIcon className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

