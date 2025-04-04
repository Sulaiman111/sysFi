"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeftIcon, PrinterIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { DeliveryMap } from "@/components/delivery/delivery-map"
import { PrintJobTimeline } from "@/components/print-jobs/print-job-timeline"
import { PrintJobDetails } from "@/components/print-jobs/print-job-details"

interface PrintJobEvent {
  id: string
  timestamp: string
  status: string
  location: string
  description: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface PrintJobData {
  id: string
  name: string
  customer: {
    name: string
    email: string
    phone: string
  }
  status: "queued" | "printing" | "completed" | "failed" | "cancelled"
  progress: number
  submittedDate: string
  estimatedCompletion: string
  printer: string
  type: string
  pages: number
  currentPage: number
  events: PrintJobEvent[]
  currentLocation: {
    lat: number
    lng: number
  }
}

// Mock data for a single print job
const mockPrintJobData: PrintJobData = {
  id: "PJ-2305-1001",
  name: "Annual Report 2023",
  customer: {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    phone: "(555) 123-4567",
  },
  status: "printing",
  progress: 65,
  submittedDate: "2023-05-04",
  estimatedCompletion: "2023-05-05",
  printer: "HP LaserJet Pro 4",
  type: "Document",
  pages: 45,
  currentPage: 29,
  currentLocation: {
    lat: 37.7749,
    lng: -122.4194,
  },
  events: [
    {
      id: "evt-001",
      timestamp: "2023-05-04T08:00:00Z",
      status: "Job Received",
      location: "Print Queue Server",
      description: "Print job has been received and validated",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    {
      id: "evt-002",
      timestamp: "2023-05-04T08:15:00Z",
      status: "Queued",
      location: "Print Queue Server",
      description: "Job has been added to the print queue",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    {
      id: "evt-003",
      timestamp: "2023-05-04T09:30:00Z",
      status: "Processing",
      location: "Print Server",
      description: "Job is being processed and prepared for printing",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    {
      id: "evt-004",
      timestamp: "2023-05-04T10:00:00Z",
      status: "Printing",
      location: "HP LaserJet Pro 4",
      description: "Job is currently printing",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
  ],
}

export default function PrintJobTrackingPage() {
  const params = useParams()
  const [printJob, setPrintJob] = useState<PrintJobData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, you would fetch the print job data from an API
    // For this example, we'll use the mock data
    setTimeout(() => {
      setPrintJob(mockPrintJobData)
      setLoading(false)
    }, 500)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <PrinterIcon className="h-8 w-8 animate-pulse" />
          <p>Loading print job information...</p>
        </div>
      </div>
    )
  }

  if (!printJob) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/print-jobs">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Print Jobs
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p>Print job not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/print-jobs">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Print Jobs
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{printJob.name}</h2>
          <p className="text-muted-foreground">
            Job ID: {printJob.id} | Type: {printJob.type}
          </p>
        </div>
        <Badge
          className="text-sm px-3 py-1"
          variant={
            printJob.status === "completed"
              ? "default"
              : printJob.status === "printing"
                ? "secondary"
                : printJob.status === "queued"
                  ? "outline"
                  : "destructive"
          }
        >
          {printJob.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Print Job Information</CardTitle>
            <CardDescription>Details about the current print job</CardDescription>
          </CardHeader>
          <CardContent>
            <PrintJobDetails printJob={printJob} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Print Job Progress</CardTitle>
            <CardDescription>Current progress and location tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{printJob.progress}%</span>
                </div>
                <Progress value={printJob.progress} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Page {printJob.currentPage} of {printJob.pages}
                  </span>
                  <span>Estimated completion: {formatDate(printJob.estimatedCompletion)}</span>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <DeliveryMap delivery={printJob} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Print Job Timeline</CardTitle>
          <CardDescription>Track the progress of your print job</CardDescription>
        </CardHeader>
        <CardContent>
          <PrintJobTimeline events={printJob.events} />
        </CardContent>
      </Card>
    </div>
  )
}

