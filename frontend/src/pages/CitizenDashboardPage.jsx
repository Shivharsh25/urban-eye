import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Award, 
  Activity, 
  Camera, 
  CheckCircle, 
  CheckCircle2, 
  ThumbsUp, 
  PhoneCall, 
  RefreshCw, 
  ShieldCheck, 
  Compass, 
  X, 
  Clock, 
  FileText, 
  ChevronRight, 
  Eye, 
  Droplets, 
  Zap, 
  Trash2,
  Phone,
  Volume2,
  VolumeX,
  Sparkles,
  TrendingUp,
  ArrowUpRight
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
    if (score >= 500) return { name: t('platinumTier'), threshold: 500, next: 1000, badge: t('ambassadorBadge') };
    if (score >= 250) return { name: t('goldTier'), threshold: 250, next: 500, badge: t('guardianBadge') };
    if (score >= 100) return { name: t('silverTier'), threshold: 100, next: 250, badge: t('activeBadge') };
    return { name: t('bronzeTier'), threshold: 0, next: 100, badge: t('contributorBadge') };
  };

  const tier = getCivicTier(userStats.civicScore);
  const progressPercent = Math.min(100, Math.max(10, ((userStats.civicScore - tier.threshold) / (tier.next - tier.threshold)) * 100));

  // Category visual metadata
  const getCategoryMeta = (type) => {
    const rawType = (type || '').toLowerCase();
    if (rawType.includes('pothole') || rawType.includes('road')) {
      return { label: t('roadHazard'), icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    }
    if (rawType.includes('garbage') || rawType.includes('waste') || rawType.includes('dump')) {
      return { label: t('illegalWaste'), icon: Trash2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    }
    if (rawType.includes('water') || rawType.includes('leak') || rawType.includes('drain')) {
      return { label: t('waterSewage'), icon: Droplets, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    }
    if (rawType.includes('light') || rawType.includes('lamp')) {
      return { label: t('streetlight'), icon: Zap, bg: 'bg-yellow-50', text: 'text-amber-700', border: 'border-yellow-200' };
    }
    return { label: t('civicInfra'), icon: ShieldAlert, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  };

  // Severity color helper
  const getSeverityBadge = (severity, priority) => {
    const s = (severity || priority || 'medium').toLowerCase();
    if (s === 'high' || s === 'critical') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">{t('critical')}</span>;
    }
    if (s === 'medium') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">{t('medium')}</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">{t('low')}</span>;
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const st = (status || 'new').toLowerCase();
    if (st === 'resolved') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {t('resolved')}
        </span>
      );
    }
    if (st === 'in_progress' || st === 'assigned') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          {t('inProgress')}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
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
    <div className="w-full text-slate-800 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-7 font-sans min-w-0 relative">
      
      {/* 1. Header Section: Clean, Spacious Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE7DD]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('welcomeBack')}, {user?.name?.split(' ')[0] || t('citizen')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF9F5] text-[#6B503B] border border-[#EAE7DD]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('liveGridActive')}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t('dashboardSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF9F5] text-slate-700 border border-[#EAE7DD] hover:border-[#99775C]/40 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh community feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#99775C] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? t('syncing') : t('syncLive')}</span>
          </button>
          
          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#99775C] hover:bg-[#84644B] text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t('newReport')}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar: 4 Clean, Airy Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Stat 1: Community Issues */}
        <div className="bg-white/95 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#EAE7DD] hover:border-[#99775C]/50 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('communityIssues')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] text-[#99775C] border border-[#EAE7DD] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{totalIncidentsCount}</div>
            <p className="text-xs text-slate-500 mt-1">{t('inArea')}</p>
          </div>
        </div>

        {/* Stat 2: Resolution Rate */}
        <div className="bg-white/95 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#EAE7DD] hover:border-[#99775C]/50 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('resolutionRate')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{resolutionPercentage}%</div>
            <p className="text-xs text-emerald-700 font-medium mt-1">{resolvedCount} {t('civicFixes')}</p>
          </div>
        </div>

        {/* Stat 3: My Submissions */}
        <div className="bg-white/95 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#EAE7DD] hover:border-[#99775C]/50 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('mySubmissions')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] text-[#99775C] border border-[#EAE7DD] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{userStats.totalReports}</div>
            <p className="text-xs text-slate-500 mt-1">{userStats.resolvedReports} {t('done')}</p>
          </div>
        </div>

        {/* Stat 4: Civic Score */}
        <div className="bg-white/95 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#EAE7DD] hover:border-[#99775C]/50 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('trustScore')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] text-[#99775C] border border-[#EAE7DD] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{userStats.civicScore}</div>
            <p className="text-xs text-[#84644B] font-medium mt-1">{tier.name} • {tier.next - userStats.civicScore} {t('ptsToNextRank')}</p>
          </div>
        </div>
      </div>

      {/* 3. Streamlined Quick Navigation Dock (Compact, non-congested) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button 
          onClick={() => navigate('/report')} 
          className="bg-white/90 backdrop-blur-xs hover:bg-white border border-[#EAE7DD] hover:border-[#99775C]/50 p-3.5 rounded-xl flex items-center gap-3 transition-all shadow-xs group text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] text-[#99775C] border border-[#EAE7DD] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{t('reportIssueAction')}</span>
            <span className="text-[11px] text-slate-500 block truncate">{t('aiDetection')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        <button 
          onClick={() => navigate('/my-reports')} 
          className="bg-white/90 backdrop-blur-xs hover:bg-white border border-[#EAE7DD] hover:border-[#99775C]/50 p-3.5 rounded-xl flex items-center gap-3 transition-all shadow-xs group text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] text-[#99775C] border border-[#EAE7DD] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{t('myActivity')}</span>
            <span className="text-[11px] text-slate-500 block truncate">{t('statusAndPdf')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        <button 
          onClick={() => navigate('/map')} 
          className="bg-white/90 backdrop-blur-xs hover:bg-white border border-[#EAE7DD] hover:border-[#99775C]/50 p-3.5 rounded-xl flex items-center gap-3 transition-all shadow-xs group text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{t('liveMap')}</span>
            <span className="text-[11px] text-slate-500 block truncate">{t('cityScanner')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        <button 
          onClick={() => setShowEmergencyModal(true)} 
          className="bg-white/90 backdrop-blur-xs hover:bg-white border border-[#EAE7DD] hover:border-rose-300 p-3.5 rounded-xl flex items-center gap-3 transition-all shadow-xs group text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{t('emergencySOS')}</span>
            <span className="text-[11px] text-slate-500 block truncate">{t('hotlines')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>

      {/* 4. Main Section: Left Feed (2 cols) + Right Info (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/95 backdrop-blur-xs border border-[#EAE7DD] rounded-2xl p-5 sm:p-6 shadow-xs">
            
            {/* Feed Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE7DD]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{t('recentAreaActivity')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('tapIncidentHint')}</p>
              </div>

              {/* Status Filter Tabs (Unified, clean) */}
              <div className="flex items-center p-1 rounded-xl bg-[#FAF9F5] border border-[#EAE7DD] text-xs font-semibold shrink-0">
                <button 
                  onClick={() => setFilter('ALL')} 
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'ALL' ? 'bg-[#99775C] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {t('all')}
                </button>
                <button 
                  onClick={() => setFilter('IN_PROGRESS')} 
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'IN_PROGRESS' ? 'bg-[#99775C] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {t('active')}
                </button>
                <button 
                  onClick={() => setFilter('RESOLVED')} 
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'RESOLVED' ? 'bg-[#99775C] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {t('resolved')}
                </button>
                <button 
                  onClick={() => setFilter('CRITICAL')} 
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === 'CRITICAL' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {t('critical')}
                </button>
              </div>
            </div>

            {/* Category Filter Chips (Single streamlined row) */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-b border-[#EAE7DD]/60">
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
                  className={`shrink-0 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer border ${
                    categoryFilter === cat.id 
                      ? 'bg-[#FAF9F5] text-[#6B503B] border-[#99775C] font-semibold shadow-xs' 
                      : 'bg-white text-slate-600 border-[#EAE7DD] hover:bg-[#FAF9F5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Feed List Items */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="w-8 h-8 border-2 border-[#99775C]/30 border-t-[#99775C] rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-medium">{t('scanningGrid')}</p>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-3 mt-3">
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
                      className="p-3.5 sm:p-4 rounded-xl border border-[#EAE7DD] hover:border-[#99775C]/60 hover:bg-[#FAF9F5]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 group cursor-pointer shadow-xs"
                      onClick={() => setSelectedDetection(report)}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Thumbnail / Category Icon */}
                        {imgUrl ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#EAE7DD] shadow-xs">
                            <img src={imgUrl} alt={report.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60">
                              <Icon className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center border ${cat.border} ${cat.bg}`}>
                            <Icon className={`w-5 h-5 ${cat.text}`} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900 capitalize group-hover:text-[#99775C] transition-colors truncate">
                              {cat.label}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {getSeverityBadge(report.severity, report.priority)}
                              {getStatusBadge(report.status)}
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#99775C] shrink-0" />
                            <span className="truncate">{summaryText}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              {new Date(report.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span className="truncate">{t('ward')}: {report.assignedDepartment?.split(' ')[0] || 'PWD'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-end gap-2.5 self-end sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-[#EAE7DD]/60 sm:border-t-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleUpvote(report._id || report.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                            isUpvoted 
                              ? 'bg-[#FAF9F5] text-[#6B503B] border-[#99775C]' 
                              : 'bg-white text-slate-600 border-[#EAE7DD] hover:bg-[#FAF9F5]'
                          }`}
                          title={t('confirmExistsTitle')}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-[#99775C] text-[#99775C]' : ''}`} />
                          <span>{currentUpvotes}</span>
                        </button>

                        <button
                          onClick={() => setSelectedDetection(report)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#84644B] hover:text-[#523D2C] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
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
              <div className="p-8 text-center text-slate-500 border border-[#EAE7DD] border-dashed rounded-xl bg-[#FAF9F5]/50 mt-3">
                <MapPin className="w-8 h-8 mx-auto text-[#99775C] mb-2" />
                <p className="text-sm font-semibold text-slate-800">{t('noMatchingReports')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('clearFiltersHint')}</p>
                <button
                  onClick={() => { setFilter('ALL'); setCategoryFilter('ALL'); }}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#EAE7DD] text-slate-700 hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                >
                  {t('resetFilters')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Civic Score & Announcements */}
        <div className="space-y-5">
          
          {/* Clean Civic Score Card */}
          <div className="bg-white/95 backdrop-blur-xs border border-[#EAE7DD] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#99775C]" />
                <span>{t('civicEngagementScore')}</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#6B503B] border border-[#EAE7DD]">
                {tier.badge}
              </span>
            </div>

            {/* Score & Tier Overview */}
            <div className="py-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-extrabold text-slate-900">{userStats.civicScore}</span>
                  <span className="text-xs font-medium text-slate-500 ml-1.5">{t('pointsShort')}</span>
                </div>
                <span className="text-xs font-bold text-[#84644B] uppercase">{tier.name}</span>
              </div>

              {/* Progress bar to next rank */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{t('levelProgress')}</span>
                  <span className="font-semibold text-slate-700">{tier.next - userStats.civicScore} {t('ptsToNextRank')}</span>
                </div>
                <div className="w-full h-2 bg-[#FAF9F5] border border-[#EAE7DD] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D7D2C0] to-[#99775C] rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Submissions Mini Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#EAE7DD]">
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DD] text-center">
                <span className="text-xl font-bold text-slate-900 block">{userStats.totalReports}</span>
                <span className="text-[11px] text-slate-500 font-medium">{t('reported')}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7DD] text-center">
                <span className="text-xl font-bold text-slate-900 block">{userStats.resolvedReports}</span>
                <span className="text-[11px] text-emerald-700 font-medium">{t('resolved')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
              Earn +25 points for every verified hazard you report.
            </p>
          </div>

          {/* Municipal Announcements Card */}
          <div className="bg-white/95 backdrop-blur-xs border border-[#EAE7DD] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#99775C]" />
                <span>{t('activeAlerts')}</span>
              </h2>
              <Link
                to="/alerts"
                className="text-xs font-semibold text-[#84644B] hover:text-[#523D2C] transition-colors"
              >
                {t('viewAll', 'View All')} →
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {announcements.length > 0 ? (
                announcements.slice(0, 3).map(ann => {
                  let alertStyle = 'bg-[#FAF9F5] border-[#EAE7DD] text-slate-800';
                  let dotStyle = 'bg-[#99775C]';
                  if (ann.type === 'error' || ann.type === 'critical') {
                    alertStyle = 'bg-rose-50/70 border-rose-200 text-slate-800';
                    dotStyle = 'bg-rose-500';
                  } else if (ann.type === 'warning') {
                    alertStyle = 'bg-amber-50/70 border-amber-200 text-slate-800';
                    dotStyle = 'bg-amber-500';
                  }

                  const isPlaying = playingAlertId === (ann._id || ann.id);

                  return (
                    <div key={ann._id || ann.id} className={`p-3.5 rounded-xl border ${alertStyle} flex flex-col gap-2`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotStyle}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 leading-snug">{ann.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{ann.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#EAE7DD]/60 text-[11px] text-slate-500">
                        <span className="font-mono">
                          {new Date(ann.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handlePlayAlertAudio(ann)}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#EAE7DD] text-slate-700 hover:bg-[#FAF9F5] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Listen to broadcast"
                        >
                          {isPlaying ? (
                            <>
                              <VolumeX className="w-3 h-3 text-[#99775C]" />
                              <span>{t('stopListening', 'Stop')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-[#99775C]" />
                              <span>{t('listenAlert', 'Listen')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#EAE7DD] rounded-xl bg-[#FAF9F5]/50">
                  <ShieldCheck className="w-7 h-7 text-[#99775C] mb-2" />
                  <p className="text-xs font-semibold text-slate-800">{t('allClearSector')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('allClearDesc')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Helpline Access Card */}
          <div className="bg-white/95 backdrop-blur-xs border border-[#EAE7DD] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t('emergencyHotlines', 'Emergency Hotlines')}</span>
                <span className="text-[11px] text-slate-500 block">Police 112 • Fire 101 • PWD</span>
              </div>
            </div>
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#EAE7DD] text-slate-700 hover:bg-[#EAE7DD]/60 text-xs font-semibold transition-all cursor-pointer"
            >
              View
            </button>
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
          className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowEmergencyModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white border border-[#EAE7DD] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAE7DD] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t('emergencyModalTitle')}</h3>
                  <p className="text-xs text-slate-500">{t('emergencyModalSubtitle')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { name: t('policeHelpline'), number: '112', desc: t('policeDesc') },
                { name: t('fireHelpline'), number: '101', desc: t('fireDesc') },
                { name: t('pwdHelpline'), number: '1800-180-0101', desc: t('pwdDesc') },
                { name: t('waterHelpline'), number: '1916', desc: t('waterDesc') },
                { name: t('electricityHelpline'), number: '1912', desc: t('electricityDesc') },
              ].map(line => (
                <a
                  key={line.number}
                  href={`tel:${line.number}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F5F3EC] border border-[#EAE7DD] transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-[#99775C] transition-colors">{line.name}</span>
                    <span className="text-[11px] text-slate-500">{line.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#6B503B] bg-white px-2 py-0.5 rounded border border-[#EAE7DD]">
                      {line.number}
                    </span>
                    <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#99775C] transition-colors" />
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE7DD]/70 text-xs font-semibold text-slate-700 border border-[#EAE7DD] transition-colors cursor-pointer"
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
