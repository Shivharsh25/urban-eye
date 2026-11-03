import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import {
  FileCheck2,
  Filter,
  Search,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  RefreshCw,
  ExternalLink,
  Shield,
  X
} from 'lucide-react';

export default function SuperAdminAllReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [needsReviewOnly, setNeedsReviewOnly] = useState(searchParams.get('needsReview') === 'true');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Modal
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedDept !== 'all') params.set('departmentId', selectedDept);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (needsReviewOnly) params.set('needsReview', 'true');

      const [repRes, deptRes] = await Promise.all([
        client.get(`/api/super-admin/reports?${params.toString()}`),
        client.get('/api/super-admin/departments')
      ]);

      setReports(repRes.data.reports || []);
      setDepartments(deptRes.data.departments || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Could not retrieve reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDept, selectedStatus, needsReviewOnly]);

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.reportId?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.assignedDepartment?.toLowerCase().includes(q) ||
      r.location?.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <FileCheck2 className="w-6 h-6 text-teal-400" />
            <span>Citywide Reports Stream</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global civic issues audit stream across all municipal departments, AI auto-dispatch flags, and resolution proof.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="p-2.5 rounded-xl bg-[#081C21] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#081C21] p-4 rounded-2xl border border-teal-950 flex flex-wrap items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, category, location..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#051317] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#051317] border border-teal-950 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#051317] border border-teal-950 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="needs_review">Needs Review</option>
        </select>

        {/* Needs Review Toggle */}
        <label className="flex items-center space-x-2 text-xs text-amber-300 font-semibold cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <input
            type="checkbox"
            checked={needsReviewOnly}
            onChange={(e) => setNeedsReviewOnly(e.target.checked)}
            className="rounded border-amber-500 text-amber-500 focus:ring-0 bg-transparent"
          />
          <span>Flagged for Review</span>
        </label>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading citywide reports...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#081C21] border border-teal-950 rounded-2xl">
          No reports match the selected filters.
        </div>
      ) : (
        <div className="bg-[#081C21] border border-teal-950 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#051317] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-teal-950">
                <tr>
                  <th className="py-3.5 px-4">Report ID & Date</th>
                  <th className="py-3.5 px-4">Category & AI Confidence</th>
                  <th className="py-3.5 px-4">Assigned Department</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-950/60">
                {filteredReports.map((report) => {
                  const isResolved = report.status === 'resolved';
                  const isInProgress = report.status === 'in_progress';
                  const needsReview = report.needsReview || report.status === 'needs_review';

                  return (
                    <tr key={report._id} className="hover:bg-[#0b252b]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-teal-300 font-bold block">{report.reportId || report._id.slice(-6)}</span>
                        <span className="text-[10px] text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{report.category}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {Math.round((report.confidence || 0) * 100)}% confidence
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 text-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>{report.assignedDepartment || 'Unassigned'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="truncate block text-slate-300" title={report.location?.address}>
                          {report.location?.address || 'GPS Coordinates Stored'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {needsReview ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Needs Review
                          </span>
                        ) : isResolved ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Resolved
                          </span>
                        ) : isInProgress ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-2.5 py-1 rounded-lg bg-teal-950/60 border border-teal-800/60 text-teal-300 hover:text-white transition-colors"
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

      {/* INSPECTION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#081C21] border border-teal-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-teal-900 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                  Report Dossier &bull; {selectedReport.reportId || selectedReport._id}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedReport.category}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Image previews (Reported vs Resolution) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Citizen Uploaded Photo</span>
                  {selectedReport.imageUrl ? (
                    <img
                      src={selectedReport.imageUrl}
                      alt="Citizen report"
                      className="w-full h-44 object-cover rounded-xl border border-teal-950 bg-black/40"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                      No photo provided
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Resolution Verification Proof</span>
                  {selectedReport.resolutionProof?.afterImageUrl ? (
                    <img
                      src={selectedReport.resolutionProof.afterImageUrl}
                      alt="Resolution proof"
                      className="w-full h-44 object-cover rounded-xl border border-emerald-900/50 bg-black/40"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                      Pending repair completion
                    </div>
                  )}
                </div>
              </div>

              {/* Details List */}
              <div className="bg-[#051317] border border-teal-950 rounded-xl p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Assigned Department:</span>
                  <span className="font-bold text-white">{selectedReport.assignedDepartment}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">AI Detection Confidence:</span>
                  <span className="font-mono text-teal-300 font-semibold">
                    {Math.round((selectedReport.confidence || 0) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Location Address:</span>
                  <span className="text-white text-right max-w-xs">{selectedReport.location?.address || 'N/A'}</span>
                </div>
                {selectedReport.needsReview && (
                  <div className="flex justify-between py-1 text-amber-300">
                    <span>Review Reason:</span>
                    <span>{selectedReport.reviewReason || 'Flagged by routing engine'}</span>
                  </div>
                )}
              </div>

              {/* Work Notes */}
              {selectedReport.workNotes && selectedReport.workNotes.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-300 block mb-2">Department Progress Logs</span>
                  <div className="space-y-2">
                    {selectedReport.workNotes.map((note, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#051317] border border-teal-950 text-[11px]">
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span className="font-semibold text-teal-300">{note.authorName}</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
