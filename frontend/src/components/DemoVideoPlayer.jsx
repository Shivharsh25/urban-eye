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
  UploadCloud
} from 'lucide-react';

const TOTAL_DURATION = 30; // 30 seconds

const CHAPTERS = [
  {
    id: 1,
    title: "1. Citizen Report",
    short: "1. Report",
    start: 0,
    end: 6,
    url: "urbaneye.gov.in/report",
    badge: "CITIZEN PORTAL",
    color: "#00E5FF",
    desc: "Citizen snaps pothole photo with automatic GPS location lock & instant submission"
  },
  {
    id: 2,
    title: "2. YOLOv8 AI Vision",
    short: "2. AI Scan",
    start: 6,
    end: 12,
    url: "urbaneye.gov.in/ai-vision-stream",
    badge: "COMPUTER VISION",
    color: "#10B981",
    desc: "YOLOv8 detects pothole (94.8% confidence), estimates severity & prevents duplicates"
  },
  {
    id: 3,
    title: "3. Auto-Triage Dispatch",
    short: "3. Dispatch",
    start: 12,
    end: 18,
    url: "urbaneye.gov.in/dept-admin/reports",
    badge: "MUNICIPAL ROUTING",
    color: "#3B82F6",
    desc: "Ticket auto-assigned to Roads & PWD department; 48h SLA timer & crew dispatched"
  },
  {
    id: 4,
    title: "4. Field Fix & Dual Proof",
    short: "4. Dual Proof",
    start: 18,
    end: 24,
    url: "urbaneye.gov.in/tracking/UE-8941",
    badge: "VERIFIED RESOLUTION",
    color: "#F59E0B",
    desc: "Road repaired; field team uploads photo proof; citizen inspects & gives 5-star rating"
  },
  {
    id: 5,
    title: "5. City Command Center",
    short: "5. Oversight",
    start: 24,
    end: 30,
    url: "urbaneye.gov.in/super-admin/dashboard",
    badge: "SUPER ADMIN",
    color: "#8B5CF6",
    desc: "Citywide GIS heatmap, department SLA response metrics & SHA-256 tamper-proof audit trail"
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
        <div className="px-5 py-3 bg-[#03070A] border-b border-teal-950/80 flex items-center justify-between z-20">
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
                  30s PRODUCT DEMO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                See exactly how citizen reports are scanned by AI, dispatched to departments, and resolved.
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

        {/* Video Stage (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full bg-[#020508] overflow-hidden select-none flex flex-col group">
          {/* Simulated Browser Chrome Bar */}
          <div className="h-9 w-full bg-[#081017] border-b border-slate-800 flex items-center px-4 justify-between text-xs z-20 shrink-0">
            {/* macOS Window Dots */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Address Bar */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-black/50 border border-teal-900/40 text-[11px] font-mono text-slate-300 w-72 sm:w-96 justify-center">
              <span className="text-emerald-400 font-bold">https://</span>
              <span>{currentChapter.url}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />
            </div>

            {/* Chapter Pill */}
            <div className="flex items-center space-x-1.5">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
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
          <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center p-3 sm:p-5">
            {/* Subtle Grid Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #00E5FF 1px, transparent 1px), linear-gradient(to bottom, #00E5FF 1px, transparent 1px)',
                backgroundSize: '36px 36px'
              }}
            />

            {/* ========================================================================= */}
            {/* SCENE 1: Citizen Mobile Issue Reporting (0:00 - 0:06)                     */}
            {/* ========================================================================= */}
            {time >= 0 && time < 6 && (
              <div className="relative w-full h-full flex items-center justify-center gap-6 animate-in fade-in duration-300">
                {/* Left: Mobile App Device Mockup */}
                <div className="h-full max-w-xs w-full bg-[#0a161c] border-2 border-teal-500/40 rounded-3xl p-3 shadow-2xl flex flex-col justify-between relative backdrop-blur-md">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <Smartphone className="w-3 h-3" />
                      <span>URBAN EYE CITIZEN APP</span>
                    </span>
                    <span>10:42 AM</span>
                  </div>

                  {/* Camera / Photo Capture Preview */}
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 border border-slate-700 bg-black mt-2">
                    <img
                      src="/usecase-pothole.jpg?v=3"
                      alt="Pothole capture"
                      className="w-full h-full object-cover"
                    />
                    {/* Live Camera Reticle */}
                    <div className="absolute inset-2 border border-white/40 rounded-xl pointer-events-none" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-mono text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>GPS: 28.6139° N, 77.2090° E</span>
                    </div>
                  </div>

                  {/* Form Details */}
                  <div className="space-y-1.5 my-2">
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
                      <div className="text-[10px] text-slate-400 font-mono">DETECTED LOCATION</div>
                      <div className="font-bold text-white flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">Ring Road Outer, Connaught Place</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono">CATEGORY</div>
                        <div className="font-bold text-amber-400">Road Damage / Pothole</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                        PENDING AI
                      </span>
                    </div>
                  </div>

                  {/* Animated Submit Button with Simulated Cursor Click */}
                  <div className="relative">
                    <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-lg shadow-emerald-950/60">
                      <span>Submit to AI Engine</span>
                      <Send className="w-3.5 h-3.5 ml-1" />
                    </div>

                    {/* Animated Cursor clicking */}
                    <div
                      className="absolute w-5 h-5 -right-1 -bottom-1 pointer-events-none animate-bounce"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 text-white">
                        <path d="M4 0l16 12-7 2 4 8-3 1-4-8-6 5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right: Explanatory Callout Box */}
                <div className="max-w-md hidden md:flex flex-col justify-center space-y-3">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold w-fit">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>ZERO HASSLE REPORTING</span>
                  </div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    Citizen Snaps a Photo — Geotagged & Timestamped Instantly
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    No complicated municipal forms. Urban Eye automatically captures verified GPS coordinates ($\pm 1.2\text{m}$ accuracy) and queues the media for neural vision analysis.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-teal-900/60 text-slate-300">
                      <span className="text-emerald-400 font-bold">✓ Camera Geotag</span>
                      <div>High Precision GPS</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-teal-900/60 text-slate-300">
                      <span className="text-cyan-400 font-bold">✓ 1-Tap Submit</span>
                      <div>Under 5 Seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 2: YOLOv8 AI Computer Vision Engine (0:06 - 0:12)                   */}
            {/* ========================================================================= */}
            {time >= 6 && time < 12 && (
              <div className="relative w-full h-full flex items-center justify-center p-2 animate-in fade-in duration-300">
                <div className="relative w-full max-w-2xl aspect-16/9 rounded-3xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl bg-black">
                  <img
                    src="/usecase-pothole.jpg?v=3"
                    alt="AI Vision Analysis"
                    className="w-full h-full object-cover filter brightness-95"
                  />

                  {/* Holographic Matrix Scanlines */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(0,229,255,0.4) 1px, transparent 1px)',
                      backgroundSize: '100% 6px'
                    }}
                  />

                  {/* Sweeping Laser Scan Line */}
                  <div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_20px_#00E5FF]"
                    style={{
                      top: `${((time - 6) / 6) * 100}%`,
                      transition: 'top 0.08s linear'
                    }}
                  />

                  {/* YOLOv8 Neural Bounding Box */}
                  <div
                    className="absolute border-2 border-emerald-400 rounded-lg shadow-[0_0_25px_rgba(16,185,129,0.9)] animate-pulse"
                    style={{
                      top: '25%',
                      left: '20%',
                      width: '48%',
                      height: '54%'
                    }}
                  >
                    {/* Corner Reticles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-300" />
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-300" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-300" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-300" />

                    {/* Floating Prediction Label */}
                    <div className="absolute -top-8 left-0 px-3 py-1 rounded-md bg-black/95 border border-emerald-400 text-emerald-300 font-mono text-[11px] font-bold flex items-center space-x-2 shadow-2xl">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>YOLOv8: POTHOLE (94.8%)</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[9px]">
                        HIGH SEVERITY
                      </span>
                    </div>
                  </div>

                  {/* Telemetry HUD Cards */}
                  <div className="absolute bottom-3 left-3 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-teal-900/80 font-mono text-[10px] space-y-1 text-slate-300 max-w-xs">
                    <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>AI INFERENCE: 142ms</span>
                    </div>
                    <div>• Defect: Deep Asphalt Fracture (~14cm)</div>
                    <div>• Triage: Roads & PWD Department</div>
                    <div className="text-cyan-300">• Deduplication: 0 Duplicates in 50m (Unique)</div>
                  </div>

                  {/* Top Right Live AI Tag */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 font-mono text-[10px] text-emerald-300 flex items-center space-x-1.5 backdrop-blur-xs">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AUTONOMOUS CLASSIFICATION ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 3: Autonomous Dept Routing & Live Dispatch (0:12 - 0:18)            */}
            {/* ========================================================================= */}
            {time >= 12 && time < 18 && (
              <div className="relative w-full h-full flex items-center justify-center p-2 animate-in fade-in duration-300">
                <div className="w-full max-w-3xl bg-[#07131A] border border-blue-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
                  {/* Department Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-white">
                            Roads & Public Works Dept (PWD)
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                            TICKET #UE-8941
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Incoming report automatically assigned based on AI confidence score
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>DISPATCHED</span>
                    </span>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400">ASSIGNED REPAIR CREW</div>
                      <div className="font-bold text-white flex items-center space-x-1.5 text-sm">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span>Rapid Crew Unit #4</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Bitumen Paver Truck 28B</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400">MUNICIPAL SLA COUNTDOWN</div>
                      <div className="font-bold text-amber-400 flex items-center space-x-1.5 text-sm">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>48h SLA Target</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">47h 58m remaining</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400">CITIZEN STATUS UPDATE</div>
                      <div className="font-bold text-cyan-400 flex items-center space-x-1.5 text-sm">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span>SMS & Push Sent</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Citizen notified in real time</div>
                    </div>
                  </div>

                  {/* Crew Dispatch Interactive Action Simulation */}
                  <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-900/50 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      <span className="font-mono text-blue-200">
                        GPS Route Pushed to Crew Mobile Tablet • ETA: 35 Minutes
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      NO MANUAL DELAYS • INSTANT TRIAGE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 4: Field Resolution & Dual Before/After Proof (0:18 - 0:24)         */}
            {/* ========================================================================= */}
            {time >= 18 && time < 24 && (
              <div className="relative w-full h-full flex items-center justify-center p-2 animate-in fade-in duration-300">
                <div className="w-full max-w-3xl bg-[#07131A] border border-amber-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
                  {/* Stepper Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-white text-sm">
                        Dual Resolution Verification (Ticket #UE-8941)
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                      RESOLVED & VERIFIED
                    </span>
                  </div>

                  {/* Side-by-side Before & After Images */}
                  <div className="grid grid-cols-2 gap-3 my-3">
                    {/* Before Image */}
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-rose-500/40 bg-black">
                      <img
                        src="/usecase-pothole.jpg?v=3"
                        alt="Before Repair"
                        className="w-full h-full object-cover filter brightness-90"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-900/90 text-rose-200 text-[10px] font-bold font-mono">
                        BEFORE (DAMAGED) • 10:42 AM
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-slate-300">
                        Pothole depth: 14cm
                      </div>
                    </div>

                    {/* After Image */}
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-emerald-500/50 bg-slate-950">
                      <img
                        src="/hero-city-full.jpg"
                        alt="After Repair"
                        className="w-full h-full object-cover filter brightness-110"
                      />
                      <div className="absolute inset-0 bg-emerald-950/20" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-700/90 text-emerald-100 text-[10px] font-bold font-mono flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                        <span>AFTER (REPAIRED) • 14:15 PM</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-400 font-bold">
                        GEO-FENCE: 100% MATCH
                      </div>
                    </div>
                  </div>

                  {/* Citizen Verification Rating Bar */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-white font-bold">Citizen Verified: Aarav M.</span>
                      <span className="text-slate-400 text-[11px] hidden sm:inline">
                        — "Fixed same day in under 4 hours!"
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">
                      TAT: 3h 33m (SLA Met)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCENE 5: Super Admin Citywide Command Center (0:24 - 0:30)                */}
            {/* ========================================================================= */}
            {time >= 24 && (
              <div className="relative w-full h-full flex items-center justify-center p-2 animate-in fade-in duration-300">
                <div className="w-full max-w-3xl bg-[#041015] border border-purple-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
                  {/* Cockpit Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Super Admin Citywide Governance Cockpit
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Cross-department KPIs, AI Routing Rules & Tamper-Proof Audit Trail
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                      LIVE CITY TELEMETRY
                    </span>
                  </div>

                  {/* 4 Large Realtime KPI Counters */}
                  <div className="grid grid-cols-4 gap-2.5 my-3 text-center">
                    <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-xl font-black text-emerald-400">1,248</div>
                      <div className="text-[9px] text-slate-400 font-mono">RESOLVED TODAY</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-xl font-black text-cyan-400">95.4%</div>
                      <div className="text-[9px] text-slate-400 font-mono">SLA COMPLIANCE</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-xl font-black text-blue-400">&lt; 3.8h</div>
                      <div className="text-[9px] text-slate-400 font-mono">AVG RESOLUTION</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-xl font-black text-purple-400">100%</div>
                      <div className="text-[9px] text-slate-400 font-mono">AUDIT VERIFIED</div>
                    </div>
                  </div>

                  {/* Immutable SHA-256 Audit Log Ticker */}
                  <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-[10px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/60">
                      <span className="flex items-center space-x-1.5 text-purple-300 font-bold">
                        <Hash className="w-3 h-3" />
                        <span>TAMPER-PROOF AUDIT TRAIL (CRYPTOGRAPHIC SHA-256)</span>
                      </span>
                      <span className="text-emerald-400">● REALTIME STREAM</span>
                    </div>
                    <div className="text-slate-300 truncate">
                      [14:15:22] TICKET #UE-8941 • PWD RESOLVED • CITIZEN VERIFIED (5★) • SHA-256: 8f9b...a1c3
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subtitle Narration Bar at the Bottom of Every Scene */}
            <div className="absolute bottom-3 inset-x-4 text-center z-20 pointer-events-none">
              <div
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/90 backdrop-blur-md text-xs sm:text-sm font-medium shadow-2xl border"
                style={{
                  borderColor: `${currentChapter.color}50`,
                  color: currentChapter.color
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: currentChapter.color }}
                />
                <span className="text-slate-200">
                  <strong style={{ color: currentChapter.color }}>{currentChapter.title}:</strong>{' '}
                  {currentChapter.desc}
                </span>
              </div>
            </div>

            {/* Replay Screen overlay when 30s completes */}
            {time >= TOTAL_DURATION && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-3 shadow-xl shadow-emerald-950/60">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white mb-1.5">
                  Urban Eye 30s Demonstration Complete
                </h3>
                <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
                  From instant citizen mobile capture to YOLOv8 AI detection, automated municipal routing, and dual verified resolution — ready for modern city governance.
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
                    <span>Replay (30s)</span>
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
          <div className="px-4 py-2.5 bg-[#04090E] border-t border-slate-800 flex flex-col space-y-2 z-20 shrink-0">
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
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handlePlayPause}
                  className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                  title={playing ? 'Pause' : 'Play'}
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={() => setTime((t) => Math.max(0, t - 5))}
                  className="px-2 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                >
                  -5s
                </button>

                <button
                  onClick={() => setTime((t) => Math.min(TOTAL_DURATION, t + 5))}
                  className="px-2 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                >
                  +5s
                </button>

                <div className="font-mono text-slate-400 text-xs pl-2">
                  <span className="text-white font-bold">{formatSecs(time)}</span>
                  <span className="text-slate-600"> / 00:30</span>
                </div>
              </div>

              {/* Center: 5 Chapter Buttons */}
              <div className="hidden sm:flex items-center space-x-1.5">
                {CHAPTERS.map((chap) => {
                  const isActive = time >= chap.start && time < chap.end;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => jumpTo(chap.start)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
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
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-0.5 bg-slate-850 rounded-lg p-0.5">
                  {[1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                        speed === s ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <div
                  className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-mono"
                  title="Silent demo walkthrough without voice"
                >
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">NO AUDIO</span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
