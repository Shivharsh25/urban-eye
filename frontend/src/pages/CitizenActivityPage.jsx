import React from 'react';
import { Activity, Camera, Zap, CheckCircle, TrendingUp, Users } from 'lucide-react';

export default function CitizenActivityPage() {
  const activities = [
    {
      id: 1,
      user: 'Anonymous Citizen',
      action: 'reported a road hazard',
      location: 'Downtown District',
      time: 'Just now',
      icon: Camera,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      id: 2,
      user: 'City Crew',
      action: 'resolved a streetlight outage',
      location: 'Northside Blvd',
      time: '45 mins ago',
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 3,
      user: 'Anonymous Citizen',
      action: 'reported a water leak',
      location: 'Westend Park',
      time: '2 hours ago',
      icon: Camera,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      id: 4,
      user: 'City Admin',
      action: 'escalated an infrastructure issue',
      location: 'Sector 7G',
      time: '3 hours ago',
      icon: Zap,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05080f] p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <span>City Activity</span>
            </h1>
            <p className="text-slate-400 mt-2">Live feed of community reports and city crew resolutions.</p>
          </div>

          {/* Timeline Feed */}
          <div className="glass-panel rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 relative">
            
            {/* Continuous Line */}
            <div className="absolute left-[39px] top-12 bottom-12 w-px bg-slate-800"></div>

            <div className="space-y-8 relative z-10">
              {activities.map((item, index) => (
                <div key={item.id} className="flex items-start space-x-6 group">
                  <div className={`w-12 h-12 rounded-full ${item.bg} border border-slate-700/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform relative z-10`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-slate-300 text-sm">
                      <span className="font-bold text-white">{item.user}</span> {item.action} near <span className="text-cyan-400">{item.location}</span>.
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 flex justify-center relative z-10">
              <button className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                Load Older Activity ↓
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Today's Impact</span>
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-3xl font-black text-white mb-1">142</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">New Reports</div>
              </div>
              
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-3xl font-black text-emerald-400 mb-1">89</div>
                <div className="text-xs text-emerald-500/70 uppercase tracking-widest font-semibold">Issues Resolved</div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="text-lg font-bold text-cyan-400">12</span>
                </div>
                <div className="text-xs text-cyan-500/70 uppercase tracking-widest font-semibold">Active City Crews</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
