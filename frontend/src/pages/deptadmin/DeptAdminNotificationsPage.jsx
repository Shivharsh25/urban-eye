import React from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function DeptAdminNotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'High-Severity Issue Assigned',
      desc: 'Severe road cave-in reported near Sector 62 Metro Station. Immediate hazard barrier deployment requested.',
      time: '18 minutes ago'
    },
    {
      id: 2,
      type: 'sla',
      title: 'SLA Milestone Approaching',
      desc: 'Report #RD-9021 approaches 75% of maximum SLA window (36/48 hours elapsed). Please confirm repair completion.',
      time: '2 hours ago'
    },
    {
      id: 3,
      type: 'info',
      title: 'AI Routing Model Synchronized',
      desc: 'Super Administrator updated confidence thresholds for pothole and pavement surface detection.',
      time: 'Yesterday'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <Bell className="w-6 h-6 text-teal-400" />
          <span>Department Priority Notifications</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Escalations, critical civic alerts, and automated SLA warnings.
        </p>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.map((item) => {
          const isUrgent = item.type === 'urgent';
          const isSLA = item.type === 'sla';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isUrgent
                  ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700'
                  : isSLA
                  ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700'
                  : 'bg-[#082027] border-teal-950 hover:border-teal-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  {isUrgent ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : isSLA ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <Info className="w-5 h-5 text-teal-400 shrink-0" />
                  )}
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
              </div>
              <p className="text-xs text-slate-300 ml-7 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
