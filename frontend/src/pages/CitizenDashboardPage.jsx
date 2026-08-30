import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, AlertTriangle, ShieldAlert, Navigation, Plus, Award, Activity, Camera, CheckCircle, ThumbsUp, UserCircle, PhoneCall, Filter, Info, BellRing } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import api from '../api/client';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, RESOLVED

  const [userStats, setUserStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    civicScore: 100, // Base score
  });

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, announcementsRes, statsRes] = await Promise.all([
          api.get('/api/detections'),
          api.get('/api/announcements'),
          api.get('/api/stats/user-summary')
        ]);
        
        const allReports = reportsRes.data.detections || [];
        const sortedReports = [...allReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentReports(sortedReports);
        
        setAnnouncements(announcementsRes.data);

        // Set dynamic stats
        if (statsRes.data) {
          setUserStats({
            totalReports: statsRes.data.totalReports || 0,
            resolvedReports: statsRes.data.resolvedReports || 0,
            civicScore: statsRes.data.trustScore || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getCivicTier = (score) => {
    if (score >= 1000) return { name: 'Platinum', color: 'from-slate-200 to-slate-400', threshold: 1000, next: 2000 };
    if (score >= 500) return { name: 'Gold', color: 'from-amber-300 to-amber-500', threshold: 500, next: 1000 };
    if (score >= 200) return { name: 'Silver', color: 'from-slate-300 to-slate-500', threshold: 200, next: 500 };
    return { name: 'Bronze', color: 'from-orange-400 to-orange-600', threshold: 0, next: 200 };
  };

  const tier = getCivicTier(userStats.civicScore);
  const progressPercent = Math.min(100, Math.max(0, ((userStats.civicScore - tier.threshold) / (tier.next - tier.threshold)) * 100));

  const filteredReports = recentReports.filter(report => {
    if (filter === 'CRITICAL') return report.priority === 'CRITICAL';
    if (filter === 'RESOLVED') return report.status === 'resolved' || report.status === 'RESOLVED';
    return true;
  }).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}
          </h1>
          <p className="text-slate-400 mt-1">Here is what's happening in your community today.</p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => navigate('/report')} className="glass-button bg-cyan-600/10 hover:bg-cyan-500/20 border border-cyan-500/20 flex flex-col items-center justify-center p-4 rounded-2xl group transition-all">
          <Plus className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-slate-200">New Report</span>
        </button>
        <button onClick={() => navigate('/my-reports')} className="glass-button bg-indigo-600/10 hover:bg-indigo-500/20 border border-indigo-500/20 flex flex-col items-center justify-center p-4 rounded-2xl group transition-all">
          <Activity className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-slate-200">My Activity</span>
        </button>
        <button onClick={() => navigate('/profile')} className="glass-button bg-emerald-600/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex flex-col items-center justify-center p-4 rounded-2xl group transition-all">
          <UserCircle className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-slate-200">Profile</span>
        </button>
        <a href="tel:911" className="glass-button bg-rose-600/10 hover:bg-rose-500/20 border border-rose-500/20 flex flex-col items-center justify-center p-4 rounded-2xl group transition-all">
          <PhoneCall className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition-transform animate-pulse" />
          <span className="text-sm font-semibold text-rose-200">Emergency</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column: Map & Local Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Community Map */}
          <div className="glass-card rounded-3xl overflow-hidden border-t border-t-white/5 flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
              <h2 className="text-lg font-bold text-slate-200 flex items-center">
                <MapPin className="w-5 h-5 text-cyan-400 mr-2" />
                Community Impact Map
              </h2>
              <span className="text-xs font-semibold text-cyan-400/80 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Live Data
              </span>
            </div>
            <div className="flex-1 relative bg-slate-800">
              <MapView />
            </div>
          </div>

          {/* Local Feed */}
          <div className="glass-card rounded-3xl p-6 border-t border-t-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-200 flex items-center">
                <Activity className="w-5 h-5 text-indigo-400 mr-2" />
                Recent Activity in your Area
              </h2>
              <div className="flex items-center space-x-2 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
                <button onClick={() => setFilter('ALL')} className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${filter === 'ALL' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}>All</button>
                <button onClick={() => setFilter('CRITICAL')} className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${filter === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'}`}>Critical</button>
                <button onClick={() => setFilter('RESOLVED')} className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${filter === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'}`}>Resolved</button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map(report => (
                  <div key={report._id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/40 hover:bg-slate-800/50 transition-colors flex gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center h-12 w-12 ${getPriorityColor(report.priority)}`}>
                      {report.priority === 'CRITICAL' ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-200 capitalize">{report.type || 'Report'}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{report.reportText || report.address}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={report.status === 'RESOLVED' || report.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}>
                          {report.status || 'new'}
                        </span>
                      </div>
                    </div>
                    <button className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-500 hover:text-cyan-400 group">
                      <ThumbsUp className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold">{report.reportCount || 1}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-slate-800/50 border-dashed rounded-2xl bg-slate-900/20">
                <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p>No recent reports in your community.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Civic Score & Badges */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-3xl p-6 border-t border-t-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 opacity-50 group-hover:opacity-100 transition-opacity" />
             <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center relative z-10">
              <Award className="w-5 h-5 text-amber-400 mr-2" />
              Civic Score
            </h2>
            
            <div className="flex flex-col items-center justify-center space-y-2 relative z-10 py-4">
               <div className={`w-24 h-24 rounded-full border-4 border-slate-700/50 flex items-center justify-center shadow-lg relative bg-slate-900/50 overflow-hidden`}>
                 <div className={`absolute bottom-0 w-full bg-gradient-to-t ${tier.color} opacity-20`} style={{ height: `${progressPercent}%` }}></div>
                 <span className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br ${tier.color} z-10`}>{userStats.civicScore}</span>
               </div>
               <p className={`text-xs font-bold tracking-widest uppercase mt-4 bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}>{tier.name} Tier</p>
               <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                 <div className={`h-full bg-gradient-to-r ${tier.color}`} style={{ width: `${progressPercent}%` }}></div>
               </div>
               <p className="text-[9px] text-slate-500 font-mono mt-1">{tier.next - userStats.civicScore} pts to next tier</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
               <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
                 <Camera className="w-5 h-5 text-cyan-400 mb-1" />
                 <span className="text-xl font-bold text-white">{userStats.totalReports}</span>
                 <span className="text-[10px] text-slate-400 uppercase tracking-wider">Reported</span>
               </div>
               <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
                 <CheckCircle className="w-5 h-5 text-emerald-400 mb-1" />
                 <span className="text-xl font-bold text-white">{userStats.resolvedReports}</span>
                 <span className="text-[10px] text-slate-400 uppercase tracking-wider">Resolved</span>
               </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-t border-t-white/5 flex flex-col">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
              <BellRing className="w-5 h-5 text-rose-400 mr-2" />
              Active Alerts
            </h2>
            <div className="space-y-3 flex-1">
              {announcements.length > 0 ? (
                announcements.map(ann => {
                  let colorClasses = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200';
                  let dotClass = 'bg-cyan-500';
                  if (ann.type === 'error') {
                    colorClasses = 'bg-rose-500/10 border-rose-500/20 text-rose-200';
                    dotClass = 'bg-rose-500 animate-pulse';
                  } else if (ann.type === 'warning') {
                    colorClasses = 'bg-amber-500/10 border-amber-500/20 text-amber-200';
                    dotClass = 'bg-amber-500 animate-pulse';
                  } else if (ann.type === 'success') {
                    colorClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200';
                    dotClass = 'bg-emerald-500';
                  }

                  return (
                    <div key={ann._id} className={`p-3 rounded-xl border ${colorClasses} flex gap-3`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotClass}`} />
                      <div>
                        <p className="text-sm font-semibold">{ann.title}</p>
                        <p className="text-xs opacity-70 mt-0.5">{ann.message}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-700/50 rounded-xl bg-slate-900/20 h-full">
                  <Info className="w-6 h-6 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400">No active alerts from city administration.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
