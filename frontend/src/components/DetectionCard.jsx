import React from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Building2, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Flame,
  Download
} from 'lucide-react';
import { generateReportPDF } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';

export default function DetectionCard({ detection, onInspect, showReporterCount = true }) {
  const { t } = useLanguage();
  if (!detection) return null;

  const severityStyles = {
    high: 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-red',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-emerald'
  };

  const getSeverityBadgeClass = (sev) => {
    if (!sev) return severityStyles.medium;
    if (typeof sev === 'string' && sev.includes('%')) {
      const val = parseInt(sev, 10);
      if (val >= 70) return severityStyles.high;
      if (val >= 40) return severityStyles.medium;
      return severityStyles.low;
    }
    const k = String(sev).toLowerCase();
    return severityStyles[k] || severityStyles.medium;
  };

  const statusStyles = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    assigned: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  const typeLabels = {
    pothole: t('pothole'),
    garbage: t('garbage'),
    water_leak: t('waterLeak'),
    streetlight: t('streetlight')
  };

  const severityKey = (detection.severity || 'medium').toLowerCase();
  const statusKey = (detection.status || 'reported').toLowerCase();

  return (
    <div 
      onClick={() => onInspect && onInspect(detection)}
      className="group relative bg-white/95 hover:bg-white border border-[#EAE7DD] hover:border-[#99775C]/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Card Header & Image */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#FAF9F5] mb-3.5 border border-[#EAE7DD]">
          {detection.imageUrl ? (
            <img 
              src={detection.imageUrl.startsWith('http') ? detection.imageUrl : `https://urban-eye-wi2j.onrender.com${detection.imageUrl}`} 
              alt={detection.type} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              {t('noImageCaptured')}
            </div>
          )}

          {/* Severity Badge overlay */}
          <div className="absolute top-2.5 right-2.5">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase font-mono tracking-wider border shadow-xs ${getSeverityBadgeClass(detection.severity)}`}>
              {detection.severity?.includes('%') ? detection.severity : t(severityKey, detection.severity)}
            </span>
          </div>

          {/* Status Badge overlay */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusStyles[detection.status] || statusStyles.new}`}>
              {t(statusKey, detection.status)}
            </span>
          </div>
        </div>

        {/* Issue Type & Ref */}
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#99775C] transition-colors capitalize">
            {typeLabels[detection.type] || detection.type}
          </h4>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            #{detection.id || detection._id}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-1.5 text-xs text-slate-700 font-medium mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#99775C] shrink-0 mt-0.5" />
          <span className="line-clamp-1">{detection.address || `${detection.lat}, ${detection.lng}`}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#EAE7DD] flex items-center justify-between text-xs">
        
        {/* Reporter count & Department */}
        <div className="flex items-center space-x-3">
          {showReporterCount && (
            <div className="flex items-center space-x-1 text-slate-700 font-mono">
              <Users className="w-3.5 h-3.5 text-[#99775C]" />
              <span className="font-bold">{detection.reportCount || 1}</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {detection.reportCount > 1 ? t('reportsCount') : t('reportSingle')}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-1 text-slate-600 truncate max-w-[130px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-[11px] font-medium">{detection.assignedDepartment || 'Municipal Ops'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            type="button"
            title="Download PDF Report"
            onClick={(e) => {
              e.stopPropagation();
              generateReportPDF(detection);
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-[#99775C] hover:bg-slate-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            className="text-xs font-semibold text-[#99775C] group-hover:text-[#6B503B] flex items-center space-x-1"
          >
            <span>{t('viewCard')}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
