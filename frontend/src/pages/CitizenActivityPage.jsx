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
      color: 'text-amber-700',
      bg: 'bg-amber-50'
    },
    {
      id: 2,
      userKey: 'cityCrew',
      defaultUser: 'City Crew',
      actionKey: 'resolvedPotholeHazard',
      defaultAction: 'repaired a road pothole hazard',
      location: 'Northside Blvd',
      timeKey: 'time45mAgo',
      defaultTime: '45 mins ago',
      icon: CheckCircle,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50'
    },
    {
      id: 3,
      userKey: 'anonymousCitizen',
      defaultUser: 'Anonymous Citizen',
      actionKey: 'reportedGarbageOverflow',
      defaultAction: 'reported a waste dump accumulation',
      location: 'Westend Park',
      timeKey: 'time2hAgo',
      defaultTime: '2 hours ago',
      icon: Camera,
      color: 'text-blue-700',
      bg: 'bg-blue-50'
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
      color: 'text-rose-700',
      bg: 'bg-rose-50'
    }
  ];

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 sm:space-y-7 font-sans">
      
      {/* Bento Hero Header */}
      <div className="bento-hero p-6 sm:p-8 relative overflow-hidden bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center shadow-xs">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                {t('liveNetwork', 'CIVIC TELEMETRY')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              {t('cityActivityTitle', 'City Activity Stream')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              {t('cityActivitySubtitle', 'Live audit feed of community reports, AI classification events, and municipal crew resolutions.')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
        
        {/* Left Column: Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bento-card p-6 sm:p-8 relative bg-white border border-slate-200 shadow-2xs">
            
            {/* Continuous Line */}
            <div className="absolute left-[35px] sm:left-[43px] top-12 bottom-12 w-px bg-slate-200"></div>

            <div className="space-y-7 relative z-10">
              {activities.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 sm:space-x-5 group">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${item.bg} border border-slate-200/90 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform relative z-10 shadow-xs`}>
                    <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      <span className="font-bold text-slate-900">{t(item.userKey, item.defaultUser)}</span>{' '}
                      {t(item.actionKey, item.defaultAction)}{' '}
                      {t('near', 'near')}{' '}
                      <span className="text-blue-700 font-bold">{item.location}</span>.
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{t(item.timeKey, item.defaultTime)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center relative z-10">
              <button className="text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors cursor-pointer">
                {t('loadOlderActivity', 'Load Older Activity ↓')}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Stats Bento Card (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bento-card p-6 space-y-5 bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2 font-display">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>{t('todaysImpact', "Today's Municipal Impact")}</span>
            </h3>
            
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90">
                <div className="text-3xl font-extrabold text-slate-900 font-display mb-0.5">142</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('newReportsStat', 'New Incident Reports')}</div>
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-3xl font-extrabold text-emerald-700 font-display mb-0.5">89</div>
                <div className="text-xs text-emerald-700 uppercase tracking-wider font-bold">{t('issuesResolved', 'Verified Issues Resolved')}</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center space-x-3 mb-0.5">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-extrabold text-blue-700 font-display">12</span>
                </div>
                <div className="text-xs text-blue-700 uppercase tracking-wider font-bold">{t('activeCityCrews', 'Active Municipal Crews')}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
