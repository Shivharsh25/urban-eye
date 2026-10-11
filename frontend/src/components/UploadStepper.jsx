import React from 'react';
import { 
  UploadCloud, 
  Cpu, 
  MapPin, 
  Layers, 
  Building2, 
  Send, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const STAGES = [
  { id: 'received', label: 'Image Ingestion', icon: UploadCloud, desc: 'Compression & EXIF check' },
  { id: 'detecting', label: 'AI Detection', icon: Cpu, desc: 'Object detection inference' },
  { id: 'geo-tagging', label: 'Geo-Tagging', icon: MapPin, desc: 'GPS & address resolution' },
  { id: 'duplicate-check', label: 'Deduplication', icon: Layers, desc: '50m geospatial clustering' },
  { id: 'routing', label: 'Dept Routing', icon: Building2, desc: 'Work order formulation' },
  { id: 'dispatched', label: 'Auto Dispatch', icon: Send, desc: 'Verified email dispatch' }
];

export default function UploadStepper({ currentStage, progressData, error }) {
  const getStageIndex = (stageId) => {
    return STAGES.findIndex((s) => s.id === stageId);
  };

  const activeIndex = currentStage ? getStageIndex(currentStage) : 0;
  const isComplete = currentStage === 'dispatched' || currentStage === 'completed';

  return (
    <div className="w-full bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl glass-panel relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </div>
          <div>
            <h4 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <span>{isComplete ? 'Report Dispatched & Confirmed' : 'Processing Your Report...'}</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Automated multi-stage AI triage, geospatial clustering & municipal routing
            </p>
          </div>
        </div>
        {progressData && (
          <div className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold font-mono flex items-center space-x-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Step {Math.min(6, (progressData.step || 1))} of 6</span>
          </div>
        )}
      </div>

      {/* Stepper Milestones Grid (Guaranteed no overflow) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-6 relative z-10">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = isComplete || idx < activeIndex;
          const isCurrent = !isComplete && idx === activeIndex;

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col p-3 rounded-2xl border min-w-0 overflow-hidden transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isCurrent
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                  : 'bg-stone-800/40 border-stone-700/60 text-stone-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-cyan-500 text-stone-950 font-bold'
                      : 'bg-stone-700/60 text-stone-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold opacity-60">0{idx + 1}</span>
              </div>

              <div className="min-w-0 overflow-hidden">
                <span className="text-xs font-bold tracking-tight block truncate text-stone-200" title={stage.label}>
                  {stage.label}
                </span>
                <span className="text-[10px] text-stone-400 block truncate mt-0.5" title={stage.desc}>
                  {stage.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Real-Time Status Log Message */}
      <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/90 flex items-start space-x-3.5 relative z-10 shadow-inner">
        {error ? (
          <>
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-rose-300 font-mono">PIPELINE ERROR</p>
              <p className="text-xs text-rose-400 mt-0.5">{error}</p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-0.5">
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold font-mono text-cyan-300">
                  {isComplete ? 'DISPATCH CONFIRMED' : 'EXECUTING PHASE'}
                </p>
                {progressData?.timestamp && (
                  <span className="text-[10px] text-stone-500 font-mono">
                    {new Date(progressData.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 mt-0.5 font-medium truncate">
                {progressData?.message || 'Processing input stream...'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
