import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, SearchIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface PrintJob {
  id: string
  name: string
  customer: string
  status: "queued" | "printing" | "completed" | "failed" | "cancelled"
  submittedDate: string
  estimatedCompletion: string
  printer: string
  type: string
  pages: number
}

const printJobs: PrintJob[] = [
  {
    id: "PJ-2305-1001",
    name: "Annual Report 2023",
    customer: "Olivia Martin",
    status: "printing",
    submittedDate: "2023-05-04",
    estimatedCompletion: "2023-05-05",
    printer: "HP LaserJet Pro 4",
    type: "Document",
    pages: 45,
  },
  {
    id: "PJ-2305-1002",
    name: "Marketing Brochures",
    customer: "Jackson Lee",
    status: "queued",
    submittedDate: "2023-05-04",
    estimatedCompletion: "2023-05-06",
    printer: "Canon ImageRunner 3",
    type: "Brochure",
    pages: 200,
  },
  {
    id: "PJ-2305-1003",
    name: "Product Catalog Q2",
    customer: "Isabella Nguyen",
    status: "completed",
    submittedDate: "2023-05-02",
    estimatedCompletion: "2023-05-03",
    printer: "HP LaserJet Pro 4",
    type: "Catalog",
    pages: 120,
  },
  {
    id: "PJ-2305-1004",
    name: "Conference Badges",
    customer: "William Kim",
    status: "failed",
    submittedDate: "2023-05-03",
    estimatedCompletion: "2023-05-04",
    printer: "Epson WorkForce 2",
    type: "Cards",
    pages: 50,
  },
  {
    id: "PJ-2305-1005",
    name: "Training Manuals",
    customer: "Sofia Davis",
    status: "cancelled",
    submittedDate: "2023-05-01",
    estimatedCompletion: "2023-05-03",
    printer: "Canon ImageRunner 3",
    type: "Document",
    pages: 300,
  },
]

export default function PrintJobsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Print Jobs</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Print Job
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search print jobs..." className="pl-8" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Print Job Management</CardTitle>
          <CardDescription>Track and manage all your print jobs in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Printer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{job.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.type}, {job.pages} pages
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{job.customer}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "completed"
                          ? "default"
                          : job.status === "printing"
                            ? "secondary"
                            : job.status === "queued"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.submittedDate)}</TableCell>
                  <TableCell>{formatDate(job.estimatedCompletion)}</TableCell>
                  <TableCell>{job.printer}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/print-jobs/${job.id}`}>Track</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

