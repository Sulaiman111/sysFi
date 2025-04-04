"use client"

import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ClipboardIcon } from "lucide-react"

interface DeliveryDetailsProps {
  delivery: {
    id: string
    orderId: string
    customer: {
      name: string
      email: string
      phone: string
    }
    address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    status: string
    dispatchDate: string
    estimatedDelivery: string
    carrier: string
    trackingNumber: string
  }
}

export function DeliveryDetails({ delivery }: DeliveryDetailsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // In a real app, you would show a toast notification here
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Tracking Number</h3>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-medium">{delivery.trackingNumber}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => copyToClipboard(delivery.trackingNumber)}
          >
            <ClipboardIcon className="h-4 w-4" />
            <span className="sr-only">Copy tracking number</span>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Carrier</h3>
        <p className="mt-1 font-medium">{delivery.carrier}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Estimated Delivery</h3>
        <p className="mt-1 font-medium">{formatDate(delivery.estimatedDelivery)}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Shipped Date</h3>
        <p className="mt-1 font-medium">{formatDate(delivery.dispatchDate)}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Recipient</h3>
        <div className="mt-1">
          <p className="font-medium">{delivery.customer.name}</p>
          <p className="text-sm text-muted-foreground">{delivery.customer.email}</p>
          <p className="text-sm text-muted-foreground">{delivery.customer.phone}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Delivery Address</h3>
        <div className="mt-1">
          <p className="font-medium">{delivery.address.street}</p>
          <p className="text-sm text-muted-foreground">
            {delivery.address.city}, {delivery.address.state} {delivery.address.zip}
          </p>
          <p className="text-sm text-muted-foreground">{delivery.address.country}</p>
        </div>
      </div>
    </div>
  )
}

