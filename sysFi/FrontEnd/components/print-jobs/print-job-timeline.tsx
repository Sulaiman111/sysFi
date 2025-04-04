import { formatDate } from "@/lib/utils"

interface TimelineEvent {
  id: string
  timestamp: string
  status: string
  location: string
  description: string
}

interface TimelineProps {
  events: TimelineEvent[]
}

export function PrintJobTimeline({ events }: TimelineProps) {
  // Sort events by timestamp in descending order (newest first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-6">
      {sortedEvents.map((event, index) => (
        <div key={event.id} className="flex">
          <div className="flex flex-col items-center mr-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              {index + 1}
            </div>
            {index < sortedEvents.length - 1 && <div className="w-px h-full bg-border mt-2"></div>}
          </div>
          <div className="pb-6">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">{event.status}</h3>
              <div className="ml-auto text-sm text-muted-foreground">{formatDate(new Date(event.timestamp))}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
            <p className="mt-2">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

