"use client"

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Define the props interface
interface ViewOnlyMapProps {
  value: {
    lat: number;
    lng: number;
  }
}

const ViewOnlyMap: React.FC<ViewOnlyMapProps> = ({ value }) => {
  const [position, setPosition] = useState<[number, number]>([value?.lat || 24.7136, value?.lng || 46.6753]); // Default to Riyadh if no coords
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setPosition([value.lat, value.lng]);
    }
  }, [value]);

  // Fix Leaflet icon issue
  useEffect(() => {
    // This code runs only on the client side
    import('leaflet').then((L) => {
      // Fix the default icon issue
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setMapReady(true);
    });
  }, []);

  if (!mapReady) {
    return <div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-md"></div>;
  }

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ width: '100%', height: '100%', minHeight: '200px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            موقع العميل
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ViewOnlyMap;
