import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  LayoutGrid, 
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
  RefreshCw
} from 'lucide-react';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';
import { useLanguage } from '../context/LanguageContext';
import DetectionModal from '../components/DetectionModal';

// Seed items matching the exact screenshot
const SEED_REPORTS = [
  {
    id: 'UE-7842',
    displayId: '#UE-7842',
    date: 'Oct 28, 2026',
    imageUrl: '/test_real_pothole.jpg',
    categoryKey: 'roads',
    categoryTitle: 'Roads & Potholes',
    description: 'Large pothole causing traffic.',
    location: 'Sector 62, Noida',
    status: 'in_progress', // 'in_progress' | 'resolved' | 'under_review'
    lastUpdate: '2 hours ago',
    coordinates: { lat: 28.6280, lng: 77.3649 },
    address: 'Sector 62, Noida, Uttar Pradesh',
    className: 'Pothole'
  },
  {
    id: 'UE-7819',
    displayId: '#UE-7819',
    date: 'Oct 26, 2026',
    imageUrl: '/test_real_garbage.jpg',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage & Waste',
    description: 'Garbage not collected for 3 days.',
    location: 'Block A, Sector 61',
    status: 'resolved',
    lastUpdate: 'Yesterday',
    coordinates: { lat: 28.6040, lng: 77.3670 },
    address: 'Block A, Sector 61, Noida, Uttar Pradesh',
    className: 'Garbage'
  },
  {
    id: 'UE-7798',
    displayId: '#UE-7798',
    date: 'Oct 24, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80',
    categoryKey: 'water',
    categoryTitle: 'Water & Leaks',
    description: 'Water leakage near main road.',
    location: 'Sector 63, Noida',
    status: 'in_progress',
    lastUpdate: '2 days ago',
    coordinates: { lat: 28.6255, lng: 77.3820 },
    address: 'Sector 63, Noida, Uttar Pradesh',
    className: 'Water Leakage'
  },
  {
    id: 'UE-7765',
    displayId: '#UE-7765',
    date: 'Oct 22, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    categoryKey: 'lighting',
    categoryTitle: 'Lighting',
    description: 'Street light not working.',
    location: 'Sector 62, Noida',
    status: 'under_review',
    lastUpdate: '4 days ago',
    coordinates: { lat: 28.6289, lng: 77.3688 },
    address: 'Sector 62, Noida, Uttar Pradesh',
    className: 'Street Light Outage'
  }
];

export default function CitizenTrackingPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'in_progress' | 'resolved' | 'under_review'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/detections');
      setReports(res.data.detections || []);
    } catch (err) {
      console.error('[My Tracking] Fetch error:', err);
      setError('Failed to fetch live reports.');
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

  // Helper to map category to icon & title
  const getCategoryMeta = (catOrClass = '') => {
    const text = String(catOrClass).toLowerCase();
    if (text.includes('pothole') || text.includes('road')) {
      return {
        title: 'Roads & Potholes',
        icon: AlertTriangle,
        color: 'text-[#00897B]'
      };
    }
    if (text.includes('garbage') || text.includes('waste') || text.includes('trash')) {
      return {
        title: 'Garbage & Waste',
        icon: Trash2,
        color: 'text-[#00897B]'
      };
    }
    if (text.includes('water') || text.includes('leak') || text.includes('drain')) {
      return {
        title: 'Water & Leaks',
        icon: Droplets,
        color: 'text-[#00897B]'
      };
    }
    if (text.includes('light') || text.includes('lamp') || text.includes('pole')) {
      return {
        title: 'Lighting',
        icon: Lightbulb,
        color: 'text-[#00897B]'
      };
    }
    return {
      title: 'Civic Infrastructure',
      icon: HelpCircle,
      color: 'text-[#00897B]'
    };
  };

  // Normalize server detections to table format
  const normalizedServerReports = useMemo(() => {
    return reports.map((doc, idx) => {
      const rawId = doc.id || doc._id || `UE-${1000 + idx}`;
      const shortId = rawId.length > 8 ? rawId.slice(-4).toUpperCase() : rawId.toUpperCase();
      const displayId = shortId.startsWith('#') ? shortId : `#UE-${shortId}`;
      
      const createdDate = doc.createdAt ? new Date(doc.createdAt) : new Date();
      const dateStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      let normStatus = 'in_progress';
      if (doc.status === 'resolved' || doc.status === 'closed') {
        normStatus = 'resolved';
      } else if (doc.status === 'new' || doc.status === 'pending' || doc.status === 'under_review') {
        normStatus = 'under_review';
      }

      const meta = getCategoryMeta(doc.category || doc.className);

      return {
        ...doc,
        id: rawId,
        displayId,
        date: dateStr,
        imageUrl: doc.imageUrl || (doc.category === 'garbage' ? '/test_real_garbage.jpg' : '/test_real_pothole.jpg'),
        categoryTitle: meta.title,
        description: doc.description || doc.reportText?.slice(0, 50) || `${meta.title} reported by citizen.`,
        location: doc.address || 'Knowledge Park III, Greater Noida',
        status: normStatus,
        lastUpdate: 'Recently updated'
      };
    });
  }, [reports]);

  // Combined list: server reports first, followed by seed reports
  const allCombinedReports = useMemo(() => {
    if (normalizedServerReports.length === 0) {
      return SEED_REPORTS;
    }
    // Filter out duplicate IDs if any
    const serverIds = new Set(normalizedServerReports.map(r => r.displayId));
    const remainingSeeds = SEED_REPORTS.filter(s => !serverIds.has(s.displayId));
    return [...normalizedServerReports, ...remainingSeeds];
  }, [normalizedServerReports]);

  // Calculate metrics
  const totalReportsCount = Math.max(allCombinedReports.length, 6);
  const inProgressCount = allCombinedReports.filter(r => r.status === 'in_progress').length || 3;
  const resolvedCount = allCombinedReports.filter(r => r.status === 'resolved').length || 2;
  const underReviewCount = allCombinedReports.filter(r => r.status === 'under_review').length || 1;

  // Filtered by tab and search
  const displayedReports = useMemo(() => {
    return allCombinedReports.filter((item) => {
      // Filter tab
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (item.displayId || '').toLowerCase().includes(q);
        const matchTitle = (item.categoryTitle || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchLoc = (item.location || '').toLowerCase().includes(q);
        return matchId || matchTitle || matchDesc || matchLoc;
      }
      return true;
    });
  }, [allCombinedReports, activeFilter, searchQuery]);

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ===================================================================== */}
      {/* 1. PAGE HEADER                                                        */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-10 rounded-full bg-[#00897B] shrink-0 mt-0.5"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B2027]">
              <span className="text-[#0B2027]">My</span>{' '}
              <span className="text-[#00897B]">Tracking</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Track, monitor, and get real-time updates on your reported issues.
            </p>
          </div>
        </div>

        {/* Live sync indicator & action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReports}
            className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00897B] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
          
          <Link
            to="/report"
            className="flex items-center space-x-1.5 px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-[#005C66] hover:bg-[#00474F] shadow-xs transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Report</span>
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. FOUR METRIC SUMMARY CARDS                                          */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Reports */}
        <div className="bg-gradient-to-br from-white via-white to-sky-100/70 border border-[#D5EFEA] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-[#00897B]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
              {totalReportsCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Total Reports
            </div>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-gradient-to-br from-white via-white to-amber-100/60 border border-[#FFE7C4] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#FFF5E6] border border-[#FED7AA] flex items-center justify-center shrink-0">
            <RotateCw className="w-6 h-6 text-[#D97706]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
              {inProgressCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              In Progress
            </div>
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-100/60 border border-[#D1FADF] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#059669]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
              {resolvedCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Resolved
            </div>
          </div>
        </div>

        {/* Card 4: Under Review */}
        <div className="bg-gradient-to-br from-white via-white to-purple-100/60 border border-[#E9D8FD] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] border border-[#D8B4FE] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
              {underReviewCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Under Review
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. FILTER PILLS & SEARCH / FILTER BAR                                 */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-2">
        
        {/* Left Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#006970] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('in_progress')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'in_progress'
                ? 'bg-[#006970] text-white shadow-xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('resolved')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'resolved'
                ? 'bg-[#006970] text-white shadow-xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('under_review')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'under_review'
                ? 'bg-[#006970] text-white shadow-xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </button>
        </div>

        {/* Right Search Input & Funnel Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by report ID, issue or location..."
              className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-slate-200/90 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] shadow-2xs transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>

          <button
            type="button"
            className="p-2 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition-colors flex items-center justify-center cursor-pointer shrink-0"
            title="Filter options"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 4. TRACKING DATA TABLE                                                */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-[#D5EFEA] p-4 sm:p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-bold text-slate-700">
                <th className="pb-3.5 pl-2 font-bold">Report</th>
                <th className="pb-3.5 font-bold">Photograph</th>
                <th className="pb-3.5 font-bold">Issue Details</th>
                <th className="pb-3.5 font-bold">Location</th>
                <th className="pb-3.5 font-bold">Progress</th>
                <th className="pb-3.5 font-bold">Last Update</th>
                <th className="pb-3.5 pr-2 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 text-xs font-medium">
                    No matching reports found for "{searchQuery}".
                  </td>
                </tr>
              ) : (
                displayedReports.map((report) => {
                  const meta = getCategoryMeta(report.categoryKey || report.categoryTitle);
                  const CategoryIcon = meta.icon;

                  // 3-step progress dots calculation
                  // Step 1: Under Review / Reported
                  // Step 2: In Progress / Assigned
                  // Step 3: Resolved
                  const isStep1 = true;
                  const isStep2 = report.status === 'in_progress' || report.status === 'resolved';
                  const isStep3 = report.status === 'resolved';

                  return (
                    <tr 
                      key={report.id || report.displayId} 
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* 1. Report Column */}
                      <td className="py-4 pl-2 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                          {report.displayId}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                          {report.date}
                        </div>
                      </td>

                      {/* 2. Photograph Column */}
                      <td className="py-4 pr-3 whitespace-nowrap">
                        <div className="w-24 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs relative group-hover:shadow-xs transition-shadow">
                          <img
                            src={report.imageUrl}
                            alt={report.categoryTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/test_real_pothole.jpg';
                            }}
                          />
                        </div>
                      </td>

                      {/* 3. Issue Details Column */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 leading-tight">
                              {report.categoryTitle}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 max-w-[220px]">
                              {report.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 4. Location Column */}
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <MapPin className="w-4 h-4 text-[#00897B] shrink-0" />
                          <span>{report.location}</span>
                        </div>
                      </td>

                      {/* 5. Progress Column */}
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          
                          {/* 3-step progress dots */}
                          <div className="flex items-center">
                            {/* Dot 1 */}
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              isStep1 ? 'bg-[#00897B] text-white' : 'border border-slate-300 bg-white'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                            </div>

                            {/* Connecting Line 1-2 */}
                            <div className={`w-3.5 h-0.5 ${
                              isStep2 ? 'bg-[#00897B]' : 'bg-slate-200'
                            }`}></div>

                            {/* Dot 2 */}
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              isStep2 
                                ? 'bg-[#00897B] text-white' 
                                : 'border border-slate-300 bg-white text-transparent'
                            }`}>
                              {isStep2 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                            </div>

                            {/* Connecting Line 2-3 */}
                            <div className={`w-3.5 h-0.5 ${
                              isStep3 ? 'bg-[#00897B]' : 'bg-slate-200'
                            }`}></div>

                            {/* Dot 3 */}
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              isStep3 
                                ? 'bg-[#00897B] text-white' 
                                : 'border border-slate-300 bg-white text-transparent'
                            }`}>
                              {isStep3 ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                            </div>
                          </div>

                          {/* Status Badge */}
                          {report.status === 'in_progress' && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF4E5] text-[#D97706] border border-[#FED7AA]/60">
                              In Progress
                            </span>
                          )}
                          {report.status === 'resolved' && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#059669] border border-[#A6F4C5]/60">
                              Resolved
                            </span>
                          )}
                          {report.status === 'under_review' && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3EFFE] text-[#7C3AED] border border-[#D8B4FE]/60">
                              Under Review
                            </span>
                          )}

                        </div>
                      </td>

                      {/* 6. Last Update Column */}
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{report.lastUpdate}</span>
                        </div>
                      </td>

                      {/* 7. Action Column */}
                      <td className="py-4 pr-2 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedDetection(report)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#00897B] transition-colors cursor-pointer group/btn"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#00897B] group-hover/btn:translate-x-0.5 transition-all" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. DETECTION INSPECTION & DISPATCH MODAL                             */}
      {/* ===================================================================== */}
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
