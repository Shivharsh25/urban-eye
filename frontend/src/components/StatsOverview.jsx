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
      progress: 100
    },
    {
      title: 'Critical Severity',
      value: bySeverity.high || 0,
      subtitle: 'Immediate municipal dispatch required',
      badge: `${totalReports > 0 ? Math.round(((bySeverity.high || 0) / totalReports) * 100) : 0}% of total`,
      icon: Flame,
      progress: totalReports > 0 ? ((bySeverity.high || 0) / totalReports) * 100 : 0
    },
    {
      title: 'In Active Triage',
      value: statusCounts.assigned || 0,
      subtitle: 'Field contractors assigned & en-route',
      badge: `${totalReports > 0 ? Math.round(((statusCounts.assigned || 0) / totalReports) * 100) : 0}% active`,
      icon: Clock,
      progress: totalReports > 0 ? ((statusCounts.assigned || 0) / totalReports) * 100 : 0
    },
    {
      title: 'Resolved Defects',
      value: statusCounts.resolved || 0,
      subtitle: 'Citizens notified & geo-verified',
      badge: `${resolutionRate}% completed`,
      icon: CheckCircle2,
      progress: resolutionRate
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="relative p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E2E5] overflow-hidden group transition-all duration-300 hover:border-[#302B69]/40 shadow-xs"
            >
              <div className="relative flex items-start justify-between z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#57536E] uppercase tracking-wider">{stat.title}</span>
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <h4 className="text-4xl font-black text-[#191636] tracking-tight">
                      {stat.value}
                    </h4>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Progress Line Indicator */}
              <div className="mt-4 pt-3 border-t border-[#E8E2E5] relative z-10">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[#57536E] truncate max-w-[180px]">{stat.subtitle}</span>
                  <span className="font-mono font-bold text-[#302B69]">{stat.badge}</span>
                </div>
                <div className="w-full bg-[#F6F6FC] border border-[#E8E2E5] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#302B69] h-full rounded-full transition-all duration-1000"
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
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs flex items-center justify-between group hover:border-[#302B69]/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#57536E] font-bold uppercase tracking-wider">Road Hazards</p>
              <p className="text-xl font-black text-[#191636]">{byType.pothole || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5]">
            Roads
          </span>
        </div>

        {/* Garbage */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs flex items-center justify-between group hover:border-[#302B69]/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] group-hover:scale-105 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#57536E] font-bold uppercase tracking-wider">Sanitation</p>
              <p className="text-xl font-black text-[#191636]">{byType.garbage || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5]">
            Waste
          </span>
        </div>

        {/* Water Leaks */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs flex items-center justify-between group hover:border-[#302B69]/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] group-hover:scale-105 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#57536E] font-bold uppercase tracking-wider">Water / Leaks</p>
              <p className="text-xl font-black text-[#191636]">{byType.water_leak || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5]">
            Utilities
          </span>
        </div>

        {/* Streetlights */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs flex items-center justify-between group hover:border-[#302B69]/40 transition-all">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#57536E] font-bold uppercase tracking-wider">Lighting</p>
              <p className="text-xl font-black text-[#191636]">{byType.streetlight || 0}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5]">
            Electrical
          </span>
        </div>

      </div>
    </div>
  );
}
