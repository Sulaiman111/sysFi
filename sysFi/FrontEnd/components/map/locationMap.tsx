"use client"

import React, { useEffect, useRef, useState } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { fromLonLat, toLonLat } from "ol/proj"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Vector as VectorLayer } from "ol/layer"
import { Vector as VectorSource } from "ol/source"
import { Style, Icon } from "ol/style"
import { Button } from "@/components/ui/button"
import { MapPinIcon, Locate } from "lucide-react"

interface MapComponentProps {
  value?: { lat: number; lng: number }
  onChange?: (location: { lat: number; lng: number }) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ value, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const [coordinates, setCoordinates] = useState<string>(
    value && value.lat !== 0 && value.lng !== 0
      ? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
      : ""
  )
  const [loading, setLoading] = useState<boolean>(false)

  // Create marker layer with draggable functionality
  const createMarkerLayer = (coordinates: [number, number]) => {
    const feature = new Feature({
      geometry: new Point(coordinates),
    })

    const vectorSource = new VectorSource({
      features: [feature],
    })

    // Use the provided location pin icon
    const pinIcon = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZCkiPjxjaXJjbGUgY3g9IjI0Ljc1IiBjeT0iNDUuNzUiIHI9IjguMjUiIGZpbGw9IiM0ODQ4NDgiLz48Y2lyY2xlIGN4PSIyNC43NSIgY3k9IjQ1Ljc1IiByPSI4LjI1IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48ZyBmaWx0ZXI9InVybCgjZmlsdGVyMV9mKSI+PGVsbGlwc2UgY3g9IjI0LjczNSIgY3k9IjQ0LjU1NCIgcng9IjMuOTM4IiByeT0iMS4yODgiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjMiLz48L2c+PGcgb3BhY2l0eT0iLjI2MiIgZmlsdGVyPSJ1cmwoI2ZpbHRlcjJfZikiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzAuODY4IDQwLjI3M2M2LjgyNC0xLjI5NCAxMS42OTUtNC42OTIgMTEuNjk1LTguNjggMC01LjEwMy03Ljk3NS05LjI0LTE3LjgxMy05LjI0UzYuOTM3IDI2LjQ5IDYuOTM3IDMxLjU5M2MwIDMuOTggNC44NSA3LjM3IDExLjY1IDguNjcybDUuMDc3IDQuNDU5Yy40OC40MjIgMS40NTYuNDI4IDEuOTQ4LjAxbDUuMjU2LTQuNDZ6IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+PC9nPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzEuNTA0IDM2LjEyQzM4LjUyMiAzMy41MyA0My41IDI3LjAyNSA0My41IDE5LjQwOCA0My41IDkuNTE4IDM1LjEwNSAxLjUgMjQuNzUgMS41UzYgOS41MTggNiAxOS40MDhjMCA3LjYyNCA0Ljk4OCAxNC4xMzUgMTIuMDE2IDE2LjcxOWw2LjQ5IDguMjI2YS4zMTIuMzEyIDAgMDAuNDg5IDBsNi41MDktOC4yMzN6IiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXIpIi8+PGVsbGlwc2UgY3g9IjI0Ljc1IiBjeT0iMTkuODY2IiByeD0iNy41IiByeT0iNy4zNDciIGZpbGw9IiNCOTEzMTMiLz48ZGVmcz48ZmlsdGVyIGlkPSJmaWx0ZXIwX2QiIHg9IjExLjUiIHk9IjMyLjUiIHdpZHRoPSIyNi41IiBoZWlnaHQ9IjI2LjUiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIvPjxmZU1vcnBob2xvZ3kgcmFkaXVzPSIxIiBvcGVyYXRvcj0iZGlsYXRlIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93Ii8+PGZlT2Zmc2V0Lz48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxLjUiLz48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuNCAwIi8+PGZlQmxlbmQgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93Ii8+PGZlQmxlbmQgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93IiByZXN1bHQ9InNoYXBlIi8+PC9maWx0ZXI+PGZpbHRlciBpZD0iZmlsdGVyMV9mIiB4PSIxOC45NjciIHk9IjQxLjQzNiIgd2lkdGg9IjExLjUzNSIgaGVpZ2h0PSI2LjIzNiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+PGZlQmxlbmQgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9InNoYXBlIi8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iLjkxNSIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyIi8+PC9maWx0ZXI+PGZpbHRlciBpZD0iZmlsdGVyMl9mIiB4PSIyLjg2NyIgeT0iMTguMjgzIiB3aWR0aD0iNDMuNzY3IiBoZWlnaHQ9IjMwLjgzMiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+PGZlQmxlbmQgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9InNoYXBlIi8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMi4wMzUiIHJlc3VsdD0iZWZmZWN0MV9mb3JlZ3JvdW5kQmx1ciIvPjwvZmlsdGVyPjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjM3LjkwMiIgeTE9IjQ0LjAzNSIgeDI9IjM3LjkwMiIgeTI9IjI3LjI4MiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wLz48c3RvcCBvZmZzZXQ9Ii45OTIiIHN0b3Atb3BhY2l0eT0iLjAxIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXIiIHgxPSIzNy41NDIiIHkxPSI0MS43ODUiIHgyPSIzNy41NDIiIHkyPSIxMi40NjkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjREYyRDJEIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY0QzRDIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+";

    return new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: pinIcon,
          scale: 1.0,
        }),
      }),
    })
  }

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Default coordinates 
    const defaultCoords: [number, number] = [35.014174, 31.57733]
    
    // Use provided coordinates if available
    const initialCoords: [number, number] = value && value.lat !== 0 && value.lng !== 0
      ? [value.lng, value.lat]
      : defaultCoords

    // Create map with attribution control removed
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: [] // Remove OpenStreetMap attribution
          }),
        }),
      ],
      view: new View({
        center: initialCoords,
        zoom: 13,
        projection: "EPSG:4326",
      }),
      controls: [] // Remove all default controls including attribution
    })

    // Reference to the current marker feature and layer
    let currentMarkerFeature: Feature | null = null;
    let currentMarkerLayer: VectorLayer<VectorSource> | null = null;

    // Function to update marker position
    const updateMarkerPosition = (coordinates: [number, number]) => {
      // Remove existing marker layers
      map.getLayers().getArray()
        .filter(layer => layer instanceof VectorLayer)
        .forEach(layer => map.removeLayer(layer))
      
      // Create and add new marker
      currentMarkerLayer = createMarkerLayer(coordinates)
      map.addLayer(currentMarkerLayer)
      
      // Store reference to the marker feature
      currentMarkerFeature = currentMarkerLayer.getSource()?.getFeatures()[0] || null;
      
      // Update state and call onChange
      const [lng, lat] = coordinates
      setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      
      if (onChange) {
        onChange({ lat, lng })
      }
    }

    // Add initial marker if we have coordinates
    if (value && value.lat !== 0 && value.lng !== 0) {
      updateMarkerPosition(initialCoords)
    }

    // Handle click events to place marker
    map.on("click", (event) => {
      const clickedCoord = event.coordinate as [number, number]
      updateMarkerPosition(clickedCoord)
    })

    // Setup drag functionality
    let isDragging = false;
    let dragStartCoord: [number, number] | null = null;

    // Pointer move handler - change cursor when over marker
    map.on("pointermove", (event: any) => {
      if (isDragging) return;
      
      const pixel = map.getEventPixel(event.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });


    // @ts-ignore
    map.on("pointerdown", (event: any) => {
      const pixel = map.getEventPixel(event.originalEvent);
      
      if (map.hasFeatureAtPixel(pixel)) {
        isDragging = true;
        dragStartCoord = event.coordinate as [number, number];
        map.getTargetElement().style.cursor = 'grabbing';
        
        // Prevent the map from moving when dragging the marker
        event.stopPropagation();
      }
    });

    // Pointer drag handler - move marker
    map.on("pointerdrag", (event: any) => {
      if (!isDragging || !currentMarkerFeature) return;
      
      const newCoord = event.coordinate as [number, number];
      
      // Update marker position visually during drag
      const geometry = currentMarkerFeature.getGeometry() as Point;
      geometry.setCoordinates(newCoord);
    });

   // @ts-ignore
    map.on("pointerup", (event: any) => {
      if (!isDragging || !currentMarkerFeature) {
        isDragging = false;
        return;
      }
      
      const newCoord = event.coordinate as [number, number];
      
      // Update coordinates and trigger onChange
      const [lng, lat] = newCoord;
      setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      
      if (onChange) {
        onChange({ lat, lng })
      }
      
      isDragging = false;
      map.getTargetElement().style.cursor = 'pointer';
    });

    mapInstanceRef.current = map
    
    return () => {
      map.setTarget(undefined);
    }
  }, [])

  // Get current location
  const getCurrentLocation = () => {
    if (!mapInstanceRef.current) return
    
    setLoading(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const coordinates: [number, number] = [longitude, latitude]
          
          // Update map view
          mapInstanceRef.current?.getView().setCenter(coordinates)
          mapInstanceRef.current?.getView().setZoom(15)
          
          // Remove existing layers
          mapInstanceRef.current?.getLayers().getArray()
            .filter(layer => layer instanceof VectorLayer)
            .forEach(layer => mapInstanceRef.current?.removeLayer(layer))
          
          // Add new marker
          const markerLayer = createMarkerLayer(coordinates)
          mapInstanceRef.current?.addLayer(markerLayer)
          
          // Update state and call onChange
          setCoordinates(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          if (onChange) {
            onChange({ lat: latitude, lng: longitude })
          }
          
          setLoading(false)
        },
        (error) => {

          console.error("Error getting location:", error)
          console.log("Error code:", error.code)
          console.log("Error message:", error.message)


          setLoading(false)
          alert("Could not get your location. Please check your browser permissions.")
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {coordinates ? `Coordinates: ${coordinates}` : "Click on map to set location"}
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <Locate className="h-4 w-4" />
          {loading ? "Loading..." : "My Location"}
        </Button>
      </div>
      <div 
        ref={mapRef} 
        className="border rounded-md" 
        style={{ width: "100%", height: "300px", overflow: "hidden" }} 
      />
    </div>
  )
}

export default MapComponent
