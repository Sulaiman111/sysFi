import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"

interface Invoice {
  id: string
  customer: {
    name: string
    email: string
    image?: string
    initials: string
  }
  amount: number
  status: "paid" | "pending" | "overdue"
  date: string
}

const invoices: Invoice[] = [
  {
    id: "INV-2305-1001",
    customer: {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      image: "/placeholder-user.jpg",
      initials: "OM",
    },
    amount: 1999.0,
    status: "paid",
    date: "2023-05-04",
  },
  {
    id: "INV-2305-1002",
    customer: {
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
      image: "/placeholder-user.jpg",
      initials: "JL",
    },
    amount: 39.0,
    status: "pending",
    date: "2023-05-03",
  },
  {
    id: "INV-2305-1003",
    customer: {
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      image: "/placeholder-user.jpg",
      initials: "IN",
    },
    amount: 299.0,
    status: "paid",
    date: "2023-05-02",
  },
  {
    id: "INV-2305-1004",
    customer: {
      name: "William Kim",
      email: "will@email.com",
      image: "/placeholder-user.jpg",
      initials: "WK",
    },
    amount: 99.0,
    status: "overdue",
    date: "2023-04-28",
  },
  {
    id: "INV-2305-1005",
    customer: {
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
      image: "/placeholder-user.jpg",
      initials: "SD",
    },
    amount: 450.0,
    status: "paid",
    date: "2023-04-26",
  },
]

export function RecentInvoices() {
  return (
    <div className="space-y-8">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={invoice.customer.image} alt="Avatar" />
            <AvatarFallback>{invoice.customer.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{invoice.customer.name}</p>
            <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
          </div>
          <div className="ml-auto font-medium">
            <div className={`text-sm ${getStatusColor(invoice.status)}`}>{formatCurrency(invoice.amount)}</div>
            <div className="text-xs text-muted-foreground">{invoice.status}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
      return "text-green-500"
    case "pending":
      return "text-yellow-500"
    case "overdue":
      return "text-red-500"
    default:
      return ""
  }
}

