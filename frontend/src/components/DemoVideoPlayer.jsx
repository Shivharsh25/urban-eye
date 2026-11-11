import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Building2,
  Truck,
  Eye,
  Check,
  Smartphone,
  ChevronRight,
  Globe,
  Camera,
  Layers,
  ArrowRight,
  Bell,
  Star,
  Hash,
  Sliders,
  Send,
  UploadCloud,
  FileText,
  Download,
  Filter,
  Crosshair,
  ThumbsUp,
  RefreshCw,
  PlusCircle,
  FileCheck,
  CheckCheck,
  UserCheck,
  Activity,
  Home,
  UserCircle,
  Settings,
  HelpCircle,
  Search,
  Moon,
  Sun,
  X
} from 'lucide-react';
import Logo from './Logo';

const TOTAL_DURATION = 42; // 42 seconds total demo duration

const CHAPTERS = [
  {
    id: 1,
    title: "1. Citizen Dashboard",
    short: "1. Dashboard",
    start: 0,
    end: 7,
    pageName: "Citizen Operations Dashboard",
    badge: "CITIZEN DASHBOARD",
    color: "#00E5FF",
    desc: "Real citizen dashboard with Civic Score (80/100), city health metrics, live community feed & 1-tap issue reporting"
  },
  {
    id: 2,
    title: "2. Report Issue (Dummy Upload)",
    short: "2. Report Issue",
    start: 7,
    end: 16,
    pageName: "Report a City Issue",
    badge: "IMAGE UPLOAD & GPS",
    color: "#10B981",
    desc: "Citizen uploads dummy pothole photo; high-precision GPS auto-locked, address geocoded & category selected"
  },
  {
    id: 3,
    title: "3. 6-Stage AI Pipeline & Report",
    short: "3. AI Pipeline",
    start: 16,
    end: 24,
    pageName: "Real-Time AI Pipeline & Formal Letter",
    badge: "YOLOV8 AI ENGINE",
    color: "#06B6D4",
    desc: "YOLOv8 detects pothole (94.8% conf), verifies municipal geofence, deduplicates & auto-generates formal complaint letter"
  },
  {
    id: 4,
    title: "4. Live Tracking & Dual Proof",
    short: "4. My Tracking",
    start: 24,
    end: 31,
    pageName: "Incident Resolution Tracking",
    badge: "DUAL VERIFICATION",
    color: "#F59E0B",
    desc: "Live ticket stepper, side-by-side Before/After dual photo proof, GPS geofence match & 5-star citizen verification"
  },
  {
    id: 5,
    title: "5. Citywide GIS Map & Radar",
    short: "5. Live Map",
    start: 31,
    end: 37,
    pageName: "Interactive City GIS Map",
    badge: "GIS RADAR",
    color: "#3B82F6",
    desc: "Real full-screen GIS radar map, animated sweep, category filters (Roads, Waste, Water, Lights) & live incident inspection"
  },
  {
    id: 6,
    title: "6. Dept Dispatch & Super Admin",
    short: "6. Super Admin",
    start: 37,
    end: 42,
    pageName: "Command Center Oversight",
    badge: "GOVERNANCE & AUDIT",
    color: "#A855F7",
    desc: "Municipal department crew deployment, 48h SLA countdown, citywide KPIs & live SHA-256 cryptographic audit logs"
  }
];

export default function DemoVideoPlayer({ onClose, onLaunchPortal }) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const lastTickRef = useRef(performance.now());

  // Playback timer loop (60fps)
  useEffect(() => {
    lastTickRef.current = performance.now();
    let frameId;

    const loop = (now) => {
      if (playing) {
        const delta = (now - lastTickRef.current) / 1000;
        setTime((prev) => {
          const next = prev + delta * speed;
          if (next >= TOTAL_DURATION) {
            setPlaying(false);
            return TOTAL_DURATION;
          }
          return next;
        });
      }
      lastTickRef.current = now;
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [playing, speed]);

  // Current chapter
  const currentChapter =
    CHAPTERS.find((c) => time >= c.start && time < c.end) || CHAPTERS[CHAPTERS.length - 1];
  const progressPercent = Math.min(100, (time / TOTAL_DURATION) * 100);

  const handlePlayPause = () => {
    if (time >= TOTAL_DURATION) {
      setTime(0);
      setPlaying(true);
    } else {
      setPlaying(!playing);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setTime(ratio * TOTAL_DURATION);
  };

  const jumpTo = (seconds) => {
    setTime(seconds);
    setPlaying(true);
  };

  const formatSecs = (sec) => {
    const s = Math.floor(sec);
    return `00:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setTime((t) => Math.max(0, t - 3));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setTime((t) => Math.min(TOTAL_DURATION, t + 3));
      } else if (e.code === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  const isSuperAdminScene = time >= 37;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="bg-[#03151A] rounded-3xl overflow-hidden max-w-6xl w-full border border-teal-500/40 shadow-2xl flex flex-col relative text-white"
        style={{ height: '92vh', maxHeight: '900px' }}
      >
        {/* Floating Close Button in Top-Right Corner */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-teal-500/40 text-slate-200 hover:text-white flex items-center justify-center shadow-xl transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
          title="Close Walkthrough"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================================= */}
        {/* MAIN VIDEO STAGE: THE ACTUAL LIVE WEBSITE INTERFACE                       */}
        {/* ========================================================================= */}
        <div className="relative flex-1 w-full overflow-hidden flex select-none bg-[#F4FAF9]">
          
          {/* ======================================================================= */}
          {/* 1. ACTUAL LEFT SIDEBAR (Matching real Sidebar.jsx styling)              */}
          {/* ======================================================================= */}
          <aside
            className={`w-44 sm:w-56 shrink-0 flex flex-col justify-between border-r transition-colors duration-300 ${
              isSuperAdminScene ? 'bg-[#02181D] border-[#00383E]' : 'bg-[#06252B] border-[#0E3841]'
            }`}
          >
            {/* Sidebar Brand Header */}
            <div className="h-14 px-3 sm:px-4 flex items-center justify-between border-b border-teal-900/60 shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                <Logo size="sm" subtitle="Active Watch" showText={true} />
              </div>
            </div>

            {/* Sidebar Nav Items */}
            <nav className="flex-1 py-3 px-2 sm:px-3 space-y-1 overflow-hidden text-xs">
              {!isSuperAdminScene ? (
                <>
                  <div
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-colors ${
                      time < 7 ? 'bg-[#005C66] text-white font-bold shadow-xs' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span className="truncate">Dashboard</span>
                  </div>

                  <div
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-colors ${
                      time >= 7 && time < 24 ? 'bg-[#005C66] text-white font-bold shadow-xs' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span className="truncate">Report Issue</span>
                  </div>

                  <div
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-colors ${
                      time >= 24 && time < 31 ? 'bg-[#005C66] text-white font-bold shadow-xs' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    <span className="truncate">My Tracking</span>
                  </div>

                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                      time >= 31 && time < 37 ? 'bg-[#005C66] text-white font-bold shadow-xs' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                      <span className="truncate">Live Map</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-bold font-mono">
                      LIVE
                    </span>
                  </div>

                  <div className="pt-2 px-3 text-[9px] font-bold font-mono text-teal-400/60 uppercase tracking-widest hidden sm:block">
                    CITY NETWORK
                  </div>

                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300">
                    <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate hidden sm:inline">Alerts</span>
                  </div>

                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate hidden sm:inline">Activity</span>
                  </div>
                </>
              ) : (
                /* Super Admin Sidebar Navigation */
                <>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#00897B] to-[#02C39A] text-white font-bold shadow-md">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Platform Cockpit</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Departments</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">City Reports</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300">
                    <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">AI Rules</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300">
                    <Hash className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Audit Logs</span>
                  </div>
                </>
              )}
            </nav>

            {/* Sidebar Bottom User Pill */}
            <div className="p-2 sm:p-3 border-t border-teal-900/60 bg-[#041B20] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {isSuperAdminScene ? 'SA' : 'ST'}
                </div>
                <div className="truncate hidden sm:block">
                  <div className="text-white font-bold text-[11px] truncate">
                    {isSuperAdminScene ? 'Super Admin' : 'Shivharsh Tiwari'}
                  </div>
                  <div className="text-[9px] text-teal-400 font-mono truncate">
                    {isSuperAdminScene ? 'Municipal Oversight' : 'Citizen • Ward 14'}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ======================================================================= */}
          {/* 2. ACTUAL MAIN CONTENT AREA & REAL TOP HEADER                           */}
          {/* ======================================================================= */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
            
            {/* Real Top Header Bar (Matching TopHeader.jsx) */}
            <header
              className={`h-14 px-4 sm:px-6 flex items-center justify-between border-b shrink-0 transition-colors duration-300 ${
                isSuperAdminScene
                  ? 'bg-[#02181D] border-[#00383E] text-white'
                  : 'bg-white/95 border-[#E2F1EE] text-slate-800 backdrop-blur-md'
              }`}
            >
              {/* Left: Real Page Title / Breadcrumb */}
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Urban EYE</span>
                <span className="text-xs text-slate-400 hidden sm:inline">/</span>
                <span className="font-extrabold text-sm sm:text-base tracking-tight truncate text-[#0B2027]">
                  {currentChapter.pageName}
                </span>
              </div>

              {/* Right: Language switch, theme, notifications, and avatar */}
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[#005C66] text-xs font-mono font-bold flex items-center space-x-1">
                  <span>अ/A</span>
                  <span className="text-[10px] text-[#00897B] font-bold">EN</span>
                </div>

                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Moon className="w-3.5 h-3.5" />
                </div>

                <div className="relative">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                    3
                  </span>
                </div>

                <div className="w-7 h-7 rounded-full bg-[#15803d] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  ST
                </div>
              </div>
            </header>

            {/* Real Website Page Viewport */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-5 relative text-slate-800">
              
              {/* Subtle ambient watermark background like the real website */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage: 'url(/watermark-city.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'bottom center'
                }}
              />

              {/* ===================================================================== */}
              {/* SCENE 1: REAL CITIZEN DASHBOARD PAGE (0:00 - 0:07)                    */}
              {/* ===================================================================== */}
              {time >= 0 && time < 7 && (
                <div className="relative z-10 space-y-3 sm:space-y-4 max-w-5xl mx-auto animate-in fade-in duration-300">
                  {/* Dashboard Header */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#0B2027] tracking-tight">
                      Citizen Operations Dashboard
                    </h1>
                    <p className="text-xs text-slate-500">
                      Real-time civic score, infrastructure telemetry and active municipal watch.
                    </p>
                  </div>

                  {/* Top Metric Cards Strip (Exact layout from CitizenDashboardPage.jsx) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Civic Score Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#005C66] to-[#00897B] text-white shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-200 block font-bold">
                          CIVIC REPUTATION
                        </span>
                        <div className="text-2xl font-black tracking-tight mt-0.5">80 / 100</div>
                        <div className="text-[10px] text-teal-100 font-medium">Level 4 Civic Guardian</div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-300 fill-current" />
                      </div>
                    </div>

                    {/* Report Stats Card */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2F1EE] shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                          MY SUBMITTED REPORTS
                        </span>
                        <div className="text-2xl font-black text-[#0B2027] tracking-tight mt-0.5">6 Issues</div>
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>2 Resolved this week</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>

                    {/* SLA Average Response */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2F1EE] shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                          AVG RESOLUTION SPEED
                        </span>
                        <div className="text-2xl font-black text-[#00897B] tracking-tight mt-0.5">3.8 Hours</div>
                        <div className="text-[10px] text-slate-500">95.4% Target Compliance</div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Hero: Report a City Issue */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#06252B] to-[#04333A] text-white border border-teal-500/30 shadow-xl flex items-center justify-between relative overflow-hidden">
                    <div className="flex items-center space-x-3.5 z-10">
                      <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                          Encountered an Urban Issue?
                        </h3>
                        <p className="text-xs text-teal-200/80 max-w-lg">
                          Snap or upload a photo. Our neural AI will detect the damage, geocode the coordinates & route to PWD.
                        </p>
                      </div>
                    </div>

                    {/* Simulated Cursor clicking '+ Report Issue' at ~4s */}
                    <div className="relative shrink-0 z-10">
                      <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50 hover:scale-105 transition-all">
                        <PlusCircle className="w-4 h-4" />
                        <span>+ Report a City Issue</span>
                      </button>

                      {time >= 3.8 && (
                        <div className="absolute -top-1 -right-1 pointer-events-none animate-bounce">
                          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 text-white drop-shadow-lg">
                            <path d="M4 0l16 12-7 2 4 8-3 1-4-8-6 5z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity Feed Table */}
                  <div className="bg-white rounded-2xl border border-[#E2F1EE] p-3.5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0B2027]">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-[#00897B]" />
                        <span>Live Ward 14 Activity Feed</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">WebSockets Active</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="font-bold text-slate-800">#UE-8941 Pothole on Sector 62</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Assigned to PWD
                        </span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-slate-800">#UE-7819 Garbage Dump Cleaned</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Resolved & Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SCENE 2: REAL REPORT ISSUE PAGE WITH DUMMY UPLOAD (0:07 - 0:16)       */}
              {/* ===================================================================== */}
              {time >= 7 && time < 16 && (
                <div className="relative z-10 space-y-3 max-w-5xl mx-auto animate-in fade-in duration-300">
                  {/* Page Title */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#0B2027] tracking-tight">
                      Report a City Issue
                    </h1>
                    <p className="text-xs text-slate-500">
                      Upload dummy pothole photo to test automated AI classification and dispatch.
                    </p>
                  </div>

                  {/* Real 3-Step Wizard Bar (Matching CitizenReportPage.jsx) */}
                  <div className="w-full py-2 px-3 rounded-2xl bg-white border border-[#E2F1EE] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#00897B] text-white flex items-center justify-center font-bold text-xs ring-4 ring-teal-50">
                        1
                      </span>
                      <span className="font-bold text-[#0B2027]">Issue Details</span>
                    </div>
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-[#00897B] to-slate-200 mx-3"></div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <span>Location</span>
                    </div>
                    <div className="h-0.5 flex-1 bg-slate-200 mx-3"></div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                        3
                      </span>
                      <span>AI Review</span>
                    </div>
                  </div>

                  {/* Main Report Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Left: Dummy Image Upload Dropzone */}
                    <div className="bg-white rounded-2xl border-2 border-dashed border-[#00897B]/50 p-3 sm:p-4 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden shadow-xs">
                      {time < 11 ? (
                        <div className="text-center space-y-2 p-3">
                          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#00897B]">
                            <UploadCloud className="w-6 h-6 animate-bounce" />
                          </div>
                          <div className="text-sm font-bold text-[#0B2027]">Drag & Drop Dummy Image</div>
                          <p className="text-xs text-slate-500">Supported: JPG, PNG, WebP (Max 15MB)</p>
                          <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#005C66] font-mono text-[10px] font-bold inline-block">
                            TARGET: test_real_pothole.jpg
                          </span>
                        </div>
                      ) : (
                        /* Preview of Uploaded Dummy Image */
                        <div className="relative w-full h-full min-h-[200px] rounded-xl overflow-hidden bg-black">
                          <img
                            src="/test_real_pothole.jpg"
                            alt="Uploaded Pothole"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/85 text-[9px] font-mono text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>GPS: 28.6139° N, 77.2090° E</span>
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-teal-950/90 text-[9px] font-mono text-teal-200">
                            test_real_pothole.jpg (1.4MB compressed)
                          </div>
                        </div>
                      )}

                      {/* Animated Simulated Cursor dragging & dropping file */}
                      {time >= 8.5 && time < 11 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-mono font-bold text-xs shadow-2xl flex items-center gap-2 animate-pulse">
                            <Camera className="w-4 h-4" />
                            <span>Dropping test_real_pothole.jpg</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actual Form Fields */}
                    <div className="bg-white rounded-2xl border border-[#E2F1EE] p-3.5 sm:p-4 space-y-2.5 shadow-xs text-xs">
                      {/* Category Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                          ISSUE CATEGORY
                        </label>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-slate-800">Road Damage / Potholes</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                            High Severity
                          </span>
                        </div>
                      </div>

                      {/* Location & Reverse Geocoded Address */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                          REVERSE GEOCODED INCIDENT ADDRESS
                        </label>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="truncate">Sector 62, Near Electronic City Metro, Noida, UP - 201309</span>
                        </div>
                      </div>

                      {/* Citizen Description */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                          CITIZEN DESCRIPTION
                        </label>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                          Deep asphalt road fracture causing severe traffic slowdown and high hazard to two-wheelers.
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="relative pt-1">
                        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00897B] via-[#005C66] to-[#04333A] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md">
                          <span>Dispatch to Automated AI Pipeline</span>
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Simulated Click at 14.5s */}
                        {time >= 14 && (
                          <div className="absolute right-6 bottom-1 pointer-events-none animate-bounce">
                            <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 text-white drop-shadow-lg">
                              <path d="M4 0l16 12-7 2 4 8-3 1-4-8-6 5z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SCENE 3: REAL 6-STAGE AI STEPPER & FORMAL REPORT (0:16 - 0:24)        */}
              {/* ===================================================================== */}
              {time >= 16 && time < 24 && (
                <div className="relative z-10 space-y-3 max-w-5xl mx-auto animate-in fade-in duration-300">
                  {/* Stepper Card */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xl text-white">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-stone-100">Automated AI Pipeline Execution</h3>
                          <p className="text-[10px] text-cyan-400 font-mono">Job #job_8941 • YOLOv8 Multi-Stage Triage</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold animate-pulse">
                        STEP 5 OF 6: DEPT ROUTING
                      </span>
                    </div>

                    {/* 6 Real Stages from UploadStepper.jsx */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3 text-xs font-mono">
                      {[
                        { label: 'Image Ingestion', done: true, icon: UploadCloud },
                        { label: 'AI Detection', done: true, icon: Cpu },
                        { label: 'Geo-Tagging', done: true, icon: MapPin },
                        { label: 'Deduplication', done: true, icon: Layers },
                        { label: 'Dept Routing', done: time >= 19, icon: Building2 },
                        { label: 'Auto Dispatch', done: time >= 21.5, icon: Send }
                      ].map((stg, i) => {
                        const Icon = stg.icon;
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                              stg.done
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 mb-1" />
                            <span className="font-bold text-[9px]">{stg.label}</span>
                            <span className="text-[8px] opacity-80">{stg.done ? '✓ Done' : 'In Flight...'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Split Visual: YOLOv8 Bounding Box & Formal Complaint Letter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left: YOLOv8 Bounding Box Reticle */}
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-emerald-500/60 shadow-lg">
                      <img
                        src="/test_real_pothole.jpg"
                        alt="YOLOv8 Bounding Box"
                        className="w-full h-full object-cover filter brightness-95"
                      />
                      {/* Sweeping Laser Line */}
                      <div
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_15px_#00E5FF]"
                        style={{
                          top: `${((time - 16) / 8) * 100}%`,
                          transition: 'top 0.1s linear'
                        }}
                      />
                      {/* Bounding Box */}
                      <div className="absolute top-[28%] left-[22%] w-[52%] h-[48%] border-2 border-emerald-400 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.9)]">
                        <span className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-black/95 border border-emerald-400 text-emerald-300 font-mono text-[9px] font-bold">
                          YOLOv8: POTHOLE (94.8%) • DEEP FRACTURE ~14cm
                        </span>
                      </div>
                    </div>

                    {/* Right: Generated Formal Complaint Letter Preview */}
                    <div className="bg-white rounded-2xl border border-[#E2F1EE] p-3.5 shadow-xs flex flex-col justify-between text-xs">
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-[#0B2027]">
                          <span className="text-[11px] font-mono uppercase text-[#00897B]">FORMAL CITIZEN COMPLAINT</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                            #UE-8941
                          </span>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-600 font-mono leading-relaxed">
                          To: Executive Engineer, Roads & Public Works Dept (PWD)<br />
                          Location: Sector 62, Noida, Uttar Pradesh (Ward 14)<br />
                          AI Classification: High-Severity Pothole (Depth: 14cm)<br />
                          SLA Guarantee: 48 Hours • Priority Status: P1 Rapid Repair
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 font-mono">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dispatched to Field Crew</span>
                        </span>
                        <button className="px-3 py-1.5 rounded-xl bg-[#00897B] text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs">
                          <Download className="w-3 h-3" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SCENE 4: REAL MY TRACKING PAGE & DUAL PROOF (0:24 - 0:31)              */}
              {/* ===================================================================== */}
              {time >= 24 && time < 31 && (
                <div className="relative z-10 space-y-3 max-w-5xl mx-auto animate-in fade-in duration-300">
                  {/* Header */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#0B2027] tracking-tight">
                      My Tracking: Ticket #UE-8941
                    </h1>
                    <p className="text-xs text-slate-500">
                      Monitor live ticket milestones, resolution photos and provide verification feedback.
                    </p>
                  </div>

                  {/* Active Ticket Card with 5-Step Resolution Stepper */}
                  <div className="bg-white rounded-2xl border border-[#E2F1EE] p-3.5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                      <div>
                        <div className="font-extrabold text-[#0B2027]">Sector 62 Main Road Pothole Repair</div>
                        <div className="text-[10px] text-slate-400 font-mono">Assigned to: Roads & Public Works Dept</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        RESOLVED & VERIFIED
                      </span>
                    </div>

                    {/* Stepper milestones */}
                    <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px]">
                      <div className="p-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold">✓ Reported</div>
                      <div className="p-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold">✓ AI Verified</div>
                      <div className="p-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold">✓ Dispatched</div>
                      <div className="p-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold">✓ In Progress</div>
                      <div className="p-1 rounded-lg bg-emerald-600 text-white font-bold shadow-xs">✓ Resolved</div>
                    </div>
                  </div>

                  {/* Dual Before / After Proof Photos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-rose-300 bg-black shadow-xs">
                      <img
                        src="/test_real_pothole.jpg"
                        alt="Before Repair"
                        className="w-full h-full object-cover filter brightness-90"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-900/90 text-rose-100 text-[9px] font-bold font-mono">
                        BEFORE (DAMAGED) • 10:42 AM
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-mono text-slate-300">
                        Damage depth: 14cm
                      </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-emerald-400 bg-slate-950 shadow-xs">
                      <img
                        src="/hero-city-full.jpg"
                        alt="After Repair"
                        className="w-full h-full object-cover filter brightness-105"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-800/90 text-emerald-100 text-[9px] font-bold font-mono flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                        <span>AFTER (REPAIRED) • 14:15 PM</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-mono text-emerald-400 font-bold">
                        GEOFENCE: 100% MATCH
                      </div>
                    </div>
                  </div>

                  {/* Citizen Verification Feedback Card */}
                  <div className="p-3 rounded-2xl bg-white border border-[#E2F1EE] flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center space-x-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="font-bold text-[#0B2027]">Citizen Verified: Aarav M.</span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        — "Fixed same day in under 4 hours!"
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      TAT: 3h 33m (SLA Met)
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SCENE 5: REAL INTERACTIVE LIVE MAP PAGE (0:31 - 0:37)                 */}
              {/* ===================================================================== */}
              {time >= 31 && time < 37 && (
                <div className="relative z-10 h-full flex flex-col justify-between max-w-5xl mx-auto animate-in fade-in duration-300">
                  {/* Map Category Pills Header */}
                  <div className="bg-white p-2.5 rounded-2xl border border-[#E2F1EE] flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center space-x-2">
                      <Crosshair className="w-4 h-4 text-[#00897B]" />
                      <span className="font-bold text-[#0B2027]">Live City Incident GIS Grid</span>
                    </div>

                    <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">ALL (24)</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">ROADS (12)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">WASTE (6)</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">WATER (4)</span>
                    </div>
                  </div>

                  {/* Real Map Canvas with Street Grid & Radar Sweep */}
                  <div className="relative flex-1 min-h-[220px] rounded-2xl overflow-hidden bg-[#03181E] border border-teal-900 my-2 flex items-center justify-center shadow-lg">
                    <img
                      src="/watermark-city.jpg"
                      alt="City Map Grid"
                      className="w-full h-full object-cover opacity-50 filter contrast-125"
                    />

                    {/* Radar Sweep Reticle */}
                    <div className="absolute w-56 h-56 rounded-full border border-cyan-400/20 pointer-events-none flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full border border-cyan-400/30"></div>
                    </div>
                    <div
                      className="absolute w-56 h-56 rounded-full pointer-events-none animate-[spin_4s_linear_infinite]"
                      style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}
                    >
                      <div className="w-full h-full bg-gradient-to-tr from-cyan-400/0 to-cyan-400/35 rounded-full" />
                    </div>

                    {/* Pulsing Pins with Real Incident Details */}
                    <div className="absolute top-[32%] left-[42%] flex items-center space-x-1.5 bg-black/90 px-2.5 py-1 rounded-xl border border-rose-500 text-rose-300 text-[10px] font-mono font-bold shadow-2xl">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>#UE-8941 Pothole (High Priority)</span>
                    </div>

                    <div className="absolute top-[62%] left-[22%] flex items-center space-x-1.5 bg-black/90 px-2.5 py-1 rounded-xl border border-emerald-500 text-emerald-300 text-[10px] font-mono font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>#UE-7819 Waste Cleared</span>
                    </div>

                    <div className="absolute top-[28%] right-[18%] flex items-center space-x-1.5 bg-black/90 px-2.5 py-1 rounded-xl border border-blue-500 text-blue-300 text-[10px] font-mono font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>Water Leak Fixed</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                    <span>Google Maps Platform API • ±1.2m GPS Geolocation Accuracy</span>
                    <span className="text-[#00897B] font-bold">● 24 Live Sensor Feeds</span>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SCENE 6: REAL SUPER ADMIN COMMAND COCKPIT (0:37 - 0:42)               */}
              {/* ===================================================================== */}
              {time >= 37 && (
                <div className="relative z-10 space-y-3 max-w-5xl mx-auto animate-in fade-in duration-300 text-slate-100">
                  {/* Cockpit Header */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>Citywide Governance Cockpit</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/40">
                        SUPER ADMIN
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400">
                      Cross-department SLA metrics, autonomous dispatch rules & cryptographic audit trail.
                    </p>
                  </div>

                  {/* 4 Large Realtime KPI Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#042026] border border-teal-800 text-center">
                      <div className="text-2xl font-black text-emerald-400">1,248</div>
                      <div className="text-[9px] text-slate-300 font-mono uppercase mt-0.5">Resolved Today</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#042026] border border-teal-800 text-center">
                      <div className="text-2xl font-black text-cyan-300">95.4%</div>
                      <div className="text-[9px] text-slate-300 font-mono uppercase mt-0.5">SLA Met (&lt;48h)</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#042026] border border-teal-800 text-center">
                      <div className="text-2xl font-black text-teal-300">3.8h</div>
                      <div className="text-[9px] text-slate-300 font-mono uppercase mt-0.5">Avg Resolution</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#042026] border border-teal-800 text-center">
                      <div className="text-2xl font-black text-purple-300">100%</div>
                      <div className="text-[9px] text-slate-300 font-mono uppercase mt-0.5">Audit Verified</div>
                    </div>
                  </div>

                  {/* Municipal Department Live Dispatch Board */}
                  <div className="p-3 rounded-2xl bg-[#042026] border border-teal-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Roads & Public Works Dept (PWD)</div>
                        <div className="text-[10px] text-slate-300 font-mono">
                          Crew Unit #4 deployed with Bitumen Paver • SLA: 47h 58m remaining
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      ACTIVE DISPATCH
                    </span>
                  </div>

                  {/* Immutable Cryptographic SHA-256 Audit Trail */}
                  <div className="p-2.5 rounded-2xl bg-[#020D11] border border-teal-900 font-mono text-[9px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-teal-900/60">
                      <span className="flex items-center space-x-1.5 text-purple-300 font-bold">
                        <Hash className="w-3 h-3" />
                        <span>TAMPER-PROOF AUDIT STREAM (CRYPTOGRAPHIC SHA-256)</span>
                      </span>
                      <span className="text-emerald-400 font-bold">● LIVE WEBSOCKET</span>
                    </div>
                    <div className="text-slate-300 truncate">
                      [14:15:22] TICKET #UE-8941 • PWD RESOLVED • CITIZEN VERIFIED (5★) • SHA-256: 8f9b2d41ac82e1...
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Subtitle Narration Bar at the Bottom of Every Scene */}
            <div className="absolute bottom-16 inset-x-4 text-center z-20 pointer-events-none">
              <div
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#06181D]/95 backdrop-blur-md text-xs font-medium shadow-2xl border max-w-full"
                style={{
                  borderColor: `${currentChapter.color}60`,
                  color: currentChapter.color
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-ping shrink-0"
                  style={{ backgroundColor: currentChapter.color }}
                />
                <span className="text-slate-100 truncate">
                  <strong style={{ color: currentChapter.color }}>{currentChapter.title}:</strong>{' '}
                  {currentChapter.desc}
                </span>
              </div>
            </div>

            {/* Replay Screen overlay when 42s completes */}
            {time >= TOTAL_DURATION && (
              <div className="absolute inset-0 bg-[#06181D]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300 text-white">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-3 shadow-xl">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  Urban Eye Complete Demonstration
                </h3>
                <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
                  From citizen issue reporting and real-time YOLOv8 AI detection to automated municipal dispatch, dual verified resolution, and citywide governance.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setTime(0);
                      setPlaying(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay (42s)</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onLaunchPortal) onLaunchPortal();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>Launch Citizen Portal</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM VIDEO CONTROLS & CHAPTER TIMELINE SCRUBBER                         */}
        {/* ========================================================================= */}
        <div className="px-4 py-2.5 bg-[#03151A] border-t border-teal-900/60 flex flex-col space-y-1.5 z-30 shrink-0">
          {/* Progress Scrubber */}
          <div
            onClick={handleSeek}
            className="h-2 w-full bg-slate-800 rounded-full cursor-pointer relative overflow-hidden group"
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-75 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs">
            {/* Left: Play/Pause, -5s/+5s, Timer */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayPause}
                className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => setTime((t) => Math.max(0, t - 5))}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
              >
                -5s
              </button>

              <button
                onClick={() => setTime((t) => Math.min(TOTAL_DURATION, t + 5))}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
              >
                +5s
              </button>

              <div className="font-mono text-slate-400 text-[11px] pl-1.5">
                <span className="text-white font-bold">{formatSecs(time)}</span>
                <span className="text-slate-500"> / 00:42</span>
              </div>
            </div>

            {/* Center: 6 Chapter Buttons */}
            <div className="hidden sm:flex items-center space-x-1">
              {CHAPTERS.map((chap) => {
                const isActive = time >= chap.start && time < chap.end;
                return (
                  <button
                    key={chap.id}
                    onClick={() => jumpTo(chap.start)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {chap.short}
                  </button>
                );
              })}
            </div>

            {/* Right: Speeds, No audio, Fullscreen */}
            <div className="flex items-center space-x-1.5">
              <div className="flex items-center space-x-0.5 bg-slate-900 rounded-lg p-0.5">
                {[1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer ${
                      speed === s ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <div
                className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-slate-900 text-slate-400 text-[9px] font-mono"
                title="Silent visual walkthrough without audio"
              >
                <VolumeX className="w-3 h-3 text-slate-400" />
                <span className="hidden md:inline">NO AUDIO</span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
