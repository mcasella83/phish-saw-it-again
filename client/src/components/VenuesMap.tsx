import React, { useEffect, useState } from "react";
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

interface VenuesMapProps {
  venues: VenueStats[];
}

// Known venue aliases and common name variations
const VENUE_ALIASES: Record<string, string[]> = {
  // Madison Square Garden variations
  "madison square garden": ["msg", "the garden", "madison square garden"],
  
  // Amphitheatres with changing sponsor names
  "pnc bank arts center": [ "garden state arts center", "pnc arts center"],
  "credit union 1 amphitheatre": ["world music theatre", "first midwest bank amphitheatre", "hollywood casino amphitheatre"],
  "keybank pavilion": ["post-gazette pavilion", "ic light amphitheatre", "starlake amphitheatre"],
  "ameris bank amphitheatre": ["verizon wireless amphitheatre", "lakewood amphitheatre"],
  "ruoff music center": ["verizon wireless music center", "klipsch music center", "deer creek music center"],
  
  // Arenas with name changes
  "united center": ["united center"],
  "td garden": ["fleetcenter", "td banknorth garden", "boston garden"],
  "wells fargo center": ["first union center", "wachovia center", "corestates center"],
  "climate pledge arena": ["keyarena", "seattle center coliseum"],
  
  // More venue name changes
  "freedom mortgage pavilion": ["bb&t pavilion", "tweeter center", "tweeter center at the waterfront"],
  "td pavilion at the mann": ["the mann center for the performing arts", "mann center", "mann music center"],

  // Other notable venues
  "fenway park": ["fenway park"],
  "wrigley field": ["wrigley field"],
  "red rocks amphitheatre": ["red rocks", "red rocks park"],
  "saratoga performing arts center": ["spac", "saratoga pac"],
  "bethel woods center for the arts": ["bethel woods"],
  "the gorge amphitheatre": ["the gorge"],
  "dick's sporting goods park": ["dicks", "commerce city"],
};

// Normalize venue name for better matching
const normalizeVenueName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Find the best venue name for geocoding
const getBestVenueNameForGeocoding = (venueName: string): string => {
  const normalized = normalizeVenueName(venueName);
  
  // Check if this venue name matches any known aliases
  for (const [canonical, aliases] of Object.entries(VENUE_ALIASES)) {
    if (aliases.some(alias => normalizeVenueName(alias) === normalized)) {
      return canonical;
    }
  }
  
  // Remove common problematic words that change over time
  let cleanName = normalized
    .replace(/\b(bank|arena|amphitheatre|amphitheater|center|centre|pavilion|stadium|theatre|theater|music|arts|park|coliseum|dome)\b/g, '')
    .replace(/\b(at|the|of|and|&)\b/g, '')
    .trim();
  
  // If we stripped too much, use original normalized name
  if (cleanName.length < 3) {
    cleanName = normalized;
  }
  
  return cleanName;
};

// Geocoding function using OpenStreetMap Nominatim API (free, no API key required)
const getVenueCoordinates = async (venue: VenueStats): Promise<VenueLocation | null> => {
  try {
    // Try multiple search strategies
    const searchStrategies = [
      // Strategy 1: Best venue name + city
      `${getBestVenueNameForGeocoding(venue.name)}, ${venue.city}, ${venue.state}, ${venue.country}`,
      // Strategy 2: Original venue name + city  
      `${venue.name}, ${venue.city}, ${venue.state}, ${venue.country}`,
      // Strategy 3: Just the core venue name + city (remove extra words)
      `${venue.name.split(' ').slice(0, 2).join(' ')}, ${venue.city}, ${venue.state}`,
      // Strategy 4: Special case for Mann Center (search for the venue address/area)
      venue.name.toLowerCase().includes('mann') ? `Mann Center, Fairmount Park, Philadelphia, PA` : null,
      // Strategy 5: City + venue type (fallback)
      `${venue.city}, ${venue.state}, amphitheatre`,
      `${venue.city}, ${venue.state}, arena`,
      `${venue.city}, ${venue.state}, theater`,
    ].filter(Boolean); // Remove null entries
    
    for (const searchQuery of searchStrategies) {
      try {
        const encodedQuery = encodeURIComponent(searchQuery);
        console.log(`Geocoding attempt: ${searchQuery}`);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=3&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'PhishApp/1.0 (Venue Mapping)'
            }
          }
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Look for the best match (prefer venues/amenities over just cities)
          const bestResult = data.find((result: any) => 
            result.type === 'venue' || 
            result.type === 'amphitheatre' || 
            result.type === 'stadium' ||
            result.type === 'arena' ||
            result.class === 'amenity' ||
            result.class === 'leisure'
          ) || data[0];
          
          console.log(`Found coordinates for ${venue.name}: ${bestResult.lat}, ${bestResult.lon} (strategy: ${searchQuery})`);
          
          return {
            ...venue,
            lat: parseFloat(bestResult.lat),
            lng: parseFloat(bestResult.lon),
          };
        }
      } catch (error) {
        console.warn(`Search strategy failed: ${searchQuery}`, error);
        continue;
      }
    }
    
    // Final fallback to city-only search
    console.log(`All venue searches failed, trying city: ${venue.city}, ${venue.state}`);
    const cityQuery = `${venue.city}, ${venue.state}, ${venue.country}`;
    const encodedCityQuery = encodeURIComponent(cityQuery);
    
    const cityResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedCityQuery}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PhishApp/1.0 (Venue Mapping)'
        }
      }
    );
    
    if (cityResponse.ok) {
      const cityData = await cityResponse.json();
      if (cityData && cityData.length > 0) {
        const cityResult = cityData[0];
        console.log(`Found city coordinates for ${venue.city}: ${cityResult.lat}, ${cityResult.lon}`);
        
        return {
          ...venue,
          lat: parseFloat(cityResult.lat),
          lng: parseFloat(cityResult.lon),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to geocode venue: ${venue.name}`, error);
    return null;
  }
};

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

export default function VenuesMap({ venues }: VenuesMapProps) {
  const [venueLocations, setVenueLocations] = useState<VenueLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const geocodeVenues = async () => {
      setLoading(true);
      const locations: VenueLocation[] = [];
      const cityVenueCount = new Map<string, number>(); // Track venues per city for offsetting
      
      setGeocodingProgress({ current: 0, total: venues.length });
      
      for (let i = 0; i < venues.length; i++) {
        const venue = venues[i];
        setGeocodingProgress({ current: i + 1, total: venues.length });
        
        const location = await getVenueCoordinates(venue);
        if (location) {
          const cityKey = `${location.city.toLowerCase()}, ${location.state.toLowerCase()}`;
          const existingCount = cityVenueCount.get(cityKey) || 0;
          
          // Add slight offset for multiple venues in same city to prevent complete overlap
          if (existingCount > 0) {
            const offsetDistance = 0.005; // Smaller offset since real coordinates are more accurate
            const angle = (existingCount * 45) * (Math.PI / 180); // 45 degrees apart
            location.lat += Math.cos(angle) * offsetDistance;
            location.lng += Math.sin(angle) * offsetDistance;
          }
          
          cityVenueCount.set(cityKey, existingCount + 1);
          locations.push(location);
        }
        
        // Add a small delay between requests to be respectful to the API
        if (i < venues.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setVenueLocations(locations);
      setLoading(false);
    };

    if (venues.length > 0) {
      geocodeVenues();
    } else {
      setLoading(false);
    }
  }, [venues]);

  if (loading) {
    return (
      <div className="h-96 w-full bg-muted rounded-md flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading map...</p>
          {geocodingProgress.total > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Geocoding venues: {geocodingProgress.current} / {geocodingProgress.total}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (venueLocations.length === 0) {
    return (
      <div className="h-96 w-full bg-muted rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No venue locations available</p>
      </div>
    );
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
