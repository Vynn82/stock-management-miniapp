'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, LeafletMouseEvent } from 'leaflet';
import {
  MapPin,
  Search,
  X,
  Check,
  Navigation,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { api } from '@/lib/api';
import { LocationData, LocationSearchResult } from '@/types';

interface LocationMapPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: LocationData) => void;
}

// Default fallback location: Phnom Penh, Cambodia
const DEFAULT_LAT = 11.5564;
const DEFAULT_LNG = 104.9282;

export function LocationMapPicker({
  initialLat,
  initialLng,
  initialAddress = '',
  isOpen,
  onClose,
  onConfirm,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  const [currentLat, setCurrentLat] = useState<number>(initialLat || DEFAULT_LAT);
  const [currentLng, setCurrentLng] = useState<number>(initialLng || DEFAULT_LNG);
  const [formattedAddress, setFormattedAddress] = useState<string>(initialAddress);
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [commune, setCommune] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Reverse geocode coordinate update helper
  const updateFromCoordinates = useCallback(async (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    setIsGeocoding(true);
    setLocationError(null);

    try {
      const result = await api.reverseGeocode(lat, lng);
      if (result) {
        setFormattedAddress(result.formattedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setProvince(result.province || null);
        setDistrict(result.district || null);
        setCommune(result.commune || null);
      }
    } catch {
      setFormattedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Initialize or re-center map when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // Dynamically load leaflet on client side to prevent SSR issues
    const initMap = async () => {
      if (typeof window === 'undefined') return;
      const L = (await import('leaflet')).default;

      if (!mapContainerRef.current) return;

      const startLat = initialLat || DEFAULT_LAT;
      const startLng = initialLng || DEFAULT_LNG;
      setCurrentLat(startLat);
      setCurrentLng(startLng);

      // Create custom SVG marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-picker-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
            <div style="background-color: #2563eb; color: white; border-radius: 9999px; width: 34px; height: 34px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); border: 2.5px solid white; display: flex; align-items: center; justify-content: center; cursor: grab;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style="width: 8px; height: 8px; background-color: #1d4ed8; transform: rotate(45deg); margin-top: -4px;"></div>
            <div style="width: 14px; height: 4px; background-color: rgba(0,0,0,0.2); border-radius: 9999px; margin-top: 2px;"></div>
          </div>
        `,
        iconSize: [34, 40],
        iconAnchor: [17, 40],
      });

      // Cleanup existing map if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 14,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // OSM tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Draggable marker
      const marker = L.marker([startLat, startLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Listen for marker dragend
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateFromCoordinates(position.lat, position.lng);
      });

      // Listen for map click to reposition marker
      map.on('click', (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateFromCoordinates(lat, lng);
      });

      // Invalidate map size after animation frames to ensure full render
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // If initial coordinates provided and no address yet, reverse geocode now
      if (initialLat && initialLng && !initialAddress) {
        updateFromCoordinates(initialLat, initialLng);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initialLat, initialLng, initialAddress, updateFromCoordinates]);

  // Handle Search input
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await api.searchLocation(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No matching locations found. Try a different place or street name.');
      }
    } catch {
      setSearchError('Unable to search places. Please click directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search result item
  const handleSelectSearchResult = (result: LocationSearchResult) => {
    const { latitude, longitude, displayName, province: p, district: d, commune: c } = result;

    setCurrentLat(latitude);
    setCurrentLng(longitude);
    setFormattedAddress(displayName);
    setProvince(p || null);
    setDistrict(d || null);
    setCommune(c || null);
    setSearchResults([]);
    setSearchQuery('');

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 16, { animate: true });
      markerRef.current.setLatLng([latitude, longitude]);
    }
  };

  // Locate User GPS inside map
  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your device.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16, { animate: true });
          markerRef.current.setLatLng([latitude, longitude]);
        }

        updateFromCoordinates(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was denied. Please pick a location manually on the map.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('GPS signal unavailable. Please select on the map.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Please try again or select manually.');
        } else {
          setLocationError('Unable to get current location. Please select on the map.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleConfirm = () => {
    onConfirm({
      address: formattedAddress || `${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`,
      latitude: currentLat,
      longitude: currentLng,
      province,
      district,
      commune,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[640px]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">
                Choose Location on Map
              </h2>
              <p className="text-[11px] text-gray-500">
                Drag marker or click anywhere on the map to pin delivery point
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar & Autocomplete container */}
        <div className="p-3 border-b border-gray-100 bg-white relative z-20 shrink-0">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search place, street, district, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-14 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100 z-30 animate-in fade-in duration-150">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2.5 hover:bg-blue-50 flex items-start gap-2 text-xs transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-800 line-clamp-2">{res.displayName}</span>
                </button>
              ))}
            </div>
          )}

          {searchError && (
            <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {searchError}
            </p>
          )}

          {locationError && (
            <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {locationError}
            </p>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 w-full bg-gray-100 overflow-hidden min-h-[220px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Map Controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Use current GPS location"
              className="w-9 h-9 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-white active:scale-95 transition-all"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-blue-600" />
              )}
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom in"
              className="w-9 h-9 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-white active:scale-95 transition-all"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom out"
              className="w-9 h-9 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-white active:scale-95 transition-all"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Draggable notice pill */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2.5 z-10 pointer-events-none">
            <div className="bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Click map or drag pin to position
            </div>
          </div>
        </div>

        {/* Selected Coordinates & Address Preview Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 shrink-0 space-y-2.5">
          <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  Selected Location
                  {isGeocoding && <Loader2 className="w-2.5 h-2.5 text-blue-600 animate-spin ml-1" />}
                </div>
                <div className="text-xs font-semibold text-gray-800 line-clamp-2 mt-0.5">
                  {formattedAddress || 'Pinning location on map...'}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex flex-wrap gap-x-2">
                  <span>Lat: {currentLat.toFixed(6)}</span>
                  <span>Lng: {currentLng.toFixed(6)}</span>
                  {province && <span className="text-blue-600 font-sans font-medium">({[commune, district, province].filter(Boolean).join(', ')})</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Confirm & Cancel Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

