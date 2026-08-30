import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';

export default function CitizenAlertsPage() {
  const alerts = [
    {
      id: 1,
      title: 'Major Road Closure: Main St.',
      description: 'Main St will be closed from 4th Ave to 8th Ave for emergency water main repairs. Please use alternate routes.',
      time: '10 mins ago',
      type: 'critical',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30'
    },
    {
      id: 2,
      title: 'Power Outage Resolved',
      description: 'Power has been fully restored to the Northside district. Thank you for your patience.',
      time: '2 hours ago',
      type: 'success',
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    },
    {
      id: 3,
      title: 'Scheduled Maintenance',
      description: 'City park facilities will undergo routine maintenance this weekend. Some areas may be restricted.',
      time: '1 day ago',
      type: 'info',
      icon: Info,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05080f] p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Bell className="w-6 h-6 text-cyan-400 animate-[ring_4s_infinite]" />
              </div>
              <span>Community Alerts</span>
            </h1>
            <p className="text-slate-400 mt-2">Stay informed with real-time city broadcasts and emergency updates.</p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Live Network</span>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="glass-panel group relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all p-6">
              
              {/* Highlight strip for critical alerts */}
              {alert.type === 'critical' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
              )}

              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl ${alert.bg} border ${alert.border} flex items-center justify-center shrink-0`}>
                  <alert.icon className={`w-6 h-6 ${alert.color}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{alert.title}</h3>
                    <div className="flex items-center space-x-1.5 text-slate-500 mt-1 sm:mt-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono uppercase tracking-wider">{alert.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{alert.description}</p>
                </div>
              </div>

            </div>
          ))}

          {/* End of Feed */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-3">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">You're all caught up</p>
          </div>
        </div>

      </div>
    </div>
  );
}
