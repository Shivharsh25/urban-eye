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
      className="group relative bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] hover:border-[#302B69]/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Card Header & Image */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F6F6FC] mb-3.5 border border-[#E8E2E5]">
          {detection.imageUrl ? (
            <img 
              src={detection.imageUrl.startsWith('http') ? detection.imageUrl : `https://urban-eye-wi2j.onrender.com${detection.imageUrl}`} 
              alt={detection.type} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8C87A6] font-mono text-xs">
              {t('noImageCaptured')}
            </div>
          )}

          {/* Severity Badge overlay */}
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border border-[#E8E2E5] bg-white text-[#302B69] shadow-xs">
              {detection.severity?.includes('%') ? detection.severity : t(severityKey, detection.severity)}
            </span>
          </div>

          {/* Status Badge overlay */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#E8E2E5] bg-[#F6F6FC] text-[#191636] shadow-xs">
              {t(statusKey, detection.status)}
            </span>
          </div>
        </div>

        {/* Issue Type & Ref */}
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-base font-bold text-[#191636] group-hover:text-[#302B69] transition-colors capitalize">
            {typeLabels[detection.type] || detection.type}
          </h4>
          <span className="text-[10px] font-mono text-[#8C87A6] font-semibold">
            #{detection.id || detection._id}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-1.5 text-xs text-[#57536E] font-medium mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#302B69] shrink-0 mt-0.5" />
          <span className="line-clamp-1">{detection.address || `${detection.lat}, ${detection.lng}`}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#E8E2E5] flex items-center justify-between text-xs">
        
        {/* Reporter count & Department */}
        <div className="flex items-center space-x-3">
          {showReporterCount && (
            <div className="flex items-center space-x-1 text-[#191636] font-mono">
              <Users className="w-3.5 h-3.5 text-[#302B69]" />
              <span className="font-bold">{detection.reportCount || 1}</span>
              <span className="text-[10px] text-[#57536E] font-medium">
                {detection.reportCount > 1 ? t('reportsCount') : t('reportSingle')}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-1 text-[#57536E] truncate max-w-[130px]">
            <Building2 className="w-3.5 h-3.5 text-[#8C87A6] shrink-0" />
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
            className="p-1 rounded-lg text-[#57536E] hover:text-[#302B69] hover:bg-[#F6F6FC] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            className="text-xs font-semibold text-[#302B69] group-hover:text-[#242052] flex items-center space-x-1"
          >
            <span>{t('viewCard')}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
