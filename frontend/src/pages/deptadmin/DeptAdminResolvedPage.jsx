import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  RefreshCw,
  Search,
  Eye,
  Camera,
  Layers,
  X
} from 'lucide-react';

export default function DeptAdminResolvedPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchResolved = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/department-admin/reports/resolved');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to load resolved reports:', err);
      setError('Could not retrieve resolved archive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolved();
  }, []);

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
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Resolved Complaints Archive</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical registry of resolved civic infrastructure problems with before-and-after photo verification.
          </p>
        </div>

        <button
          onClick={fetchResolved}
          className="p-2.5 rounded-xl bg-[#082027] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4 bg-[#082027] p-3 rounded-2xl border border-teal-950">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resolved reports..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06181D] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400 pr-2">
          {filteredReports.length} resolved
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading resolved complaints...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#082027] border border-teal-950 rounded-2xl">
          No resolved complaints found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className="bg-[#082027] border border-teal-950 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-teal-800 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-teal-300 font-bold text-xs">
                      {report.reportId || report._id.slice(-6)}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{report.category}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    RESOLVED
                  </span>
                </div>

                {/* Before / After side-by-side or thumbnail */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="relative rounded-lg overflow-hidden border border-teal-950 bg-black/40 h-28">
                    {report.imageUrl ? (
                      <img src={report.imageUrl} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                        No photo
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300 font-mono">
                      BEFORE
                    </span>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-emerald-900/60 bg-black/40 h-28">
                    {report.resolutionProof?.afterImageUrl ? (
                      <img src={report.resolutionProof.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-emerald-400">
                        Work Verified
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-950/80 text-[9px] text-emerald-300 font-mono">
                      AFTER
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{report.location?.address || 'Location on map'}</span>
                </div>

                {report.resolutionProof?.notes && (
                  <p className="text-xs text-slate-300 line-clamp-2 italic bg-[#06181D] p-2.5 rounded-xl border border-teal-950">
                    "{report.resolutionProof.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-teal-950 flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(report.updatedAt || report.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-800 text-teal-300 hover:text-white"
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  <span>Dossier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#082027] border border-teal-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                  Resolved Dossier &bull; {selectedReport.reportId || selectedReport._id}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedReport.category}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Citizen Submission</span>
                  {selectedReport.imageUrl ? (
                    <img src={selectedReport.imageUrl} alt="Before" className="w-full h-40 object-cover rounded-xl border border-teal-950" />
                  ) : (
                    <div className="w-full h-40 rounded-xl bg-black/40 flex items-center justify-center text-slate-500">No Image</div>
                  )}
                </div>
                <div>
                  <span className="text-emerald-400 font-semibold block mb-1">After Resolution Proof</span>
                  {selectedReport.resolutionProof?.afterImageUrl ? (
                    <img src={selectedReport.resolutionProof.afterImageUrl} alt="After" className="w-full h-40 object-cover rounded-xl border border-emerald-900" />
                  ) : (
                    <div className="w-full h-40 rounded-xl bg-black/40 flex items-center justify-center text-slate-500">Verified by Inspector</div>
                  )}
                </div>
              </div>

              <div className="bg-[#06181D] border border-teal-950 rounded-xl p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Resolution Notes:</span>
                  <span className="text-white text-right font-medium max-w-xs">{selectedReport.resolutionProof?.notes || 'Completed standard repair protocol.'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white text-right max-w-xs">{selectedReport.location?.address}</span>
                </div>
                {selectedReport.resolutionProof?.resolvedAt && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Resolved At:</span>
                    <span className="text-teal-300 font-mono">{new Date(selectedReport.resolutionProof.resolvedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
