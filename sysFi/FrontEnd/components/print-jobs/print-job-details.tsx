"use client"

import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ClipboardIcon, PrinterIcon } from "lucide-react"

interface PrintJobDetailsProps {
  printJob: {
    id: string
    name: string
    customer: {
      name: string
      email: string
      phone: string
    }
    status: string
    submittedDate: string
    estimatedCompletion: string
    printer: string
    type: string
    pages: number
  }
}

export function PrintJobDetails({ printJob }: PrintJobDetailsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // In a real app, you would show a toast notification here
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Job ID</h3>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-medium">{printJob.id}</p>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(printJob.id)}>
            <ClipboardIcon className="h-4 w-4" />
            <span className="sr-only">Copy job ID</span>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Printer</h3>
        <div className="mt-1 flex items-center gap-2">
          <PrinterIcon className="h-4 w-4 text-muted-foreground" />
          <p className="font-medium">{printJob.printer}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Job Type</h3>
        <p className="mt-1 font-medium">{printJob.type}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Pages</h3>
        <p className="mt-1 font-medium">{printJob.pages}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Submitted Date</h3>
        <p className="mt-1 font-medium">{formatDate(printJob.submittedDate)}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Estimated Completion</h3>
        <p className="mt-1 font-medium">{formatDate(printJob.estimatedCompletion)}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
        <div className="mt-1">
          <p className="font-medium">{printJob.customer.name}</p>
          <p className="text-sm text-muted-foreground">{printJob.customer.email}</p>
          <p className="text-sm text-muted-foreground">{printJob.customer.phone}</p>
        </div>
      </div>
    </div>
  )
}

