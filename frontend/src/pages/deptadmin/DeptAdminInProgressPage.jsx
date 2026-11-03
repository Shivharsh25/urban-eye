import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Clock,
  Wrench,
  CheckCircle2,
  Plus,
  MessageSquare,
  MapPin,
  RefreshCw,
  Camera,
  X,
  Send
} from 'lucide-react';

export default function DeptAdminInProgressPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note Modal
  const [activeReportForNote, setActiveReportForNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Resolve Modal
  const [activeReportForResolve, setActiveReportForResolve] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    resolutionNotes: '',
    afterImageUrl: '',
    partsUsed: ''
  });
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const fetchInProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/department-admin/reports/in-progress');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to load in-progress jobs:', err);
      setError('Could not retrieve active repair jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInProgress();
  }, []);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!activeReportForNote || !noteText.trim()) return;

    try {
      setSubmittingNote(true);
      await client.post(`/api/department-admin/reports/${activeReportForNote._id}/work-notes`, {
        note: noteText.trim(),
        action: 'PROGRESS_UPDATE'
      });
      setNoteText('');
      setActiveReportForNote(null);
      fetchInProgress();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to append work note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeReportForResolve) return;

    try {
      setSubmittingResolve(true);
      await client.post(`/api/department-admin/reports/${activeReportForResolve._id}/resolve`, {
        resolutionNotes: resolveForm.resolutionNotes,
        afterImageUrl: resolveForm.afterImageUrl,
        partsUsed: resolveForm.partsUsed.split(',').map(s => s.trim()).filter(Boolean)
      });
      setActiveReportForResolve(null);
      setResolveForm({ resolutionNotes: '', afterImageUrl: '', partsUsed: '' });
      fetchInProgress();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete report resolution.');
    } finally {
      setSubmittingResolve(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Clock className="w-6 h-6 text-sky-400" />
            <span>Active Field Work Orders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Jobs currently under repair by your department's field maintenance and technical crews.
          </p>
        </div>

        <button
          onClick={fetchInProgress}
          className="p-2.5 rounded-xl bg-[#082027] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading active work orders...
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#082027] border border-teal-950 rounded-2xl">
          No work orders are currently marked in progress.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reports.map((report) => (
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    IN REPAIR
                  </span>
                </div>

                {report.imageUrl && (
                  <img
                    src={report.imageUrl}
                    alt="Issue"
                    className="w-full h-36 object-cover rounded-xl border border-teal-950 mb-3 bg-black/40"
                  />
                )}

                <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{report.location?.address || 'GPS Coordinates Registered'}</span>
                </div>

                {/* Latest Note preview */}
                {report.workNotes && report.workNotes.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#06181D] border border-teal-950 text-xs text-slate-300 mb-3">
                    <span className="text-[10px] uppercase font-bold text-teal-400 block mb-1">
                      Latest Crew Update:
                    </span>
                    <p className="line-clamp-2">{report.workNotes[report.workNotes.length - 1].note}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-teal-950 flex items-center justify-between">
                <button
                  onClick={() => setActiveReportForNote(report)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-950 border border-teal-800 text-teal-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>

                <button
                  onClick={() => setActiveReportForResolve(report)}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-emerald-950/50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Repair</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD WORK NOTE MODAL */}
      {activeReportForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#082027] border border-teal-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900 mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span>Append Work Note</span>
              </h2>
              <button onClick={() => setActiveReportForNote(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <textarea
                rows={4}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Asphalt compaction unit arrived on site; paving layer 1 in progress."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#06181D] border border-teal-900 text-white text-xs focus:outline-none focus:border-teal-400 resize-none"
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReportForNote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-4 py-2 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-xs font-bold uppercase tracking-wider"
                >
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE WORK ORDER MODAL */}
      {activeReportForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#082027] border border-teal-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900 mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Verify & Mark Resolved</span>
              </h2>
              <button onClick={() => setActiveReportForResolve(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Resolving this report will notify the citizen and mark the SLA as fulfilled.
            </p>

            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resolution Summary *</label>
                <textarea
                  rows={3}
                  required
                  value={resolveForm.resolutionNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                  placeholder="Describe repair actions taken (e.g., Road surface patched and sealed; tested for smooth vehicular passage)."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">After-Repair Photo URL (Proof of Work)</label>
                <input
                  type="url"
                  value={resolveForm.afterImageUrl}
                  onChange={(e) => setResolveForm({ ...resolveForm, afterImageUrl: e.target.value })}
                  placeholder="https://... (URL or leave empty for default)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Materials / Crews Used (comma separated)</label>
                <input
                  type="text"
                  value={resolveForm.partsUsed}
                  onChange={(e) => setResolveForm({ ...resolveForm, partsUsed: e.target.value })}
                  placeholder="e.g. Cold asphalt mix (250kg), Crew Unit 4"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06181D] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-teal-900">
                <button
                  type="button"
                  onClick={() => setActiveReportForResolve(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase disabled:opacity-50"
                >
                  {submittingResolve ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
