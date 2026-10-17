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

const POPULAR_LOCATIONS = [
  { name: 'Aeon 1', query: 'Aeon Mall 1 Phnom Penh', lat: 11.54808, lng: 104.9325859 },
  { name: 'Aeon 2 (Sen Sok)', query: 'Aeon Mall Sen Sok', lat: 11.5975, lng: 104.8872 },
  { name: 'Toul Kork', query: 'Toul Kork, Phnom Penh', lat: 11.5738692, lng: 104.8996872 },
  { name: 'BKK1', query: 'Boeung Keng Kang 1, Phnom Penh', lat: 11.5516, lng: 104.9254 },
  { name: 'Riverside (Daun Penh)', query: 'Daun Penh, Phnom Penh', lat: 11.5683, lng: 104.9304 },
  { name: 'Olympic Stadium', query: 'Olympic Stadium Phnom Penh', lat: 11.5583, lng: 104.9125 },
  { name: 'Chroy Changvar', query: 'Chroy Changvar, Phnom Penh', lat: 11.5935, lng: 104.9351 },
];

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
            <div style="background-color: #0f172a; color: white; border-radius: 9999px; width: 34px; height: 34px; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35); border: 2.5px solid white; display: flex; align-items: center; justify-content: center; cursor: grab;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style="width: 8px; height: 8px; background-color: #0f172a; transform: rotate(45deg); margin-top: -4px;"></div>
            <div style="width: 14px; height: 4px; background-color: rgba(0,0,0,0.25); border-radius: 9999px; margin-top: 2px;"></div>
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

  // Automatic live search debounced by 350ms
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(() => {
      executeSearch(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const executeSearch = async (queryText: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await api.searchLocation(queryText);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError(
          `No places found matching "${queryText}". Try a district or landmark (e.g. Toul Kork, Aeon).`,
        );
      }
    } catch {
      setSearchError('Unable to search places. Please click directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Form submit search handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    executeSearch(searchQuery.trim());
  };

  // Select Search result item from autocomplete dropdown
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

  // Quick select popular Phnom Penh delivery area / landmark
  const handleSelectQuickLandmark = (item: (typeof POPULAR_LOCATIONS)[0]) => {
    setSearchQuery(item.name);
    setCurrentLat(item.lat);
    setCurrentLng(item.lng);
    setSearchResults([]);
    setSearchError(null);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([item.lat, item.lng], 16, { animate: true });
      markerRef.current.setLatLng([item.lat, item.lng]);
    }
    updateFromCoordinates(item.lat, item.lng);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[640px] border border-neutral-200/80">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Select Delivery Location
              </h2>
              <p className="text-[11px] text-neutral-300">
                Drag pin or search any specific landmark in Cambodia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close map"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar, Quick Chips & Autocomplete container */}
        <div className="p-3 border-b border-neutral-100 bg-white relative z-30 shrink-0 space-y-2">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search place, street, district, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-neutral-500 animate-spin absolute right-2.5 top-2.5" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-3.5 py-2 bg-gradient-to-r from-neutral-950 to-neutral-800 hover:from-neutral-900 hover:to-neutral-700 disabled:from-neutral-300 disabled:to-neutral-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors active:scale-95 shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Select Popular Landmark Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-0.5 no-scrollbar">
            <span className="text-[10px] font-extrabold text-neutral-400 shrink-0 uppercase tracking-wider">
              Quick:
            </span>
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleSelectQuickLandmark(loc)}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-[11px] font-semibold rounded-xl shrink-0 whitespace-nowrap active:scale-95 transition-all shadow-2xs"
              >
                {loc.name}
              </button>
            ))}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-[5.25rem] bg-white border border-neutral-200 rounded-2xl shadow-2xl max-h-52 overflow-y-auto divide-y divide-neutral-100 z-50 animate-in fade-in duration-150">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-3 hover:bg-neutral-50 flex items-start gap-2.5 text-xs transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <span className="text-neutral-900 font-semibold block line-clamp-1">
                      {res.displayName.split(',')[0]}
                    </span>
                    <span className="text-neutral-500 text-[11px] block line-clamp-1 mt-0.5">
                      {res.displayName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchError && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/70 p-2 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              {searchError}
            </p>
          )}

          {locationError && (
            <p className="text-[11px] text-red-700 bg-red-50 border border-red-200/70 p-2 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              {locationError}
            </p>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 w-full bg-neutral-100 overflow-hidden min-h-[220px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Map Controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Use current GPS location"
              className="w-9 h-9 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-white active:scale-95 transition-all"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 text-neutral-900 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-neutral-900" />
              )}
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom in"
              className="w-9 h-9 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-white active:scale-95 transition-all"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom out"
              className="w-9 h-9 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-white active:scale-95 transition-all"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Draggable notice pill */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2.5 z-10 pointer-events-none">
            <div className="bg-neutral-950/85 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Click map or drag pin to position
            </div>
          </div>
        </div>

        {/* Selected Coordinates & Address Preview Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 shrink-0 space-y-2.5">
          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 text-xs shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase font-black tracking-wider text-neutral-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-900" />
                  Selected Delivery Point
                  {isGeocoding && <Loader2 className="w-2.5 h-2.5 text-neutral-900 animate-spin ml-1" />}
                </div>
                <div className="text-xs font-bold text-neutral-900 line-clamp-2 mt-0.5">
                  {formattedAddress || 'Pinning location on map...'}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5 flex flex-wrap gap-x-2">
                  <span>Lat: {currentLat.toFixed(6)}</span>
                  <span>Lng: {currentLng.toFixed(6)}</span>
                  {province && <span className="text-neutral-900 font-sans font-semibold">({[commune, district, province].filter(Boolean).join(', ')})</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Confirm & Cancel Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 min-h-[44px] bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 rounded-2xl text-xs font-bold transition-all text-center active:scale-95"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-2 py-3 px-4 min-h-[44px] bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 hover:from-neutral-900 hover:to-neutral-700 text-white rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Check className="w-4 h-4" />
              Confirm Delivery Point
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

