import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Camera, 
  RefreshCw, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';
import DetectionCard from '../components/DetectionCard';
import DetectionModal from '../components/DetectionModal';

export default function CitizenReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/detections');
      setReports(res.data.detections || []);
    } catch (err) {
      console.error('[My Reports] Fetch error:', err);
      setError('Failed to fetch your reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to live WebSockets updates for this citizen's reports
    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => {
        setReports((prev) => [newDoc, ...prev]);
      },
      onMerged: ({ detection }) => {
        setReports((prev) =>
          prev.map((d) => (d.id === detection.id || d._id === detection.id ? detection : d))
        );
      },
      onUpdated: (updatedDoc) => {
        setReports((prev) =>
          prev.map((d) => (d.id === updatedDoc.id || d._id === updatedDoc.id ? updatedDoc : d))
        );
      },
      onDeleted: ({ id }) => {
        setReports((prev) => prev.filter((d) => d.id !== id && d._id !== id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredReports = reports.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              My Submitted Reports
            </h1>
            <span className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold animate-pulse">
              LIVE TRACKING
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Track real-time status changes and community confirmations for your reported infrastructure issues
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchReports}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 hover:text-white hover:bg-slate-800 transition-colors shadow-lg"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/report"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'new', 'assigned', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase transition-all whitespace-nowrap ${
              filterStatus === status
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80 hover:bg-slate-800'
            }`}
          >
            {status === 'all' ? `All Reports (${reports.length})` : status}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-6">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-sm font-mono font-bold text-cyan-400 animate-pulse tracking-widest">SYNCING LIVE REPORTS...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl glass-card border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3 shadow-2xl">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl glass-card flex flex-col items-center border-t border-t-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-900/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-inner mb-6 relative z-10 border border-slate-800/80">
            <FileText className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-100 relative z-10">No reports found</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto relative z-10 font-medium">
            {filterStatus === 'all'
              ? "You haven't submitted any infrastructure issue reports yet."
              : `No reports with status "${filterStatus}".`}
          </p>
          <Link
            to="/report"
            className="mt-8 relative z-10 inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 transition-all shadow-xl shadow-cyan-500/25 transform hover:scale-105 active:scale-95"
          >
            <Camera className="w-5 h-5" />
            <span>Submit Your First Report</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReports.map((d) => (
            <DetectionCard
              key={d.id || d._id}
              detection={d}
              onInspect={(selected) => setSelectedDetection(selected)}
            />
          ))}
        </div>
      )}

      {/* Detection Inspection Modal */}
      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onStatusUpdated={(updated) => {
            setReports((prev) =>
              prev.map((d) => (d.id === updated.id || d._id === updated.id ? updated : d))
            );
            setSelectedDetection(updated);
          }}
        />
      )}

    </div>
  );
}
