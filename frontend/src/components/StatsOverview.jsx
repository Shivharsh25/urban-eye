import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  AlertTriangle,
  Droplets, 
  Trash2, 
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const {
    totalReports = 0,
    totalIncidents = 0,
    statusCounts = { new: 0, assigned: 0, resolved: 0, escalated: 0 },
    bySeverity = { high: 0, medium: 0, low: 0 },
    byType = { pothole: 0, garbage: 0, water_leak: 0, streetlight: 0 }
  } = stats;

  const resolutionRate = totalReports > 0 
    ? Math.round(((statusCounts.resolved || 0) / totalReports) * 100) 
    : 0;

  const kpis = [
    {
      title: 'Active Issues',
      value: totalReports,
      subtitle: `${totalIncidents} citizen reports logged`,
      badge: 'LIVE TELEMETRY',
      icon: Layers,
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      iconBg: 'bg-blue-50 border-blue-200/80 text-blue-600',
      barColor: 'bg-blue-600',
      progress: 100
    },
    {
      title: 'Critical Severity',
      value: bySeverity.high || 0,
      subtitle: 'Immediate dispatch required',
      badge: `${totalReports > 0 ? Math.round(((bySeverity.high || 0) / totalReports) * 100) : 0}% OF TOTAL`,
      icon: AlertTriangle,
      textColor: 'text-rose-700',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      iconBg: 'bg-rose-50 border-rose-200/80 text-rose-600',
      barColor: 'bg-rose-600',
      progress: totalReports > 0 ? ((bySeverity.high || 0) / totalReports) * 100 : 0
    },
    {
      title: 'In Active Triage',
      value: statusCounts.assigned || 0,
      subtitle: 'Field contractors en-route',
      badge: `${totalReports > 0 ? Math.round(((statusCounts.assigned || 0) / totalReports) * 100) : 0}% ASSIGNED`,
      icon: Clock,
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      iconBg: 'bg-amber-50 border-amber-200/80 text-amber-600',
      barColor: 'bg-amber-500',
      progress: totalReports > 0 ? ((statusCounts.assigned || 0) / totalReports) * 100 : 0
    },
    {
      title: 'Resolved Defects',
      value: statusCounts.resolved || 0,
      subtitle: 'Geo-verified by city crews',
      badge: `${resolutionRate}% RATE`,
      icon: CheckCircle2,
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconBg: 'bg-emerald-50 border-emerald-200/80 text-emerald-600',
      barColor: 'bg-emerald-600',
      progress: resolutionRate
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top 4 Precision Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bento-card p-5 relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                    <div className="mt-1.5">
                      <h4 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight tabular-nums">
                        {stat.value}
                      </h4>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${stat.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Progress & Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
                  <span className="text-slate-500 truncate max-w-[170px]">{stat.subtitle}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${stat.badgeBg}`}>
                    {stat.badge}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`${stat.barColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(Math.max(stat.progress, 6), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Category Metrics Bar */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Potholes */}
        <div className="bento-card p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Road Hazards</p>
              <p className="text-lg font-extrabold text-slate-900 font-display tabular-nums">{byType.pothole || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
            Roads
          </span>
        </div>

        {/* Garbage */}
        <div className="bento-card p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Sanitation</p>
              <p className="text-lg font-extrabold text-slate-900 font-display tabular-nums">{byType.garbage || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Waste
          </span>
        </div>

      </div>
    </div>
  );
}
