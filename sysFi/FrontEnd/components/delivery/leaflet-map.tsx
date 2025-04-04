"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Navigation, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MapViewProps } from "./map-view"

// This component will only be loaded client-side
export default function LeafletMap({
  center = [31.2357, 30.0444], // Cairo, Egypt as default center
  zoom = 13,
  markers = [],
  routes = [],
  driverLocation,
  onMarkerClick,
  className,
  showControls = true,
  optimizeRoute = false,
}: MapViewProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<any>(null)
  const routesLayerRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const routingControlRef = useRef<any>(null)

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [leaflet, setLeaflet] = useState<any>(null)

  // Initialize Leaflet only on client-side
  useEffect(() => {
    // Import Leaflet dynamically
    const initializeLeaflet = async () => {
      try {
        // Import Leaflet and its CSS
        const L = await import("leaflet")
        await import("leaflet/dist/leaflet.css")

        // Fix Leaflet's default icon path issues
        delete (L.Icon.Default.prototype as any)._getIconUrl

        // Set custom icon paths using public URLs instead of imports
        L.Icon.Default.mergeOptions({
          iconUrl: "/leaflet/marker-icon.png",
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        })

        // Try to import routing machine (optional)
        try {
          await import("leaflet-routing-machine")
        } catch (error) {
          console.warn("Leaflet Routing Machine not available:", error)
        }

        setLeaflet(L)
      } catch (error) {
        console.error("Error loading Leaflet:", error)
      }
    }

    initializeLeaflet()
  }, [])

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (!leaflet || !mapContainerRef.current) return

    // Create map instance
    const map = leaflet.map(mapContainerRef.current).setView(center, zoom)

    // Add OpenStreetMap tile layer
    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })
      .addTo(map)

    // Create layers for markers and routes
    markersLayerRef.current = leaflet.layerGroup().addTo(map)
    routesLayerRef.current = leaflet.layerGroup().addTo(map)

    // Store map reference
    mapRef.current = map
    setIsMapLoaded(true)

    // Clean up on unmount
    return () => {
      if (map) {
        map.remove()
        mapRef.current = null
        markersLayerRef.current = null
        routesLayerRef.current = null
        driverMarkerRef.current = null
        if (routingControlRef.current) {
          routingControlRef.current.remove()
          routingControlRef.current = null
        }
      }
    }
  }, [leaflet, center, zoom])

  // Update map center and zoom if props change
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return

    mapRef.current.setView(center, zoom)
  }, [center, zoom, isMapLoaded])

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !isMapLoaded || !leaflet) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Add new markers
    markers.forEach((marker) => {
      // Create custom icon based on marker type
      let icon

      switch (marker.icon) {
        case "delivery":
          icon = leaflet.divIcon({
            className: "custom-div-icon",
            html: `<div class="marker-pin bg-red-500"></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
          })
          break
        case "warehouse":
          icon = leaflet.divIcon({
            className: "custom-div-icon",
            html: `<div class="marker-pin bg-blue-500"></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
          })
          break
        case "driver":
          icon = leaflet.divIcon({
            className: "custom-div-icon",
            html: `<div class="marker-pin bg-green-500"></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
          })
          break
        default:
          icon = new leaflet.Icon.Default()
      }

      // Create marker with popup
      const mapMarker = leaflet
        .marker(marker.position, { icon })
        .bindPopup(`<b>${marker.title}</b>${marker.description ? `<br>${marker.description}` : ""}`)
        .addTo(markersLayerRef.current!)

      // Add click handler if provided
      if (onMarkerClick) {
        mapMarker.on("click", () => onMarkerClick(marker))
      }
    })
  }, [markers, isMapLoaded, onMarkerClick, leaflet])

  // Update routes when they change
  useEffect(() => {
    if (!mapRef.current || !routesLayerRef.current || !isMapLoaded || !leaflet) return

    // Clear existing routes
    routesLayerRef.current.clearLayers()

    // Add new routes
    routes.forEach((route) => {
      if (route.waypoints.length < 2) return

      const polyline = leaflet
        .polyline(route.waypoints, {
          color: route.color || "#3b82f6",
          weight: 5,
          opacity: 0.7,
          dashArray: "10, 10",
          lineJoin: "round",
        })
        .addTo(routesLayerRef.current!)

      // Fit map to route bounds
      mapRef.current?.fitBounds(polyline.getBounds(), { padding: [50, 50] })
    })
  }, [routes, isMapLoaded, leaflet])

  // Update driver location marker when it changes
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !driverLocation || !leaflet) return

    // Remove existing driver marker
    if (driverMarkerRef.current) {
      driverMarkerRef.current.remove()
    }

    // Create custom driver icon
    const driverIcon = leaflet.divIcon({
      className: "custom-div-icon",
      html: `<div class="marker-pin bg-green-500 pulse"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    })

    // Add new driver marker
    driverMarkerRef.current = leaflet
      .marker(driverLocation, { icon: driverIcon })
      .bindPopup("<b>Driver Location</b><br>Current position")
      .addTo(mapRef.current)
  }, [driverLocation, isMapLoaded, leaflet])

  // Handle route optimization
  const handleOptimizeRoute = async () => {
    if (!mapRef.current || !isMapLoaded || markers.length < 2 || !leaflet) return

    setIsOptimizing(true)

    try {
      // Remove existing routing control
      if (routingControlRef.current) {
        routingControlRef.current.remove()
      }

      // Check if routing machine is available
      if (leaflet.Routing && leaflet.Routing.control) {
        // Create waypoints from markers
        const waypoints = markers.map((marker) => leaflet.latLng(marker.position[0], marker.position[1]))

        // Create routing control
        routingControlRef.current = leaflet.Routing.control({
          waypoints,
          routeWhileDragging: false,
          showAlternatives: false,
          fitSelectedRoutes: true,
          lineOptions: {
            styles: [
              { color: "#6366F1", opacity: 0.8, weight: 6 },
              { color: "#818CF8", opacity: 0.5, weight: 2 },
            ],
          },
          createMarker: () => null, // Don't create default markers
        }).addTo(mapRef.current)

        // Wait for route calculation
        await new Promise((resolve) => {
          routingControlRef.current.on("routesfound", resolve)
        })
      } else {
        // Fallback if routing machine is not available
        // Create a simple polyline between markers
        const waypoints = markers.map((marker) => marker.position)
        leaflet
          .polyline(waypoints, {
            color: "#6366F1",
            weight: 5,
            opacity: 0.8,
          })
          .addTo(mapRef.current)
      }
    } catch (error) {
      console.error("Error optimizing route:", error)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Zoom controls
  const handleZoomIn = () => {
    if (!mapRef.current) return
    mapRef.current.setZoom(mapRef.current.getZoom() + 1)
  }

  const handleZoomOut = () => {
    if (!mapRef.current) return
    mapRef.current.setZoom(mapRef.current.getZoom() - 1)
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div ref={mapContainerRef} className="h-full min-h-[400px] w-full z-10" />

      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p>Loading map...</p>
          </div>
        </div>
      )}

      {showControls && isMapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <Button variant="secondary" size="icon" onClick={handleZoomIn} className="bg-background/80 backdrop-blur-sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut} className="bg-background/80 backdrop-blur-sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          {optimizeRoute && (
            <Button
              variant="secondary"
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || markers.length < 2}
              className="bg-background/80 backdrop-blur-sm"
            >
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              <span className="text-xs">Optimize</span>
            </Button>
          )}
        </div>
      )}

      {/* Add custom CSS for markers */}
      <style jsx global>{`
        .marker-pin {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .pulse {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </Card>
  )
}

