import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Layers, MapPin, Navigation, Map as MapIcon, Flame } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Internal component to handle programmatic map actions
const MapHandler = ({ center, zoom, selectedLocation, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(16);
    } else if (selectedLocation?.lat && selectedLocation?.lng) {
      map.panTo(selectedLocation);
    } else if (center) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom, selectedLocation, userLocation]);

  return null;
};

// HeatmapLayer is deprecated in Google Maps API v3.65+ and causes crashes.
// We remove the implementation but keep a dummy component to prevent breakages if referenced.
const HeatmapLayer = () => {
  return null;
};

// Custom Marker component
const IncidentMarker = ({ detection, onSelect }) => {
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const handleMarkerClick = useCallback(() => {
    setInfoWindowShown(isShown => !isShown);
  }, []);

  const handleClose = useCallback(() => {
    setInfoWindowShown(false);
  }, []);

  const colorMap = {
    high: { bg: '#ef4444', ring: 'rgba(239, 68, 68, 0.4)', text: '#fff' },
    medium: { bg: '#f59e0b', ring: 'rgba(245, 158, 11, 0.4)', text: '#fff' },
    low: { bg: '#10b981', ring: 'rgba(16, 185, 129, 0.4)', text: '#fff' }
  };
  const { bg, ring, text } = colorMap[detection.severity] || colorMap.medium;

  return (
    <>
      <Marker 
        position={{ lat: detection.lat, lng: detection.lng }} 
        onClick={handleMarkerClick}
        title={detection.type}
      />

      {infoWindowShown && (
        <InfoWindow 
          position={{ lat: detection.lat, lng: detection.lng }} 
          onCloseClick={handleClose}
          pixelOffset={[0, -20]}
        >
          <div className="p-1 font-sans" style={{ minWidth: '220px', color: '#1e293b' }}>
            {detection.imageUrl && (
              <img src={detection.imageUrl} alt="Issue" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#0284c7' }}>{detection.type.replace('_', ' ')}</span>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: detection.severity === 'high' ? '#fee2e2' : detection.severity === 'medium' ? '#fef3c7' : '#d1fae5', color: detection.severity === 'high' ? '#991b1b' : detection.severity === 'medium' ? '#92400e' : '#065f46', textTransform: 'uppercase' }}>
                {detection.severity}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px 0' }}>{detection.address || `${detection.lat}, ${detection.lng}`}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
              <span>Reports: <strong>{detection.reportCount || 1}</strong></span>
              <span style={{ textTransform: 'capitalize' }}>Status: <strong>{detection.status}</strong></span>
            </div>
            <button 
              onClick={() => { onSelect(detection); handleClose(); }} 
              style={{ width: '100%', marginTop: '8px', padding: '6px 10px', background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Inspect Incident Details
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default function MapView({
  detections = [],
  onSelectDetection,
  onLocationSelect,
  selectedLocation,
  center = { lat: 40.7128, lng: -74.0060 },
  zoom = 14,
  height = "520px",
  allowPinDrop = false,
  enableHeatmapToggle = false
}) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    Array.isArray(center) ? { lat: center[0], lng: center[1] } : center
  );

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        if (onLocationSelect && allowPinDrop) {
          onLocationSelect(coords);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error fetching location", error);
        alert("Could not fetch location. Please ensure location permissions are granted.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapClick = (e) => {
    const latLng = e.detail?.latLng || e.latLng;
    if (allowPinDrop && onLocationSelect && latLng) {
      const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
      const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
      
      onLocationSelect({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6))
      });
    }
  };

  const filteredDetections = detections.filter((d) => {
    if (selectedType !== 'all' && d.type !== selectedType) return false;
    if (selectedSeverity !== 'all' && d.severity !== selectedSeverity) return false;
    return d.lat && d.lng;
  });

  if (!API_KEY) {
    return (
      <div className="relative w-full rounded-2xl border border-slate-800 shadow-2xl bg-slate-900 flex items-center justify-center p-8 text-center" style={{ height }}>
        <div>
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Google Maps Setup Required</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Please add your Google Maps API Key to the <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-400">VITE_GOOGLE_MAPS_API_KEY</code> environment variable in the frontend <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-400">.env</code> file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl glass-panel group" style={{ height }}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={zoom}
          onClick={handleMapClick}
          disableDefaultUI={true}
          gestureHandling={'greedy'}
          style={{ width: '100%', height: '100%' }}
        >
          <MapHandler 
            center={mapCenter} 
            zoom={zoom} 
            selectedLocation={selectedLocation} 
            userLocation={userLocation}
          />
          
          {/* Render Detections (Always show since heatmap is disabled) */}
          {filteredDetections.map(d => (
            <IncidentMarker 
              key={d.id || `${d.lat}-${d.lng}`} 
              detection={d} 
              onSelect={onSelectDetection} 
            />
          ))}

          {/* Render User Location Pin */}
          {userLocation && (
            <Marker position={userLocation} title="Your Location" zIndex={100} />
          )}

          {/* Render Dropped Pin */}
          {allowPinDrop && selectedLocation && !userLocation && (
             <Marker position={selectedLocation} title="Dropped Pin" zIndex={90} />
          )}
        </Map>

      {/* Floating Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {allowPinDrop && (
            <button
              onClick={fetchLiveLocation}
              disabled={isLocating}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-xl shadow-lg bg-cyan-500/90 text-white hover:bg-cyan-400 border border-cyan-400/50 disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'LOCATING...' : 'LIVE'}</span>
            </button>
          )}

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-200 border border-slate-700/50 backdrop-blur-xl shadow-lg outline-none cursor-pointer focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Potholes</option>
            <option value="garbage">Garbage / Dumping</option>
            <option value="water_leak">Water Leaks</option>
            <option value="streetlight">Streetlights</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-200 border border-slate-700/50 backdrop-blur-xl shadow-lg outline-none cursor-pointer focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>

        {enableHeatmapToggle && (
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-xl shadow-lg border ${
                showHeatmap 
                  ? 'bg-rose-500/90 text-white border-rose-400 shadow-rose-500/25' 
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              {showHeatmap ? <MapIcon className="w-4 h-4" /> : <Flame className="w-4 h-4 text-rose-400" />}
              <span>{showHeatmap ? 'VIEW PINS' : 'HEATMAP'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Legend (Hide in Heatmap mode) */}
      {!showHeatmap && (
        <div className="absolute bottom-4 left-4 z-[400] px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl text-[11px] font-bold flex items-center space-x-4 shadow-xl pointer-events-none">
        <span className="text-slate-400 font-bold">SEVERITY:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-slate-300">High</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">Medium</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Low</span>
        </div>
        </div>
      )}

      {allowPinDrop && (
        <div className="absolute top-4 right-4 z-[400] px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold backdrop-blur-xl shadow-lg flex items-center space-x-2 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 animate-bounce" />
          <span>Click map to pin coordinate</span>
        </div>
      )}
    </div>
  );
}
