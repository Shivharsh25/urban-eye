import React from 'react';
import { Activity, Camera, Zap, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenActivityPage() {
  const { t } = useLanguage();

  const activities = [
    {
      id: 1,
      userKey: 'anonymousCitizen',
      defaultUser: 'Anonymous Citizen',
      actionKey: 'reportedRoadHazard',
      defaultAction: 'reported a road hazard',
      location: 'Downtown District',
      timeKey: 'justNow',
      defaultTime: 'Just now',
      icon: Camera,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      id: 2,
      userKey: 'cityCrew',
      defaultUser: 'City Crew',
      actionKey: 'resolvedStreetlightOutage',
      defaultAction: 'resolved a streetlight outage',
      location: 'Northside Blvd',
      timeKey: 'time45mAgo',
      defaultTime: '45 mins ago',
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 3,
      userKey: 'anonymousCitizen',
      defaultUser: 'Anonymous Citizen',
      actionKey: 'reportedWaterLeak',
      defaultAction: 'reported a water leak',
      location: 'Westend Park',
      timeKey: 'time2hAgo',
      defaultTime: '2 hours ago',
      icon: Camera,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      id: 4,
      userKey: 'cityAdmin',
      defaultUser: 'City Admin',
      actionKey: 'escalatedInfraIssue',
      defaultAction: 'escalated an infrastructure issue',
      location: 'Sector 7G',
      timeKey: 'time3hAgo',
      defaultTime: '3 hours ago',
      icon: Zap,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    }
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      
      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-[#99775C]/10 border border-[#99775C]/25 flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#99775C]" />
              </div>
              <span>{t('cityActivityTitle', 'City Activity')}</span>
            </h1>
            <p className="text-slate-600 mt-2 text-sm font-medium">{t('cityActivitySubtitle', 'Live feed of community reports and city crew resolutions.')}</p>
          </div>

          {/* Timeline Feed */}
          <div className="rounded-3xl bg-white/95 border border-[#EAE7DD] p-6 sm:p-8 relative shadow-sm">
            
            {/* Continuous Line */}
            <div className="absolute left-[39px] sm:left-[47px] top-12 bottom-12 w-px bg-[#EAE7DD]"></div>

            <div className="space-y-8 relative z-10">
              {activities.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 sm:space-x-6 group">
                  <div className={`w-12 h-12 rounded-full ${item.bg} border border-[#EAE7DD] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform relative z-10 bg-white shadow-xs`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      <span className="font-bold text-slate-900">{t(item.userKey, item.defaultUser)}</span>{' '}
                      {t(item.actionKey, item.defaultAction)}{' '}
                      {t('near', 'near')}{' '}
                      <span className="text-[#99775C] font-semibold">{item.location}</span>.
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono font-medium">{t(item.timeKey, item.defaultTime)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 flex justify-center relative z-10 border-t border-[#EAE7DD]">
              <button className="text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors py-1 px-3 rounded-lg hover:bg-slate-50">
                {t('loadOlderActivity', 'Load Older Activity ↓')}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/95 border border-[#EAE7DD] shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#99775C]" />
              <span>{t('todaysImpact', "Today's Impact")}</span>
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DD]">
                <div className="text-3xl font-black text-slate-900 mb-1">142</div>
                <div className="text-xs text-slate-600 uppercase tracking-widest font-bold">{t('newReportsStat', 'New Reports')}</div>
              </div>
              
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-3xl font-black text-emerald-700 mb-1">89</div>
                <div className="text-xs text-emerald-800 uppercase tracking-widest font-bold">{t('issuesResolved', 'Issues Resolved')}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#99775C]/10 border border-[#99775C]/25">
                <div className="flex items-center space-x-3 mb-1">
                  <Users className="w-5 h-5 text-[#99775C]" />
                  <span className="text-2xl font-black text-slate-900">12</span>
                </div>
                <div className="text-xs text-slate-700 uppercase tracking-widest font-bold">{t('activeCityCrews', 'Active City Crews')}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
