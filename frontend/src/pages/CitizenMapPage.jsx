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
import { useLanguage } from '../context/LanguageContext';

export default function CitizenMapPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [customCenter, setCustomCenter] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Panel visibility states: default closed on mobile so map is 100% visible immediately
  const [isLeftOpen, setIsLeftOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return false;
    try {
      const stored = localStorage.getItem('urban_eye_map_left_open');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isRightOpen, setIsRightOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return false;
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
    { id: 'all', label: t('allIssues', 'All Incidents'), icon: Layers, color: 'text-[#302B69]', bg: 'bg-[#F6F6FC]', border: 'border-[#302B69]/30' },
    { id: 'pothole', label: t('roadHazard', 'Road Hazards'), icon: AlertTriangle, color: 'text-[#302B69]', bg: 'bg-[#F6F6FC]', border: 'border-[#302B69]/30' },
    { id: 'waste', label: t('illegalWaste', 'Illegal Dumping'), icon: Trash2, color: 'text-[#302B69]', bg: 'bg-[#F6F6FC]', border: 'border-[#302B69]/30' },
    { id: 'water', label: t('waterSewage', 'Water Leaks'), icon: Droplets, color: 'text-[#302B69]', bg: 'bg-[#F6F6FC]', border: 'border-[#302B69]/30' },
    { id: 'lighting', label: t('streetlights', 'Streetlights'), icon: Zap, color: 'text-[#302B69]', bg: 'bg-[#F6F6FC]', border: 'border-[#302B69]/30' }
  ];

  // Filter detections
  const filteredReports = useMemo(() => {
    if (activeFilter === 'all') return reports;
    return reports.filter(r => {
      const rType = (r.type || '').toLowerCase();
      if (activeFilter === 'pothole') return rType.includes('pothole') || rType.includes('road');
      if (activeFilter === 'waste') return rType.includes('waste') || rType.includes('garbage') || rType.includes('dump');
      if (activeFilter === 'water') return rType.includes('water') || rType.includes('leak');
      if (activeFilter === 'lighting') return rType.includes('light') || rType.includes('lamp');
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
    <div className="flex-1 w-full h-full min-h-[calc(100dvh-57px)] lg:min-h-full bg-[#F6EBE8] overflow-hidden relative font-sans">
      
      {/* 1. Full-Bleed Google Map Container (Always fills 100% of viewport) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapView 
          detections={filteredReports}
          center={mapCenter}
          zoom={13}
          height="100%"
          onSelectDetection={(d) => setSelectedDetection(d)}
          showFilters={false}
        />
      </div>

      {/* Radar Sweep Animation */}
      {showScanner && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
          <div className="absolute w-[800px] h-[800px] rounded-full border border-[#302B69]/10 flex items-center justify-center">
            <div className="absolute w-[600px] h-[600px] rounded-full border border-[#302B69]/20 flex items-center justify-center">
              <div className="absolute w-[400px] h-[400px] rounded-full border border-[#302B69]/30 flex items-center justify-center">
                <div className="absolute w-[200px] h-[200px] rounded-full border border-[#302B69]/40 shadow-xs"></div>
              </div>
            </div>
          </div>
          
          <Crosshair className="absolute w-12 h-12 text-[#302B69]/50" strokeWidth={1} />
          
          <div className="absolute w-[800px] h-[800px] rounded-full animate-[spin_4s_linear_infinite]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}>
              <div className="w-full h-full bg-gradient-to-tr from-[#302B69]/0 to-[#302B69]/10 rounded-full"></div>
          </div>
        </div>
      )}

      {/* 2. Mobile Floating HUD Bar */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Filter Trigger Button */}
        <button
          onClick={() => {
            updateLeftOpen(!isLeftOpen);
            if (isRightOpen) updateRightOpen(false);
          }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636] text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Filter className="w-3.5 h-3.5 text-[#302B69]" />
          <span>{t('filterBy')}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5] font-mono text-[10px]">
            {filteredReports.length}
          </span>
        </button>

        {/* Center: Live Pin Indicator */}
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs font-mono font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#302B69] animate-pulse"></span>
          <span>{filteredReports.length} {t('live')}</span>
        </div>

        {/* Right: GPS Locate & Feed Trigger */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="p-2 rounded-xl bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] shadow-xs active:scale-95 transition-all"
            title="Locate me"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => {
              updateRightOpen(!isRightOpen);
              if (isLeftOpen) updateLeftOpen(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636] text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-[#302B69]" />
            <span>{t('activity')}</span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Backdrop when either drawer is open */}
      {(isLeftOpen || isRightOpen) && (
        <div 
          className="fixed inset-0 bg-[#191636]/30 backdrop-blur-xs z-30 lg:hidden animate-fade-in"
          onClick={() => {
            updateLeftOpen(false);
            updateRightOpen(false);
          }}
        />
      )}

      {/* 4. Desktop-Only Floating Trigger Button when Left Panel is Hidden */}
      <div 
        className={`hidden lg:block absolute top-6 left-6 z-20 transition-all duration-300 ease-in-out ${
          isLeftOpen 
            ? 'opacity-0 pointer-events-none -translate-x-12 scale-95' 
            : 'opacity-100 pointer-events-auto translate-x-0 scale-100'
        }`}
      >
        <button
          onClick={() => updateLeftOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636] flex items-center space-x-3 shadow-xs transition-all duration-200 group hover:scale-[1.02]"
          title="Open Layer Filters & Grid Info"
        >
          <div className="w-8 h-8 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69] group-hover:bg-[#302B69] group-hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">{t('filterBy')}</span>
            <span className="text-[10px] text-[#302B69] font-mono font-medium">
              {activeFilter === 'all' ? `${filteredReports.length} ${t('pins')}` : filters.find(f => f.id === activeFilter)?.label}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C87A6] group-hover:text-[#302B69] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 5. Left Panel (Grid Info & Layer Filters): Bottom-sheet on mobile, sidebar card on desktop */}
      <div 
        className={`fixed inset-x-3 bottom-4 top-auto max-h-[75vh] sm:inset-auto sm:top-16 sm:left-4 sm:w-80 lg:absolute lg:top-6 lg:left-6 lg:w-72 lg:max-h-[calc(100vh-5rem)] z-40 flex flex-col space-y-3 pointer-events-auto overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${
          isLeftOpen 
            ? 'translate-y-0 lg:translate-x-0 opacity-100' 
            : 'translate-y-full lg:-translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        {/* Header Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#302B69]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-[#191636] tracking-tight">{t('liveGridActive')}</h1>
                <p className="text-[9px] text-[#57536E] font-mono uppercase tracking-widest">{t('appSubtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={fetchReports}
                className="p-1.5 rounded-xl bg-[#F6F6FC] hover:bg-[#302B69] text-[#57536E] hover:text-white transition-colors"
                title="Refresh Map Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => updateLeftOpen(false)}
                className="p-1.5 rounded-xl bg-[#F6F6FC] hover:bg-[#302B69] text-[#57536E] hover:text-white transition-colors border border-transparent"
                title="Close Filters Panel"
              >
                <X className="w-4 h-4 lg:hidden" />
                <ChevronLeft className="w-4 h-4 hidden lg:block" />
              </button>
            </div>
          </div>

          <p className="text-xs text-[#57536E] leading-relaxed">
            {t('dashboardSubtitle')}
          </p>

          <div className="mt-3 pt-2.5 border-t border-[#E8E2E5] flex items-center justify-between text-xs">
            <span className="text-[#57536E] font-medium">{t('communityIssues')}:</span>
            <span className="font-mono font-bold text-[#302B69] bg-[#F6F6FC] px-2 py-0.5 rounded-full border border-[#E8E2E5]">
              {filteredReports.length}
            </span>
          </div>
        </div>

        {/* Filters Card */}
        <div className="p-3 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs">
          <div className="flex items-center justify-between px-2 pb-2.5 mb-1.5 border-b border-[#E8E2E5]">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-[#302B69]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#57536E]">{t('filterBy')}</span>
            </div>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-[10px] text-[#302B69] hover:text-[#191636] font-mono font-bold"
              >
                {t('reset')}
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

              const isSelected = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(filter.id);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      updateLeftOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#F6F6FC] border border-[#302B69]/30 shadow-xs'
                      : 'border border-transparent hover:bg-[#F6F6FC]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <filter.icon className={`w-4 h-4 ${isSelected ? 'text-[#302B69]' : 'text-[#8C87A6]'}`} />
                    <span className={`text-xs font-semibold ${isSelected ? 'text-[#191636] font-bold' : 'text-[#57536E]'}`}>
                      {filter.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white text-[#302B69] border border-[#E8E2E5] font-bold' : 'text-[#8C87A6]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Desktop Top Centered Status HUD & Master Zen Mode Toggle */}
      <div className="hidden lg:flex absolute top-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-white/95 border border-[#E8E2E5] items-center space-x-3 shadow-xs pointer-events-auto">
          {/* Live Pins Badge */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#302B69] rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-bold text-[#191636] uppercase tracking-widest whitespace-nowrap">
              {filteredReports.length} {t('pinsLive', 'Pins Live')}
            </span>
          </div>
          
          <div className="h-4 w-px bg-[#E8E2E5]"></div>

          {/* Locate Me */}
          <button 
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#302B69] hover:text-[#191636] uppercase tracking-widest transition-colors"
            title="Center map on your current location"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? t('locating', 'Locating...') : t('myLocation', 'My Location')}</span>
          </button>

          <div className="h-4 w-px bg-[#E8E2E5]"></div>

          {/* Radar Toggle */}
          <button 
            onClick={() => setShowScanner(!showScanner)}
            className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${showScanner ? 'text-[#302B69] font-bold' : 'text-[#57536E] hover:text-[#191636]'}`}
            title="Toggle Radar Sweep Animation"
          >
            {showScanner ? t('radarOn', 'Radar ON') : t('radarOff', 'Radar OFF')}
          </button>

          <div className="h-4 w-px bg-[#E8E2E5]"></div>

          {/* Full Map / Zen Mode Toggle */}
          <button 
            onClick={toggleFullMap}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
              isFullMap 
                ? 'bg-[#302B69] text-white shadow-xs font-black' 
                : 'bg-[#F6F6FC] text-[#302B69] hover:bg-[#302B69] hover:text-white border border-[#E8E2E5]'
            }`}
            title={isFullMap ? "Restore side cards (Shortcut: M)" : "Hide all side cards for clean full map view (Shortcut: M)"}
          >
            {isFullMap ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{isFullMap ? t('showCards', 'Show Cards') : t('fullMap', 'Full Map')}</span>
          </button>
      </div>

      {/* 7. Desktop-Only Floating Trigger Button when Right Feed is Hidden */}
      <div 
        className={`hidden lg:block absolute top-6 right-6 z-20 transition-all duration-300 ease-in-out ${
          isRightOpen 
            ? 'opacity-0 pointer-events-none translate-x-12 scale-95' 
            : 'opacity-100 pointer-events-auto translate-x-0 scale-100'
        }`}
      >
        <button
          onClick={() => updateRightOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636] flex items-center space-x-3 shadow-xs transition-all duration-200 group hover:scale-[1.02]"
          title="Open Live Incident Feed"
        >
          <ChevronLeft className="w-4 h-4 text-[#8C87A6] group-hover:text-[#302B69] group-hover:-translate-x-0.5 transition-all" />
          <div className="relative w-8 h-8 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69] group-hover:bg-[#302B69] group-hover:text-white transition-colors">
            <Activity className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#302B69] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#302B69]"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">{t('feed', 'Feed')}</span>
            <span className="text-[10px] text-[#302B69] font-mono font-medium">
              {filteredReports.length} {t('live', 'Live')}
            </span>
          </div>
        </button>
      </div>

      {/* 8. Right Panel: Live Feed (Bottom-sheet on mobile, sidebar on desktop) */}
      <div 
        className={`fixed inset-x-3 bottom-4 top-auto max-h-[75vh] sm:inset-auto sm:top-16 sm:right-4 sm:w-84 lg:absolute lg:right-6 lg:top-6 lg:bottom-6 lg:w-84 lg:max-h-none z-40 flex flex-col pointer-events-auto transition-all duration-300 ease-in-out ${
          isRightOpen 
            ? 'translate-y-0 lg:translate-x-0 opacity-100' 
            : 'translate-y-full lg:translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full rounded-2xl bg-white border border-[#E8E2E5] shadow-xs flex flex-col overflow-hidden max-h-[70vh] lg:max-h-none">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-[#E8E2E5] flex items-center justify-between bg-[#F6F6FC]">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-[#302B69]" />
              <h2 className="text-xs font-bold text-[#191636] uppercase tracking-widest">{t('liveIncidentFeed', 'Live Incident Feed')}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#302B69] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#302B69]"></span>
              </span>

              <button
                onClick={() => updateRightOpen(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-[#302B69] text-[#57536E] hover:text-white transition-colors border border-[#E8E2E5] ml-1"
                title="Close Live Feed"
              >
                <X className="w-4 h-4 lg:hidden" />
                <ChevronRight className="w-4 h-4 hidden lg:block" />
              </button>
            </div>
          </div>

          {/* Incidents List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-[#302B69]/20 border-t-[#302B69] rounded-full animate-spin"></div>
              </div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div 
                  key={report._id || report.id} 
                  onClick={() => {
                    setSelectedDetection(report);
                    if (report.lat && report.lng) {
                      setCustomCenter({ lat: Number(report.lat), lng: Number(report.lng) });
                    }
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      updateRightOpen(false);
                    }
                  }}
                  className="p-3 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] hover:border-[#302B69]/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E2E5] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#302B69]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-[#191636] truncate capitalize group-hover:text-[#302B69] transition-colors">
                          {report.type?.replace('_', ' ') || 'Incident'}
                        </h4>
                        <span className="text-[9px] text-[#57536E] font-mono whitespace-nowrap ml-1">
                          {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#57536E] truncate">
                        {report.address || `${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}`}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#E8E2E5] text-[10px]">
                        <span className="uppercase font-extrabold text-[#302B69]">
                          {t((report.severity || 'medium').toLowerCase(), report.severity || 'Medium')}
                        </span>
                        <span className="text-[#57536E] capitalize">{t((report.status || 'reported').toLowerCase(), report.status || 'Reported')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#57536E] text-xs">
                {t('noIncidentsForFilter', 'No incidents found for current filter.')}
              </div>
            )}
          </div>

          {/* Bottom Button */}
          <div className="p-3 border-t border-[#E8E2E5] bg-[#F6F6FC]">
            <button 
              onClick={() => navigate('/my-reports')}
              className="w-full py-2.5 rounded-xl bg-[#302B69] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#242052] transition-all flex items-center justify-center space-x-2"
            >
              <span>{t('myReportsAndPdf', 'My Reports & PDF')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 9. Incident Modal */}
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
