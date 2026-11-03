import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  LayoutGrid, 
  Car, 
  Droplets, 
  Zap, 
  Megaphone, 
  CheckCircle2, 
  Compass, 
  ExternalLink, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX, 
  Share2, 
  PhoneCall, 
  Check, 
  ShieldCheck,
  MapPin,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getSocket } from '../api/socket';
import api from '../api/client';

export default function CitizenAlertsPage() {
  const { t, lang } = useLanguage();

  const [activeCategory, setActiveCategory] = useState('ALL'); // ALL, emergency, traffic, water, electricity, notice
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // User Alert Preferences state stored in localStorage
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('urban_eye_alert_prefs');
      return stored ? JSON.parse(stored) : {
        emergency: true,
        traffic: true,
        water: true,
        electricity: true,
        notice: true,
        smsNotifications: false,
        soundAlerts: true
      };
    } catch {
      return {
        emergency: true,
        traffic: true,
        water: true,
        electricity: true,
        notice: true,
        smsNotifications: false,
        soundAlerts: true
      };
    }
  });

  // Acknowledged alerts state
  const [acknowledgedMap, setAcknowledgedMap] = useState(() => {
    try {
      const stored = localStorage.getItem('urban_eye_ack_alerts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const togglePreference = (key) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('urban_eye_alert_prefs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Seed alerts matching the reference screenshot exactly
  const seedAlerts = useMemo(() => [
    {
      id: 'alert-seed-1',
      title: 'Major Road Closure: Main St.',
      desc: 'Main St. is closed from 4th Ave to 8th Ave for repair work. Use alternate routes.',
      category: 'emergency', // emergency | traffic | water | electricity | notice
      badgeType: 'emergency', // emergency | advisory | resolved
      badgeLabel: 'Emergency',
      timeText: '2 mins ago',
      zone: 'Main St. (4th Ave - 8th Ave)',
      emergencyCall: '112',
      coordinates: { lat: 28.6280, lng: 77.3649 },
      accentColor: '#EF4444' // red
    },
    {
      id: 'alert-seed-2',
      title: 'Water Supply Interruption',
      desc: 'Water supply will be unavailable in Sector 62 from 10 AM to 4 PM due to maintenance.',
      category: 'water',
      badgeType: 'advisory',
      badgeLabel: 'Advisory',
      timeText: '1 hour ago',
      zone: 'Sector 62, Noida',
      emergencyCall: '1916',
      coordinates: { lat: 28.6289, lng: 77.3688 },
      accentColor: '#F59E0B' // amber
    },
    {
      id: 'alert-seed-3',
      title: 'Streetlights Restored',
      desc: 'Streetlights in Sector 9 are now fully operational.',
      category: 'electricity',
      badgeType: 'resolved',
      badgeLabel: 'Resolved',
      timeText: '3 hours ago',
      zone: 'Sector 9, Downtown',
      emergencyCall: null,
      coordinates: { lat: 28.6040, lng: 77.3670 },
      accentColor: '#10B981' // green
    }
  ], []);

  // Fetch announcements from server & combine with seed alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/announcements');
      const serverData = res.data || [];

      const mappedServer = serverData.map((item, idx) => {
        let cat = 'notice';
        let badgeType = 'advisory';
        let badgeLabel = 'Advisory';
        let accentColor = '#00897B';

        const rawType = (item.type || '').toLowerCase();
        const text = `${item.title} ${item.message}`.toLowerCase();

        if (rawType === 'error' || text.includes('closure') || text.includes('emergency') || text.includes('danger')) {
          cat = 'emergency';
          badgeType = 'emergency';
          badgeLabel = 'Emergency';
          accentColor = '#EF4444';
        } else if (text.includes('traffic') || text.includes('road')) {
          cat = 'traffic';
          badgeType = 'advisory';
          badgeLabel = 'Advisory';
          accentColor = '#3B82F6';
        } else if (text.includes('water') || text.includes('pipe') || text.includes('drain')) {
          cat = 'water';
          badgeType = 'advisory';
          badgeLabel = 'Advisory';
          accentColor = '#F59E0B';
        } else if (text.includes('power') || text.includes('electric') || text.includes('light')) {
          cat = 'electricity';
          badgeType = text.includes('restored') ? 'resolved' : 'advisory';
          badgeLabel = text.includes('restored') ? 'Resolved' : 'Advisory';
          accentColor = text.includes('restored') ? '#10B981' : '#F59E0B';
        }

        return {
          id: item.id || item._id || `ann-${idx}`,
          title: item.title,
          desc: item.message,
          category: cat,
          badgeType,
          badgeLabel,
          timeText: 'Recently',
          zone: item.zone || 'Municipal Jurisdiction',
          emergencyCall: badgeType === 'emergency' ? '112' : null,
          accentColor
        };
      });

      // Filter out duplicate titles
      const serverTitles = new Set(mappedServer.map(s => s.title));
      const remainingSeeds = seedAlerts.filter(s => !serverTitles.has(s.title));
      setAlerts([...mappedServer, ...remainingSeeds]);
    } catch (err) {
      console.warn('Could not fetch announcements from server:', err);
      setAlerts(seedAlerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Listen to real-time broadcast announcements via WebSockets
    const s = getSocket();
    const handleNewAnnouncement = (newAnn) => {
      const incoming = {
        id: newAnn.id || newAnn._id || `ann-${Date.now()}`,
        title: newAnn.title,
        desc: newAnn.message,
        category: 'emergency',
        badgeType: 'emergency',
        badgeLabel: 'Emergency',
        timeText: 'Just now',
        zone: newAnn.zone || 'Municipal Jurisdiction',
        emergencyCall: '112',
        accentColor: '#EF4444'
      };
      setAlerts(prev => [incoming, ...prev]);
      showToast(`New Broadcast: ${newAnn.title}`);
    };

    s.on('announcement:created', handleNewAnnouncement);
    return () => {
      s.off('announcement:created', handleNewAnnouncement);
    };
  }, [seedAlerts]);

  // Audio Text-to-Speech playback
  const handleToggleAudio = (alertItem) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported on this device.');
      return;
    }

    if (playingId === alertItem.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${alertItem.title}. ${alertItem.desc}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    setPlayingId(alertItem.id);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Community Acknowledge toggle
  const handleToggleAcknowledge = (id) => {
    setAcknowledgedMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('urban_eye_ack_alerts', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Marked as acknowledged. Stay safe!');
  };

  // Share alert
  const handleShare = async (alertItem) => {
    const text = `🚨 Urban EYE Alert: ${alertItem.title}\n📍 Affected Zone: ${alertItem.zone}\nℹ️ Details: ${alertItem.desc}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Urban EYE Alert: ${alertItem.title}`,
          text,
          url: window.location.href
        });
        return;
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Alert details copied to clipboard!');
    } catch {
      showToast('Could not copy alert details.');
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (activeCategory === 'ALL') return alerts;
    return alerts.filter(a => a.category === activeCategory);
  }, [alerts, activeCategory]);

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3 border border-[#00897B]/40">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. MOBILE HEADER (When TopHeader is hidden on mobile)                */}
      {/* ===================================================================== */}
      <div className="lg:hidden flex items-center gap-3 pb-3 border-b border-[#E2F1EE]">
        <div className="w-10 h-10 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
          <Bell className="w-5 h-5 text-[#00897B]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0B2027] tracking-tight">
            Community Alerts
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time city updates, emergency notices and important announcements.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. CATEGORY FILTER PILLS ROW                                          */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        
        {/* All */}
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-[#006970] text-white shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All</span>
        </button>

        {/* Emergency */}
        <button
          type="button"
          onClick={() => setActiveCategory('emergency')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'emergency'
              ? 'bg-[#006970] text-white shadow-xs font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Emergency</span>
        </button>

        {/* Traffic */}
        <button
          type="button"
          onClick={() => setActiveCategory('traffic')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'traffic'
              ? 'bg-[#006970] text-white shadow-xs font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
          }`}
        >
          <Car className="w-3.5 h-3.5 text-blue-500" />
          <span>Traffic</span>
        </button>

        {/* Water */}
        <button
          type="button"
          onClick={() => setActiveCategory('water')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'water'
              ? 'bg-[#006970] text-white shadow-xs font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-500" />
          <span>Water</span>
        </button>

        {/* Electricity */}
        <button
          type="button"
          onClick={() => setActiveCategory('electricity')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'electricity'
              ? 'bg-[#006970] text-white shadow-xs font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Electricity</span>
        </button>

        {/* Public Notice */}
        <button
          type="button"
          onClick={() => setActiveCategory('notice')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeCategory === 'notice'
              ? 'bg-[#006970] text-white shadow-xs font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-teal-600" />
          <span>Public Notice</span>
        </button>

      </div>

      {/* ===================================================================== */}
      {/* 3. TWO-COLUMN GRID: ALERT CARDS (LEFT) + AFFECTED AREA & PREFS (RIGHT)*/}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: ALERT CARDS STACK                                      */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#D5EFEA] p-10 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No alerts found</h3>
              <p className="text-xs text-slate-500 mt-1">There are currently no active alerts in this category.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isEmergency = alert.badgeType === 'emergency';
              const isResolved = alert.badgeType === 'resolved';
              const isAdvisory = !isEmergency && !isResolved;

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex items-center justify-between gap-4 cursor-pointer group ${
                    isEmergency 
                      ? 'border-rose-100/90 hover:border-rose-300' 
                      : isResolved
                        ? 'border-emerald-100/90 hover:border-emerald-300'
                        : 'border-amber-100/90 hover:border-amber-300'
                  }`}
                >
                  {/* Left Edge Accent Strip */}
                  <div 
                    className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
                    style={{ backgroundColor: alert.accentColor }}
                  ></div>

                  {/* Left Content (Icon + Title & Description) */}
                  <div className="flex items-center gap-4 pl-1">
                    
                    {/* Icon Container */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isEmergency 
                        ? 'bg-[#FEE2E2] text-[#DC2626]' 
                        : isResolved
                          ? 'bg-[#D1FAE5] text-[#059669]'
                          : 'bg-[#FEF3C7] text-[#D97706]'
                    }`}>
                      {isEmergency ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : isResolved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    {/* Text block */}
                    <div>
                      <h3 className={`text-sm sm:text-base font-bold text-slate-900 transition-colors ${
                        isEmergency 
                          ? 'group-hover:text-rose-700' 
                          : isResolved
                            ? 'group-hover:text-emerald-700'
                            : 'group-hover:text-amber-700'
                      }`}>
                        {alert.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-xl">
                        {alert.desc}
                      </p>
                    </div>

                  </div>

                  {/* Right Badges & Time & Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      {/* Status Badge */}
                      <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                        isEmergency 
                          ? 'bg-[#FEE2E2] text-[#DC2626]' 
                          : isResolved
                            ? 'bg-[#D1FAE5] text-[#059669]'
                            : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}>
                        {alert.badgeLabel}
                      </span>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{alert.timeText}</span>
                      </div>
                    </div>

                    {/* Chevron Right */}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: AFFECTED AREA MAP & ALERT PREFERENCES                 */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          
          {/* CARD 1: AFFECTED AREA */}
          <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#00897B]" />
                <h3 className="text-sm font-bold text-slate-900">Affected Area</h3>
              </div>
              <Link
                to="/map"
                className="text-xs font-bold text-[#005C66] hover:text-[#00897B] transition-colors flex items-center gap-1 group/map"
              >
                <span>View Map</span>
                <ExternalLink className="w-3 h-3 group-hover/map:translate-x-0.5 group-hover/map:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Stylized Street Grid with Affected Corridor matching the screenshot */}
            <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200/80 bg-[#F5FAF8] group/corridor cursor-pointer">
              <Link to="/map" className="block w-full h-full relative" title="Open Interactive City Map">
                
                {/* SVG Street Grid Background */}
                <svg className="w-full h-full" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* City Blocks (soft mint green) */}
                  <rect x="15" y="15" width="80" height="50" rx="6" fill="#E2F2EC" />
                  <rect x="110" y="15" width="85" height="50" rx="6" fill="#E2F2EC" />
                  <rect x="210" y="15" width="85" height="50" rx="6" fill="#E2F2EC" />
                  <rect x="310" y="15" width="75" height="50" rx="6" fill="#E2F2EC" />

                  <rect x="15" y="80" width="80" height="60" rx="6" fill="#E2F2EC" />
                  <rect x="110" y="80" width="85" height="60" rx="6" fill="#E2F2EC" />
                  <rect x="210" y="80" width="85" height="60" rx="6" fill="#E2F2EC" />
                  <rect x="310" y="80" width="75" height="60" rx="6" fill="#E2F2EC" />

                  <rect x="15" y="155" width="80" height="65" rx="6" fill="#E2F2EC" />
                  <rect x="110" y="155" width="85" height="65" rx="6" fill="#E2F2EC" />
                  <rect x="210" y="155" width="85" height="65" rx="6" fill="#E2F2EC" />
                  <rect x="310" y="155" width="75" height="65" rx="6" fill="#E2F2EC" />

                  {/* Diagonal Street Corridor (Main St) */}
                  {/* Translucent Red Buffer Route */}
                  <line 
                    x1="90" y1="115" 
                    x2="310" y2="185" 
                    stroke="#EF4444" 
                    strokeWidth="18" 
                    strokeLinecap="round" 
                    strokeOpacity="0.3" 
                  />
                  
                  {/* Center Road Closure Line */}
                  <line 
                    x1="90" y1="115" 
                    x2="310" y2="185" 
                    stroke="#EF4444" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  {/* Start Closure Icon (Circle with minus symbol) */}
                  <g transform="translate(90, 115)">
                    <circle r="8" fill="#EF4444" />
                    <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </g>

                  {/* End Closure Icon (Circle with minus symbol) */}
                  <g transform="translate(310, 185)">
                    <circle r="8" fill="#EF4444" />
                    <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                </svg>

                {/* Subtle map overlay badge on hover */}
                <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/90 text-[10px] font-bold text-slate-700 shadow-2xs group-hover/corridor:bg-[#005C66] group-hover/corridor:text-white transition-colors">
                  Main St. (4th - 8th Ave)
                </div>
              </Link>
            </div>
          </div>

          {/* CARD 2: ALERT PREFERENCES */}
          <div 
            onClick={() => setIsPrefModalOpen(true)}
            className="bg-white rounded-3xl border border-[#D5EFEA] p-4 sm:p-5 shadow-xs hover:border-[#00897B]/50 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5 text-[#00897B]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                  Alert Preferences
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Get alerts for your area and chosen categories.
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* 4. ALERT DETAILS MODAL                                                */}
      {/* ===================================================================== */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${selectedAlert.accentColor}20`, color: selectedAlert.accentColor }}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Civic Advisory Brief
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold mb-2 ${
                  selectedAlert.badgeType === 'emergency'
                    ? 'bg-rose-100 text-rose-700'
                    : selectedAlert.badgeType === 'resolved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedAlert.badgeLabel}
                </span>
                <h2 className="text-lg font-black text-slate-900 leading-snug">
                  {selectedAlert.title}
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                  {selectedAlert.desc}
                </p>
              </div>

              {/* Affected Location */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#00897B] shrink-0" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Affected Zone: </span>
                  <span>{selectedAlert.zone}</span>
                </div>
              </div>

              {/* Actions row: Audio Readout, Stay Safe Ack, Share */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleToggleAudio(selectedAlert)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    playingId === selectedAlert.id
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  {playingId === selectedAlert.id ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Listen</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleAcknowledge(selectedAlert.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    acknowledgedMap[selectedAlert.id]
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${acknowledgedMap[selectedAlert.id] ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{acknowledgedMap[selectedAlert.id] ? 'Acknowledged' : 'Acknowledge'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(selectedAlert)}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors shrink-0"
                  title="Share Alert"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Emergency Hotline Button if Emergency */}
              {selectedAlert.emergencyCall && (
                <a
                  href={`tel:${selectedAlert.emergencyCall}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all w-full mt-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency Dispatch ({selectedAlert.emergencyCall})</span>
                </a>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. ALERT PREFERENCES MODAL                                            */}
      {/* ===================================================================== */}
      {isPrefModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Sliders className="w-4 h-4 text-[#00897B]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Alert Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrefModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Choose the civic categories you want to receive instant push & notification updates for:
              </p>

              <div className="space-y-3">
                {[
                  { key: 'emergency', label: 'Emergency & Road Closures', desc: 'Critical city advisories and hazard alerts' },
                  { key: 'traffic', label: 'Traffic & Transit', desc: 'Road construction, traffic congestion & diversions' },
                  { key: 'water', label: 'Water & Utilities', desc: 'Water pipeline maintenance and supply interruptions' },
                  { key: 'electricity', label: 'Electricity Grid', desc: 'Power outages, streetlight repairs & restorations' },
                  { key: 'notice', label: 'Public Notices', desc: 'Municipal sanitation campaigns & community announcements' }
                ].map((item) => (
                  <div 
                    key={item.key}
                    onClick={() => togglePreference(item.key)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      preferences[item.key] ? 'bg-[#00897B] text-white' : 'border border-slate-300 bg-white'
                    }`}>
                      {preferences[item.key] && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPrefModalOpen(false);
                  showToast('Alert preferences saved successfully!');
                }}
                className="w-full py-2.5 rounded-xl bg-[#005C66] hover:bg-[#00474F] text-white text-xs font-bold transition-all shadow-xs mt-2"
              >
                Save Preferences
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
