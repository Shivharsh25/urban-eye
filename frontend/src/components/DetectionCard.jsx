import React from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Building2, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { generateReportPDF } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';

export default function DetectionCard({ detection, onInspect, showReporterCount = true }) {
  const { t } = useLanguage();
  if (!detection) return null;

  const severityStyles = {
    high: 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold',
    critical: 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/90 font-bold',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 font-bold'
  };

  const statusStyles = {
    new: 'bg-blue-50 text-blue-700 border-blue-200/90 font-bold',
    assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200/90 font-bold',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200/90 font-bold',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 font-bold'
  };

  const typeLabels = {
    pothole: t('pothole', 'Pothole / Road Hazard'),
    garbage: t('garbage', 'Sanitation / Waste Overflow'),
    water_leak: t('waterLeak', 'Water Pipe Rupture'),
    streetlight: t('streetlight', 'Streetlight Outage')
  };

  const rawSev = detection.severity || '50%';
  const sevNum = parseInt(rawSev);
  let severityTier = 'medium';
  let severityDisplay = rawSev;

  if (!isNaN(sevNum)) {
    severityDisplay = `${sevNum}%`;
    if (sevNum >= 70) severityTier = 'high';
    else if (sevNum >= 40) severityTier = 'medium';
    else severityTier = 'low';
  } else {
    severityTier = String(rawSev).toLowerCase();
    severityDisplay = severityTier.toUpperCase();
  }

  const statusKey = (detection.status || 'new').toLowerCase();

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/${url}`;
  };

  const imgUrl = resolveImageUrl(detection.imageUrl);

  return (
    <div 
      onClick={() => onInspect && onInspect(detection)}
      className="bento-card p-4 group flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-all duration-200 bg-white"
    >
      <div>
        {/* Card Header Media */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3.5 border border-slate-200/80">
          {imgUrl ? (
            <img 
              src={imgUrl} 
              alt={detection.type} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1.5 p-4 text-center">
              <FileText className="w-6 h-6 text-slate-300" />
              <span className="text-xs font-semibold text-slate-500">AI Telemetry Tag</span>
            </div>
          )}

          {/* Severity Badge overlay in Percentage Form */}
          <div className="absolute top-2.5 right-2.5">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border shadow-xs backdrop-blur-md flex items-center gap-1 ${severityStyles[severityTier] || severityStyles.medium}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {severityDisplay}
            </span>
          </div>

          {/* Status Badge overlay */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md shadow-xs ${statusStyles[statusKey] || statusStyles.new}`}>
              {t(statusKey, statusKey.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Issue Type & Ref */}
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 font-display group-hover:text-blue-600 transition-colors truncate">
            {typeLabels[detection.type] || detection.type}
          </h4>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
            #{detection.id || detection._id}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-1.5 text-xs text-slate-600 mb-3">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{detection.address || `${detection.lat?.toFixed?.(4) || detection.lat}, ${detection.lng?.toFixed?.(4) || detection.lng}`}</span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
        
        {/* Reporter count & Department */}
        <div className="flex items-center space-x-3 min-w-0">
          {showReporterCount && (
            <div className="flex items-center space-x-1 text-slate-700 shrink-0">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold">{detection.reportCount || 1}</span>
              <span className="text-[10px] text-slate-500">
                {(detection.reportCount || 1) > 1 ? 'reports' : 'report'}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-1 text-slate-600 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-[11px] font-medium">{detection.assignedDepartment || 'Municipal Ops'}</span>
          </div>
        </div>

        {/* PDF Download Button */}
        <button 
          type="button"
          title="Download Verified PDF Dispatch Brief"
          onClick={(e) => {
            e.stopPropagation();
            generateReportPDF(detection);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-all shrink-0 cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">PDF</span>
        </button>
      </div>
    </div>
  );
}
