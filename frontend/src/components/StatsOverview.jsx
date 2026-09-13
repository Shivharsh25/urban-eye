import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  TrendingUp, 
  Zap, 
  Droplets, 
  Trash2, 
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Cpu
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

  const clusterSavings = totalIncidents > totalReports 
    ? Math.round(((totalIncidents - totalReports) / totalIncidents) * 100) 
    : 18;

  const kpis = [
    {
      title: 'Total Active Issues',
      value: totalReports,
      subtitle: `${totalIncidents} citizen submissions logged`,
      badge: 'LIVE TELEMETRY',
      icon: Layers,
      color: 'text-cyan-400',
      glow: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
      border: 'border-cyan-500/30',
      progress: 100,
      progressColor: 'from-cyan-500 to-sky-400'
    },
    {
      title: 'Critical Severity',
      value: bySeverity.high || 0,
      subtitle: 'Immediate municipal dispatch required',
      badge: `${totalReports > 0 ? Math.round(((bySeverity.high || 0) / totalReports) * 100) : 0}% of total`,
      icon: Flame,
      color: 'text-rose-400',
      glow: 'bg-rose-500/10 group-hover:bg-rose-500/20',
      border: 'border-rose-500/30',
      progress: totalReports > 0 ? ((bySeverity.high || 0) / totalReports) * 100 : 0,
      progressColor: 'from-rose-500 to-red-400'
    },
    {
      title: 'In Active Triage',
      value: statusCounts.assigned || 0,
      subtitle: 'Field contractors assigned & en-route',
      badge: `${totalReports > 0 ? Math.round(((statusCounts.assigned || 0) / totalReports) * 100) : 0}% active`,
      icon: Clock,
      color: 'text-amber-400',
      glow: 'bg-amber-500/10 group-hover:bg-amber-500/20',
      border: 'border-amber-500/30',
      progress: totalReports > 0 ? ((statusCounts.assigned || 0) / totalReports) * 100 : 0,
      progressColor: 'from-amber-500 to-yellow-400'
    },
    {
      title: 'Resolved Defects',
      value: statusCounts.resolved || 0,
      subtitle: 'Citizens notified & geo-verified',
      badge: `${resolutionRate}% completed`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
      border: 'border-emerald-500/30',
      progress: resolutionRate,
      progressColor: 'from-emerald-500 to-teal-400'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top 4 Premium Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="relative p-5 sm:p-6 rounded-3xl glass-card border border-slate-800/80 overflow-hidden group transition-all duration-300 hover:border-slate-700 shadow-xl bg-slate-900/40"
            >
              {/* Radial Blur Glow */}
              <div className={`absolute -right-6 -top-6 w-36 h-36 ${stat.glow} rounded-full blur-3xl transition-all duration-500 pointer-events-none`}></div>
              
              <div className="relative flex items-start justify-between z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <h4 className={`text-4xl font-black ${stat.color} tracking-tight drop-shadow-md`}>
                      {stat.value}
                    </h4>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-slate-900/90 border ${stat.border} shadow-lg shadow-black/40`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>

              {/* Progress Line Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 relative z-10">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400 truncate max-w-[180px]">{stat.subtitle}</span>
                  <span className={`font-mono font-bold ${stat.color}`}>{stat.badge}</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r ${stat.progressColor} h-full rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min(Math.max(stat.progress, 5), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Category Metrics & Municipal Health Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Potholes */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800/80 bg-slate-900/30 flex items-center justify-between group hover:border-sky-500/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Road Hazards</p>
              <p className="text-xl font-black text-white">{byType.pothole || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Roads
          </span>
        </div>

        {/* Garbage */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800/80 bg-slate-900/30 flex items-center justify-between group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Sanitation</p>
              <p className="text-xl font-black text-white">{byType.garbage || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Waste
          </span>
        </div>

        {/* Water Leaks */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800/80 bg-slate-900/30 flex items-center justify-between group hover:border-blue-500/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 group-hover:scale-105 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Water / Leaks</p>
              <p className="text-xl font-black text-white">{byType.water_leak || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Utilities
          </span>
        </div>

        {/* Streetlights */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800/80 bg-slate-900/30 flex items-center justify-between group hover:border-amber-500/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Lighting</p>
              <p className="text-xl font-black text-white">{byType.streetlight || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Electrical
          </span>
        </div>

      </div>
    </div>
  );
}
