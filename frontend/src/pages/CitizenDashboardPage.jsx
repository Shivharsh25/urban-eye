import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Sparkles, 
  TrendingUp, 
  Clock, 
  FileText, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  ShieldCheck, 
  Compass, 
  Locate, 
  X, 
  ExternalLink, 
  Download, 
  Layers, 
  Flame, 
  Droplets, 
  Zap, 
  Trash2,
  Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import DetectionModal from '../components/DetectionModal';
import api from '../api/client';
import { subscribeToDetections } from '../api/socket';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
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
  
  // Map positioning state
  const [customMapCenter, setCustomMapCenter] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState(new Set());

  const [userStats, setUserStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    civicScore: 85,
  });

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

  // Compute smart map center: custom pin/GPS -> latest valid report -> NCR default
  const mapCenter = useMemo(() => {
    if (customMapCenter) return customMapCenter;
    if (recentReports && recentReports.length > 0) {
      const firstValid = recentReports.find(r => r.lat && r.lng && !isNaN(r.lat) && !isNaN(r.lng));
      if (firstValid) {
        return { lat: Number(firstValid.lat), lng: Number(firstValid.lng) };
      }
    }
    // Default to Greater Noida / NCR civic hub
    return { lat: 28.4744, lng: 77.5040 };
  }, [customMapCenter, recentReports]);

  // Handle GPS location trigger
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomMapCenter({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        });
        setIsLocating(false);
      },
      (err) => {
        console.error('Location error:', err);
        setIsLocating(false);
        alert('Could not determine current location. Please check browser location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResetMapCenter = () => {
    setCustomMapCenter(null);
  };

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
    if (score >= 500) return { name: 'Platinum', color: 'from-cyan-300 via-sky-400 to-indigo-500', textGradient: 'from-cyan-400 to-blue-400', threshold: 500, next: 1000, badge: 'Civic Ambassador', perk: 'Direct priority municipal escalation' };
    if (score >= 250) return { name: 'Gold', color: 'from-amber-300 via-amber-400 to-orange-500', textGradient: 'from-amber-400 to-orange-400', threshold: 250, next: 500, badge: 'Verified Guardian', perk: 'Priority dispatch & verified reporter badge' };
    if (score >= 100) return { name: 'Silver', color: 'from-slate-200 via-slate-300 to-slate-400', textGradient: 'from-slate-200 to-slate-400', threshold: 100, next: 250, badge: 'Active Citizen', perk: 'Expedited AI incident triage' };
    return { name: 'Bronze', color: 'from-orange-400 to-amber-600', textGradient: 'from-orange-400 to-amber-500', threshold: 0, next: 100, badge: 'Community Contributor', perk: 'Standard community reporting' };
  };

  const tier = getCivicTier(userStats.civicScore);
  const progressPercent = Math.min(100, Math.max(10, ((userStats.civicScore - tier.threshold) / (tier.next - tier.threshold)) * 100));

  // Category visual metadata
  const getCategoryMeta = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('pothole') || t.includes('road')) {
      return { label: 'Road Hazard / Pothole', icon: AlertTriangle, bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    }
    if (t.includes('garbage') || t.includes('waste') || t.includes('dump')) {
      return { label: 'Illegal Waste / Garbage', icon: Trash2, bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    }
    if (t.includes('water') || t.includes('leak') || t.includes('drain')) {
      return { label: 'Water Leak / Sewage', icon: Droplets, bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    }
    if (t.includes('light') || t.includes('lamp')) {
      return { label: 'Streetlight Outage', icon: Zap, bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    }
    return { label: 'Civic Infrastructure', icon: ShieldAlert, bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' };
  };

  // Severity color helper
  const getSeverityBadge = (severity, priority) => {
    const s = (severity || priority || 'medium').toLowerCase();
    if (s === 'high' || s === 'critical') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">CRITICAL</span>;
    }
    if (s === 'medium') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">MEDIUM</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">LOW</span>;
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const st = (status || 'new').toLowerCase();
    if (st === 'resolved') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          RESOLVED
        </span>
      );
    }
    if (st === 'in_progress' || st === 'assigned') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          IN PROGRESS
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
        REPORTED
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10 font-sans">
      
      {/* Top Welcome & Notification Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">{user?.name?.split(' ')[0] || 'Citizen'}</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Grid Active
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time urban surveillance, community impact tracking, and civic resolution dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
          
          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* 4-Card Community Metric Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Community Issues</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalIncidentsCount}</span>
            <span className="text-xs font-semibold text-slate-500">active in area</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>GPS verified incidents</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City Resolution Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{resolutionPercentage}%</span>
            <span className="text-xs font-semibold text-emerald-400">resolved</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400/80 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{resolvedCount} municipal fixes</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{userStats.totalReports}</span>
            <span className="text-xs font-semibold text-slate-400">filed by you</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>{userStats.resolvedReports} resolved</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Civic Trust Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${tier.textGradient}`}>{userStats.civicScore}</span>
            <span className="text-xs font-bold uppercase text-amber-400/90">{tier.name}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium truncate">
            <span>{tier.next - userStats.civicScore} pts to next rank</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <button 
          onClick={() => navigate('/report')} 
          className="glass-card hover:border-sky-500/40 p-4 rounded-2xl flex items-center gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-sky-500/5 to-slate-900/50"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-sky-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white flex items-center gap-1">
              Report Issue
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">AI Detection & Dispatch</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/my-reports')} 
          className="glass-card hover:border-indigo-500/40 p-4 rounded-2xl flex items-center gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-indigo-500/5 to-slate-900/50"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white flex items-center gap-1">
              My Activity & PDF
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">Status timeline & exports</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/map')} 
          className="glass-card hover:border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-emerald-500/5 to-slate-900/50"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white flex items-center gap-1">
              Full Screen Map
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">Interactive city scanner</p>
          </div>
        </button>

        <button 
          onClick={() => setShowEmergencyModal(true)} 
          className="glass-card hover:border-rose-500/40 p-4 rounded-2xl flex items-center gap-3.5 text-left group transition-all duration-200 bg-gradient-to-br from-rose-500/5 to-slate-900/50"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneCall className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-rose-200 flex items-center gap-1">
              Emergency SOS
              <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-rose-300/70 truncate">Municipal Control Hotlines</p>
          </div>
        </button>
      </div>

      {/* Main Grid: Left (Map & Local Activity) + Right (Civic Score & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Enhanced Community Impact Map Card */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 flex flex-col h-[460px] shadow-2xl relative bg-slate-950">
            
            {/* Map Header Bar */}
            <div className="px-5 py-3.5 border-b border-slate-800/70 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-xl z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Community Impact Map
                    <span className="text-[11px] font-mono font-normal text-slate-400">
                      ({recentReports.length} pins active)
                    </span>
                  </h2>
                </div>
              </div>

              {/* Map View Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  title="Locate my GPS coordinates"
                >
                  <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'My GPS'}</span>
                </button>

                {customMapCenter && (
                  <button
                    onClick={handleResetMapCenter}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    title="Recenter on community incidents"
                  >
                    <span>Reset</span>
                  </button>
                )}

                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Grid
                </span>
              </div>
            </div>

            {/* Google Map Container with Connected Detections */}
            <div className="flex-1 relative w-full h-full bg-slate-900">
              <MapView 
                detections={recentReports}
                center={mapCenter}
                zoom={13}
                height="100%"
                onSelectDetection={(detection) => setSelectedDetection(detection)}
                showFilters={true}
              />
            </div>
          </div>

          {/* Local Activity Feed */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/80 bg-slate-900/40">
            
            {/* Feed Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Recent Activity in your Area</h2>
                  <p className="text-xs text-slate-400">Click any incident to inspect details or download official PDF</p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
                <button 
                  onClick={() => setFilter('ALL')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'ALL' ? 'bg-indigo-600/30 text-indigo-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('CRITICAL')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Critical
                </button>
                <button 
                  onClick={() => setFilter('IN_PROGRESS')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setFilter('RESOLVED')} 
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all text-center whitespace-nowrap ${filter === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Category Sub-Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'pothole', label: 'Roads & Potholes' },
                { id: 'garbage', label: 'Garbage & Waste' },
                { id: 'water_leak', label: 'Water & Leaks' },
                { id: 'streetlight', label: 'Lighting' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
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
                <p className="text-xs text-slate-400 font-medium">Scanning community grid...</p>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-3">
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
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700/80 hover:bg-slate-850/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer"
                      onClick={() => setSelectedDetection(report)}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Thumbnail or Category Icon */}
                        {imgUrl ? (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700/60 shadow-md">
                            <img src={imgUrl} alt={report.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                              <Icon className={`w-3 h-3 ${cat.text}`} />
                            </div>
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border ${cat.border} ${cat.bg}`}>
                            <Icon className={`w-5 h-5 ${cat.text}`} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white capitalize group-hover:text-cyan-300 transition-colors truncate">
                              {cat.label}
                            </span>
                            {getSeverityBadge(report.severity, report.priority)}
                            {getStatusBadge(report.status)}
                          </div>

                          <p className="text-xs text-slate-300 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span className="truncate">{summaryText}</span>
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span>Ward: {report.assignedDepartment?.split(' ')[0] || 'PWD'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleUpvote(report._id || report.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isUpvoted 
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                              : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-cyan-300 hover:bg-slate-800'
                          }`}
                          title="Confirm this issue exists in your area"
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                          <span>{currentUpvotes}</span>
                        </button>

                        <button
                          onClick={() => setSelectedDetection(report)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Inspect & PDF</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-slate-800/50 border-dashed rounded-2xl bg-slate-900/20">
                <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No matching reports in your community.</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing filters or report an issue you discovered on the road.</p>
                <button
                  onClick={() => { setFilter('ALL'); setCategoryFilter('ALL'); }}
                  className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Reset Filters
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
                Civic Engagement Score
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
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PTS</span>
                </div>
              </div>

              <p className={`text-xs font-extrabold tracking-widest uppercase mt-3 bg-clip-text text-transparent bg-gradient-to-r ${tier.textGradient}`}>
                {tier.name} Tier Citizen
              </p>
              
              {/* Progress to Next Tier */}
              <div className="w-full mt-3">
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Level Progress</span>
                  <span className="text-amber-400 font-bold">{tier.next - userStats.civicScore} pts to {tier.name === 'Platinum' ? 'Legend' : 'Next Tier'}</span>
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
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Reported</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center text-center">
                <CheckCircle className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-lg font-bold text-white">{userStats.resolvedReports}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Resolved</span>
              </div>
            </div>

            {/* How to Earn Points Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">How to Boost Score:</span>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>📸 Verified Incident Report</span>
                <span className="font-mono font-bold text-emerald-400">+25 pts</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>✅ Municipal Fix Completed</span>
                <span className="font-mono font-bold text-cyan-400">+50 pts</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>👍 Confirm Community Hazard</span>
                <span className="font-mono font-bold text-amber-400">+5 pts</span>
              </div>
            </div>
          </div>

          {/* Active Municipal Announcements Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/80 bg-slate-900/50 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-rose-400" />
                Active Alerts
              </h2>
              {announcements.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {announcements.length} Alert{announcements.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="space-y-3 flex-1">
              {announcements.length > 0 ? (
                announcements.map(ann => {
                  let colorClasses = 'bg-cyan-500/10 border-cyan-500/25 text-cyan-200';
                  let dotClass = 'bg-cyan-400';
                  if (ann.type === 'error') {
                    colorClasses = 'bg-rose-500/10 border-rose-500/25 text-rose-200';
                    dotClass = 'bg-rose-500 animate-pulse';
                  } else if (ann.type === 'warning') {
                    colorClasses = 'bg-amber-500/10 border-amber-500/25 text-amber-200';
                    dotClass = 'bg-amber-400 animate-pulse';
                  } else if (ann.type === 'success') {
                    colorClasses = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200';
                    dotClass = 'bg-emerald-400';
                  }

                  return (
                    <div key={ann._id} className={`p-3.5 rounded-xl border ${colorClasses} flex gap-3 shadow-sm`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotClass}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold">{ann.title}</p>
                        <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{ann.message}</p>
                        <span className="text-[9px] font-mono opacity-50 block mt-1">
                          {new Date(ann.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/80 mb-2" />
                  <p className="text-xs font-bold text-slate-300">All Clear in Sector</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No critical municipal hazard warnings or route closures.</p>
                </div>
              )}
            </div>
          </div>

          {/* Civic Reporting Quick Tips */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800/80 bg-slate-900/30">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Pro Tips for Faster Resolution
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span><strong>Capture Wide Angle:</strong> Include road dividers or nearby storefronts to help field teams locate the issue.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span><strong>Verify Map Pin:</strong> Fine-tune the GPS pin on the map preview if reporting after leaving the site.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span><strong>Download Official PDF:</strong> Use the generated PDF dispatch report if escalating to your local RWA or ward councillor.</span>
              </div>
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
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Emergency Civic Hotlines</h3>
                  <p className="text-xs text-slate-400">Direct dial for municipal and emergency services</p>
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
                { name: 'National Emergency / Police', number: '112', desc: 'Police, ambulance & disaster control', color: 'rose' },
                { name: 'Fire Control Room', number: '101', desc: 'Fire hazards & rescue services', color: 'orange' },
                { name: 'Municipal / PWD Road Control', number: '1800-180-0101', desc: 'Sinkholes, road collapse & fallen trees', color: 'sky' },
                { name: 'Water Supply & Main Pipeline', number: '1916', desc: 'Major water line rupture & flooding', color: 'cyan' },
                { name: 'Electricity Board / Live Wire', number: '1912', desc: 'High-voltage wire hazard & transformer fire', color: 'amber' },
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
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
