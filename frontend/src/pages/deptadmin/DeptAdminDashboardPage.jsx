import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users2,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Wrench,
  AlertCircle
} from 'lucide-react';

export default function DeptAdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/department-admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load department dashboard:', err);
      setError('Could not retrieve department metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Loading Department Command Center...</span>
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
            onClick={fetchDashboard}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 text-xs font-semibold hover:bg-rose-900 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const counts = data?.counts || {};
  const dept = data?.department || {};
  const inProgress = data?.inProgressWorkOrders || [];
  const flagged = data?.flaggedForReview || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <span>{dept.name || 'Department'} Operations Hub</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300">
              SLA: {dept.slaHours || 48}h
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dispatch triage, field repair work orders, and resolution audit stream.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#082027] border border-teal-900/70 hover:border-teal-600 text-teal-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Assigned */}
        <div className="bg-[#082027] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Reports</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{counts.total || 0}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            Civic issues routed to this department
          </div>
        </div>

        {/* Pending Triage */}
        <div className="bg-[#082027] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Triage</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{counts.pending || 0}</div>
          <div className="mt-2 text-[11px] text-amber-300 font-semibold">
            {counts.pending > 0 ? 'Awaiting crew dispatch' : 'Queue clear'}
          </div>
        </div>

        {/* In-Progress Work Orders */}
        <div className="bg-[#082027] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In-Progress Repairs</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{counts.inProgress || 0}</div>
          <div className="mt-2 text-[11px] text-sky-300">
            Active repair teams on site
          </div>
        </div>

        {/* Resolved Complaints */}
        <div className="bg-[#082027] border border-teal-950 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-800 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Issues</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{counts.resolved || 0}</div>
          <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
            Verified with photo proof
          </div>
        </div>

      </div>

      {/* Two Column Section: Active Work Orders & Needs Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Work Orders */}
        <div className="lg:col-span-2 bg-[#082027] border border-teal-950 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>Active Field Work Orders</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Issues currently under repair by field maintenance crews</p>
            </div>
            <Link
              to="/dept-admin/in-progress"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              View All Work Orders &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {inProgress.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No work orders currently in progress.
              </div>
            ) : (
              inProgress.slice(0, 4).map((item) => (
                <div key={item._id} className="p-4 rounded-xl bg-[#06181D] border border-teal-950 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-teal-300 font-bold text-xs">{item.reportId || item._id.slice(-6)}</span>
                      <span className="font-semibold text-white text-xs">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-xs">{item.location?.address || 'GPS Location'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      IN PROGRESS
                    </span>
                    <Link
                      to={`/dept-admin/in-progress`}
                      className="px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-800 text-teal-300 hover:text-white text-xs"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flagged / Triage Queue */}
        <div className="bg-[#082027] border border-teal-950 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Flagged Triage Queue</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {flagged.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Reports requiring manual inspection or low AI confidence verification.
            </p>

            <div className="space-y-3">
              {flagged.slice(0, 3).map((item) => (
                <div key={item._id} className="p-3 rounded-xl bg-[#06181D] border border-teal-950 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-white truncate">{item.category}</span>
                    <span className="font-mono text-amber-400 text-[10px]">{Math.round((item.confidence || 0) * 100)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{item.location?.address}</p>
                </div>
              ))}
              {flagged.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No reports flagged for manual review.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/dept-admin/reports"
            className="mt-4 block text-center py-2.5 rounded-xl bg-teal-950/80 border border-teal-800/60 hover:bg-teal-900/60 text-xs font-bold text-teal-300 hover:text-white transition-colors"
          >
            Review All Department Reports &rarr;
          </Link>
        </div>

      </div>

    </div>
  );
}

