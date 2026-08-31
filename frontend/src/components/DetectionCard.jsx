import React from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Building2, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Flame 
} from 'lucide-react';

export default function DetectionCard({ detection, onInspect, showReporterCount = true }) {
  if (!detection) return null;

  const severityStyles = {
    high: 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-red',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-emerald'
  };

  const statusStyles = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    assigned: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  const typeLabels = {
    pothole: 'Road Pothole',
    garbage: 'Garbage Dumping',
    water_leak: 'Water Leakage',
    streetlight: 'Faulty Streetlight'
  };

  return (
    <div 
      onClick={() => onInspect && onInspect(detection)}
      className="group relative bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
    >
      <div>
        {/* Card Header & Image */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3.5 border border-slate-800/80">
          {detection.imageUrl ? (
            <img 
              src={detection.imageUrl.startsWith('http') ? detection.imageUrl : `https://urban-eye-wi2j.onrender.com${detection.imageUrl}`} 
              alt={detection.type} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
              NO IMAGE CAPTURED
            </div>
          )}

          {/* Severity Badge overlay */}
          <div className="absolute top-2.5 right-2.5">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase font-mono tracking-wider border shadow-md ${severityStyles[detection.severity] || severityStyles.medium}`}>
              {detection.severity}
            </span>
          </div>

          {/* Status Badge overlay */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusStyles[detection.status] || statusStyles.new}`}>
              {detection.status}
            </span>
          </div>
        </div>

        {/* Issue Type & Ref */}
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            {typeLabels[detection.type] || detection.type}
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            #{detection.id || detection._id}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-1.5 text-xs text-slate-400 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{detection.address || `${detection.lat}, ${detection.lng}`}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        
        {/* Reporter count & Department */}
        <div className="flex items-center space-x-3">
          {showReporterCount && (
            <div className="flex items-center space-x-1 text-slate-300 font-mono">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">{detection.reportCount || 1}</span>
              <span className="text-[10px] text-slate-400">report{detection.reportCount > 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="flex items-center space-x-1 text-slate-400 truncate max-w-[130px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-[11px]">{detection.assignedDepartment || 'Municipal Ops'}</span>
          </div>
        </div>

        <button 
          type="button"
          className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center space-x-1"
        >
          <span>View</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
}
