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
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 shadow-2xl glass-panel relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-base font-bold text-slate-100">
              Processing your report...
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            We are tracking the progress of your submission
          </p>
        </div>
        {progressData && (
          <div className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold">
            Step {Math.min(6, (progressData.step || 1))} of 6
          </div>
        )}
      </div>

      {/* Stepper Milestones */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = isComplete || idx < activeIndex;
          const isCurrent = !isComplete && idx === activeIndex;

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col p-3 rounded-xl border transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : isCurrent
                  ? 'bg-sky-500/10 border-sky-400 text-sky-400 shadow-sm shadow-sky-500/10'
                  : 'bg-slate-800/40 border-slate-700 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : isCurrent
                      ? 'bg-sky-500 text-slate-900'
                      : 'bg-slate-700 text-slate-400'
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

              <span className="text-xs font-bold tracking-tight">{stage.label}</span>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">{stage.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Current Real-Time Status Log Message */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3">
        {error ? (
          <>
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
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
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(progressData.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                {progressData?.message || 'Processing input stream...'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
