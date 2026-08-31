import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api/client';

const COLORS = ['#0ea5e9', '#8b5cf6', '#3b82f6', '#f43f5e'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    critical: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [typeData, setTypeData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/stats/summary');
      const data = res.data;
      
      setStats({
        total: data.totalReports || 0,
        resolved: data.statusCounts?.resolved || 0,
        pending: (data.statusCounts?.new || 0) + (data.statusCounts?.assigned || 0),
        critical: data.bySeverity?.high || 0
      });
      
      if (data.byType) {
        setTypeData(Object.entries(data.byType).map(([key, val]) => ({
          name: key.replace('_', ' ').toUpperCase(),
          value: val
        })).filter(item => item.value > 0));
      } else {
        setTypeData([]);
      }
      
      // We don't have historical trend data from the backend yet, so just show a flatline if no reports
      // Or we can calculate it from recentDetections if we want, but for now we'll just empty it if no reports
      if (data.totalReports === 0) {
        setTrendData([
          { name: 'Mon', reports: 0, resolved: 0 },
          { name: 'Tue', reports: 0, resolved: 0 },
          { name: 'Wed', reports: 0, resolved: 0 },
          { name: 'Thu', reports: 0, resolved: 0 },
          { name: 'Fri', reports: 0, resolved: 0 },
          { name: 'Sat', reports: 0, resolved: 0 },
          { name: 'Sun', reports: 0, resolved: 0 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Analytics</h1>
          <p className="text-slate-400 mt-1">Platform usage, reporting trends, and resolution metrics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 border-t border-t-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Reports</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-t border-t-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Resolved Issues</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.resolved}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-t border-t-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Pending Review</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.pending}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-t border-t-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium">Critical Priority</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.critical}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <div className="glass-card rounded-2xl p-6 border-t border-t-white/5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Reporting & Resolution Trends (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                <Area type="monotone" dataKey="resolved" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Type Pie Chart */}
        <div className="glass-card rounded-2xl p-6 border-t border-t-white/5">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Reports by Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {typeData.length === 0 ? (
                  <Pie
                    data={[{name: 'No Data', value: 1}]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#1e293b" stroke="none"
                    dataKey="value"
                  />
                ) : (
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                )}
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {typeData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
