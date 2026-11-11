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
  Layers as LayersIcon
} from 'lucide-react';

const TOTAL_DURATION = 42; // 42 seconds total demo duration

const CHAPTERS = [
  {
    id: 1,
    title: "1. Citizen Dashboard",
    short: "1. Dashboard",
    start: 0,
    end: 7,
    url: "urbaneye.gov.in/dashboard",
    badge: "CITIZEN PORTAL",
    color: "#00E5FF",
    desc: "Citizen overview, Civic Score (80/100), real-time city health metrics & 1-tap issue reporting"
  },
  {
    id: 2,
    title: "2. Report Issue (Dummy Upload)",
    short: "2. Report & Upload",
    start: 7,
    end: 16,
    url: "urbaneye.gov.in/report",
    badge: "IMAGE UPLOAD & GPS",
    color: "#10B981",
    desc: "Citizen uploads pothole dummy photo, verified GPS location auto-locked & category selected"
  },
  {
    id: 3,
    title: "3. 6-Stage AI Pipeline & Report",
    short: "3. AI Pipeline",
    start: 16,
    end: 24,
    url: "urbaneye.gov.in/report/triage-pipeline",
    badge: "YOLOV8 AI ENGINE",
    color: "#06B6D4",
    desc: "YOLOv8 detects pothole (94.8% conf), verifies geofence, deduplicates & formats formal complaint"
  },
  {
    id: 4,
    title: "4. Live Tracking & Dual Proof",
    short: "4. Live Tracking",
    start: 24,
    end: 31,
    url: "urbaneye.gov.in/tracking/UE-8941",
    badge: "DUAL VERIFICATION",
    color: "#F59E0B",
    desc: "Real-time stepper tracking, Before & After photo proof, geofence check & 5-star citizen rating"
  },
  {
    id: 5,
    title: "5. Citywide GIS Map & Radar",
    short: "5. Live Map",
    start: 31,
    end: 37,
    url: "urbaneye.gov.in/map",
    badge: "GIS RADAR",
    color: "#3B82F6",
    desc: "Interactive GIS map, radar sweep, category filters & real-time severity heat clusters"
  },
  {
    id: 6,
    title: "6. Dept Dispatch & Super Admin",
    short: "6. Admin Oversight",
    start: 37,
    end: 42,
    url: "urbaneye.gov.in/super-admin",
    badge: "GOVERNANCE & AUDIT",
    color: "#A855F7",
    desc: "Municipal repair crew dispatch, 48h SLA countdown, citywide KPIs & SHA-256 audit logs"
  }
];

export default function DemoVideoPlayer({ onClose, onLaunchPortal }) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const lastTickRef = useRef(performance.now());

  // Main playback timer loop (60fps)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="bg-[#050B10] rounded-3xl overflow-hidden max-w-5xl w-full border border-teal-500/30 shadow-2xl flex flex-col relative text-white"
        style={{ maxHeight: '94vh' }}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3 bg-[#03070A] border-b border-teal-950/80 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-wide text-white">
                  Urban Eye — Full Application Walkthrough
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  REAL WEBSITE PAGES DEMO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                See exactly how citizen reports are submitted, analyzed by AI, tracked to resolution, and monitored citywide.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Demo"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Stage */}
        <div className="relative aspect-[4/3] sm:aspect-video min-h-[360px] sm:min-h-0 w-full bg-[#020508] overflow-hidden select-none flex flex-col group">
          {/* Simulated Browser Chrome Bar */}
          <div className="h-9 w-full bg-[#081017] border-b border-slate-800 flex items-center px-4 justify-between text-xs z-20 shrink-0">
            {/* macOS Window Dots */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Address Bar */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-black/50 border border-teal-900/40 text-[11px] font-mono text-slate-300 flex-1 max-w-[210px] sm:max-w-xs md:max-w-md mx-2 justify-center">
              <span className="text-emerald-400 font-bold">https://</span>
              <span className="truncate">{currentChapter.url}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1 shrink-0" />
            </div>

            {/* Chapter Pill */}
            <div className="flex items-center space-x-1.5">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: `${currentChapter.color}20`,
                  color: currentChapter.color,
                  border: `1px solid ${currentChapter.color}40`
                }}
              >
                {currentChapter.badge}
              </span>
            </div>
          </div>

          {/* Main Visual Display Area */}
          <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-[#050C12]">
            {/* Ambient Background Grid */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #00E5FF 1px, transparent 1px), linear-gradient(to bottom, #00E5FF 1px, transparent 1px)',
                backgroundSize: '36px 36px'
              }}
            />

            {/* ========================================================================= */}
            {/* SCENE 1: Real Citizen Dashboard (0:00 - 0:07)                             */}
            {/* ========================================================================= */}
            {time >= 0 && time < 7 && (
              <div className="relative w-full h-full flex flex-col justify-between p-2 sm:p-3 animate-in fade-in duration-300 bg-[#06181D]/90 border border-teal-900/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-2.5 border-b border-teal-900/60">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00897B] to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md">
                      UE
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                        <span>Citizen Portal</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </h3>
                      <p className="text-[10px] text-teal-400/80 font-mono">Welcome back, Shivharsh T. • Ward 14</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#005C66]/50 border border-teal-500/30 text-teal-200 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span>CIVIC SCORE: 80</span>
                    </span>
                  </div>
                </div>

                {/* Dashboard Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 my-2 text-xs">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#042026] border border-teal-900/70">
                    <div className="text-[9px] font-mono text-slate-400 uppercase">My Submitted Reports</div>
                    <div className="text-lg font-black text-white mt-0.5">6 Issues</div>
                    <div className="text-[9px] text-emerald-400 font-bold">2 Resolved this week</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#042026] border border-teal-900/70">
                    <div className="text-[9px] font-mono text-slate-400 uppercase">Avg Response Time</div>
                    <div className="text-lg font-black text-cyan-300 mt-0.5">3.8 Hours</div>
                    <div className="text-[9px] text-teal-400">95.4% SLA Compliance</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#042026] border border-teal-900/70">
                    <div className="text-[9px] font-mono text-slate-400 uppercase">City Health Index</div>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">92.4%</div>
                    <div className="text-[9px] text-slate-400">Active municipal watch</div>
                  </div>
                </div>

                {/* Main Action Banner: Report an Issue */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#005C66]/80 via-[#00897B]/70 to-[#028090]/80 border border-teal-400/40 flex items-center justify-between relative shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">Encountered a Civic Issue?</h4>
                      <p className="text-[10px] text-teal-100/80">Snap a photo to let our neural AI detect, classify & dispatch to PWD.</p>
                    </div>
                  </div>

                  {/* Primary Button */}
                  <div className="relative shrink-0">
                    <button className="px-3.5 py-2 rounded-xl bg-white text-[#06252B] font-extrabold text-xs flex items-center space-x-1.5 shadow-md">
                      <PlusCircle className="w-4 h-4 text-[#00897B]" />
                      <span>Report Issue</span>
                    </button>

                    {/* Animated Cursor clicking button at time ~4s */}
                    {time >= 3.5 && (
                      <div className="absolute -top-1 -right-1 pointer-events-none animate-bounce">
                        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 text-white drop-shadow-md">
                          <path d="M4 0l16 12-7 2 4 8-3 1-4-8-6 5z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Community Activity Row */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-teal-300">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>RECENT: Sector 62 Pothole #UE-8941 dispatched to Roads & PWD</span>
                  </span>
                  <span className="text-slate-500">Live WebSockets Stream</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 2: Real Report Issue Page — Uploading Dummy Image (0:07 - 0:16)      */}
            {/* ========================================================================= */}
            {time >= 7 && time < 16 && (
              <div className="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-3.5 animate-in fade-in duration-300 bg-[#071B22]/95 border border-teal-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* 3-Step Wizard Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-teal-900/60 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#00897B] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span className="font-bold text-white text-xs">Issue Details</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-[#00897B] to-slate-700 mx-3"></div>
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">2</span>
                    <span>Location</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-slate-800 mx-3"></div>
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">3</span>
                    <span>AI Review</span>
                  </div>
                </div>

                {/* Main Split Upload & Details Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 flex-1 min-h-0">
                  {/* Left: Dummy Image Upload Dropzone */}
                  <div className="relative rounded-2xl border-2 border-dashed border-teal-500/50 bg-[#041217] overflow-hidden flex flex-col items-center justify-center p-2 group">
                    {time < 10.5 ? (
                      <div className="text-center space-y-2 p-3">
                        <div className="w-10 h-10 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                          <UploadCloud className="w-5 h-5 animate-bounce" />
                        </div>
                        <div className="text-xs font-bold text-white">Upload Incident Image</div>
                        <p className="text-[10px] text-slate-400">Drag & drop or browse dummy photo</p>
                        <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[9px] font-bold inline-block">
                          SELECTING: test_real_pothole.jpg
                        </span>
                      </div>
                    ) : (
                      /* Preview of Uploaded Dummy Image */
                      <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                        <img
                          src="/test_real_pothole.jpg"
                          alt="Uploaded Dummy Pothole"
                          className="w-full h-full object-cover filter brightness-95"
                        />
                        <div className="absolute inset-0 border border-teal-400/40 rounded-xl pointer-events-none" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 border border-emerald-500/50 text-[9px] font-mono text-emerald-400 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>EXIF GPS: 28.6139° N, 77.2090° E</span>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-teal-950/90 text-[9px] font-mono text-teal-200">
                          test_real_pothole.jpg (1.4MB compressed)
                        </div>
                      </div>
                    )}

                    {/* Animated Cursor dragging & dropping file */}
                    {time >= 8.5 && time < 10.5 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-mono font-bold text-[10px] shadow-2xl flex items-center gap-1.5 animate-pulse">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Dropping test_real_pothole.jpg</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Real Issue Details Form */}
                  <div className="flex flex-col justify-between space-y-2 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block font-mono">
                        ISSUE CATEGORY
                      </label>
                      <div className="p-2 rounded-xl bg-[#042026] border border-teal-900 flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Road Damage & Potholes</span>
                        </span>
                        <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          HIGH SEVERITY
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block font-mono">
                        GEOCODED INCIDENT ADDRESS
                      </label>
                      <div className="p-2 rounded-xl bg-[#042026] border border-teal-900 text-xs text-slate-200 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span className="truncate">Sector 62, Near Electronic City Metro, Noida, UP</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block font-mono">
                        CITIZEN DESCRIPTION
                      </label>
                      <div className="p-2 rounded-xl bg-[#042026] border border-teal-900 text-[11px] text-slate-300 leading-snug">
                        Deep road fracture causing severe traffic slowdown and hazard to two-wheelers.
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="relative pt-1">
                      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#005C66] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-lg">
                        <span>Dispatch to Automated AI Pipeline</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {/* Click animation at 14.5s */}
                      {time >= 14 && (
                        <div className="absolute right-4 bottom-1 pointer-events-none animate-bounce">
                          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 text-white drop-shadow-md">
                            <path d="M4 0l16 12-7 2 4 8-3 1-4-8-6 5z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer status notice */}
                <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between border-t border-teal-900/40 pt-1">
                  <span>✓ Dual SHA-256 integrity hash verification</span>
                  <span className="text-emerald-400">Fast AI Model Ready</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 3: Real 6-Stage AI Stepper & Formal Letter (0:16 - 0:24)             */}
            {/* ========================================================================= */}
            {time >= 16 && time < 24 && (
              <div className="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-3 animate-in fade-in duration-300 bg-[#06181F]/95 border border-cyan-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Stepper Header */}
                <div className="flex items-center justify-between pb-2 border-b border-teal-900/60">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">Real-Time AI Pipeline Execution</h4>
                      <p className="text-[10px] text-cyan-300 font-mono">Job #job_91824 • Automated Municipal Ingestion</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-[10px] font-bold animate-pulse">
                    PROCESSING STEP 5 OF 6
                  </span>
                </div>

                {/* 6-Stage Stepper Grid (Matching UploadStepper.jsx exactly) */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 my-2 text-[10px] font-mono">
                  {[
                    { label: 'Ingestion', done: true, icon: UploadCloud },
                    { label: 'AI Detection', done: true, icon: Cpu },
                    { label: 'Geo-Tagging', done: true, icon: MapPin },
                    { label: 'Deduplication', done: true, icon: LayersIcon },
                    { label: 'Dept Routing', done: time >= 19, icon: Building2 },
                    { label: 'Dispatched', done: time >= 21, icon: Send }
                  ].map((stg, i) => {
                    const Icon = stg.icon;
                    return (
                      <div
                        key={i}
                        className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                          stg.done
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-1" />
                        <span className="font-bold text-[9px] leading-tight">{stg.label}</span>
                        <span className="text-[8px] opacity-80">{stg.done ? '✓ Verified' : 'In Flight...'}</span>
                      </div>
                    );
                  })}
                </div>

                {/* YOLOv8 Visual Inference & Formal Letter Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-h-0">
                  {/* Left: YOLOv8 Bounding Box Scan on Dummy Image */}
                  <div className="relative rounded-xl overflow-hidden bg-black border border-cyan-500/50">
                    <img
                      src="/test_real_pothole.jpg"
                      alt="YOLOv8 Detection"
                      className="w-full h-full object-cover"
                    />
                    {/* Sweeping Laser Scan Line */}
                    <div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00E5FF]"
                      style={{
                        top: `${((time - 16) / 8) * 100}%`,
                        transition: 'top 0.1s linear'
                      }}
                    />
                    {/* Bounding Box */}
                    <div className="absolute top-[28%] left-[24%] w-[50%] h-[48%] border-2 border-emerald-400 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.9)]">
                      <span className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-black/90 border border-emerald-400 text-emerald-300 font-mono text-[9px] font-bold">
                        YOLOv8: POTHOLE (94.8%)
                      </span>
                    </div>
                  </div>

                  {/* Right: Generated Formal Complaint Letter Preview */}
                  <div className="p-2.5 rounded-xl bg-[#031014] border border-teal-900 font-mono text-[10px] text-slate-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-teal-400 font-bold pb-1 border-b border-teal-900/60 text-[11px]">
                        <span>FORMAL CITIZEN COMPLAINT</span>
                        <span className="text-emerald-400">#UE-8941</span>
                      </div>
                      <p className="mt-1 text-[9px] text-slate-300 leading-relaxed">
                        To: Executive Engineer, Roads & Public Works Dept (PWD)<br />
                        Subject: Urgent repair of high-severity road defect at Sector 62, Noida.<br />
                        AI Verified: Depth ~14cm • Priority: P1 • Target SLA: 48h.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-teal-900/60">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        <span>Ticket Dispatched</span>
                      </span>
                      <button className="px-2 py-1 rounded bg-[#005C66] text-white text-[9px] font-bold flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>PDF Letter</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 4: Real Tracking Page — Dual Before/After Proof (0:24 - 0:31)        */}
            {/* ========================================================================= */}
            {time >= 24 && time < 31 && (
              <div className="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-3.5 animate-in fade-in duration-300 bg-[#071920]/95 border border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-teal-900/60">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">
                        Live Tracking: Ticket #UE-8941
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">Sector 62 Road Repair • Assigned: Roads & PWD</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                    RESOLVED & VERIFIED
                  </span>
                </div>

                {/* Side-by-Side Dual Before & After Verification */}
                <div className="grid grid-cols-2 gap-2.5 my-2 flex-1 min-h-0">
                  {/* Before Photo */}
                  <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 bg-black">
                    <img
                      src="/test_real_pothole.jpg"
                      alt="Before Repair"
                      className="w-full h-full object-cover filter brightness-90"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-950/90 text-rose-200 text-[9px] font-bold font-mono">
                      BEFORE • 10:42 AM (REPORTED)
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-mono text-slate-300">
                      Pothole depth: ~14cm
                    </div>
                  </div>

                  {/* After Photo (Repaired) */}
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-950">
                    <img
                      src="/hero-city-full.jpg"
                      alt="After Repair"
                      className="w-full h-full object-cover filter brightness-105"
                    />
                    <div className="absolute inset-0 bg-emerald-950/20" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-800/90 text-emerald-100 text-[9px] font-bold font-mono flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                      <span>AFTER • 14:15 PM (REPAIRED)</span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[8px] font-mono text-emerald-400 font-bold">
                      GEOFENCE: 100% MATCH
                    </div>
                  </div>
                </div>

                {/* Citizen Rating & Verified Stepper */}
                <div className="p-2.5 rounded-xl bg-[#042026] border border-teal-900 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="font-bold text-white text-[11px]">Citizen Rating: 5/5 Stars</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      — "Repaired on the same day in 3h 33m!"
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-400 font-bold">
                    TAT: 3h 33m (SLA Met)
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 5: Real City GIS Live Map & Radar (0:31 - 0:37)                     */}
            {/* ========================================================================= */}
            {time >= 31 && time < 37 && (
              <div className="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-3 animate-in fade-in duration-300 bg-[#041217]/95 border border-blue-500/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Map Filter Controls Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-teal-900/60 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-xs sm:text-sm">Live City GIS Incident Grid</span>
                  </div>

                  <div className="flex items-center space-x-1 font-mono text-[9px]">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">ALL (24)</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">ROADS (12)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">WASTE (6)</span>
                  </div>
                </div>

                {/* Simulated Interactive Map Canvas with Radar Reticle */}
                <div className="relative w-full flex-1 min-h-0 rounded-xl overflow-hidden bg-[#03151D] border border-teal-900/80 my-1.5 flex items-center justify-center">
                  {/* Base Map Graphic */}
                  <img
                    src="/watermark-city.jpg"
                    alt="City Grid Map"
                    className="w-full h-full object-cover opacity-40 filter contrast-125"
                  />

                  {/* High-Tech Radar Sweep Animation */}
                  <div className="absolute w-48 h-48 rounded-full border border-cyan-500/20 pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-cyan-400/30 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-cyan-300/40"></div>
                    </div>
                  </div>
                  <div
                    className="absolute w-48 h-48 rounded-full pointer-events-none animate-[spin_4s_linear_infinite]"
                    style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}
                  >
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-400/0 to-cyan-400/30 rounded-full" />
                  </div>

                  {/* Pulsing Incident Pins */}
                  <div className="absolute top-[35%] left-[45%] flex items-center space-x-1 bg-black/90 px-2 py-1 rounded-xl border border-rose-500/70 text-rose-400 text-[9px] font-mono font-bold shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>#UE-8941 Pothole (High)</span>
                  </div>
                  <div className="absolute top-[60%] left-[25%] flex items-center space-x-1 bg-black/90 px-2 py-1 rounded-xl border border-emerald-500/70 text-emerald-400 text-[9px] font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>#UE-7819 Waste Cleaned</span>
                  </div>
                  <div className="absolute top-[25%] right-[20%] flex items-center space-x-1 bg-black/90 px-2 py-1 rounded-xl border border-blue-500/70 text-blue-400 text-[9px] font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Water Leak Repaired</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-teal-900/40">
                  <span className="text-cyan-300">Google Maps Platform API • ±1.2m Geolocation Accuracy</span>
                  <span className="text-emerald-400 font-bold">● 24 Live Sensor Streams</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 6: Dept Admin Dispatch & Super Admin Cockpit (0:37 - 0:42)          */}
            {/* ========================================================================= */}
            {time >= 37 && (
              <div className="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-3 animate-in fade-in duration-300 bg-[#040E14]/95 border border-purple-500/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">Command Center Governance</h4>
                      <p className="text-[10px] text-slate-400">Department Routing & Cryptographic SHA-256 Audit Trail</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/40">
                    LIVE CITY TELEMETRY
                  </span>
                </div>

                {/* 4 Realtime KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-lg font-black text-emerald-400">1,248</div>
                    <div className="text-[8px] text-slate-400 font-mono uppercase">Resolved Today</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-lg font-black text-cyan-400">95.4%</div>
                    <div className="text-[8px] text-slate-400 font-mono uppercase">SLA Met (48h)</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-lg font-black text-blue-400">3.8h</div>
                    <div className="text-[8px] text-slate-400 font-mono uppercase">Avg Resolution</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-lg font-black text-purple-400">100%</div>
                    <div className="text-[8px] text-slate-400 font-mono uppercase">Audit Verified</div>
                  </div>
                </div>

                {/* Immutable SHA-256 Cryptographic Audit Log Strip */}
                <div className="p-2 rounded-xl bg-[#020B10] border border-slate-800/80 font-mono text-[9px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400 pb-0.5 border-b border-slate-800/60">
                    <span className="flex items-center space-x-1.5 text-purple-300 font-bold">
                      <Hash className="w-3 h-3" />
                      <span>CRYPTOGRAPHIC AUDIT STREAM (SHA-256)</span>
                    </span>
                    <span className="text-emerald-400">● REAL-TIME</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    [14:15:22] TICKET #UE-8941 • PWD RESOLVED • CITIZEN VERIFIED (5★) • HASH: 8f9b2d...a1c3
                  </div>
                </div>
              </div>
            )}

            {/* Subtitle Narration Bar at the Bottom */}
            <div className="absolute bottom-2.5 inset-x-3 text-center z-20 pointer-events-none">
              <div
                className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/90 backdrop-blur-md text-[10px] sm:text-xs font-medium shadow-2xl border max-w-full"
                style={{
                  borderColor: `${currentChapter.color}50`,
                  color: currentChapter.color
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-ping shrink-0"
                  style={{ backgroundColor: currentChapter.color }}
                />
                <span className="text-slate-200 truncate">
                  <strong style={{ color: currentChapter.color }}>{currentChapter.title}:</strong>{' '}
                  {currentChapter.desc}
                </span>
              </div>
            </div>

            {/* Replay Screen overlay when 42s completes */}
            {time >= TOTAL_DURATION && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-3 shadow-xl shadow-emerald-950/60">
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
                  >
                    <span>Launch Citizen Portal</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Video Controls & Chapter Navigation */}
          <div className="px-4 py-2 bg-[#04090E] border-t border-slate-800 flex flex-col space-y-1.5 z-20 shrink-0">
            {/* Progress Scrubber */}
            <div
              onClick={handleSeek}
              className="h-2 w-full bg-slate-800/80 rounded-full cursor-pointer relative overflow-hidden group"
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
                  className="px-2 py-0.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                >
                  -5s
                </button>

                <button
                  onClick={() => setTime((t) => Math.min(TOTAL_DURATION, t + 5))}
                  className="px-2 py-0.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                >
                  +5s
                </button>

                <div className="font-mono text-slate-400 text-[11px] pl-1.5">
                  <span className="text-white font-bold">{formatSecs(time)}</span>
                  <span className="text-slate-600"> / 00:42</span>
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
                          : 'bg-slate-900/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {chap.short}
                    </button>
                  );
                })}
              </div>

              {/* Right: Speeds, No audio, Fullscreen */}
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center space-x-0.5 bg-slate-850 rounded-lg p-0.5">
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
                  className="w-7 h-7 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
