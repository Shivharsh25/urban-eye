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
    <div className="min-h-full p-4 sm:p-6 lg:p-10 relative overflow-hidden text-[#191636]">
      
      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#191636] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3 border border-[#302B69]">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2E5]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#191636] tracking-tight flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center shrink-0 shadow-xs">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#302B69]" />
              </div>
              <span>{t('communityAlertsTitle', 'Community Alerts & Broadcasts')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#57536E] mt-1.5 font-medium">
              {t('communityAlertsSubtitle', 'Stay informed with real-time city broadcasts, hazardous condition advisories, and emergency updates.')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => fetchAlerts(true)}
              disabled={refreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] hover:bg-[#F6F6FC] hover:border-[#302B69] transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#302B69]' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-widest">{t('liveNetwork', 'LIVE NETWORK')}</span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs space-y-3">
          
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8C87A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchAlertsPlaceholder', 'Search alerts by keyword, ward or topic...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-xs sm:text-sm text-[#191636] placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C87A6] hover:text-[#191636] px-1.5 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {[
              { id: 'ALL', label: t('allAlerts', 'All Alerts'), count: alerts.length },
              { id: 'CRITICAL', label: t('criticalEmergency', 'Critical / Emergency'), count: alerts.filter(a => a.type === 'critical').length, color: 'text-rose-600' },
              { id: 'WARNING', label: t('civicAdvisories', 'Advisories'), count: alerts.filter(a => a.type === 'warning').length, color: 'text-amber-700' },
              { id: 'SUCCESS', label: t('serviceRestored', 'Restored'), count: alerts.filter(a => a.type === 'success').length, color: 'text-emerald-700' },
              { id: 'INFO', label: t('publicNotices', 'Notices'), count: alerts.filter(a => a.type === 'info').length, color: 'text-sky-700' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#302B69] text-white border-[#302B69] shadow-xs font-bold'
                    : 'bg-white text-[#57536E] border-[#E8E2E5] hover:text-[#191636] hover:bg-[#F6F6FC]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${filter === tab.id ? 'bg-white/25 text-white' : 'bg-[#F6F6FC] text-[#57536E]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Alerts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <div className="w-9 h-9 border-3 border-[#302B69]/20 border-t-[#302B69] rounded-full animate-spin"></div>
            <p className="text-xs text-[#57536E] font-medium">Scanning civic broadcast frequencies...</p>
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
                  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-[#E8E2E5] hover:border-[#302B69]/50 transition-all p-4 sm:p-6 shadow-xs hover:shadow-sm"
                >
                  {/* Left accent strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${visuals.strip}`}></div>

                  <div className="flex flex-col sm:flex-row items-start gap-4 pl-1 sm:pl-2">
                    
                    {/* Icon Badge */}
                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${visuals.bg} border ${visuals.border} flex items-center justify-center shrink-0 shadow-xs`}>
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
                            <span className="text-[11px] font-mono text-[#57536E] flex items-center gap-1 truncate font-semibold">
                              <MapPin className="w-3 h-3 text-[#302B69] shrink-0" />
                              {alert.zone}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 text-[#57536E] font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#191636] group-hover:text-[#302B69] transition-colors mb-1.5 leading-snug">
                        {alert.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#57536E] leading-relaxed mb-4 font-normal">
                        {alert.desc}
                      </p>

                      {/* Interactive Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#E8E2E5]">
                        
                        {/* Audio & Community Ack */}
                        <div className="flex items-center gap-2">
                          {/* Text-to-Speech Play Button */}
                          <button
                            onClick={() => handleToggleAudio(alert)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                              isPlaying
                                ? 'bg-[#302B69] text-white border-[#302B69] animate-pulse'
                                : 'bg-[#F6F6FC] text-[#191636] border-[#E8E2E5] hover:text-[#302B69] hover:border-[#302B69]'
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
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                                : 'bg-[#F6F6FC] text-[#57536E] border-[#E8E2E5] hover:text-emerald-700 hover:border-emerald-300'
                            }`}
                            title="Confirm safe & acknowledged"
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 ${isAck ? 'fill-emerald-500 text-emerald-600' : ''}`} />
                            <span>{isAck ? t('staySafeAcknowledged', 'Acknowledged') : 'Stay Safe'}</span>
                            <span className="font-mono text-[10px] text-[#57536E]">({totalAck})</span>
                          </button>
                        </div>

                        {/* Share & Emergency Hotlines */}
                        <div className="flex items-center gap-2">
                          {alert.emergencyCall && (
                            <a
                              href={`tel:${alert.emergencyCall}`}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1.5"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                              <span>SOS {alert.emergencyCall}</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleShare(alert)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-white text-[#191636] hover:bg-[#F6F6FC] border border-[#E8E2E5] hover:border-[#302B69] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
          <div className="p-12 text-center text-[#57536E] border border-[#E8E2E5] border-dashed rounded-3xl bg-white space-y-3">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-600 mb-1" />
            <h3 className="text-base font-bold text-[#191636]">No alerts matching your filter</h3>
            <p className="text-xs text-[#57536E] max-w-sm mx-auto">
              All sectors currently operational without active emergency broadcast notices for this category.
            </p>
            <button
              onClick={() => { setFilter('ALL'); setSearchQuery(''); }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#302B69] text-white hover:bg-[#242052] transition-colors shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
