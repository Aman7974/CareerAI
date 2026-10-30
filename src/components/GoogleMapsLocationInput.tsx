/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMapsPlace,
  searchGoogleMapsPlaces,
  reverseGeocodeGoogleMaps,
  VERIFIED_GOOGLE_MAPS_PLACES,
} from '../utils/googleMapsLocations';

interface GoogleMapsLocationInputProps {
  value: string;
  onChange: (newLocation: string, place?: GoogleMapsPlace) => void;
  selectedCountryCode: string;
  onCountryDetected?: (countryCode: string) => void;
  required?: boolean;
}

export const GoogleMapsLocationInput: React.FC<GoogleMapsLocationInputProps> = ({
  value,
  onChange,
  selectedCountryCode,
  onCountryDetected,
  required = true,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GoogleMapsPlace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GoogleMapsPlace | null>(() => {
    return (
      VERIFIED_GOOGLE_MAPS_PLACES.find(
        (p) => p.name.toLowerCase() === value.toLowerCase() || value.toLowerCase().includes(p.city.toLowerCase())
      ) || null
    );
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setErrorMessage(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchGoogleMapsPlaces(val, selectedCountryCode);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);
  };

  // Select place from dropdown
  const handleSelectPlace = (place: GoogleMapsPlace) => {
    setSelectedPlace(place);
    setQuery(place.name);
    onChange(place.name, place);
    setIsOpen(false);
    setSuggestions([]);

    if (place.countryCode && onCountryDetected) {
      onCountryDetected(place.countryCode);
    }
  };

  // Handle GPS Auto-detect via Google Maps reverse geocode
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please type your city above.');
      return;
    }

    setIsGpsLoading(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const place = await reverseGeocodeGoogleMaps(latitude, longitude);
          if (place) {
            setSelectedPlace(place);
            setQuery(place.name);
            onChange(place.name, place);
            if (place.countryCode && onCountryDetected) {
              onCountryDetected(place.countryCode);
            }
          } else {
            // Fallback string
            const fallbackName = `Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            setQuery(fallbackName);
            onChange(fallbackName);
          }
        } catch (err: any) {
          setErrorMessage(`Google Maps lookup error: ${err.message || 'Could not resolve address'}`);
        } finally {
          setIsGpsLoading(false);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        setErrorMessage(`Could not access GPS (${err.message}). You can type any Google Maps location directly.`);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // Filtered popular places for quick chips
  const countryPopularPlaces = VERIFIED_GOOGLE_MAPS_PLACES.filter(
    (p) => p.countryCode === selectedCountryCode.toLowerCase()
  ).slice(0, 7);

  const googleMapsUrl =
    selectedPlace?.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'Bengaluru')}`;

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px] text-sky-400">pin_drop</span>
          <span>Google Maps Location *</span>
          <span className="text-[10px] text-sky-400 font-normal">(Any verified city / area on Google Maps)</span>
        </label>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isGpsLoading}
          className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer underline disabled:opacity-50"
          title="Detect your device GPS and resolve the exact place on Google Maps"
        >
          {isGpsLoading ? (
            <span className="inline-block w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span className="material-symbols-outlined text-[14px]">my_location</span>
          )}
          <span>{isGpsLoading ? 'Detecting via GPS...' : 'Detect Nearby (GPS)'}</span>
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0 || query.trim().length > 1) {
              setIsOpen(true);
            }
          }}
          placeholder="City or location"
          className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />

        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sky-400">
          <span className="material-symbols-outlined text-[18px]">search</span>
        </div>

        {/* Right action indicator */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <span className="inline-block w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
          )}
        </div>
      </div>

      {/* Live Google Maps Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-slate-900/95 backdrop-blur-md border border-sky-500/40 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
          <div className="p-2 bg-slate-950/80 text-[10px] font-semibold text-slate-400 flex items-center justify-between border-b border-slate-800">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="material-symbols-outlined text-[14px]">explore</span>
              <span>Google Maps Places Matching &quot;{query}&quot;</span>
            </span>
            <span>Select to Anchor Location</span>
          </div>

          {suggestions.length === 0 && !isLoading ? (
            <div className="p-3 text-center text-xs text-slate-400">
              No direct place matches found. You can still use &quot;{query}&quot; as custom Google Maps location.
            </div>
          ) : (
            suggestions.map((place) => (
              <button
                key={place.placeId}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="w-full p-2.5 text-left hover:bg-sky-950/60 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <div className="mt-0.5 p-1 rounded-md bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 shrink-0">
                  <span className="material-symbols-outlined text-[16px]">
                    {place.type === 'tech_hub'
                      ? 'apartment'
                      : place.type === 'landmark'
                      ? 'flag'
                      : 'location_on'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white group-hover:text-sky-300 flex items-center gap-1.5 flex-wrap">
                    <span>{place.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Google Maps
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {place.formattedAddress}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>
                      Coordinates: {place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}° E
                    </span>
                    <span>•</span>
                    <span className="capitalize">{place.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected location verification & Coordinates Indicator */}
      {selectedPlace && (
        <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-sky-200">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
            <div>
              <span className="font-semibold text-white">{selectedPlace.name}</span>
              <span className="text-slate-400 ml-1.5">
                ({selectedPlace.lat.toFixed(4)}° N, {selectedPlace.lng.toFixed(4)}° E)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Verified Tech Hubs for the Selected Country */}
      {countryPopularPlaces.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] text-slate-400 block mb-1">
            Top Google Maps Tech Hubs:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {countryPopularPlaces.map((p) => {
              const isSelected =
                query.toLowerCase().includes(p.city.toLowerCase()) ||
                selectedPlace?.placeId === p.placeId;
              return (
                <button
                  key={p.placeId}
                  type="button"
                  onClick={() => handleSelectPlace(p)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px] text-sky-400">place</span>
                  <span>{p.city}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error notification if geolocation or place lookup fails */}
      {errorMessage && (
        <div className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[14px]">info</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
