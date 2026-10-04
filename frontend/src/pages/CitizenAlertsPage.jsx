import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  Share2, 
  ShieldCheck, 
  Search, 
  PhoneCall, 
  Check, 
  RefreshCw,
  Flame,
  Radio,
  SlidersHorizontal,
  ThumbsUp,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getSocket } from '../api/socket';
import api from '../api/client';

export default function CitizenAlertsPage() {
  const { t, lang } = useLanguage();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, WARNING, SUCCESS, INFO
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio Speech Synthesis state
  const [playingId, setPlayingId] = useState(null);

  // Acknowledged alerts (Stay Safe)
  const [acknowledgedMap, setAcknowledgedMap] = useState(() => {
    try {
      const stored = localStorage.getItem('urban_eye_ack_alerts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Base built-in civic advisories for NCR/Smart City
  const defaultAlerts = useMemo(() => [
    {
      id: 'def-1',
      title: lang === 'hi' ? 'आपातकालीन पाइपलाइन मरम्मत: सेक्टर 14' : 'Major Road Closure: Main St.',
      desc: lang === 'hi' 
        ? 'मुख्य जल आपूर्ति पाइपलाइन मरम्मत के कारण सेक्टर 14 से 18 तक यातायात डायवर्ट किया गया है। कृपया वैकल्पिक मार्ग का उपयोग करें।'
        : 'Main St will be closed from 4th Ave to 8th Ave for emergency water main repairs. Please use alternate routes.',
      type: 'critical',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      zone: 'Sector 14 & Main St',
      baseAck: 184,
      emergencyCall: '112'
    },
    {
      id: 'def-2',
      title: lang === 'hi' ? 'मानसून तूफ़ानी जल निकासी परामर्श' : 'Monsoon Storm Drainage Advisory',
      desc: lang === 'hi'
        ? 'आगामी 24 घंटों में भारी बारिश की चेतावनी। पीडब्ल्यूडी सक्शन मशीनें निचले इलाकों में तैनात हैं। नालों के पास सावधानी बरतें।'
        : 'Heavy precipitation predicted over next 24 hours. Municipal PWD rapid pumps dispatched to low-lying zones. Avoid open drains.',
      type: 'warning',
      createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      zone: 'Citywide Lowlands',
      baseAck: 92,
      emergencyCall: '1916'
    },
    {
      id: 'def-3',
      title: lang === 'hi' ? 'ग्रिड विद्युत आपूर्ति पूर्णतः बहाल' : 'Power Outage Resolved',
      desc: lang === 'hi'
        ? 'उत्तरी सब-स्टेशन में ट्रांसफॉर्मर मरम्मत कार्य सफलतापूर्वक पूरा हो चुका है। सभी स्ट्रीटलाइट्स एवं घरेलू आपूर्ति सामान्य है।'
        : 'Power has been fully restored to the Northside district. All municipal street lighting networks operating normally.',
      type: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      zone: 'North District',
      baseAck: 310
    },
    {
      id: 'def-4',
      title: lang === 'hi' ? 'स्वच्छता महा-अभियान: वार्ड 7' : 'Clean City Sweep & Waste Disposal Notice',
      desc: lang === 'hi'
        ? 'रविवार सुबह वार्ड 7 एवं 9 में गहन स्वच्छता अभियान। नागरिक गीला और सूखा कचरा अलग-अलग डिब्बों में सौंपें।'
        : 'Intensive mechanized road sweeping and waste clearance scheduled for Ward 7 & 9 this weekend. Segregate organic & dry waste.',
      type: 'info',
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      zone: 'Ward 7 & Ward 9',
      baseAck: 67
    }
  ], [lang]);

  // Fetch announcements from server
  const fetchAlerts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/api/announcements');
      const serverData = res.data || [];
      
      const mappedServer = serverData.map(item => ({
        id: item.id || item._id,
        title: item.title,
        desc: item.message,
        type: item.type === 'error' ? 'critical' : (item.type || 'info'),
        createdAt: item.createdAt || new Date().toISOString(),
        zone: item.zone || 'Municipal Alert',
        baseAck: Math.floor(Math.random() * 40) + 15,
        emergencyCall: item.type === 'error' ? '112' : null
      }));

      // Combine server with default rich advisories
      const combined = [...mappedServer, ...defaultAlerts];
      // Deduplicate by title
      const unique = [];
      const seen = new Set();
      for (const a of combined) {
        if (!seen.has(a.title)) {
          seen.add(a.title);
          unique.push(a);
        }
      }
      setAlerts(unique);
    } catch (err) {
      console.warn('Could not fetch remote announcements, loading local advisories:', err);
      setAlerts(defaultAlerts);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Listen to real-time broadcast announcements
    const s = getSocket();
    const handleNewAnnouncement = (newAnn) => {
      const incoming = {
        id: newAnn.id || newAnn._id || `ann-${Date.now()}`,
        title: newAnn.title,
        desc: newAnn.message,
        type: newAnn.type === 'error' ? 'critical' : (newAnn.type || 'info'),
        createdAt: new Date().toISOString(),
        zone: 'Live Broadcast',
        baseAck: 1,
        isNew: true
      };
      setAlerts(prev => [incoming, ...prev]);
      showToast(lang === 'hi' ? `नया प्रसारण: ${newAnn.title}` : `New Broadcast: ${newAnn.title}`);
    };

    s.on('announcement:created', handleNewAnnouncement);
    return () => {
      s.off('announcement:created', handleNewAnnouncement);
    };
  }, [defaultAlerts]);

  // Text to Speech playback
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

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Community Acknowledge / Stay Safe
  const handleToggleAcknowledge = (id) => {
    setAcknowledgedMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('urban_eye_ack_alerts', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(lang === 'hi' ? 'पुष्टि दर्ज की गई! सुरक्षित रहें।' : 'Marked as Acknowledged. Stay safe!');
  };

  // Share alert
  const handleShare = async (alertItem) => {
    const text = `🚨 Urban EYE Alert: ${alertItem.title}\n📍 Zone: ${alertItem.zone}\nℹ️ Details: ${alertItem.desc}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Urban EYE Alert: ${alertItem.title}`,
          text: text,
          url: window.location.href
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast(t('alertCopied', 'Alert details copied to clipboard!'));
    } catch {
      showToast('Could not copy alert details.');
    }
  };

  // Filtered & Searched alerts
  const filteredAlerts = alerts.filter(a => {
    // Type filter
    if (filter === 'CRITICAL' && a.type !== 'critical') return false;
    if (filter === 'WARNING' && a.type !== 'warning') return false;
    if (filter === 'SUCCESS' && a.type !== 'success') return false;
    if (filter === 'INFO' && a.type !== 'info') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchDesc = (a.desc || '').toLowerCase().includes(q);
      const matchZone = (a.zone || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchZone;
    }
    return true;
  });

  const getAlertVisuals = (type) => {
    switch (type) {
      case 'critical':
        return {
          icon: AlertTriangle,
          badge: lang === 'hi' ? 'अति आवश्यक' : 'EMERGENCY',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          dot: 'bg-rose-500 animate-pulse',
          strip: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
        };
      case 'warning':
        return {
          icon: Flame,
          badge: lang === 'hi' ? 'नागरिक परामर्श' : 'ADVISORY',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          strip: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
        };
      case 'success':
        return {
          icon: CheckCircle,
          badge: lang === 'hi' ? 'सेवा बहाल' : 'RESTORED',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-400',
          strip: 'bg-emerald-500'
        };
      default:
        return {
          icon: Info,
          badge: lang === 'hi' ? 'सार्वजनिक सूचना' : 'PUBLIC NOTICE',
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          dot: 'bg-cyan-400',
          strip: 'bg-cyan-500'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:20px_20px] opacity-[0.04]"></div>
      </div>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-slate-900/95 border border-cyan-500/50 text-cyan-300 font-bold text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/10">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
              </div>
              <span>{t('communityAlertsTitle', 'Community Alerts & Broadcasts')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              {t('communityAlertsSubtitle', 'Stay informed with real-time city broadcasts, hazardous condition advisories, and emergency updates.')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => fetchAlerts(true)}
              disabled={refreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">{t('liveNetwork', 'LIVE NETWORK')}</span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchAlertsPlaceholder', 'Search alerts by keyword, ward or topic...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {[
              { id: 'ALL', label: t('allAlerts', 'All Alerts'), count: alerts.length },
              { id: 'CRITICAL', label: t('criticalEmergency', 'Critical / Emergency'), count: alerts.filter(a => a.type === 'critical').length, color: 'text-rose-400' },
              { id: 'WARNING', label: t('civicAdvisories', 'Advisories'), count: alerts.filter(a => a.type === 'warning').length, color: 'text-amber-400' },
              { id: 'SUCCESS', label: t('serviceRestored', 'Restored'), count: alerts.filter(a => a.type === 'success').length, color: 'text-emerald-400' },
              { id: 'INFO', label: t('publicNotices', 'Notices'), count: alerts.filter(a => a.type === 'info').length, color: 'text-cyan-400' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm font-bold'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Alerts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <div className="w-9 h-9 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium">Scanning civic broadcast frequencies...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map(alert => {
              const visuals = getAlertVisuals(alert.type);
              const Icon = visuals.icon;
              const isPlaying = playingId === alert.id;
              const isAck = !!acknowledgedMap[alert.id];
              const totalAck = (alert.baseAck || 45) + (isAck ? 1 : 0);

              return (
                <div 
                  key={alert.id} 
                  className={`glass-panel group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/60 border ${visuals.border} hover:border-slate-700 transition-all p-4 sm:p-6 shadow-xl`}
                >
                  {/* Left accent strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${visuals.strip}`}></div>

                  <div className="flex flex-col sm:flex-row items-start gap-4 pl-1 sm:pl-2">
                    
                    {/* Icon Badge */}
                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${visuals.bg} border ${visuals.border} flex items-center justify-center shrink-0 shadow-md`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${visuals.color}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${visuals.bg} ${visuals.color} border ${visuals.border} flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${visuals.dot}`} />
                            {visuals.badge}
                          </span>
                          
                          {alert.zone && (
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                              {alert.zone}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5 leading-snug">
                        {alert.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                        {alert.desc}
                      </p>

                      {/* Interactive Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80">
                        
                        {/* Audio & Community Ack */}
                        <div className="flex items-center gap-2">
                          {/* Text-to-Speech Play Button */}
                          <button
                            onClick={() => handleToggleAudio(alert)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                              isPlaying
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:text-cyan-300 hover:bg-slate-800'
                            }`}
                            title="Listen to broadcast audio"
                          >
                            {isPlaying ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>{t('stopListening', 'Stop Audio')}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>{t('listenAlert', 'Listen Broadcast')}</span>
                              </>
                            )}
                          </button>

                          {/* Stay Safe / Acknowledged Reaction */}
                          <button
                            onClick={() => handleToggleAcknowledge(alert.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                              isAck
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-emerald-300 hover:bg-slate-800'
                            }`}
                            title="Confirm safe & acknowledged"
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 ${isAck ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                            <span>{isAck ? t('staySafeAcknowledged', 'Acknowledged') : 'Stay Safe'}</span>
                            <span className="font-mono text-[10px] text-slate-500">({totalAck})</span>
                          </button>
                        </div>

                        {/* Share & Emergency Hotlines */}
                        <div className="flex items-center gap-2">
                          {alert.emergencyCall && (
                            <a
                              href={`tel:${alert.emergencyCall}`}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition-all flex items-center gap-1.5"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                              <span>SOS {alert.emergencyCall}</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleShare(alert)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-950/60 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Share alert with neighbors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t('shareAlert', 'Share')}</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 border border-slate-800/60 border-dashed rounded-3xl bg-slate-900/30 space-y-3">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400/80 mb-1" />
            <h3 className="text-base font-bold text-white">No alerts matching your filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All sectors currently operational without active emergency broadcast notices for this category.
            </p>
            <button
              onClick={() => { setFilter('ALL'); setSearchQuery(''); }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
