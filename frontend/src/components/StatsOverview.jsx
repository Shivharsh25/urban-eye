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
  Flame 
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

  const kpis = [
    {
      title: 'Total Active Issues',
      value: totalReports,
      subtitle: `${totalIncidents} citizen submissions`,
      icon: Layers,
      color: 'text-sky-500',
      border: 'border-sky-500/20',
      bg: 'from-sky-500/5 to-slate-800/20'
    },
    {
      title: 'High Severity',
      value: bySeverity.high || 0,
      subtitle: 'Immediate action required',
      icon: Flame,
      color: 'text-rose-500',
      border: 'border-rose-500/20',
      bg: 'from-rose-500/5 to-slate-800/20'
    },
    {
      title: 'Currently Assigned',
      value: statusCounts.assigned || 0,
      subtitle: 'Under department review',
      icon: Clock,
      color: 'text-amber-500',
      border: 'border-amber-500/20',
      bg: 'from-amber-500/5 to-slate-800/20'
    },
    {
      title: 'Resolved Issues',
      value: statusCounts.resolved || 0,
      subtitle: 'Citizens notified',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      border: 'border-emerald-500/20',
      bg: 'from-emerald-500/5 to-slate-800/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="relative p-6 rounded-3xl glass-card overflow-hidden group cursor-default"
            >
              <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${stat.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative flex items-start justify-between z-10">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <h4 className={`text-4xl font-black ${stat.color} drop-shadow-md`}>{stat.value}</h4>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-slate-900/80 border ${stat.border} shadow-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="relative mt-4 flex items-center space-x-2 z-10">
                <div className={`w-2 h-2 rounded-full ${stat.color} animate-pulse`}></div>
                <p className="text-xs text-slate-400 font-medium">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-4 p-5 rounded-2xl glass-card group hover:-translate-y-1 transition-transform">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 group-hover:border-sky-500/40 transition-colors">
            <AlertCircle className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Potholes</p>
            <p className="text-2xl font-bold text-slate-200">{byType.pothole || 0}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-2xl glass-card group hover:-translate-y-1 transition-transform">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
            <Trash2 className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Garbage</p>
            <p className="text-2xl font-bold text-slate-200">{byType.garbage || 0}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-2xl glass-card group hover:-translate-y-1 transition-transform">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Water Leaks</p>
            <p className="text-2xl font-bold text-slate-200">{byType.water_leak || 0}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-2xl glass-card group hover:-translate-y-1 transition-transform">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 group-hover:border-yellow-500/40 transition-colors">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Streetlights</p>
            <p className="text-2xl font-bold text-slate-200">{byType.streetlight || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
