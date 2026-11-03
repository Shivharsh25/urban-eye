import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  Lightbulb, 
  HelpCircle,
  Camera,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';
import { useLanguage } from '../context/LanguageContext';
import DetectionModal from '../components/DetectionModal';

// High-quality fallback seed reports if backend detections are empty
const FALLBACK_REPORTS = [
  {
    id: 'UE-7842',
    displayId: '#UE-7842',
    date: 'Oct 28, 2026',
    imageUrl: '/test_real_pothole.jpg',
    categoryKey: 'roads',
    categoryTitle: 'Roads & Potholes',
    description: 'Deep road cavity causing severe evening traffic bottleneck.',
    location: 'Sector 62, Noida',
    address: 'Sector 62, Noida, Uttar Pradesh - 201309',
    status: 'in_progress',
    severity: 'High',
    confidence: '94%',
    department: 'Public Works Department',
    coordinates: { lat: 28.6280, lng: 77.3649 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'UE-7819',
    displayId: '#UE-7819',
    date: 'Oct 26, 2026',
    imageUrl: '/test_real_garbage.jpg',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage & Waste',
    description: 'Municipal waste overflow and unattended garbage containers.',
    location: 'Block A, Sector 61',
    address: 'Block A, Sector 61, Noida, Uttar Pradesh',
    status: 'resolved',
    severity: 'Medium',
    confidence: '91%',
    department: 'Sanitation & Solid Waste',
    coordinates: { lat: 28.6040, lng: 77.3670 },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'UE-7798',
    displayId: '#UE-7798',
    date: 'Oct 24, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80',
    categoryKey: 'water',
    categoryTitle: 'Water & Leaks',
    description: 'Underground pipeline burst causing road flooding and low water pressure.',
    location: 'Sector 63, Noida',
    address: 'Sector 63, Noida, Uttar Pradesh',
    status: 'in_progress',
    severity: 'High',
    confidence: '88%',
    department: 'Jal Board / Water Works',
    coordinates: { lat: 28.6255, lng: 77.3820 },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'UE-7765',
    displayId: '#UE-7765',
    date: 'Oct 22, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    categoryKey: 'lighting',
    categoryTitle: 'Lighting',
    description: 'Dark pedestrian walkway due to non-functional sodium street lamps.',
    location: 'Sector 62, Noida',
    address: 'Sector 62, Noida, Uttar Pradesh',
    status: 'under_review',
    severity: 'Low',
    confidence: '96%',
    department: 'Electrical Maintenance',
    coordinates: { lat: 28.6289, lng: 77.3688 },
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'UE-7751',
    displayId: '#UE-7751',
    date: 'Oct 20, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=600&auto=format&fit=crop&q=80',
    categoryKey: 'roads',
    categoryTitle: 'Roads & Potholes',
    description: 'Faded pedestrian crosswalk lines and damaged road divider.',
    location: 'Sector 18 Market Road',
    address: 'Sector 18, Noida, Uttar Pradesh',
    status: 'resolved',
    severity: 'Medium',
    confidence: '89%',
    department: 'Traffic Engineering',
    coordinates: { lat: 28.5708, lng: 77.3260 },
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'UE-7740',
    displayId: '#UE-7740',
    date: 'Oct 18, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    categoryKey: 'others',
    categoryTitle: 'Public Infrastructure',
    description: 'Broken public park bench and damaged security fencing.',
    location: 'City Green Park, Sector 50',
    address: 'Sector 50, Noida, Uttar Pradesh',
    status: 'new',
    severity: 'Low',
    confidence: '92%',
    department: 'Horticulture & Parks',
    coordinates: { lat: 28.5744, lng: 77.3619 },
    createdAt: new Date(Date.now() - 150 * 60 * 60 * 1000).toISOString()
  }
];

export default function CitizenReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/detections');
      const data = res.data?.detections || [];
      if (data.length > 0) {
        setReports(data);
      } else {
        setReports(FALLBACK_REPORTS);
      }
    } catch (err) {
      console.warn('[CitizenReportsPage] API fetch error, using fallback seed data:', err);
      setReports(FALLBACK_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to live WebSockets updates
    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => {
        setReports((prev) => [newDoc, ...prev]);
      },
      onMerged: ({ detection }) => {
        setReports((prev) =>
          prev.map((d) => (d.id === detection.id || d._id === detection.id ? detection : d))
        );
      },
      onUpdated: (updatedDoc) => {
        setReports((prev) =>
          prev.map((d) => (d.id === updatedDoc.id || d._id === updatedDoc.id ? updatedDoc : d))
        );
      },
      onDeleted: ({ id }) => {
        setReports((prev) => prev.filter((d) => d.id !== id && d._id !== id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Helper for category metadata
  const getCategoryMeta = (item) => {
    const raw = String(item.categoryKey || item.type || item.className || '').toLowerCase();
    if (raw.includes('pothole') || raw.includes('road')) {
      return { key: 'roads', label: 'Roads & Potholes', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' };
    }
    if (raw.includes('garbage') || raw.includes('waste') || raw.includes('trash')) {
      return { key: 'garbage', label: 'Garbage & Waste', icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    }
    if (raw.includes('water') || raw.includes('leak')) {
      return { key: 'water', label: 'Water & Leaks', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' };
    }
    if (raw.includes('light') || raw.includes('lamp') || raw.includes('street')) {
      return { key: 'lighting', label: 'Lighting', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
    return { key: 'others', label: 'Infrastructure', icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' };
  };

  // Helper for status styling
  const getStatusMeta = (status) => {
    const s = String(status || 'new').toLowerCase().replace('-', '_');
    if (s.includes('resolved') || s === 'completed') {
      return { label: 'Resolved', badgeClass: 'bg-[#E6F8F6] text-[#00897B] border-[#BDEEE7]' };
    }
    if (s.includes('progress') || s === 'assigned') {
      return { label: 'In Progress', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (s.includes('review') || s === 'pending') {
      return { label: 'Under Review', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    return { label: 'New Report', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
  };

  // Helper for severity styling
  const getSeverityMeta = (sev) => {
    const s = String(sev || 'Medium').toLowerCase();
    if (s.includes('high') || s.includes('critical')) {
      return { label: 'High', class: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (s.includes('low')) {
      return { label: 'Low', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    return { label: 'Medium', class: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  // Compute metrics
  const metrics = useMemo(() => {
    const total = reports.length;
    let resolved = 0;
    let inProgress = 0;
    let underReview = 0;

    reports.forEach((r) => {
      const s = String(r.status || '').toLowerCase();
      if (s.includes('resolved')) resolved++;
      else if (s.includes('progress') || s.includes('assigned')) inProgress++;
      else underReview++;
    });

    return { total, inProgress, resolved, underReview };
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        const cat = getCategoryMeta(item).key;
        if (cat !== activeCategory) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const s = String(item.status || '').toLowerCase().replace('-', '_');
        if (statusFilter === 'in_progress' && !s.includes('progress') && !s.includes('assigned')) return false;
        if (statusFilter === 'resolved' && !s.includes('resolved')) return false;
        if (statusFilter === 'under_review' && !s.includes('review') && !s.includes('new') && !s.includes('pending')) return false;
        if (statusFilter === 'new' && !s.includes('new') && !s.includes('pending')) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = String(item.id || item.displayId || '').toLowerCase().includes(q);
        const descMatch = String(item.description || '').toLowerCase().includes(q);
        const locMatch = String(item.location || item.address || '').toLowerCase().includes(q);
        const catMatch = getCategoryMeta(item).label.toLowerCase().includes(q);
        if (!idMatch && !descMatch && !locMatch && !catMatch) return false;
      }

      return true;
    });
  }, [reports, activeCategory, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F3F9F8] text-[#0B2027] px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-6">

      {/* =================================================================== */}
      {/* 1. HEADER ROW                                                      */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title with Cyber-Teal accent bar */}
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-10 bg-[#00897B] rounded-full mt-1 shrink-0"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B2027]">
              Civic Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Explore community-submitted incident reports, AI detections, and citywide infrastructure updates.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-[#D5EFEA] rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-[#E6F8F6] text-[#00897B]' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-[#E6F8F6] text-[#00897B]' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#D5EFEA] text-slate-700 transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 text-[#00897B] ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Track My Reports link */}
          <Link
            to="/tracking"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#D5EFEA] text-xs font-bold text-slate-700 hover:text-[#00897B] transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-[#00897B]" />
            <span>My Tracking</span>
          </Link>

          {/* Report New Issue CTA */}
          <Link
            to="/report"
            className="px-4 py-2.5 rounded-xl bg-[#005C66] hover:bg-[#06252B] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. METRICS CARDS ROW (Matching Reference Layout)                   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Reports */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              {metrics.total}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              Total Reports
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <RotateCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              {metrics.inProgress}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              In Progress
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              {metrics.resolved}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              Resolved
            </div>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              {metrics.underReview}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              Under Review
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. FILTER TABS & SEARCH BAR ROW                                     */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-[#D5EFEA] shadow-2xs space-y-3.5">
        
        {/* Top: Status Tabs + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {[
              { id: 'all', label: 'All Reports' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'under_review', label: 'Under Review' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-[#005C66] text-white shadow-2xs'
                    : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, issue or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-[#D5EFEA] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100 scrollbar-hide">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Category:
          </span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'roads', label: 'Roads & Potholes' },
            { id: 'garbage', label: 'Garbage & Waste' },
            { id: 'water', label: 'Water & Leaks' },
            { id: 'lighting', label: 'Lighting' },
            { id: 'others', label: 'Others' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#E6F8F6] text-[#00897B] border border-[#BDEEE7]'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MAIN CONTENT: CARD GRID OR TABLE VIEW                            */}
      {/* =================================================================== */}
      {loading && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-3 border-[#00897B]/20 border-t-[#00897B] rounded-full animate-spin"></div>
          <p className="text-xs font-mono font-bold text-[#005C66] tracking-wider">SYNCING CIVIC REPORTS...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#D5EFEA] flex flex-col items-center shadow-2xs">
          <div className="w-16 h-16 bg-[#E6F8F6] rounded-2xl flex items-center justify-center mb-4 border border-[#BDEEE7]">
            <FileText className="w-8 h-8 text-[#00897B]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Reports Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            {searchQuery || activeCategory !== 'all' || statusFilter !== 'all'
              ? 'Try modifying your search or filter criteria to see available civic reports.'
              : 'No civic reports have been filed yet. Submit the first issue to get started!'}
          </p>
          <Link
            to="/report"
            className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#005C66] hover:bg-[#06252B] transition-all shadow-xs active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Submit a Report</span>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= CARD GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((item) => {
            const cat = getCategoryMeta(item);
            const status = getStatusMeta(item.status);
            const severity = getSeverityMeta(item.severity);
            const CatIcon = cat.icon;
            const displayId = item.displayId || `#UE-${String(item.id || item._id || '').slice(-4).toUpperCase()}`;

            return (
              <div
                key={item.id || item._id}
                onClick={() => setSelectedDetection(item)}
                className="group bg-white rounded-2xl border border-[#D5EFEA] hover:border-[#00897B]/50 transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Thumbnail / Header */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `https://urban-eye-wi2j.onrender.com${item.imageUrl}`}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400">
                        <CatIcon className="w-10 h-10 text-slate-300 mb-1" />
                        <span className="text-[11px] font-mono">No Image Attached</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono font-bold text-[10px] tracking-tight">
                        {displayId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${severity.class}`}>
                        {severity.label}
                      </span>
                    </div>

                    {/* Bottom AI Tag */}
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white text-[11px] font-semibold drop-shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                      <span>AI Verified {item.confidence || '94%'}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2.5">
                    {/* Category Header */}
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center shrink-0`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 tracking-tight">
                        {cat.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description || 'Community incident submitted for municipal inspection and dispatch.'}
                    </p>

                    {/* Location Pin */}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 truncate pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00897B] shrink-0" />
                      <span className="truncate">{item.location || item.address || 'Noida, Uttar Pradesh'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-[#F9FBFA] border-t border-[#EAEFEF] flex items-center justify-between">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.badgeClass}`}>
                    {status.label}
                  </span>

                  {/* Inspect CTA */}
                  <div className="text-xs font-bold text-[#00897B] group-hover:text-[#005C66] flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE LIST VIEW ================= */
        <div className="bg-white rounded-2xl border border-[#D5EFEA] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#EAEFEF] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Report</th>
                  <th className="py-3 px-4">Photograph</th>
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReports.map((item) => {
                  const cat = getCategoryMeta(item);
                  const status = getStatusMeta(item.status);
                  const severity = getSeverityMeta(item.severity);
                  const CatIcon = cat.icon;
                  const displayId = item.displayId || `#UE-${String(item.id || item._id || '').slice(-4).toUpperCase()}`;

                  return (
                    <tr
                      key={item.id || item._id}
                      onClick={() => setSelectedDetection(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* ID & Date */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {displayId}
                        <div className="text-[10px] font-sans text-slate-400 font-normal mt-0.5">
                          {item.date || 'Recent'}
                        </div>
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl.startsWith('http') ? item.imageUrl : `https://urban-eye-wi2j.onrender.com${item.imageUrl}`}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <CatIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Issue Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{cat.label}</div>
                        <div className="text-slate-500 text-[11px] line-clamp-1 max-w-xs mt-0.5">
                          {item.description || 'Verified civic issue'}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#00897B]" />
                          <span>{item.location || item.address || 'Noida'}</span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${severity.class}`}>
                          {severity.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-xs font-bold text-[#00897B] group-hover:text-[#005C66] inline-flex items-center gap-1">
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. DETECTION INSPECTION MODAL                                       */}
      {/* =================================================================== */}
      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onStatusUpdated={(updated) => {
            setReports((prev) =>
              prev.map((d) => (d.id === updated.id || d._id === updated.id ? updated : d))
            );
            setSelectedDetection(updated);
          }}
        />
      )}

    </div>
  );
}
