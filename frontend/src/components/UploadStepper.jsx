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

  const isNoIssue = currentStage === 'no_issue' || 
    progressData?.details?.detected === false || 
    Boolean(progressData?.message?.toLowerCase().includes('no municipal issue'));
  const activeIndex = currentStage ? getStageIndex(currentStage) : 0;
  const isComplete = currentStage === 'dispatched' || currentStage === 'completed' || isNoIssue;

  return (
    <div className="w-full max-w-full min-w-0 bg-white border border-[#E8E2E5] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs relative overflow-hidden box-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#E8E2E5] relative z-10 w-full min-w-0">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69] shrink-0">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            ) : (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold text-[#191636] flex items-center gap-1.5 truncate">
              <span>
                {isNoIssue
                  ? 'AI Scan Complete: Clear'
                  : isComplete 
                  ? 'Report Dispatched & Confirmed' 
                  : 'Processing Your Report...'}
              </span>
            </h4>
            <p className="text-[11px] sm:text-xs text-[#57536E] mt-0.5 line-clamp-1">
              {isNoIssue 
                ? 'Image analyzed. Public areas verified clear.'
                : 'Automated multi-stage AI triage, geospatial clustering & routing'}
            </p>
          </div>
        </div>
        {progressData && (
          <div className="self-start sm:self-auto px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] text-[11px] sm:text-xs font-semibold font-mono flex items-center space-x-2 shadow-xs shrink-0">
            <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-600' : 'bg-[#302B69] animate-pulse'}`}></span>
            <span>{isNoIssue ? 'Verified Clear' : `Step ${Math.min(6, (progressData.step || 1))} of 6`}</span>
          </div>
        )}
      </div>

      {/* Stepper Milestones Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6 relative z-10 w-full min-w-0">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = isComplete || idx < activeIndex;
          const isCurrent = !isComplete && idx === activeIndex;

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border min-w-0 overflow-hidden transition-all duration-300 box-border ${
                isDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : isCurrent
                  ? 'bg-[#F6F6FC] border-[#302B69] text-[#302B69] shadow-xs ring-1 ring-[#302B69]/30'
                  : 'bg-white border-[#E8E2E5] text-[#8C87A6]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                      ? 'bg-[#302B69] text-white font-bold'
                      : 'bg-[#F6F6FC] text-[#8C87A6]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold opacity-60">0{idx + 1}</span>
              </div>

              <div className="min-w-0 overflow-hidden">
                <span className="text-[11px] sm:text-xs font-bold tracking-tight block truncate text-[#191636]" title={stage.label}>
                  {stage.label}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#57536E] block truncate mt-0.5" title={stage.desc}>
                  {stage.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Real-Time Status Log Message */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-start space-x-2.5 sm:space-x-3.5 relative z-10 w-full min-w-0 overflow-hidden box-border">
        {error ? (
          <>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-bold text-rose-700 font-mono">PIPELINE ERROR</p>
              <p className="text-[11px] sm:text-xs text-rose-600 mt-0.5 break-words">{error}</p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-0.5 shrink-0">
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 text-[#302B69] animate-spin shrink-0" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] sm:text-xs font-bold font-mono text-[#302B69] truncate">
                  {isNoIssue ? 'ANALYSIS COMPLETE' : isComplete ? 'DISPATCH CONFIRMED' : 'EXECUTING PHASE'}
                </p>
                {progressData?.timestamp && (
                  <span className="text-[9px] sm:text-[10px] text-[#57536E] font-mono shrink-0">
                    {new Date(progressData.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#191636] mt-0.5 font-medium truncate">
                {progressData?.message || (isNoIssue ? 'No municipal issue detected in this image.' : 'Processing input stream...')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
