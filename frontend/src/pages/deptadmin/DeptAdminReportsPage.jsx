import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  Wrench,
  MapPin,
  X
} from 'lucide-react';

export default function DeptAdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Report Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await client.get(`/api/department-admin/reports${query}`);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Could not retrieve department reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (reportId, nextStatus) => {
    try {
      setStatusUpdating(true);
      await client.patch(`/api/department-admin/reports/${reportId}/status`, {
        status: nextStatus
      });
      fetchReports();
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update report status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.reportId?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.location?.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-teal-400" />
            <span>Assigned Department Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complaints auto-routed to your department by AI detection and citizen submissions.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="p-2.5 rounded-xl bg-[#082027] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#082027] p-3 rounded-2xl border border-teal-950">
        
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Reports' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'needs_review', label: 'Needs Review' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-[#005C66] to-[#00897B] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#06181D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#06181D] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading assigned reports...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#082027] border border-teal-950 rounded-2xl">
          No reports found matching criteria.
        </div>
      ) : (
        <div className="bg-[#082027] border border-teal-950 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#06181D] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-teal-950">
                <tr>
                  <th className="py-3.5 px-4">Report ID</th>
                  <th className="py-3.5 px-4">Category & Confidence</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-950/60">
                {filteredReports.map((report) => {
                  const isResolved = report.status === 'resolved';
                  const isInProgress = report.status === 'in_progress';
                  const needsReview = report.needsReview || report.status === 'needs_review';

                  return (
                    <tr key={report._id} className="hover:bg-[#0b2830]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-300">
                        {report.reportId || report._id.slice(-6)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{report.category}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {Math.round((report.confidence || 0) * 100)}% conf
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-300" title={report.location?.address}>
                        {report.location?.address || 'Location on map'}
                      </td>

                      <td className="py-3.5 px-4">
                        {needsReview ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Needs Review
                          </span>
                        ) : isResolved ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Resolved
                          </span>
                        ) : isInProgress ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {report.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(report._id, 'in_progress')}
                            disabled={statusUpdating}
                            className="px-2.5 py-1 rounded-lg bg-sky-600/30 border border-sky-500/40 text-sky-300 hover:bg-sky-600 hover:text-white text-[11px] font-semibold transition-colors"
                          >
                            Dispatch Crew
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-800 text-teal-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#082027] border border-teal-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                  Report ID: {selectedReport.reportId || selectedReport._id}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedReport.category}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {selectedReport.imageUrl && (
                <img
                  src={selectedReport.imageUrl}
                  alt="Issue photo"
                  className="w-full h-48 object-cover rounded-xl border border-teal-950 bg-black/40"
                />
              )}

              <div className="bg-[#06181D] border border-teal-950 rounded-xl p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-bold uppercase text-teal-300">{selectedReport.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white text-right max-w-xs">{selectedReport.location?.address || 'GPS'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">AI Confidence:</span>
                  <span className="font-mono text-teal-300 font-semibold">{Math.round((selectedReport.confidence || 0) * 100)}%</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-teal-900">
                {selectedReport.status !== 'in_progress' && selectedReport.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport._id, 'in_progress')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                  >
                    Set In Progress
                  </button>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

