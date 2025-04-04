"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { InvoiceView } from "@/components/invoices/invoice-view"
import invoiceService from "@/lib/api/invoice-service"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ViewInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await invoiceService.getInvoiceById(params.id as string)
        setInvoice(data)
      } catch (error) {
        console.error("Error fetching invoice:", error)
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoice()
  }, [params.id, toast])

  const handleClose = () => {
    setIsOpen(false)
    router.back()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!invoice) {
    return <div>Invoice not found</div>
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice #{invoice.invoiceId || invoice.id}</DialogTitle>
        </DialogHeader>
        <InvoiceView
          invoice={{
            id: invoice.id,
            invoiceId: invoice.invoiceId,
            customer: invoice.customer,
            email: invoice.email || invoice.phone?.toString() || 'No email provided',
            amount: invoice.amount,
            status: invoice.status,
            date: invoice.date,
            dueDate: invoice.dueDate,
            items: invoice.items
          }}
        />
      </DialogContent>
    </Dialog>
  )
}