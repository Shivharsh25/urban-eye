import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import {
  FileText,
  Building2,
  Users,
  UserCheck,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Shield,
  Activity,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/super-admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load Super Admin stats:', err);
      setError('Could not retrieve platform metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Loading Executive Metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button
            onClick={fetchStats}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 text-xs font-semibold hover:bg-rose-900 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const reports = stats?.reports || {};
  const depts = stats?.departments || {};
  const admins = stats?.admins || {};
  const routing = stats?.routing || {};
  const breakdown = stats?.departmentBreakdown || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <span>Urban EYE Command Center</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
              Platform Overview
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time cross-department orchestration, AI dispatch performance, and civic issue telemetry.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#081C21] border border-teal-900/70 hover:border-teal-600 text-teal-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total City Reports */}
        <div className="bg-[#081C21] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Civic Reports</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{reports.total || 0}</div>
          <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{reports.resolved || 0} resolved</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-semibold">{reports.inProgress || 0} in progress</span>
          </div>
        </div>

        {/* Municipal Departments */}
        <div className="bg-[#081C21] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Departments</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{depts.active || 0} <span className="text-sm font-normal text-slate-500">/ {depts.total || 0}</span></div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across Roads, Sanitation, Water, Parks & Power
          </div>
        </div>

        {/* Dept Admin Vetting */}
        <div className="bg-[#081C21] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Admin Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{admins.pendingRequests || 0}</div>
          <div className="mt-2">
            {admins.pendingRequests > 0 ? (
              <Link to="/super-admin/requests" className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1">
                <span>Review Pending Applicants</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-[11px] text-emerald-400">All applications processed</span>
            )}
          </div>
        </div>

        {/* Auto-Routing Rate */}
        <div className="bg-[#081C21] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Auto-Dispatch Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {routing.successRate || 94.2}%
          </div>
          <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="text-purple-300 font-semibold">{routing.flaggedForReview || 0} flagged</span>
            <span>for manual triage</span>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Department Distribution & Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Reports Distribution */}
        <div className="lg:col-span-2 bg-[#081C21] border border-teal-950 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Department Load Telemetry</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Report distribution across active municipal divisions</p>
            </div>
            <Link
              to="/super-admin/departments"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              Manage Departments &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {breakdown.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No reports data available yet.</div>
            ) : (
              breakdown.map((dept, idx) => {
                const totalDept = dept.total || 0;
                const resolvedDept = dept.resolved || 0;
                const percent = totalDept > 0 ? Math.round((resolvedDept / totalDept) * 100) : 0;
                return (
                  <div key={idx} className="bg-[#051317] border border-teal-950/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <Building2 className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-bold text-white">{dept.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-400 border border-teal-900 font-mono">
                          {dept.code}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-300">
                        <span className="text-white font-bold">{totalDept}</span> reports &bull;{' '}
                        <span className="text-emerald-400 font-semibold">{percent}% resolved</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Triage / Flagged Reports */}
        <div className="bg-[#081C21] border border-teal-950 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Flagged for Review</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {stats?.flaggedReports?.length || 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Issues requiring manual routing verification due to low AI confidence or boundary uncertainty.
            </p>

            <div className="space-y-3">
              {(stats?.flaggedReports || []).slice(0, 4).map((report) => (
                <div key={report._id} className="p-3 rounded-xl bg-[#051317] border border-teal-950 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-white truncate max-w-[150px]">{report.category}</span>
                    <span className="text-[10px] font-mono text-amber-400">{Math.round((report.confidence || 0) * 100)}% conf</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{report.location?.address || 'Location detected'}</p>
                  <p className="text-[10px] text-amber-300/80 mt-1">{report.reviewReason || 'Low classification confidence'}</p>
                </div>
              ))}
              {(stats?.flaggedReports || []).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No reports currently require manual routing review.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/super-admin/reports?needsReview=true"
            className="mt-4 block text-center py-2.5 rounded-xl bg-teal-950/80 border border-teal-800/60 hover:bg-teal-900/60 text-xs font-bold text-teal-300 hover:text-white transition-colors"
          >
            Open Review Stream &rarr;
          </Link>
        </div>

      </div>

      {/* Quick Access Matrix */}
      <div className="bg-[#081C21] border border-teal-950 rounded-2xl p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-4">Platform Administration Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            to="/super-admin/departments"
            className="p-3 rounded-xl bg-[#051317] hover:bg-[#07242a] border border-teal-950 hover:border-teal-700 transition-all block text-center"
          >
            <Building2 className="w-5 h-5 text-teal-400 mx-auto mb-1.5" />
            <span className="font-semibold text-white block">Create Department</span>
            <span className="text-[10px] text-slate-400">Configure civic wings</span>
          </Link>

          <Link
            to="/super-admin/requests"
            className="p-3 rounded-xl bg-[#051317] hover:bg-[#07242a] border border-teal-950 hover:border-teal-700 transition-all block text-center"
          >
            <UserCheck className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <span className="font-semibold text-white block">Review Applications</span>
            <span className="text-[10px] text-slate-400">Approve department admins</span>
          </Link>

          <Link
            to="/super-admin/ai-config"
            className="p-3 rounded-xl bg-[#051317] hover:bg-[#07242a] border border-teal-950 hover:border-teal-700 transition-all block text-center"
          >
            <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
            <span className="font-semibold text-white block">AI & Routing Rules</span>
            <span className="text-[10px] text-slate-400">Adjust thresholds</span>
          </Link>

          <Link
            to="/super-admin/audit-logs"
            className="p-3 rounded-xl bg-[#051317] hover:bg-[#07242a] border border-teal-950 hover:border-teal-700 transition-all block text-center"
          >
            <Activity className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
            <span className="font-semibold text-white block">Audit Trail</span>
            <span className="text-[10px] text-slate-400">Platform activity log</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
