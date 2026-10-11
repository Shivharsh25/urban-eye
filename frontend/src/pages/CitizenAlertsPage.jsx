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
          color: 'text-rose-700',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          dot: 'bg-rose-600 animate-pulse',
          strip: 'bg-rose-600'
        };
      case 'warning':
        return {
          icon: Flame,
          badge: lang === 'hi' ? 'नागरिक परामर्श' : 'ADVISORY',
          color: 'text-amber-800',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          dot: 'bg-amber-600 animate-pulse',
          strip: 'bg-amber-600'
        };
      case 'success':
        return {
          icon: CheckCircle,
          badge: lang === 'hi' ? 'सेवा बहाल' : 'RESTORED',
          color: 'text-emerald-800',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          dot: 'bg-emerald-600',
          strip: 'bg-emerald-600'
        };
      default:
        return {
          icon: Info,
          badge: lang === 'hi' ? 'सार्वजनिक सूचना' : 'PUBLIC NOTICE',
          color: 'text-sky-800',
          bg: 'bg-sky-50',
          border: 'border-sky-200',
          dot: 'bg-sky-600',
          strip: 'bg-sky-600'
        };
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 sm:space-y-7">
      
      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-white border border-blue-600/30 text-blue-700 font-bold text-xs sm:text-sm rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bento Hero Header */}
      <div className="civic-hero p-6 sm:p-8 relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider flex items-center shadow-xs">
                <Radio className="w-3.5 h-3.5 mr-1.5 text-blue-600 animate-pulse" />
                {t('liveNetwork', 'LIVE CIVIC BROADCASTS')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              {t('communityAlertsTitle', 'Community Alerts & Broadcasts')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              {t('communityAlertsSubtitle', 'Stay informed with real-time city broadcasts, hazardous condition advisories, and emergency updates.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchAlerts(true)}
              disabled={refreshing}
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-widest">{t('liveNetwork', 'ONLINE')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls Bento Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        
        {/* Search Box */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchAlertsPlaceholder', 'Search alerts by keyword, ward or topic...')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all shadow-xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {[
            { id: 'ALL', label: t('allAlerts', 'All Alerts'), count: alerts.length },
            { id: 'CRITICAL', label: t('criticalEmergency', 'Critical / Emergency'), count: alerts.filter(a => a.type === 'critical').length, color: 'text-rose-600' },
            { id: 'WARNING', label: t('civicAdvisories', 'Advisories'), count: alerts.filter(a => a.type === 'warning').length, color: 'text-amber-600' },
            { id: 'SUCCESS', label: t('serviceRestored', 'Restored'), count: alerts.filter(a => a.type === 'success').length, color: 'text-emerald-600' },
            { id: 'INFO', label: t('publicNotices', 'Notices'), count: alerts.filter(a => a.type === 'info').length, color: 'text-blue-600' },
          ].map(tab => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-16 space-y-3 shadow-xs">
          <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Scanning civic broadcast frequencies...</p>
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
                className="bg-white border border-slate-200 rounded-2xl relative overflow-hidden p-5 sm:p-6 transition-all hover:border-slate-300 duration-200 group shadow-xs"
              >
                {/* Left accent strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${visuals.strip}`}></div>

                <div className="flex flex-col sm:flex-row items-start gap-4 pl-1 sm:pl-2">
                  
                  {/* Icon Badge */}
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${visuals.bg} border ${visuals.border} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${visuals.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${visuals.bg} ${visuals.color} border ${visuals.border} flex items-center gap-1.5 shadow-2xs`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${visuals.dot}`} />
                          {visuals.badge}
                        </span>
                        
                        {alert.zone && (
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                            {alert.zone}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display group-hover:text-blue-600 transition-colors mb-1.5 leading-snug">
                      {alert.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {alert.desc}
                    </p>

                    {/* Interactive Actions Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                      
                      {/* Audio & Community Ack */}
                      <div className="flex items-center gap-2">
                        {/* Text-to-Speech Play Button */}
                        <button
                          onClick={() => handleToggleAudio(alert)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                            isPlaying
                              ? 'bg-blue-600 text-white border-blue-600 animate-pulse shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Listen to broadcast audio"
                        >
                          {isPlaying ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-white" />
                              <span>{t('stopListening', 'Stop Audio')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{t('listenAlert', 'Listen Broadcast')}</span>
                            </>
                          )}
                        </button>

                        {/* Stay Safe / Acknowledged Reaction */}
                        <button
                          onClick={() => handleToggleAcknowledge(alert.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                            isAck
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-emerald-700 hover:bg-slate-100'
                          }`}
                          title="Confirm safe & acknowledged"
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 ${isAck ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                          <span>{isAck ? t('staySafeAcknowledged', 'Acknowledged') : 'Stay Safe'}</span>
                          <span className="font-mono text-[10px] text-slate-400">({totalAck})</span>
                        </button>
                      </div>

                      {/* Share & Emergency Hotlines */}
                      <div className="flex items-center gap-2">
                        {alert.emergencyCall && (
                          <a
                            href={`tel:${alert.emergencyCall}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            <span>SOS {alert.emergencyCall}</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleShare(alert)}
                          className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Share alert with neighbors"
                        >
                          <Share2 className="w-3.5 h-3.5 text-blue-600" />
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
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <ShieldCheck className="w-10 h-10 mx-auto text-emerald-600 mb-1" />
          <h3 className="text-base font-bold text-slate-900 font-display">No alerts matching your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            All sectors currently operational without active emergency broadcast notices for this category.
          </p>
          <button
            onClick={() => { setFilter('ALL'); setSearchQuery(''); }}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
