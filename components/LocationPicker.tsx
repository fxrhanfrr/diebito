import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  defaultAddress?: string;
  placeholder?: string;
}

export default function LocationPicker({ 
  onLocationSelect, 
  defaultAddress = '', 
  placeholder = "Search for locality (e.g., Thane West)" 
}: LocationPickerProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Search by text (Option B) using free OpenStreetMap API (Nominatim)
  const searchLocation = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setResults(data);
      setShowResults(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Get current location (Option A) using HTML5 Geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Reverse geocode to get address string
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const foundAddress = data.display_name || "Current Location";
        setAddress(foundAddress);
        onLocationSelect({ lat: latitude, lng: longitude, address: foundAddress });
        setShowResults(false);
      } catch (e) {
        console.error(e);
        // Fallback
        setAddress("Current Location");
        onLocationSelect({ lat: latitude, lng: longitude, address: "Current Location" });
      } finally {
        setLoading(false);
      }
    }, () => {
      alert("Unable to retrieve your location. Please check your browser permissions.");
      setLoading(false);
    });
  };

  const handleSelect = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setAddress(item.display_name);
    setShowResults(false);
    onLocationSelect({ lat, lng, address: item.display_name });
  };

  // Debounce user typing to prevent spamming the API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (address !== defaultAddress && address.trim().length > 2) {
        // Only search if user typed something new and it's not the exact match already picked
        const isAlreadyPicked = results.some(r => r.display_name === address);
        if (!isAlreadyPicked) {
          searchLocation(address);
        }
      }
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [address]);

  return (
    <div className="relative space-y-2">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true) }}
            onBlur={() => setTimeout(() => setShowResults(false), 200)} // delay to allow clicks
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={getCurrentLocation} 
          disabled={loading} 
          className="shrink-0 bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {loading ? 'Locating...' : 'Use GPS'}
        </Button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-slate-100 text-sm border-b last:border-b-0 transition-colors"
              onMouseDown={(e) => {
                // Ignore blur when clicking dropdown
                e.preventDefault();
                handleSelect(item);
              }}
            >
              {item.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
