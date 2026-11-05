import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  VolumeX,
  Volume2,
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
  Download,
  Building2,
  Truck,
  Eye,
  Check,
  Smartphone,
  ChevronRight
} from 'lucide-react';

const DURATION = 30; // 30 seconds total demo

const SCENES = [
  {
    id: 1,
    title: "1. Citizen Report & Geotag",
    shortTitle: "Citizen Report",
    start: 0,
    end: 6,
    badge: "STEP 1: CAPTURE",
    color: "#00E5FF",
    desc: "Citizen snaps photo with GPS coordinates & issue description"
  },
  {
    id: 2,
    title: "2. YOLOv8 AI Auto-Detection",
    shortTitle: "AI Vision Triage",
    start: 6,
    end: 12,
    badge: "STEP 2: AI RECOGNITION",
    color: "#10B981",
    desc: "Computer vision classifies hazard, severity & eliminates duplicates"
  },
  {
    id: 3,
    title: "3. Autonomous Dept Routing",
    shortTitle: "Smart Dispatch",
    start: 12,
    end: 18,
    badge: "STEP 3: DEPT ROUTING",
    color: "#3B82F6",
    desc: "Auto-routes ticket to PWD / Sanitation with SLA countdown"
  },
  {
    id: 4,
    title: "4. Field Action & Dual Proof",
    shortTitle: "Field Resolution",
    start: 18,
    end: 24,
    badge: "STEP 4: FIELD RESOLUTION",
    color: "#F59E0B",
    desc: "Field crew uploads geo-verified Before/After repair proof"
  },
  {
    id: 5,
    title: "5. Super Admin City Intelligence",
    shortTitle: "City Analytics",
    start: 24,
    end: 30,
    badge: "STEP 5: OVERSIGHT",
    color: "#8B5CF6",
    desc: "Citywide GIS heatmap, SLA monitoring & immutable audit trail"
  }
];

export default function DemoVideoPlayer({ onClose, onLaunchPortal }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const imagesRef = useRef({});

  // Preload key images for canvas drawing
  useEffect(() => {
    const urls = {
      pothole: '/usecase-pothole.jpg?v=3',
      garbage: '/usecase-garbage.jpg?v=3',
      city: '/hero-city-full.jpg',
      streetlight: '/usecase-streetlight.jpg?v=3'
    };

    Object.entries(urls).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        imagesRef.current[key] = img;
      };
    });
  }, []);

  // Main playback loop
  useEffect(() => {
    lastTimeRef.current = performance.now();

    const tick = (now) => {
      if (isPlaying) {
        const delta = (now - lastTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          const next = prev + delta * playbackRate;
          if (next >= DURATION) {
            setIsPlaying(false);
            return DURATION;
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, playbackRate]);

  // Current active scene
  const currentScene = SCENES.find((s) => currentTime >= s.start && currentTime < s.end) || SCENES[SCENES.length - 1];
  const progressPercent = Math.min(100, (currentTime / DURATION) * 100);

  const handlePlayPause = () => {
    if (currentTime >= DURATION) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(ratio * DURATION);
  };

  const handleJumpToScene = (start) => {
    setCurrentTime(start);
    setIsPlaying(true);
  };

  const formatTime = (seconds) => {
    const s = Math.floor(seconds);
    const ms = Math.floor((seconds - s) * 10);
    const secs = s < 10 ? `0${s}` : `${s}`;
    return `00:${secs}`;
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 3));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(DURATION, t + 3));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="bg-[#051317] rounded-3xl overflow-hidden max-w-5xl w-full border border-teal-900/60 shadow-2xl flex flex-col relative text-white"
        style={{ maxHeight: '94vh' }}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#031013]/90 border-b border-teal-950 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-wide text-white">
                  Urban Eye — Complete Platform Demo
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  30s SILENT WALKTHROUGH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Auto-detection, municipal triage, field resolution & audit trails
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Canvas Stage (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full bg-[#020b0e] overflow-hidden select-none flex items-center justify-center group">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #00E5FF 1px, transparent 1px), linear-gradient(to bottom, #00E5FF 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* SCENE 1: Citizen Report (0s - 6s) */}
          {currentTime >= 0 && currentTime < 6 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src="/hero-city-full.jpg"
                  alt="City"
                  className="w-full h-full object-cover filter brightness-[0.25] blur-xs scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020b0e] via-[#020b0e]/70 to-transparent" />
              </div>

              {/* Simulated Mobile Mockup */}
              <div className="relative z-10 max-w-sm w-full bg-slate-900/90 border border-teal-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px]">
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-mono">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>CITIZEN MOBILE PORTAL</span>
                  </span>
                  <span className="text-slate-400 font-mono">10:42 AM</span>
                </div>

                <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-700 aspect-4/3 bg-slate-950">
                  <img
                    src="/usecase-pothole.jpg?v=3"
                    alt="Pothole capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>GPS LOCKED: ± 1.2m</span>
                  </div>
                  <div className="absolute bottom-2 inset-x-2 p-2 rounded-lg bg-black/80 backdrop-blur-xs text-[10px] text-slate-300 font-mono">
                    📍 Ring Road Outer, Sector 4 • PWD Jurisdiction
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Pothole & Surface Damage</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Pending AI Scan
                    </span>
                  </div>
                  <div className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-lg shadow-emerald-950/50">
                    <span>Submitting to Urban Eye AI Engine</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Live Overlay Subtitle */}
              <div className="absolute bottom-6 inset-x-6 text-center z-20 pointer-events-none">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-teal-500/30 text-xs sm:text-sm text-teal-200 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>
                    <strong>Step 1:</strong> Citizen snaps photo with verified GPS location & timestamps.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 2: YOLOv8 AI Detection (6s - 12s) */}
          {currentTime >= 6 && currentTime < 12 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10 animate-in fade-in duration-300">
              <div className="relative w-full max-w-2xl aspect-16/9 rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-black">
                <img
                  src="/usecase-pothole.jpg?v=3"
                  alt="AI scanning"
                  className="w-full h-full object-cover filter brightness-90"
                />

                {/* Laser Scanning Grid Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '100% 8px'
                  }}
                />

                {/* Sweeping Laser Line */}
                <div
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_15px_#00E5FF]"
                  style={{
                    top: `${((currentTime - 6) / 6) * 100}%`,
                    transition: 'top 0.1s linear'
                  }}
                />

                {/* Animated AI Bounding Box */}
                <div
                  className="absolute border-2 border-emerald-400 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-pulse"
                  style={{
                    top: '28%',
                    left: '22%',
                    width: '46%',
                    height: '52%'
                  }}
                >
                  {/* Bounding Box Corner Reticles */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

                  {/* AI Prediction Tag */}
                  <div className="absolute -top-7 left-0 px-2.5 py-1 rounded bg-black/90 border border-emerald-400 text-emerald-400 font-mono text-[10px] font-bold flex items-center space-x-1.5 shadow-lg">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>YOLOv8: POTHOLE (94.6%)</span>
                    <span className="text-amber-400">| HIGH RISK</span>
                  </div>
                </div>

                {/* Telemetry HUD Panel */}
                <div className="absolute bottom-3 left-3 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-teal-900/80 font-mono text-[10px] space-y-1 text-slate-300">
                  <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>INFERENCE COMPLETED: 142ms</span>
                  </div>
                  <div>• Triage: PWD Road Infrastructure</div>
                  <div>• Estimated Depth: ~14.5 cm</div>
                  <div>• Spatial Deduplication: 0 Duplicates</div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="absolute bottom-6 inset-x-6 text-center z-20 pointer-events-none">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 shadow-xl">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Step 2:</strong> YOLOv8 AI vision classifies defect, severity & verifies zero duplicates.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 3: Autonomous Dept Routing (12s - 18s) */}
          {currentTime >= 12 && currentTime < 18 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
              <div className="w-full max-w-3xl bg-slate-900/95 border border-blue-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        Autonomous Department Triage Dispatch
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Assigned based on AI classification & municipal geo-fencing
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-xs font-bold">
                    AUTO-DISPATCHED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400">PRIMARY DEPT</span>
                    <div className="font-bold text-white text-sm">Roads & PWD</div>
                    <p className="text-slate-400 text-[11px]">
                      Central Bitumen & Surface Repair Unit #4
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400">SLA TARGET</span>
                    <div className="font-bold text-amber-400 text-sm flex items-center space-x-1.5">
                      <Clock className="w-4 h-4" />
                      <span>48h SLA Active</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Countdown started: 47h 58m remaining
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400">CREW NOTIFICATION</span>
                    <div className="font-bold text-emerald-400 text-sm flex items-center space-x-1.5">
                      <Truck className="w-4 h-4" />
                      <span>Dispatched via Fleet GPS</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Mobile crew acknowledged assignment
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-between text-xs font-mono text-blue-200">
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>Citizen Notification Dispatched via SMS & Push</span>
                  </span>
                  <span>TICKET #UE-2026-8941</span>
                </div>
              </div>

              {/* Subtitle */}
              <div className="absolute bottom-6 inset-x-6 text-center z-20 pointer-events-none">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-blue-500/30 text-xs sm:text-sm text-blue-200 shadow-xl">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>
                    <strong>Step 3:</strong> Rule engine automatically routes to the right municipal department without manual delay.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 4: Field Resolution & Dual Verification (18s - 24s) */}
          {currentTime >= 18 && currentTime < 24 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10 animate-in fade-in duration-300">
              <div className="w-full max-w-3xl bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        Dual Resolution Verification
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Before / After photographic evidence confirmed by field supervisor & citizen
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>RESOLVED ON-SITE</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 aspect-video bg-black">
                    <img
                      src="/usecase-pothole.jpg?v=3"
                      alt="Before repair"
                      className="w-full h-full object-cover filter brightness-90"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 font-mono text-[10px] font-bold">
                      BEFORE • 10:42 AM
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 aspect-video bg-slate-950">
                    <img
                      src="/hero-city-full.jpg"
                      alt="Repaired road"
                      className="w-full h-full object-cover filter brightness-110"
                    />
                    <div className="absolute inset-0 bg-emerald-950/30" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-800/90 text-emerald-100 font-mono text-[10px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <span>AFTER (BITUMEN APPLIED) • 14:15 PM</span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-emerald-400">
                      GEO-FENCE: VERIFIED MATCH
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Citizen Aarav M. approved resolution (Rating: ★★★★★)</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">Total Time: 3h 33m</span>
                </div>
              </div>

              {/* Subtitle */}
              <div className="absolute bottom-6 inset-x-6 text-center z-20 pointer-events-none">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 shadow-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Step 4:</strong> Field team uploads photo proof; citizen approves resolution with rating.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 5: Super Admin City Intelligence (24s - 30s) */}
          {currentTime >= 24 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10 animate-in fade-in duration-300">
              <div className="w-full max-w-3xl bg-[#031519]/95 border border-purple-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        Super Admin City-Wide Governance Command
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Real-time cross-department telemetry & tamper-proof audit trails
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-xs font-bold">
                    SYSTEM HEALTH: 99.8%
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4 text-center">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xl font-black text-emerald-400">1,248</div>
                    <div className="text-[10px] text-slate-400 font-mono">RESOLVED TODAY</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xl font-black text-cyan-400">95.4%</div>
                    <div className="text-[10px] text-slate-400 font-mono">SLA COMPLIANCE</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xl font-black text-blue-400">&lt; 3.2h</div>
                    <div className="text-[10px] text-slate-400 font-mono">AVG DISPATCH</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xl font-black text-purple-400">100%</div>
                    <div className="text-[10px] text-slate-400 font-mono">AUDIT VERIFIED</div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>LIVE IMMUTABLE AUDIT LOG (SHA-256)</span>
                    <span className="text-emerald-400">● REALTIME STREAM</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    [14:15:22] REPORT #UE-8941 • PWD RESOLVED • DUAL VERIFIED • HASH: 8f9b...a1c3
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="absolute bottom-6 inset-x-6 text-center z-20 pointer-events-none">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-purple-500/30 text-xs sm:text-sm text-purple-200 shadow-xl">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>
                    <strong>Step 5:</strong> Super Admin monitors citywide metrics, AI routing & audit trail logs.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Replay Overlay on Completion */}
          {currentTime >= DURATION && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mb-4 shadow-xl shadow-emerald-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                Urban Eye 30s Demonstration Complete
              </h3>
              <p className="text-xs text-slate-300 max-w-md mb-6">
                From AI auto-detection to multi-department triage and dual-verified resolution — ready to deploy for modern cities.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setCurrentTime(0);
                    setIsPlaying(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay Demo (30s)</span>
                </button>
                <button
                  onClick={() => {
                    if (onLaunchPortal) onLaunchPortal();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <span>Launch Citizen Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div className="px-5 py-3.5 bg-[#031013] border-t border-teal-950 flex flex-col space-y-2.5 z-20">
          {/* Chapter Markers & Progress Scrubber */}
          <div className="relative w-full">
            {/* Clickable Progress Bar */}
            <div
              onClick={handleSeek}
              className="h-2 w-full bg-slate-800/80 rounded-full cursor-pointer relative overflow-hidden group"
            >
              {/* Progress Fill */}
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-75 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>

            {/* Chapter Dividers */}
            <div className="absolute inset-0 pointer-events-none flex justify-between">
              {SCENES.map((scene, i) => (
                <div
                  key={scene.id}
                  className="h-2 w-0.5 bg-black/60"
                  style={{ left: `${(scene.start / DURATION) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Lower Control Bar */}
          <div className="flex items-center justify-between text-xs">
            {/* Left Controls: Play/Pause, Rewind, Timecode */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="w-9 h-9 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentTime((t) => Math.max(0, t - 5))}
                className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-[10px] font-mono"
                title="Rewind 5s"
              >
                -5s
              </button>

              <button
                onClick={() => setCurrentTime((t) => Math.min(DURATION, t + 5))}
                className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-[10px] font-mono"
                title="Forward 5s"
              >
                +5s
              </button>

              <div className="font-mono text-slate-400 text-xs pl-2">
                <span className="text-white font-bold">{formatTime(currentTime)}</span>
                <span className="text-slate-600"> / 00:30</span>
              </div>
            </div>

            {/* Center Chapter Chips */}
            <div className="hidden md:flex items-center space-x-1.5">
              {SCENES.map((scene) => {
                const isActive = currentTime >= scene.start && currentTime < scene.end;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleJumpToScene(scene.start)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                        : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {scene.shortTitle}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Speed, Silent badge, Fullscreen */}
            <div className="flex items-center space-x-3">
              {/* Playback Speed */}
              <div className="flex items-center space-x-1 bg-slate-800/60 rounded-lg p-0.5">
                {[1, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      playbackRate === rate ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Silent Indicator */}
              <div
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800/60 text-slate-400 text-[10px] font-mono"
                title="Demo runs without voice/sound"
              >
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">NO AUDIO</span>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

