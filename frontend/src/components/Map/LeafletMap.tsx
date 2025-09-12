import { useEffect, useMemo, useRef, useState, memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG, MARKER_ICONS } from '../../config/mapConfig';
import { Location, Event } from '../../types';

// Fix for default markers in Leaflet with Webpack/Vite (avoid explicit any)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  locations: Location[];
  events?: Event[];
  selectedLocation?: Location;
  onLocationSelect?: (location: Location) => void;
  onEventSelect?: (event: Event) => void;
  className?: string;
}

export const LeafletMap = memo<LeafletMapProps>(({
  locations = [],
  events: _events = [],
  selectedLocation,
  onLocationSelect,
  onEventSelect: _onEventSelect,
  className = ''
}) => {
  // TODO: Implement events display and onEventSelect functionality
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'dark' | 'terrain'>('default');
  const [showEvents, setShowEvents] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Memoized callback for location selection
  const handleLocationSelect = useCallback((location: Location) => {
    onLocationSelect?.(location);
  }, [onLocationSelect]);

  // Memoized callback for event toggle
  const handleEventToggle = useCallback(() => {
    setShowEvents(prev => !prev);
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      try {
        // Create map instance
        const map = L.map(mapRef.current, {
          zoomControl: false // We'll add custom controls
        }).setView(
          [MAP_CONFIG.center.lat, MAP_CONFIG.center.lng],
          MAP_CONFIG.zoom
        );

        // Add zoom control in bottom right
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        // Add tile layer
        const tileLayer = L.tileLayer(MAP_CONFIG.tileLayer.url, {
          attribution: MAP_CONFIG.tileLayer.attribution,
          maxZoom: MAP_CONFIG.maxZoom,
          minZoom: MAP_CONFIG.minZoom
        });
        
        tileLayer.addTo(map);

        // Set campus bounds (optional - allows zooming beyond campus)
        // Uncomment the following lines if you want to restrict map bounds
        // const bounds = L.latLngBounds(
        //   [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
        //   [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east]
        // );
        // map.setMaxBounds(bounds);

        mapInstanceRef.current = map;
        setIsMapLoaded(true);
        setMapError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map. Please refresh the page.');
        toast.error('Failed to load map. Please refresh.');
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []);

  // Use the already filtered locations from props, with fallback sample data
  const filteredLocations = useMemo(() => {
    if (Array.isArray(locations) && locations.length > 0) return locations;
    return [
      {
        _id: 'sample-1',
        name: 'Main Academic Block',
        description: 'Primary academic building with classrooms and faculty offices',
        type: 'building' as const,
        coordinates: { lat: 30.3548, lng: 76.3635 },
        tags: ['academic', 'main'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'sample-2', 
        name: 'Central Library',
        description: 'Main library with study areas and digital resources',
        type: 'building' as const,
        coordinates: { lat: 30.3558, lng: 76.3645 },
        tags: ['library', 'study'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'sample-3',
        name: 'Student Cafeteria',
        description: 'Main dining facility for students and staff',
        type: 'poi' as const,
        coordinates: { lat: 30.3538, lng: 76.3625 },
        tags: ['food', 'dining'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }, [locations]);

  // Update markers when locations or events change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

  // Add location markers
  filteredLocations.forEach(location => {
      if (location.coordinates) {
        // Create custom icon based on type
        const emoji = MARKER_ICONS[location.type as keyof typeof MARKER_ICONS] || '📍';
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: white; 
              border-radius: 50%; 
              width: 35px; 
              height: 35px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              border: 3px solid #2563eb; 
              font-size: 18px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
            ">${emoji}</div>
          `,
          iconSize: [35, 35],
          iconAnchor: [17.5, 17.5],
          className: 'custom-leaflet-marker'
        });

        const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
          icon: customIcon
        });

        // Add popup with improved styling
        marker.bindPopup(`
          <div style="padding: 12px; min-width: 200px; font-family: Inter, sans-serif;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 8px 0; color: #1f2937;">${location.name}</h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0; line-height: 1.4;">${location.description || 'No description available'}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${location.type}</span>
              ${location.floor ? 
                `<span style="font-size: 12px; color: #6b7280;">Floor: ${location.floor}</span>` : ''}
            </div>
          </div>
        `, {
          closeButton: true,
          maxWidth: 250
        });

        // Add click handler
        marker.on('click', () => {
          handleLocationSelect(location);
        });

        marker.addTo(mapInstanceRef.current!);
        markersRef.current.push(marker);
      }
    });

    // Add event markers (if provided)
  if (showEvents && Array.isArray(_events) && _events.length > 0) {
      _events.forEach((evt) => {
        // Backend populates evt.locationId with Location when available
        let coords: Location['coordinates'] | undefined;
        const locId = (evt as unknown as { locationId?: Location | string }).locationId;
        if (locId && typeof locId === 'object' && 'coordinates' in locId) {
          const loc = locId as Location;
          coords = loc.coordinates;
        } else {
          coords = undefined;
        }
        if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          const customIcon = L.divIcon({
            html: `
              <div style="
                background: #1e293b; 
                color: #fff;
                border-radius: 8px; 
                padding: 4px 6px; 
                font-size: 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                cursor: pointer;
              ">🎫</div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            className: 'custom-leaflet-event-marker'
          });

          const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="padding: 10px; min-width: 200px; font-family: Inter, sans-serif;">
              <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0; color: #1f2937;">${evt.title ?? 'Event'}</h3>
              <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0;">${evt.description ?? ''}</p>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#334155;">
                <span>${evt.category ?? ''}</span>
                <span>${evt.dateTime ? new Date(evt.dateTime).toLocaleString() : ''}</span>
              </div>
            </div>
          `);

          marker.addTo(mapInstanceRef.current!);
          markersRef.current.push(marker);
  }
      });
    }
  }, [filteredLocations, _events, handleLocationSelect, showEvents]);

  // Handle selected location
  useEffect(() => {
    if (selectedLocation && selectedLocation.coordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng],
        18
      );
    }
  }, [selectedLocation]);

  // Change map style
  const changeMapStyle = (style: 'default' | 'satellite' | 'dark' | 'terrain') => {
    if (!mapInstanceRef.current) return;

    // Remove current tile layer
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    // Add new tile layer
    let tileConfig = MAP_CONFIG.tileLayer;
    if (style !== 'default') {
      tileConfig = MAP_CONFIG.alternativeTiles[style];
    }

    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: MAP_CONFIG.maxZoom,
      minZoom: MAP_CONFIG.minZoom
    });

    tileLayer.addTo(mapInstanceRef.current);
    setMapStyle(style);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls (style switcher) with Accessibility */}
      <div className="map-controls" role="toolbar" aria-label="Map style controls">
        <button
          className={`layer-toggle-btn ${mapStyle === 'default' ? 'ring-2 ring-green-500' : ''}`}
          title="Default map view"
          aria-label="Switch to default map view"
          aria-pressed={mapStyle === 'default'}
          onClick={() => changeMapStyle('default')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              changeMapStyle('default');
            }
          }}
        >
          M
        </button>
        <button
          className={`layer-toggle-btn ${mapStyle === 'satellite' ? 'ring-2 ring-green-500' : ''}`}
          title="Satellite map view"
          aria-label="Switch to satellite map view"
          aria-pressed={mapStyle === 'satellite'}
          onClick={() => changeMapStyle('satellite')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              changeMapStyle('satellite');
            }
          }}
        >
          S
        </button>
        <button
          className={`layer-toggle-btn ${mapStyle === 'dark' ? 'ring-2 ring-green-500' : ''}`}
          title="Dark map view"
          aria-label="Switch to dark map view"
          aria-pressed={mapStyle === 'dark'}
          onClick={() => changeMapStyle('dark')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              changeMapStyle('dark');
            }
          }}
        >
          D
        </button>
        <button
          className={`layer-toggle-btn ${mapStyle === 'terrain' ? 'ring-2 ring-green-500' : ''}`}
          title="Terrain map view"
          aria-label="Switch to terrain map view"
          aria-pressed={mapStyle === 'terrain'}
          onClick={() => changeMapStyle('terrain')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              changeMapStyle('terrain');
            }
          }}
        >
          T
        </button>
        <button
          className={`layer-toggle-btn ${showEvents ? 'ring-2 ring-emerald-500' : ''}`}
          title="Toggle events display"
          aria-label={`${showEvents ? 'Hide' : 'Show'} events on map`}
          aria-pressed={showEvents}
          onClick={() => handleEventToggle()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEventToggle();
            }
          }}
        >
          🎫
        </button>
      </div>

      {/* Search Results Counter with Accessibility */}
    <div 
      className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2"
      role="status"
      aria-live="polite"
      aria-label={`Search results: ${(Array.isArray(filteredLocations) ? filteredLocations.length : 0)} location${(Array.isArray(filteredLocations) ? filteredLocations.length : 0) !== 1 ? 's' : ''} found`}
    >
        <span className="text-sm font-medium">
      {(Array.isArray(filteredLocations) ? filteredLocations.length : 0)} location{(Array.isArray(filteredLocations) ? filteredLocations.length : 0) !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Loading State with Accessibility */}
      {!isMapLoaded && !mapError && (
        <div 
          className="absolute inset-0 bg-gray-50 flex items-center justify-center z-[2000]"
          role="status"
          aria-live="polite"
          aria-label="Loading campus map"
        >
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"
              aria-hidden="true"
            />
            <p className="text-gray-600 text-sm">Loading campus map...</p>
          </div>
        </div>
      )}

      {/* Error State with Accessibility */}
      {mapError && (
        <div 
          className="absolute inset-0 bg-red-50 flex items-center justify-center z-[2000]"
          role="alert"
          aria-live="assertive"
          aria-label={`Map error: ${mapError}`}
        >
          <div className="text-center">
            <div className="text-red-600 text-xl mb-2" aria-hidden="true">⚠️</div>
            <p className="text-red-600 text-sm">{mapError}</p>
          </div>
        </div>
      )}

      {/* Map Container with Accessibility */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        role="img"
        aria-label="Interactive campus map showing locations and events"
        tabIndex={0}
        onKeyDown={(e) => {
          // Allow map to receive focus for keyboard navigation
          if (e.key === 'Enter') {
            e.preventDefault();
            mapRef.current?.focus();
          }
        }}
        style={{ 
          minHeight: '500px',
          height: '100%',
          background: '#f8fafc'
        }}
      />
    </div>
  );
});

LeafletMap.displayName = 'LeafletMap';

export default LeafletMap;
