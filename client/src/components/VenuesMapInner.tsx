import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VenueStats } from "@/lib/phish-processing";
import MapLegend from "./MapLegend";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VenueLocation {
  name: string;
  city: string;
  state: string;
  country: string;
  showCount: number;
  lat: number;
  lng: number;
}

interface VenuesMapInnerProps {
  venueLocations: VenueLocation[];
}

// Component to fit map bounds to markers
function MapBounds({ venues }: { venues: VenueLocation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (venues.length > 0) {
      const bounds = L.latLngBounds(venues.map(venue => [venue.lat, venue.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, venues]);
  
  return null;
}

// Create custom icon based on show count
const createCustomIcon = (showCount: number) => {
  const size = Math.min(Math.max(20 + (showCount * 2), 25), 50);
  const color = showCount >= 10 ? '#ef4444' : showCount >= 5 ? '#f97316' : '#22c55e';
  
  return L.divIcon({
    className: 'custom-venue-marker',
    html: `
      <div style="
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(10, size * 0.3)}px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${showCount}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function VenuesMapInner({ venueLocations }: VenuesMapInnerProps) {
  return (
    <div className="relative">
      <div className="h-96 w-full rounded-md overflow-hidden border">
        <MapContainer
          center={[39.8283, -98.5795]} // Center of USA
          zoom={4}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds venues={venueLocations} />
          {venueLocations.map((venue, index) => (
            <Marker
              key={`${venue.name}-${venue.city}-${index}`}
              position={[venue.lat, venue.lng]}
              icon={createCustomIcon(venue.showCount)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-base">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {venue.city}, {venue.state}, {venue.country}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {venue.showCount} show{venue.showCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Legend positioned absolutely in the top-right corner */}
      <div className="absolute top-2 right-2 z-[1000]">
        <MapLegend />
      </div>
    </div>
  );
}
