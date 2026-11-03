import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  FileText, 
  Users, 
  RotateCw, 
  CheckCircle2, 
  ListFilter, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  Check, 
  Layers, 
  TrendingUp, 
  ChevronDown, 
  Trash2, 
  Zap, 
  Droplets,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';

export default function CitizenActivityPage() {
  const { t, lang } = useLanguage();

  const [activeFilter, setActiveFilter] = useState('all'); // all, new, assigned, in_progress, resolved
  const [trendRange, setTrendRange] = useState('7d'); // 7d, 30d
  const [liveReports, setLiveReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fetch recent server detections to blend into live activity
  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/detections');
      setLiveReports(res.data.detections || []);
    } catch (err) {
      console.warn('Could not fetch server detections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();

    // Subscribe to live WebSockets events
    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => {
        setLiveReports((prev) => [newDoc, ...prev]);
      },
      onUpdated: (updatedDoc) => {
        setLiveReports((prev) =>
          prev.map((d) => (d.id === updatedDoc.id || d._id === updatedDoc.id ? updatedDoc : d))
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Base seed activities matching the screenshot
  const baseActivities = useMemo(() => [
    {
      id: 'act-1',
      title: 'Road hazard reported',
      desc: 'Pothole on main road affecting traffic.',
      location: 'Sector 62',
      time: '10:24 AM',
      status: 'new', // new | assigned | in_progress | resolved
      category: 'roads',
      icon: AlertTriangle,
      iconBg: 'bg-[#E6F8F6] text-[#00897B]',
      nodeBorder: 'border-[#10B981]',
      hasInnerDot: true
    },
    {
      id: 'act-2',
      title: 'Assigned to Crew #R-08',
      desc: 'Task created and dispatched to field crew.',
      location: 'Sector 62',
      time: '10:37 AM',
      status: 'assigned',
      category: 'crews',
      icon: Users,
      iconBg: 'bg-[#EFF6FF] text-[#3B82F6]',
      nodeBorder: 'border-slate-300',
      hasInnerDot: false
    },
    {
      id: 'act-3',
      title: 'Repair work in progress',
      desc: 'Crew #R-08 started pothole repair.',
      location: 'Sector 62',
      time: '11:05 AM',
      status: 'in_progress',
      category: 'repair',
      icon: Wrench,
      iconBg: 'bg-[#FFF5E6] text-[#D97706]',
      nodeBorder: 'border-amber-400',
      hasInnerDot: false
    },
    {
      id: 'act-4',
      title: 'Streetlight issue resolved',
      desc: 'Faulty streetlight repaired and restored.',
      location: 'Sector 9',
      time: '11:42 AM',
      status: 'resolved',
      category: 'lighting',
      icon: CheckCircle2,
      iconBg: 'bg-[#ECFDF3] text-[#059669]',
      nodeBorder: 'border-[#10B981]',
      hasInnerDot: true
    }
  ], []);

  // Transform dynamic server reports to match live activity structure
  const dynamicActivities = useMemo(() => {
    const fromServer = liveReports.slice(0, 4).map((doc, idx) => {
      let status = 'in_progress';
      let icon = AlertTriangle;
      let iconBg = 'bg-[#E6F8F6] text-[#00897B]';
      let nodeBorder = 'border-amber-400';
      let hasInnerDot = false;

      if (doc.status === 'resolved' || doc.status === 'closed') {
        status = 'resolved';
        icon = CheckCircle2;
        iconBg = 'bg-[#ECFDF3] text-[#059669]';
        nodeBorder = 'border-[#10B981]';
        hasInnerDot = true;
      } else if (doc.status === 'new' || doc.status === 'pending') {
        status = 'new';
        icon = AlertTriangle;
        iconBg = 'bg-[#E6F8F6] text-[#00897B]';
        nodeBorder = 'border-[#10B981]';
        hasInnerDot = true;
      } else if (doc.status === 'assigned') {
        status = 'assigned';
        icon = Users;
        iconBg = 'bg-[#EFF6FF] text-[#3B82F6]';
        nodeBorder = 'border-slate-300';
      }

      const createdDate = doc.createdAt ? new Date(doc.createdAt) : new Date();
      const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: doc.id || doc._id || `serv-${idx}`,
        title: `${doc.className || doc.category || 'Incident'} reported`,
        desc: doc.description || doc.reportText?.slice(0, 50) || 'Automated civic ticket dispatched.',
        location: typeof doc.address === 'string' ? doc.address.split(',')[0] : (doc.location?.coordinates ? `GPS: ${Number(doc.location.coordinates[1]).toFixed(2)}, ${Number(doc.location.coordinates[0]).toFixed(2)}` : 'Sector 62'),
        time: timeStr,
        status,
        category: doc.category || 'roads',
        icon,
        iconBg,
        nodeBorder,
        hasInnerDot
      };
    });

    if (fromServer.length === 0) return baseActivities;
    // Combine server reports with base activities
    return [...fromServer, ...baseActivities];
  }, [liveReports, baseActivities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') return dynamicActivities;
    return dynamicActivities.filter(a => a.status === activeFilter);
  }, [dynamicActivities, activeFilter]);

  // Resolution trend points matching screenshot
  // Dates: Oct 22, Oct 23, Oct 24, Oct 25, Oct 26, Oct 27, Oct 28
  const trendPoints = [
    { date: 'Oct 22', value: 28, x: 25, y: 144 },
    { date: 'Oct 23', value: 39, x: 75, y: 122 },
    { date: 'Oct 24', value: 52, x: 125, y: 96 },
    { date: 'Oct 25', value: 49, x: 175, y: 102 },
    { date: 'Oct 26', value: 65, x: 225, y: 70 },
    { date: 'Oct 27', value: 77, x: 275, y: 46 },
    { date: 'Oct 28', value: 89, x: 325, y: 22 }
  ];

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ===================================================================== */}
      {/* 1. MOBILE HEADER (When TopHeader is hidden on mobile)                */}
      {/* ===================================================================== */}
      <div className="lg:hidden flex items-center gap-3 pb-3 border-b border-[#E2F1EE]">
        <div className="w-10 h-10 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
          <Activity className="w-5 h-5 text-[#00897B]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0B2027] tracking-tight">
            City Activity
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Live operations across reports, departments and field crews.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MAIN TWO-COLUMN DASHBOARD GRID                                     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: 4 VERTICAL METRIC CARDS                                */}
        {/* =================================================================== */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Card 1: New Reports */}
          <div className="bg-gradient-to-br from-white via-white to-teal-50/50 border border-[#D5EFEA] rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
                142
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                New Reports
              </div>
            </div>
          </div>

          {/* Card 2: Active Crews */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50/50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-blue-200 flex items-center justify-center text-[#3B82F6] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
                12
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Active Crews
              </div>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="bg-gradient-to-br from-white via-white to-amber-50/50 border border-amber-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#FFF5E6] border border-amber-200 flex items-center justify-center text-[#D97706] shrink-0">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
                8
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                In Progress
              </div>
            </div>
          </div>

          {/* Card 4: Resolved Today */}
          <div className="bg-gradient-to-br from-white via-white to-emerald-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#ECFDF3] border border-emerald-200 flex items-center justify-center text-[#059669] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
                89
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Resolved Today
              </div>
            </div>
          </div>

        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: LIVE ACTIVITY (TOP) + DEPARTMENT & TRENDS (BOTTOM)    */}
        {/* =================================================================== */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TOP CARD: LIVE ACTIVITY */}
          <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 sm:p-6 shadow-xs space-y-5">
            
            {/* Header + Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-[#00897B]" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Live Activity
                </h2>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'new', label: 'New' },
                  { key: 'assigned', label: 'Assigned' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'resolved', label: 'Resolved' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveFilter(item.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === item.key
                        ? 'bg-[#006970] text-white font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90 font-medium'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Connected Timeline Feed */}
            <div className="relative pl-1 sm:pl-2">
              
              {/* Continuous vertical connecting line */}
              <div className="absolute left-[9px] sm:left-[13px] top-4 bottom-6 w-0.5 bg-slate-200"></div>

              <div className="space-y-4 relative z-10">
                {filteredActivities.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No activity records found for this filter.
                  </div>
                ) : (
                  filteredActivities.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between gap-3 group hover:bg-slate-50/50 p-2 rounded-2xl transition-colors"
                    >
                      {/* Left: Timeline node + Category icon + Title / Subtitle */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        
                        {/* Timeline Node */}
                        <div className={`w-4 h-4 rounded-full border-2 ${item.nodeBorder} bg-white flex items-center justify-center shrink-0`}>
                          {item.hasInnerDot && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                          )}
                        </div>

                        {/* Category Square Icon */}
                        <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                          <item.icon className="w-4 h-4" />
                        </div>

                        {/* Title and Subtitle */}
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                            {item.desc}
                          </p>
                        </div>

                      </div>

                      {/* Right: Location + Time + Status Badge */}
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        
                        {/* Location */}
                        <div className="hidden md:flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{typeof item.location === 'string' ? item.location : (item.address || 'Sector 62')}</span>
                        </div>

                        {/* Time */}
                        <div className="text-xs font-mono font-medium text-slate-500">
                          {item.time}
                        </div>

                        {/* Status Badge */}
                        <div className="min-w-[80px] text-right">
                          {item.status === 'new' && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#059669] border border-[#A6F4C5]/60 inline-block">
                              New
                            </span>
                          )}
                          {item.status === 'assigned' && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-200/80 inline-block">
                              Assigned
                            </span>
                          )}
                          {item.status === 'in_progress' && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF5E6] text-[#D97706] border border-[#FED7AA]/60 inline-block">
                              In Progress
                            </span>
                          )}
                          {item.status === 'resolved' && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#059669] border border-[#A6F4C5]/60 inline-block">
                              Resolved
                            </span>
                          )}
                        </div>

                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

          {/* BOTTOM ROW: DEPARTMENT ACTIVITY (LEFT) + RESOLUTION TREND (RIGHT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: DEPARTMENT ACTIVITY */}
            <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Layers className="w-4 h-4 text-[#00897B]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Department Activity
                </h3>
              </div>

              <div className="space-y-4 pt-1">
                {[
                  { name: 'Roads', icon: AlertTriangle, percent: 75 },
                  { name: 'Sanitation', icon: Trash2, percent: 60 },
                  { name: 'Electricity', icon: Zap, percent: 50 },
                  { name: 'Water', icon: Droplets, percent: 40 }
                ].map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between gap-3">
                    {/* Icon + Label */}
                    <div className="flex items-center gap-2.5 w-28 shrink-0">
                      <dept.icon className="w-4 h-4 text-[#00897B]" />
                      <span className="text-xs font-bold text-slate-800">{dept.name}</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#006970] h-full rounded-full transition-all duration-500"
                        style={{ width: `${dept.percent}%` }}
                      ></div>
                    </div>

                    {/* Percentage */}
                    <div className="w-10 text-right text-xs font-mono font-bold text-slate-700">
                      {dept.percent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 2: RESOLUTION TREND */}
            <div className="bg-white rounded-3xl border border-[#D5EFEA] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00897B]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Resolution Trend
                  </h3>
                </div>

                <div className="relative">
                  <select
                    value={trendRange}
                    onChange={(e) => setTrendRange(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 pl-2.5 pr-7 py-1 focus:outline-none focus:border-[#00897B] shadow-2xs cursor-pointer"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* High-Fidelity SVG Chart matching the screenshot */}
              <div className="relative w-full h-44 pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 350 180">
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Y-Axis Grid Lines & Labels */}
                  {[
                    { label: '100', y: 15 },
                    { label: '75', y: 55 },
                    { label: '50', y: 95 },
                    { label: '25', y: 135 },
                    { label: '0', y: 170 }
                  ].map((grid) => (
                    <g key={grid.label}>
                      <text x="5" y={grid.y + 3} fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                        {grid.label}
                      </text>
                      <line x1="25" y1={grid.y} x2="340" y2={grid.y} stroke="#F1F5F9" strokeWidth="1" />
                    </g>
                  ))}

                  {/* Shaded Area under Curve */}
                  <polygon
                    points="25,170 25,144 75,122 125,96 175,102 225,70 275,46 325,22 325,170"
                    fill="url(#trendGradient)"
                  />

                  {/* Green Trend Line */}
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="25,144 75,122 125,96 175,102 225,70 275,46 325,22"
                  />

                  {/* Data Points */}
                  {trendPoints.map((pt) => (
                    <g 
                      key={pt.date} 
                      className="cursor-pointer group/dot"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="group-hover/dot:r-5 transition-all"
                      />
                    </g>
                  ))}

                  {/* X-Axis Date Labels */}
                  {trendPoints.map((pt) => (
                    <text
                      key={pt.date}
                      x={pt.x}
                      y="180"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {pt.date}
                    </text>
                  ))}
                </svg>

                {/* Hover Tooltip */}
                {hoveredPoint && (
                  <div 
                    className="absolute z-20 px-2 py-1 bg-slate-900 text-white rounded-md text-[10px] font-mono font-bold shadow-md -translate-x-1/2 -translate-y-8 pointer-events-none"
                    style={{ left: `${(hoveredPoint.x / 350) * 100}%`, top: `${(hoveredPoint.y / 180) * 100}%` }}
                  >
                    {hoveredPoint.date}: {hoveredPoint.value} resolved
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
