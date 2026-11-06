import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  AlertTriangle, 
  Calendar,
  Layers,
  TrendingUp,
  FileText,
  ShieldCheck,
  Users,
  Zap,
  ThumbsUp,
  MoreVertical,
  BarChart2,
  Bell,
  RefreshCw,
  Plus,
  PhoneCall,
  X,
  Phone,
  Trash2,
  Droplets,
  Activity,
  Map as MapIcon,
  ChevronDown
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
  
  // Filter state matching screenshot: All, Open, In Progress, Resolved
  const [filter, setFilter] = useState('ALL'); // ALL, OPEN, IN_PROGRESS, RESOLVED
  const [scoreTimeframe, setScoreTimeframe] = useState('This Month');
  const [showAllActivity, setShowAllActivity] = useState(false);
  
  // Interactive modal states
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [playingAlertId, setPlayingAlertId] = useState(null);

  const [userStats, setUserStats] = useState({
    totalReports: 6,
    resolvedReports: 2,
    civicScore: 80,
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

  // Audio broadcast player for municipal announcements
  const handlePlayAlertAudio = (ann) => {
    if (!('speechSynthesis' in window)) return;
    const annId = ann?._id || ann?.id || 'alert-1';
    if (playingAlertId === annId) {
      window.speechSynthesis.cancel();
      setPlayingAlertId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const title = ann?.title || 'High Risk Area Reported';
    const msg = ann?.message || 'Multiple complaints near Sector 62.';
    const textToSpeak = `${title}. ${msg}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingAlertId(null);
    utterance.onerror = () => setPlayingAlertId(null);
    setPlayingAlertId(annId);
    window.speechSynthesis.speak(utterance);
  };

  // Seed default community reports matching the design if server is empty
  const defaultSampleReports = [
    {
      _id: 'seed-1',
      id: 'seed-1',
      type: 'garbage',
      title: 'Illegal Waste / Garbage',
      address: 'Knowledge Park III, Greater Noida',
      assignedDepartment: 'Sanitation',
      createdAt: '2026-10-14T10:30:00Z',
      status: 'in_progress',
      reportCount: 1,
      severity: 'medium',
      confidence: 0.94
    },
    {
      _id: 'seed-2',
      id: 'seed-2',
      type: 'pothole',
      title: 'Road Hazard / Pothole',
      address: 'Delta 1, Sector 20, Greater Noida',
      assignedDepartment: 'Roads',
      createdAt: '2026-10-11T14:15:00Z',
      status: 'in_progress',
      reportCount: 7,
      severity: 'high',
      confidence: 0.98
    },
    {
      _id: 'seed-3',
      id: 'seed-3',
      type: 'streetlight',
      title: 'Street Light Not Working',
      address: 'Block A, Sector 61',
      assignedDepartment: 'Electricity',
      createdAt: '2026-10-10T19:45:00Z',
      status: 'resolved',
      reportCount: 3,
      severity: 'low',
      confidence: 0.91
    }
  ];

  // Fetch community data
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [reportsRes, announcementsRes, statsRes] = await Promise.all([
        api.get('/api/detections?scope=community'),
        api.get('/api/announcements'),
        api.get('/api/stats/user-summary')
      ]);
      
      const allReports = reportsRes.data?.detections || [];
      if (allReports.length > 0) {
        const sortedReports = [...allReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentReports(sortedReports);
      } else {
        setRecentReports(defaultSampleReports);
      }
      
      setAnnouncements(announcementsRes.data || []);

      if (statsRes.data) {
        setUserStats({
          totalReports: statsRes.data.totalReports ?? 6,
          resolvedReports: statsRes.data.resolvedReports ?? 2,
          civicScore: statsRes.data.trustScore ?? 80,
        });
      }
    } catch (error) {
      console.warn('Using baseline reports due to network/API state:', error.message);
      setRecentReports(defaultSampleReports);
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

  // Toggle upvote on incident
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

  // Category Icon & Styling Helper
  const getCategoryDisplay = (report) => {
    const rawType = ((report.type || '') + ' ' + (report.title || '')).toLowerCase();
    
    if (rawType.includes('waste') || rawType.includes('garbage') || rawType.includes('dump')) {
      return {
        title: report.title || 'Illegal Waste / Garbage',
        icon: Trash2,
        boxBg: 'bg-[#E8F8F0]',
        iconColor: 'text-[#10B981]',
        borderColor: 'border-[#D1F2E2]'
      };
    }
    if (rawType.includes('pothole') || rawType.includes('road') || rawType.includes('hazard')) {
      return {
        title: report.title || 'Road Hazard / Pothole',
        icon: AlertTriangle,
        boxBg: 'bg-[#E6F8F5]',
        iconColor: 'text-[#00897B]',
        borderColor: 'border-[#CEEFE8]'
      };
    }
    if (rawType.includes('light') || rawType.includes('lamp') || rawType.includes('street')) {
      return {
        title: report.title || 'Street Light Not Working',
        icon: Zap,
        boxBg: 'bg-[#F4EBFD]',
        iconColor: 'text-[#8B5CF6]',
        borderColor: 'border-[#E9D5FF]'
      };
    }
    if (rawType.includes('water') || rawType.includes('leak') || rawType.includes('drain')) {
      return {
        title: report.title || 'Water Leakage / Pipe Burst',
        icon: Droplets,
        boxBg: 'bg-[#EBF5FE]',
        iconColor: 'text-[#0284C7]',
        borderColor: 'border-[#BAE6FD]'
      };
    }
    return {
      title: report.title || 'Civil Infrastructure Alert',
      icon: AlertTriangle,
      boxBg: 'bg-[#E6F8F5]',
      iconColor: 'text-[#00897B]',
      borderColor: 'border-[#CEEFE8]'
    };
  };

  // Status badge helper exactly matching screenshot
  const renderStatusBadge = (status) => {
    const st = (status || 'in_progress').toLowerCase();
    if (st === 'resolved') {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#10B981] border border-[#D1F2E2]/70 inline-block text-center min-w-[90px]">
          Resolved
        </span>
      );
    }
    if (st === 'open' || st === 'new' || st === 'reported') {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#EBF5FE] text-[#0284C7] border border-[#BAE6FD]/70 inline-block text-center min-w-[90px]">
          Open
        </span>
      );
    }
    return (
      <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FFF3E8] text-[#D97706] border border-[#FDE68A]/70 inline-block text-center min-w-[90px]">
        In Progress
      </span>
    );
  };

  // Clean location & date formatting
  const formatReportLocation = (report) => {
    if (report.address && report.address.trim()) return report.address;
    if (report.lat && report.lng) return `GPS: ${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}`;
    return 'Sector 62, Greater Noida';
  };

  const formatReportDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Oct 14, 2026';
    }
  };

  // Filter reports
  const displayReports = (recentReports.length > 0 ? recentReports : defaultSampleReports).filter(report => {
    const st = (report.status || 'in_progress').toLowerCase();
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return st === 'open' || st === 'new' || st === 'reported';
    if (filter === 'IN_PROGRESS') return st === 'in_progress' || st === 'assigned';
    if (filter === 'RESOLVED') return st === 'resolved';
    return true;
  });

  const visibleReports = showAllActivity ? displayReports : displayReports.slice(0, 3);

  // Calculate resolution stats
  const totalCount = recentReports.length > 0 ? recentReports.length : 24;
  const resolvedCount = recentReports.filter(r => (r.status || '').toLowerCase() === 'resolved').length;
  const resolutionPercentage = recentReports.length > 0 && totalCount > 0 
    ? Math.round((resolvedCount / totalCount) * 100) 
    : 13;

  // Primary announcement
  const primaryAlert = announcements.length > 0 ? announcements[0] : {
    id: 'alert-default-1',
    title: 'High Risk Area Reported',
    message: 'Multiple complaints near Sector 62.'
  };

  const citizenName = user?.name?.split(' ')[0] || 'Rai';

  return (
    <div className="w-full text-slate-800 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans min-w-0">
      
      {/* ================================================================= */}
      {/* 1. WELCOME GREETING & TOP ACTION BUTTONS (INC. EMERGENCY SOS)     */}
      {/* ================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2027] tracking-tight flex items-center gap-2">
            <span>Welcome back, {citizenName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Real-time urban surveillance, community impact tracking, and civic resolution dispatch.
          </p>
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E5F7F3] text-[#00796B] border border-[#BDEEE3] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Grid Active
            </span>
          </div>
        </div>

        {/* Top Action Buttons: Sync Live, Emergency SOS, New Report */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F2FBF9] text-[#053B42] border border-[#CEE7E2] transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh community feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#005C66] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Immediate Emergency Services & Hotlines"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>Emergency SOS</span>
          </button>
          
          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-[#005C66] hover:bg-[#004B53] text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. KEY METRICS BAR: CAPSULE / PILL SHAPED CONTAINER (EXACT EDGES) */}
      {/* ================================================================= */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl lg:rounded-full border border-[#BCEEE5] px-4 sm:px-8 lg:px-12 py-4 sm:py-6 shadow-[0_4px_28px_rgba(0,180,180,0.12)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-5 lg:gap-2 items-center">
          
          {/* Metric 1: Community Issues */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#00897B]">
              <Layers className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B2027] leading-none">
                {totalCount}
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                Community<br />Issues
              </div>
            </div>
          </div>

          {/* Metric 2: Resolution Rate */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#00897B]">
              <TrendingUp className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B2027] leading-none">
                {resolutionPercentage}%
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                Resolution<br />Rate
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                <span>▲</span>
                <span>+3%</span>
              </div>
            </div>
          </div>

          {/* Metric 3: My Submissions */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#00897B]">
              <FileText className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B2027] leading-none">
                {userStats.totalReports || 6}
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                My<br />Submissions
              </div>
            </div>
          </div>

          {/* Center Vertical Divider matching screenshot */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-px h-12 bg-[#D5EFEA]"></div>
          </div>

          {/* Metric 4: Civic Trust */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#00897B]">
              <ShieldCheck className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B2027] leading-none">
                {userStats.civicScore || 80}
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                Civic Trust
              </div>
              <div className="text-[10px] font-semibold text-amber-700 mt-0.5">
                Bronze • +20 pts
              </div>
            </div>
          </div>

          {/* Metric 5: Engagement */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#00897B]">
              <Users className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B2027] leading-none">
                88%
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                Engagement
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                <span>▲</span>
                <span>+5%</span>
              </div>
            </div>
          </div>

          {/* Metric 6: Pending SOS */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#00897B]">
              <Zap className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B2027] leading-none">
                0
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 leading-tight">
                Pending SOS
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. MAIN CONTENT GRID: LEFT FEED (2 COLS) + RIGHT STATS (1 COL)    */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* --------------------------------------------------------------- */}
        {/* LEFT 2 COLUMNS: Recent Activity in Your Area                    */}
        {/* --------------------------------------------------------------- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 sm:p-6 shadow-xs shadow-teal-900/5">
            
            {/* Header: Title & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2F1EE]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E6F8F5] text-[#00897B] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0B2027]">
                    Recent Activity in Your Area
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest reports and updates from the community.
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs matching screenshot: [All] Open In Progress Resolved */}
              <div className="flex items-center space-x-1 self-start sm:self-center">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filter === 'ALL'
                      ? 'bg-[#003840] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2FBF9]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('OPEN')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    filter === 'OPEN'
                      ? 'bg-[#003840] text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2FBF9]'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setFilter('IN_PROGRESS')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    filter === 'IN_PROGRESS'
                      ? 'bg-[#003840] text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2FBF9]'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilter('RESOLVED')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    filter === 'RESOLVED'
                      ? 'bg-[#003840] text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#F2FBF9]'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* List of Incidents */}
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                  <div className="w-8 h-8 border-2 border-[#005C66]/20 border-t-[#005C66] rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-medium">Scanning local grid sensors...</p>
                </div>
              ) : displayReports.length > 0 ? (
                <>
                  <div className={`space-y-3 transition-all duration-300 ${showAllActivity ? 'max-h-[620px] overflow-y-auto custom-scrollbar pr-1' : ''}`}>
                    {visibleReports.map((report) => {
                      const meta = getCategoryDisplay(report);
                      const Icon = meta.icon;
                      const repId = report._id || report.id;
                      const isUpvoted = upvotedIds.has(repId);
                      const upvoteCount = (report.reportCount || 1) + (isUpvoted ? 1 : 0);
                      const locationText = formatReportLocation(report);
                      const dateText = formatReportDate(report.createdAt);
                      const wardText = report.assignedDepartment || 'Sanitation';

                      return (
                        <div
                          key={repId}
                          onClick={() => setSelectedDetection(report)}
                          className="p-4 rounded-2xl border border-[#E5F2EF] hover:border-[#00A896]/40 hover:bg-[#FAFDFC] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group cursor-pointer shadow-2xs"
                        >
                          {/* Left: Category Icon + Description */}
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className={`w-11 h-11 rounded-xl ${meta.boxBg} ${meta.iconColor} border ${meta.borderColor} flex items-center justify-center shrink-0`}>
                              <Icon className="w-5 h-5 stroke-[2]" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-[#0B2027] group-hover:text-[#005C66] transition-colors truncate">
                                {meta.title}
                              </h3>

                              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{locationText}</span>
                              </p>

                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{dateText}</span>
                                </span>
                                <span>•</span>
                                <span>Ward: {wardText}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Status Badge + Upvote + Menu */}
                          <div 
                            className="flex items-center justify-end gap-3 self-end sm:self-center shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Status Badge */}
                            {renderStatusBadge(report.status)}

                            {/* Thumbs Up Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleUpvote(repId)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isUpvoted 
                                  ? 'bg-[#E5F7F3] text-[#00796B] border-[#00A896]' 
                                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-2xs'
                              }`}
                              title="Confirm / Support this issue"
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-[#00796B] text-[#00796B]' : 'text-slate-500'}`} />
                              <span>{upvoteCount}</span>
                            </button>

                            {/* Three Dots Menu Button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setSelectedDetection(report)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Inspect Issue & View PDF"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* View All / Show Less Toggle Button */}
                  {displayReports.length > 3 && (
                    <div className="pt-3 text-center border-t border-[#E2F1EE]">
                      <button
                        type="button"
                        onClick={() => setShowAllActivity(!showAllActivity)}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F2FBF9] hover:bg-[#E5F7F3] text-[#005C66] text-xs font-bold transition-all border border-[#D5EFEA] shadow-2xs cursor-pointer active:scale-95"
                      >
                        <span>{showAllActivity ? 'Show Less' : `View All Activity (${displayReports.length})`}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllActivity ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-[#D5EFEA] rounded-2xl bg-[#F9FDFC]">
                  <p className="text-sm font-semibold text-slate-700">No reports found for this filter.</p>
                  <button
                    onClick={() => setFilter('ALL')}
                    className="mt-2 text-xs font-bold text-[#005C66] hover:underline cursor-pointer"
                  >
                    View All Reports
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* RIGHT 1 COLUMN: Civic Score + Active Alerts + Emergency SOS     */}
        {/* --------------------------------------------------------------- */}
        <div className="space-y-6">
          
          {/* Card 1: Civic Engagement Score */}
          <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 sm:p-6 shadow-xs shadow-teal-900/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#00897B]" />
                <h3 className="text-base font-bold text-[#0B2027]">
                  Civic Engagement Score
                </h3>
              </div>

              {/* Timeframe selector */}
              <div className="relative">
                <select
                  value={scoreTimeframe}
                  onChange={(e) => setScoreTimeframe(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-white border border-[#D5EFEA] rounded-xl px-2.5 py-1 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-[#00897B]"
                >
                  <option value="This Month">This Month</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="All Time">All Time</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1.5 text-slate-400 text-xs">⌵</span>
              </div>
            </div>

            {/* Score points & delta */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-[#0B2027]">
                {userStats.civicScore || 80}
              </span>
              <span className="text-sm font-bold text-[#0B2027]">pts</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 ml-1">
                <span>▲</span>
                <span>+5 pts</span>
              </span>
            </div>

            {/* Smooth Wave Chart matching screenshot */}
            <div className="relative w-full h-24 my-2 overflow-hidden">
              <svg 
                viewBox="0 0 380 90" 
                preserveAspectRatio="none" 
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="scoreWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A896" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00A896" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Wave Area Fill */}
                <path 
                  d="M 0,65 Q 60,60 120,50 T 240,40 T 350,15 L 380,12 L 380,90 L 0,90 Z" 
                  fill="url(#scoreWaveGrad)" 
                />
                {/* Wave Stroke Line */}
                <path 
                  d="M 0,65 Q 60,60 120,50 T 240,40 T 350,15 L 380,12" 
                  fill="none" 
                  stroke="#00A896" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                {/* Endpoint Node */}
                <circle cx="378" cy="12" r="3.5" fill="#00A896" />
              </svg>
            </div>

            {/* Level Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                <span>Level Progress</span>
                <span>20 pts to next rank</span>
              </div>
              <div className="w-full h-2.5 bg-[#E6F3F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#005C66] rounded-full transition-all duration-500" 
                  style={{ width: '80%' }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Active Alerts */}
          <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 sm:p-6 shadow-xs shadow-teal-900/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#00897B]" />
                <h3 className="text-base font-bold text-[#0B2027]">
                  Active Alerts
                </h3>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-bold text-slate-700 hover:text-[#005C66] transition-colors flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            {/* Alert Box matching screenshot */}
            <div className="bg-[#FFF5F5] border border-[#FEE2E2] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse"></div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0B2027] truncate">
                    {primaryAlert.title || 'High Risk Area Reported'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed truncate">
                    {primaryAlert.message || 'Multiple complaints near Sector 62.'}
                  </p>
                </div>
              </div>

              {/* View Button with Audio Broadcast speech synthesis integration */}
              <button
                type="button"
                onClick={() => handlePlayAlertAudio(primaryAlert)}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
                title="View alert and listen to audio dispatch"
              >
                {playingAlertId ? 'Playing...' : 'View'}
              </button>
            </div>
          </div>

          {/* Card 3: Emergency SOS Services Quick Card */}
          <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 shadow-xs shadow-teal-900/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#0B2027] truncate">Emergency SOS</h4>
                <p className="text-xs text-slate-500 truncate">Police 112 • Fire 101 • Rapid Hotlines</p>
              </div>
            </div>
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
            >
              Open SOS
            </button>
          </div>

        </div>

      </div>

      {/* ================================================================= */}
      {/* 4. MODALS: DETECTION INSPECT MODAL + EMERGENCY SERVICES MODAL     */}
      {/* ================================================================= */}
      
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
          className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowEmergencyModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white border border-[#D5EFEA] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2F1EE] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FEECEC] text-[#EF4444] flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2027]">Emergency Services</h3>
                  <p className="text-xs text-slate-500">Instant direct civic emergency dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'National Emergency Helpline', number: '112', desc: 'Police, Fire & Ambulance response' },
                { name: 'Fire Control Command', number: '101', desc: 'Rapid municipal fire and hazard unit' },
                { name: 'Roads & PWD Emergency', number: '1800-180-0101', desc: 'Severe sinkholes and road collapse' },
                { name: 'Water Board Emergency', number: '1916', desc: 'Major pipeline rupture and flood alert' },
                { name: 'Power Grid Hazard', number: '1912', desc: 'Fallen live wire and transformer sparks' },
              ].map(line => (
                <a
                  key={line.number}
                  href={`tel:${line.number}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FDFC] hover:bg-[#F2FBF9] border border-[#D5EFEA] transition-all group"
                >
                  <div>
                    <span className="text-xs font-bold text-[#0B2027] block group-hover:text-[#005C66] transition-colors">{line.name}</span>
                    <span className="text-[11px] text-slate-500">{line.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#005C66] bg-white px-2.5 py-1 rounded-lg border border-[#D5EFEA]">
                      {line.number}
                    </span>
                    <Phone className="w-4 h-4 text-slate-400 group-hover:text-[#005C66] transition-colors" />
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#F2FBF9] hover:bg-[#E5F7F3] text-xs font-bold text-[#005C66] border border-[#D5EFEA] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
