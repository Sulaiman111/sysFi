"use client"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Define types for our props
export interface MapViewProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  routes?: MapRoute[]
  driverLocation?: [number, number]
  onMarkerClick?: (marker: MapMarker) => void
  className?: string
  showControls?: boolean
  optimizeRoute?: boolean
}

export interface MapMarker {
  id: string
  position: [number, number]
  title: string
  description?: string
  icon?: "default" | "delivery" | "driver" | "warehouse"
}

export interface MapRoute {
  id: string
  waypoints: [number, number][]
  color?: string
}

// Create a placeholder component to show while the map is loading
function MapPlaceholder({ className }: { className?: string }) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="h-full min-h-[400px] w-full bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p>Loading map...</p>
        </div>
      </div>
    </Card>
  )
}

// Dynamically import the actual map component with SSR disabled
const DynamicMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: MapPlaceholder,
})

// This is the component we export - it's just a wrapper around the dynamic import
export function MapView(props: MapViewProps) {
  return <DynamicMap {...props} />
}

