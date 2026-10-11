import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Navigation, 
  Plus, 
  Award, 
  Activity, 
  Camera, 
  CheckCircle, 
  CheckCircle2, 
  ThumbsUp, 
  UserCircle, 
  PhoneCall, 
  Filter, 
  Info, 
  BellRing, 
  TrendingUp, 
  Clock, 
  FileText, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  ShieldCheck, 
  Compass, 
  X, 
  ExternalLink, 
  Download, 
  Layers, 
  Flame, 
  Droplets, 
  Zap, 
  Trash2,
  Phone,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DetectionModal from '../components/DetectionModal';
import api from '../api/client';
import { subscribeToDetections } from '../api/socket';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  
  // Data state
  const [recentReports, setRecentReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, IN_PROGRESS, RESOLVED
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL, pothole, garbage, water_leak, streetlight
  
  // Interactive modal states
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [playingAlertId, setPlayingAlertId] = useState(null);

  const [userStats, setUserStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    civicScore: 85,
  });

  // Lock body scroll and handle escape key for emergency modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showEmergencyModal) {
        setShowEmergencyModal(false);
      }
    };
    if (showEmergencyModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [showEmergencyModal]);

  const handlePlayAlertAudio = (ann) => {
    if (!('speechSynthesis' in window)) return;
    const annId = ann._id || ann.id;
    if (playingAlertId === annId) {
      window.speechSynthesis.cancel();
      setPlayingAlertId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const textToSpeak = `${ann.title}. ${ann.message}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingAlertId(null);
    utterance.onerror = () => setPlayingAlertId(null);
    setPlayingAlertId(annId);
    window.speechSynthesis.speak(utterance);
  };

  // Fetch community data
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [reportsRes, announcementsRes, statsRes] = await Promise.all([
        // Query community-wide reports so map shows all local incidents
        api.get('/api/detections?scope=community'),
        api.get('/api/announcements'),
        api.get('/api/stats/user-summary')
      ]);
      
      const allReports = reportsRes.data.detections || [];
      const sortedReports = [...allReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentReports(sortedReports);
      
      setAnnouncements(announcementsRes.data || []);

      if (statsRes.data) {
        setUserStats({
          totalReports: statsRes.data.totalReports || 0,
          resolvedReports: statsRes.data.resolvedReports || 0,
          civicScore: statsRes.data.trustScore || 85,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to live WebSockets updates
    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => {
        setRecentReports((prev) => [newDoc, ...prev]);
      },
      onMerged: ({ detection }) => {
        setRecentReports((prev) =>
          prev.map((d) => (d.id === detection.id || d._id === detection.id ? detection : d))
        );
      },
      onUpdated: (updatedDoc) => {
        setRecentReports((prev) =>
          prev.map((d) => (d.id === updatedDoc.id || d._id === updatedDoc.id ? updatedDoc : d))
        );
      },
      onDeleted: ({ id }) => {
        setRecentReports((prev) => prev.filter((d) => d.id !== id && d._id !== id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Upvote / Support issue handler
  const handleToggleUpvote = (reportId) => {
    setUpvotedIds(prev => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };

  // Civic tier calculation
  const getCivicTier = (score) => {
    if (score >= 500) return { name: t('platinumTier'), color: 'from-cyan-300 via-sky-400 to-indigo-500', textGradient: 'from-cyan-400 to-blue-400', threshold: 500, next: 1000, badge: t('ambassadorBadge'), perk: 'Direct priority municipal escalation' };
    if (score >= 250) return { name: t('goldTier'), color: 'from-amber-300 via-amber-400 to-orange-500', textGradient: 'from-amber-400 to-orange-400', threshold: 250, next: 500, badge: t('guardianBadge'), perk: 'Priority dispatch & verified reporter badge' };
    if (score >= 100) return { name: t('silverTier'), color: 'from-slate-200 via-slate-300 to-slate-400', textGradient: 'from-slate-200 to-slate-400', threshold: 100, next: 250, badge: t('activeBadge'), perk: 'Expedited AI incident triage' };
    return { name: t('bronzeTier'), color: 'from-orange-400 to-amber-600', textGradient: 'from-orange-400 to-amber-500', threshold: 0, next: 100, badge: t('contributorBadge'), perk: 'Standard community reporting' };
  };

  const tier = getCivicTier(userStats.civicScore);
  const progressPercent = Math.min(100, Math.max(10, ((userStats.civicScore - tier.threshold) / (tier.next - tier.threshold)) * 100));

  // Category visual metadata
  const getCategoryMeta = (type) => {
    const rawType = (type || '').toLowerCase();
    if (rawType.includes('pothole') || rawType.includes('road')) {
      return { label: t('roadHazard'), icon: AlertTriangle, bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    }
    if (rawType.includes('garbage') || rawType.includes('waste') || rawType.includes('dump')) {
      return { label: t('illegalWaste'), icon: Trash2, bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    }
    if (rawType.includes('water') || rawType.includes('leak') || rawType.includes('drain')) {
      return { label: t('waterSewage'), icon: Droplets, bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    }
    if (rawType.includes('light') || rawType.includes('lamp')) {
      return { label: t('streetlight'), icon: Zap, bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    }
    return { label: t('civicInfra'), icon: ShieldAlert, bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' };
  };

  // Severity color helper
  const getSeverityBadge = (severity, priority) => {
    const s = (severity || priority || 'medium').toLowerCase();
    if (s === 'high' || s === 'critical') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">{t('critical')}</span>;
    }
    if (s === 'medium') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">{t('medium')}</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{t('low')}</span>;
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const st = (status || 'new').toLowerCase();
    if (st === 'resolved') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          {t('resolved')}
        </span>
      );
    }
    if (st === 'in_progress' || st === 'assigned') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          {t('inProgress')}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
        {t('reported')}
      </span>
    );
  };

  // Clean description string from raw database text
  const cleanReportSummary = (report) => {
    if (report.address && report.address.trim()) {
      return report.address;
    }
    if (report.reportText) {
      const clean = report.reportText
        .replace(/={3,}/g, '')
        .replace(/URBAN EYE - MUNICIPAL INFRASTRUCTURE DISPATCH/gi, '')
        .replace(/LOCATION GPS:.*$/gim, '')
        .trim();
      if (clean.length > 0) return clean.slice(0, 100);
    }
    if (report.lat && report.lng) {
      return `GPS Coordinates: ${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}`;
    }
    return 'Location verified via urban sensors';
  };

  // Filtered reports for feed
  const filteredReports = recentReports.filter(report => {
    if (filter === 'CRITICAL' && report.severity !== 'high' && report.priority !== 'CRITICAL') return false;
    if (filter === 'RESOLVED' && report.status !== 'resolved' && report.status !== 'RESOLVED') return false;
    if (filter === 'IN_PROGRESS' && report.status !== 'in_progress' && report.status !== 'assigned') return false;
    
    if (categoryFilter !== 'ALL') {
      const type = (report.type || '').toLowerCase();
      if (categoryFilter === 'pothole' && !type.includes('pothole') && !type.includes('road')) return false;
      if (categoryFilter === 'garbage' && !type.includes('garbage') && !type.includes('waste')) return false;
      if (categoryFilter === 'water_leak' && !type.includes('water') && !type.includes('leak')) return false;
      if (categoryFilter === 'streetlight' && !type.includes('light') && !type.includes('lamp')) return false;
    }
    return true;
  });

  // Calculate resolution rate
  const totalIncidentsCount = recentReports.length;
  const resolvedCount = recentReports.filter(r => (r.status || '').toLowerCase() === 'resolved').length;
  const resolutionPercentage = totalIncidentsCount > 0 ? Math.round((resolvedCount / totalIncidentsCount) * 100) : 100;

  return (
    <div className="p-3 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-fade-in relative z-10 font-sans min-w-0 overflow-x-hidden pb-16 lg:pb-8">
      
      {/* Top Welcome & Notification Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-800/60 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight truncate">
              {t('welcomeBack')}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">{user?.name?.split(' ')[0] || t('citizen')}</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              {t('liveGridActive')}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 truncate">
            {t('dashboardSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? t('syncing') : t('syncLive')}</span>
          </button>
          
          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t('newReport')}</span>
          </button>
        </div>
      </div>

      {/* 4-Card Community Metric Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full min-w-0">
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{t('communityIssues')}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-white">{totalIncidentsCount}</span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">{t('inArea')}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] text-cyan-400 font-medium truncate">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{t('gpsVerified')}</span>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{t('resolutionRate')}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-white">{resolutionPercentage}%</span>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 truncate">{t('resolved')}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-400/80 font-medium truncate">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{resolvedCount} {t('civicFixes')}</span>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{t('mySubmissions')}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-white">{userStats.totalReports}</span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate">{t('filed')}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] text-indigo-300 font-medium truncate">
            <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{userStats.resolvedReports} {t('done')}</span>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{t('trustScore')}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${tier.textGradient}`}>{userStats.civicScore}</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase text-amber-400/90 truncate">{tier.name}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
            <span className="truncate">{tier.next - userStats.civicScore} {t('ptsToNextRank')}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 w-full min-w-0">
        <button 
          onClick={() => navigate('/report')} 
          className="glass-card hover:border-sky-500/40 p-3 sm:p-4 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-sky-500/5 to-slate-900/50 min-w-0 w-full overflow-hidden"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1 truncate">
              {t('reportIssueAction')}
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{t('aiDetection')}</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/my-reports')} 
          className="glass-card hover:border-indigo-500/40 p-3 sm:p-4 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-indigo-500/5 to-slate-900/50 min-w-0 w-full overflow-hidden"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1 truncate">
              {t('myActivity')}
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{t('statusAndPdf')}</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/map')} 
          className="glass-card hover:border-emerald-500/40 p-3 sm:p-4 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-emerald-500/5 to-slate-900/50 min-w-0 w-full overflow-hidden"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1 truncate">
              {t('liveMap')}
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{t('cityScanner')}</p>
          </div>
        </button>

        <button 
          onClick={() => setShowEmergencyModal(true)} 
          className="glass-card hover:border-rose-500/40 p-3 sm:p-4 rounded-2xl flex items-center gap-2.5 sm:gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-rose-500/5 to-slate-900/50 min-w-0 w-full overflow-hidden"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-rose-200 flex items-center gap-1 truncate">
              {t('emergencySOS')}
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-rose-300/70 truncate">{t('hotlines')}</p>
          </div>
        </button>
      </div>

      {/* Main Grid: Left (Local Activity) + Right (Civic Score & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full min-w-0">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 w-full min-w-0">

          {/* Local Activity Feed */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-800/80 bg-slate-900/40 w-full min-w-0 overflow-hidden">
            
            {/* Feed Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-slate-800/60 w-full min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">{t('recentAreaActivity')}</h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">{t('tapIncidentHint')}</p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full w-full sm:w-auto shrink-0 no-scrollbar">
                <button 
                  onClick={() => setFilter('ALL')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'ALL' ? 'bg-indigo-600/30 text-indigo-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t('all')}
                </button>
                <button 
                  onClick={() => setFilter('CRITICAL')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t('critical')}
                </button>
                <button 
                  onClick={() => setFilter('IN_PROGRESS')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t('active')}
                </button>
                <button 
                  onClick={() => setFilter('RESOLVED')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {t('resolved')}
                </button>
              </div>
            </div>

            {/* Category Sub-Filters */}
            <div className="flex items-center gap-1.5 mb-4 pb-1 overflow-x-auto max-w-full w-full no-scrollbar">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">{t('filterBy')}</span>
              {[
                { id: 'ALL', label: t('allCategories') },
                { id: 'pothole', label: t('potholes') },
                { id: 'garbage', label: t('wasteGarbage') },
                { id: 'water_leak', label: t('waterLeaks') },
                { id: 'streetlight', label: t('streetlights') },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    categoryFilter === cat.id 
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm' 
                      : 'bg-slate-900/50 text-slate-400 border-slate-800/80 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Reports List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-medium">{t('scanningGrid')}</p>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-3 w-full min-w-0">
                {filteredReports.slice(0, 8).map(report => {
                  const cat = getCategoryMeta(report.type);
                  const Icon = cat.icon;
                  const isUpvoted = upvotedIds.has(report._id || report.id);
                  const currentUpvotes = (report.reportCount || 1) + (isUpvoted ? 1 : 0);
                  const summaryText = cleanReportSummary(report);
                  const imgUrl = report.imageUrl ? (report.imageUrl.startsWith('http') ? report.imageUrl : `https://urban-eye-wi2j.onrender.com${report.imageUrl}`) : null;

                  return (
                    <div 
                      key={report._id || report.id} 
                      className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700/80 hover:bg-slate-850/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group cursor-pointer w-full min-w-0 overflow-hidden"
                      onClick={() => setSelectedDetection(report)}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                        {/* Thumbnail or Category Icon */}
                        {imgUrl ? (
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 shadow-md">
                            <img src={imgUrl} alt={report.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                              <Icon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${cat.text}`} />
                            </div>
                          </div>
                        ) : (
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 flex items-center justify-center border ${cat.border} ${cat.bg}`}>
                            <Icon className={`w-5 h-5 ${cat.text}`} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-white capitalize group-hover:text-cyan-300 transition-colors truncate max-w-[150px] sm:max-w-none">
                              {cat.label}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {getSeverityBadge(report.severity, report.priority)}
                              {getStatusBadge(report.status)}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 flex items-center gap-1.5 min-w-0 w-full">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{summaryText}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] sm:text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              {new Date(report.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : lang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span className="truncate">{t('ward')}: {report.assignedDepartment?.split(' ')[0] || 'PWD'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex items-center justify-end gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-t-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleUpvote(report._id || report.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isUpvoted 
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                              : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-cyan-300 hover:bg-slate-800'
                          }`}
                          title={t('confirmExistsTitle')}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                          <span>{currentUpvotes}</span>
                        </button>

                        <button
                          onClick={() => setSelectedDetection(report)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('inspectPdf')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-slate-800/50 border-dashed rounded-2xl bg-slate-900/20">
                <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">{t('noMatchingReports')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('clearFiltersHint')}</p>
                <button
                  onClick={() => { setFilter('ALL'); setCategoryFilter('ALL'); }}
                  className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {t('resetFilters')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Civic Score, Alerts & Quick Guides */}
        <div className="space-y-6">
          
          {/* Enhanced Civic Score Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/80 relative overflow-hidden bg-slate-900/50">
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                {t('civicEngagementScore')}
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300`}>
                {tier.badge}
              </span>
            </div>
            
            {/* Circular Gauge Representation */}
            <div className="flex flex-col items-center justify-center py-4 relative z-10">
              <div className="relative w-28 h-28 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-2xl bg-slate-950/70 overflow-hidden">
                <div 
                  className={`absolute bottom-0 w-full bg-gradient-to-t ${tier.color} opacity-25 transition-all duration-500`} 
                  style={{ height: `${progressPercent}%` }} 
                />
                <div className="text-center z-10">
                  <span className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${tier.textGradient}`}>
                    {userStats.civicScore}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('pointsShort')}</span>
                </div>
              </div>

              <p className={`text-xs font-extrabold tracking-widest uppercase mt-3 bg-clip-text text-transparent bg-gradient-to-r ${tier.textGradient}`}>
                {tier.name} {t('tierCitizen')}
              </p>
              
              {/* Progress to Next Tier */}
              <div className="w-full mt-3">
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>{t('levelProgress')}</span>
                  <span className="text-amber-400 font-bold">{tier.next - userStats.civicScore} {t('ptsTo')} {tier.name === t('platinumTier') ? t('legend') : t('nextTier')}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${tier.color} transition-all duration-500`} 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Submissions breakdown */}
            <div className="grid grid-cols-2 gap-3 mt-3 relative z-10">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center text-center">
                <Camera className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-lg font-bold text-white">{userStats.totalReports}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t('reported')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center text-center">
                <CheckCircle className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-lg font-bold text-white">{userStats.resolvedReports}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t('resolved')}</span>
              </div>
            </div>

            {/* How to Earn Points Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('howToBoostScore')}</span>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>📸 {t('verifiedIncidentReport')}</span>
                <span className="font-mono font-bold text-emerald-400">+25 pts</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>✅ {t('municipalFixCompleted')}</span>
                <span className="font-mono font-bold text-cyan-400">+50 pts</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>👍 {t('confirmCommunityHazard')}</span>
                <span className="font-mono font-bold text-amber-400">+5 pts</span>
              </div>
            </div>
          </div>

          {/* Active Municipal Announcements Card */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-800/80 bg-slate-900/50 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-rose-400" />
                <span>{t('activeAlerts')}</span>
              </h2>
              <div className="flex items-center gap-2">
                {announcements.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {announcements.length} {t('alertsCount')}
                  </span>
                )}
                <Link
                  to="/alerts"
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {t('viewAll', 'View All')} →
                </Link>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {announcements.length > 0 ? (
                announcements.map(ann => {
                  let colorClasses = 'bg-cyan-500/10 border-cyan-500/25 text-cyan-200';
                  let dotClass = 'bg-cyan-400';
                  if (ann.type === 'error' || ann.type === 'critical') {
                    colorClasses = 'bg-rose-500/10 border-rose-500/25 text-rose-200';
                    dotClass = 'bg-rose-500 animate-pulse';
                  } else if (ann.type === 'warning') {
                    colorClasses = 'bg-amber-500/10 border-amber-500/25 text-amber-200';
                    dotClass = 'bg-amber-400 animate-pulse';
                  } else if (ann.type === 'success') {
                    colorClasses = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200';
                    dotClass = 'bg-emerald-400';
                  }

                  const isPlaying = playingAlertId === (ann._id || ann.id);

                  return (
                    <div key={ann._id || ann.id} className={`p-3.5 rounded-xl border ${colorClasses} flex flex-col gap-2 shadow-sm`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotClass}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold leading-snug">{ann.title}</p>
                          <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{ann.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                        <span className="font-mono opacity-50">
                          {new Date(ann.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handlePlayAlertAudio(ann)}
                          className="px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Listen to broadcast"
                        >
                          {isPlaying ? (
                            <>
                              <VolumeX className="w-3 h-3 text-cyan-400" />
                              <span>{t('stopListening', 'Stop')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-cyan-400" />
                              <span>{t('listenAlert', 'Listen')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/80 mb-2" />
                  <p className="text-xs font-bold text-slate-300">{t('allClearSector')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('allClearDesc')}</p>
                  <Link
                    to="/alerts"
                    className="mt-3 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    {t('viewAllAlerts', 'View All Community Alerts')} →
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Incident Detail & PDF Inspection Modal */}
      {selectedDetection && (
        <DetectionModal 
          detection={selectedDetection} 
          onClose={() => setSelectedDetection(null)}
          onStatusUpdated={(updated) => {
            setRecentReports(prev => prev.map(r => (r._id === updated._id || r.id === updated.id ? updated : r)));
          }}
        />
      )}

      {/* Emergency Hotlines Modal */}
      {showEmergencyModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowEmergencyModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="glass-card bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t('emergencyModalTitle')}</h3>
                  <p className="text-xs text-slate-400">{t('emergencyModalSubtitle')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: t('policeHelpline'), number: '112', desc: t('policeDesc'), color: 'rose' },
                { name: t('fireHelpline'), number: '101', desc: t('fireDesc'), color: 'orange' },
                { name: t('pwdHelpline'), number: '1800-180-0101', desc: t('pwdDesc'), color: 'sky' },
                { name: t('waterHelpline'), number: '1916', desc: t('waterDesc'), color: 'cyan' },
                { name: t('electricityHelpline'), number: '1912', desc: t('electricityDesc'), color: 'amber' },
              ].map(line => (
                <a
                  key={line.number}
                  href={`tel:${line.number}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition-colors">{line.name}</span>
                    <span className="text-[11px] text-slate-400">{line.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      {line.number}
                    </span>
                    <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
