'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { LocationData } from '@/types';

// Dynamic import with SSR disabled to guarantee Leaflet only renders on client
const LocationMapPicker = dynamic(
  () => import('./location-map-picker').then((mod) => mod.LocationMapPicker),
  { ssr: false }
);

interface LocationInputSectionProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
  onChange: (location: LocationData) => void;
  required?: boolean;
}

export function LocationInputSection({
  address,
  latitude,
  longitude,
  province,
  district,
  commune,
  onChange,
  required = true,
}: LocationInputSectionProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState<string | null>(null);

  // Track if coordinates came from map/GPS or if address text was altered manually
  const hasCoordinates = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  // Manual address typing handler:
  // When the user edits the address text manually, clear the coordinates so stale coordinates are not submitted
  const handleAddressTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setGpsError(null);
    setGpsSuccessMessage(null);

    // If coordinates were present, decouple them to avoid stale coordinate submissions
    onChange({
      address: newText,
      latitude: null,
      longitude: null,
      province: null,
      district: null,
      commune: null,
    });
  };

  // Map Picker confirmed handler
  const handleMapConfirm = (location: LocationData) => {
    setGpsError(null);
    setGpsSuccessMessage('Location selected from map');
    onChange(location);
    setIsMapOpen(false);
  };

  // "Use My Current Location" button click handler
  // Note: Only invoked on explicit user button click, NEVER on initial page load
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    if (isLocating) return; // Prevent duplicate requests

    setIsLocating(true);
    setGpsError(null);
    setGpsSuccessMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        try {
          const result = await api.reverseGeocode(lat, lng);
          const formatted = result?.formattedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          onChange({
            address: formatted,
            latitude: lat,
            longitude: lng,
            province: result?.province || null,
            district: result?.district || null,
            commune: result?.commune || null,
          });

          setGpsSuccessMessage('Current GPS location captured successfully');
        } catch {
          // Fallback if reverse geocode service fails
          onChange({
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            latitude: lat,
            longitude: lng,
            province: null,
            district: null,
            commune: null,
          });
          setGpsSuccessMessage('GPS coordinates recorded');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(
            'Location access was denied. You can enter your address manually or select on the map.',
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('GPS location unavailable. Please select on the map or type your address.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('Location request timed out. Please try again or choose on the map.');
        } else {
          setGpsError('Unable to retrieve location. Please choose on the map or enter manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  // Clear coordinates while keeping text address
  const handleClearCoordinates = () => {
    onChange({
      address,
      latitude: null,
      longitude: null,
      province: null,
      district: null,
      commune: null,
    });
    setGpsSuccessMessage(null);
  };

  return (
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-gray-700">
          Delivery / Customer Location {required && '*'}
        </label>
        {hasCoordinates && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> GPS Linked
          </span>
        )}
      </div>

      {/* Manual Address Input */}
      <div className="relative">
        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <textarea
          required={required}
          rows={2}
          placeholder="Enter address: House / Street / Commune / District / Province..."
          value={address}
          onChange={handleAddressTextChange}
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-colors"
        />
      </div>

      {/* Action Buttons: Choose on Map & Use Current Location */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className="py-2 px-2.5 bg-blue-50 hover:bg-blue-100/80 active:bg-blue-200/80 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Choose on Map</span>
        </button>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100/80 active:bg-indigo-200/80 disabled:opacity-60 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
              <span className="truncate">Getting GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Use My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {gpsError && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}

      {gpsSuccessMessage && !gpsError && (
        <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{gpsSuccessMessage}</span>
        </div>
      )}

      {/* Selected Location Preview Card */}
      {hasCoordinates && (
        <div className="p-2.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-xl text-xs space-y-1 animate-in fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                Selected Delivery Coordinates
              </div>
              <div className="text-[11px] font-mono text-gray-700 mt-0.5 flex flex-wrap gap-x-2">
                <span>
                  <strong>Latitude:</strong> {latitude?.toFixed(6)}
                </span>
                <span>
                  <strong>Longitude:</strong> {longitude?.toFixed(6)}
                </span>
              </div>
              {(province || district || commune) && (
                <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                  Area: {[commune, district, province].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleClearCoordinates}
              title="Remove GPS coordinates"
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-blue-100 text-[10px] text-blue-600">
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="font-semibold hover:underline flex items-center gap-1"
            >
              Edit on Map <ExternalLink className="w-2.5 h-2.5" />
            </button>
            <span className="text-gray-400">Synchronized</span>
          </div>
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      {isMapOpen && (
        <LocationMapPicker
          isOpen={isMapOpen}
          initialLat={latitude}
          initialLng={longitude}
          initialAddress={address}
          onClose={() => setIsMapOpen(false)}
          onConfirm={handleMapConfirm}
        />
      )}
    </div>
  );
}

