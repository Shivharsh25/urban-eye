import React, { useState, useEffect, useMemo } from 'react';
import MapView from '../components/MapView';
import DetectionModal from '../components/DetectionModal';
import { 
  Layers, 
  MapPin, 
  Filter, 
  AlertTriangle, 
  Zap, 
  Droplets, 
  Trash2, 
  Activity, 
  ArrowRight, 
  Crosshair, 
  ShieldAlert, 
  Eye, 
  RefreshCw,
  Locate,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { subscribeToDetections } from '../api/socket';

export default function CitizenMapPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [customCenter, setCustomCenter] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Panel visibility states with localStorage persistence
  const [isLeftOpen, setIsLeftOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('urban_eye_map_left_open');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isRightOpen, setIsRightOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('urban_eye_map_right_open');
      return stored !== null ? stored === 'true' : false;
    } catch {
      return false;
    }
  });

  const updateLeftOpen = (val) => {
    setIsLeftOpen(val);
    try {
      localStorage.setItem('urban_eye_map_left_open', String(val));
    } catch {}
  };

  const updateRightOpen = (val) => {
    setIsRightOpen(val);
    try {
      localStorage.setItem('urban_eye_map_right_open', String(val));
    } catch {}
  };

  const isFullMap = !isLeftOpen && !isRightOpen;

  const toggleFullMap = () => {
    if (isFullMap) {
      updateLeftOpen(true);
      updateRightOpen(true);
    } else {
      updateLeftOpen(false);
      updateRightOpen(false);
    }
  };

  // Keyboard shortcut (M: toggle full map, Esc: close cards)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleFullMap();
      } else if (e.key === 'Escape') {
        if (isLeftOpen || isRightOpen) {
          updateLeftOpen(false);
          updateRightOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeftOpen, isRightOpen, isFullMap]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/detections?scope=community');
      setReports(res.data.detections || []);
    } catch (err) {
      console.error('Failed to fetch detections for map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => setReports(prev => [newDoc, ...prev]),
      onMerged: ({ detection }) => setReports(prev => prev.map(d => (d.id === detection.id || d._id === detection.id ? detection : d))),
      onUpdated: (updated) => setReports(prev => prev.map(d => (d.id === updated.id || d._id === updated.id ? updated : d))),
      onDeleted: ({ id }) => setReports(prev => prev.filter(d => d.id !== id && d._id !== id))
    });

    return () => unsubscribe();
  }, []);

  const filters = [
    { id: 'all', label: 'All Incidents', icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { id: 'pothole', label: 'Road Hazards', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { id: 'waste', label: 'Illegal Dumping', icon: Trash2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { id: 'water', label: 'Water Leaks', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'lighting', label: 'Streetlights', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
  ];

  // Filter detections
  const filteredReports = useMemo(() => {
    if (activeFilter === 'all') return reports;
    return reports.filter(r => {
      const t = (r.type || '').toLowerCase();
      if (activeFilter === 'pothole') return t.includes('pothole') || t.includes('road');
      if (activeFilter === 'waste') return t.includes('waste') || t.includes('garbage') || t.includes('dump');
      if (activeFilter === 'water') return t.includes('water') || t.includes('leak');
      if (activeFilter === 'lighting') return t.includes('light') || t.includes('lamp');
      return true;
    });
  }, [reports, activeFilter]);

  // Compute smart center: custom GPS -> first valid report -> NCR default
  const mapCenter = useMemo(() => {
    if (customCenter) return customCenter;
    const valid = reports.find(r => r.lat && r.lng && !isNaN(r.lat) && !isNaN(r.lng));
    if (valid) {
      return { lat: Number(valid.lat), lng: Number(valid.lng) };
    }
    return { lat: 28.4744, lng: 77.5040 };
  }, [customCenter, reports]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomCenter({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        });
        setIsLocating(false);
      },
      (err) => {
        console.error('Locate error:', err);
        setIsLocating(false);
        alert('Could not determine current location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex h-full min-h-[calc(100dvh-60px)] lg:min-h-full w-full bg-[#05080f] overflow-hidden relative font-sans">
      
      {/* 1. Floating Trigger Button when Left Panel is Hidden */}
      <div 
        className={`absolute top-3 left-3 sm:top-6 sm:left-6 z-20 transition-all duration-300 ease-in-out ${
          isLeftOpen 
            ? 'opacity-0 pointer-events-none -translate-x-12 scale-95' 
            : 'opacity-100 pointer-events-auto translate-x-0 scale-100'
        }`}
      >
        <button
          onClick={() => updateLeftOpen(true)}
          className="glass-panel px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 hover:text-white flex items-center space-x-3 shadow-2xl backdrop-blur-xl transition-all duration-200 group hover:scale-[1.02]"
          title="Open Layer Filters & Grid Info"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
            <Filter className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">Layer Filters</span>
            <span className="text-[10px] text-cyan-400 font-mono font-medium">
              {activeFilter === 'all' ? `${filteredReports.length} Incidents` : filters.find(f => f.id === activeFilter)?.label}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 2. Floating Left Panel (Grid Info & Layer Filters) */}
      <div 
        className={`absolute top-3 left-3 right-3 sm:right-auto sm:left-6 sm:top-6 z-20 w-auto sm:w-72 max-w-[calc(100vw-1.5rem)] flex flex-col space-y-3 pointer-events-auto max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${
          isLeftOpen 
            ? 'translate-x-0 opacity-100' 
            : '-translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        {/* Header Card */}
        <div className="glass-panel p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">Live Grid</h1>
                <p className="text-[9px] text-cyan-400/80 font-mono uppercase tracking-widest">Urban Network</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={fetchReports}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Refresh Map Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => updateLeftOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/30"
                title="Hide Filters Panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time geospatial visualization of infrastructure hazards across your municipal sector.
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Active Incidents:</span>
            <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {filteredReports.length}
            </span>
          </div>
        </div>

        {/* Filters Card */}
        <div className="glass-panel p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between px-2 pb-2.5 mb-1.5 border-b border-slate-800/60">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Layer Filters</span>
            </div>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            {filters.map(filter => {
              const count = filter.id === 'all' 
                ? reports.length 
                : reports.filter(r => {
                    const t = (r.type || '').toLowerCase();
                    if (filter.id === 'pothole') return t.includes('pothole') || t.includes('road');
                    if (filter.id === 'waste') return t.includes('waste') || t.includes('garbage') || t.includes('dump');
                    if (filter.id === 'water') return t.includes('water') || t.includes('leak');
                    if (filter.id === 'lighting') return t.includes('light') || t.includes('lamp');
                    return false;
                  }).length;

              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeFilter === filter.id
                      ? `${filter.bg} border ${filter.border} shadow-sm`
                      : 'border border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <filter.icon className={`w-4 h-4 ${activeFilter === filter.id ? filter.color : 'text-slate-500'}`} />
                    <span className={`text-xs font-semibold ${activeFilter === filter.id ? 'text-white font-bold' : 'text-slate-400'}`}>
                      {filter.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    activeFilter === filter.id ? 'bg-slate-900/60 text-white font-bold' : 'text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Full-Screen Map Container */}
      <div className="flex-1 w-full h-full relative">
        <div className="w-full h-full relative z-0">
          <MapView 
            detections={filteredReports}
            center={mapCenter}
            zoom={13}
            height="100%"
            onSelectDetection={(d) => setSelectedDetection(d)}
            showFilters={false}
          />
        </div>

        {/* High-Tech Radar Overlay */}
        {showScanner && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
            <div className="absolute w-[800px] h-[800px] rounded-full border border-cyan-500/10 flex items-center justify-center">
              <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/20 flex items-center justify-center">
                <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 flex items-center justify-center">
                  <div className="absolute w-[200px] h-[200px] rounded-full border border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.2)]"></div>
                </div>
              </div>
            </div>
            
            <Crosshair className="absolute w-12 h-12 text-cyan-400/50" strokeWidth={1} />
            
            <div className="absolute w-[800px] h-[800px] rounded-full animate-[spin_4s_linear_infinite]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}>
               <div className="w-full h-full bg-gradient-to-tr from-cyan-400/0 to-cyan-400/20 rounded-full"></div>
            </div>
          </div>
        )}

        {/* 4. Top Centered Status HUD & Master Zen Mode Toggle */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 glass-panel px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl flex items-center space-x-3 shadow-2xl pointer-events-auto">
           {/* Live Pins Badge */}
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
             <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap">
               {filteredReports.length} Pins Live
             </span>
           </div>
           
           <div className="h-4 w-px bg-slate-700"></div>

           {/* Locate Me */}
           <button 
             onClick={handleLocateMe}
             disabled={isLocating}
             className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
             title="Center map on your current location"
           >
             <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
             <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'My Location'}</span>
           </button>

           <div className="h-4 w-px bg-slate-700"></div>

           {/* Radar Toggle */}
           <button 
             onClick={() => setShowScanner(!showScanner)}
             className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${showScanner ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
             title="Toggle Radar Sweep Animation"
           >
             {showScanner ? 'Radar ON' : 'Radar OFF'}
           </button>

           <div className="h-4 w-px bg-slate-700"></div>

           {/* Full Map / Zen Mode Toggle */}
           <button 
             onClick={toggleFullMap}
             className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
               isFullMap 
                 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 font-black' 
                 : 'bg-slate-800/80 text-cyan-400 hover:bg-slate-700/80 hover:text-cyan-300 border border-cyan-500/30'
             }`}
             title={isFullMap ? "Restore side cards (Shortcut: M)" : "Hide all side cards for clean full map view (Shortcut: M)"}
           >
             {isFullMap ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
             <span>{isFullMap ? 'Show Cards' : 'Full Map'}</span>
           </button>
        </div>
      </div>

      {/* 5. Floating Trigger Button when Right Feed is Hidden */}
      <div 
        className={`absolute top-3 right-3 sm:top-6 sm:right-6 z-20 transition-all duration-300 ease-in-out ${
          isRightOpen 
            ? 'opacity-0 pointer-events-none translate-x-12 scale-95' 
            : 'opacity-100 pointer-events-auto translate-x-0 scale-100'
        }`}
      >
        <button
          onClick={() => updateRightOpen(true)}
          className="glass-panel px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 hover:text-white flex items-center space-x-2 sm:space-x-3 shadow-2xl backdrop-blur-xl transition-all duration-200 group hover:scale-[1.02]"
          title="Open Live Incident Feed"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:-translate-x-0.5 transition-all" />
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">Feed</span>
            <span className="text-[10px] text-cyan-400 font-mono font-medium">
              {filteredReports.length} Live
            </span>
          </div>
        </button>
      </div>

      {/* 6. Floating Right Panel: Live Feed */}
      <div 
        className={`absolute right-3 left-3 sm:left-auto sm:right-6 top-3 sm:top-6 bottom-3 sm:bottom-6 w-auto sm:w-84 max-w-[calc(100vw-1.5rem)] z-20 flex flex-col pointer-events-auto transition-all duration-300 ease-in-out ${
          isRightOpen 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-panel h-full rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-black/20">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-widest">Live Incident Feed</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>

              <button
                onClick={() => updateRightOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/30 ml-1"
                title="Hide Live Feed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Incidents List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div 
                  key={report._id || report.id} 
                  onClick={() => setSelectedDetection(report)}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate capitalize group-hover:text-cyan-300 transition-colors">
                          {report.type?.replace('_', ' ') || 'Incident'}
                        </h4>
                        <span className="text-[9px] text-cyan-400/70 font-mono whitespace-nowrap ml-1">
                          {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {report.address || `${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}`}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-700/40 text-[10px]">
                        <span className={`uppercase font-extrabold ${report.severity === 'high' ? 'text-rose-400' : report.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {report.severity || 'Medium'}
                        </span>
                        <span className="text-slate-400 capitalize">{report.status || 'Reported'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                No incidents found for current filter.
              </div>
            )}
          </div>

          {/* Bottom Button */}
          <div className="p-3 border-t border-slate-800/80 bg-black/20">
            <button 
              onClick={() => navigate('/my-reports')}
              className="w-full py-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/20 border border-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>My Reports & PDF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. Incident Modal */}
      {selectedDetection && (
        <DetectionModal 
          detection={selectedDetection} 
          onClose={() => setSelectedDetection(null)}
          onStatusUpdated={(updated) => {
            setReports(prev => prev.map(r => (r._id === updated._id || r.id === updated.id ? updated : r)));
          }}
        />
      )}
      
    </div>
  );
}
