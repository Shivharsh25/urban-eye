import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';
import { useLanguage } from '../context/LanguageContext';
import DetectionCard from '../components/DetectionCard';
import DetectionModal from '../components/DetectionModal';

export default function CitizenReportsPage() {
  const { t } = useLanguage();
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

    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => setReports((prev) => [newDoc, ...prev]),
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

    return () => unsubscribe();
  }, []);

  const filteredReports = reports.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="civic-hero p-6 sm:p-8 bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              CITIZEN INCIDENT LOG
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
              {reports.length} logged
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            My Submitted Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
            Real-time status tracking for civic issues you reported. Monitored and assigned by zonal engineers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchReports}
            className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/report"
            className="civic-btn-primary shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        {['all', 'new', 'assigned', 'resolved'].map((status) => {
          const count = status === 'all' 
            ? reports.length 
            : reports.filter((r) => r.status === status).length;
          const isSelected = filterStatus === status;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="capitalize">{status === 'all' ? 'All Incidents' : status}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      {loading && reports.length === 0 ? (
        <div className="civic-panel flex flex-col items-center justify-center p-20 space-y-4 bg-white">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide">Syncing incident database...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-white border border-rose-200 text-rose-800 text-sm flex items-center space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="civic-panel text-center py-20 px-4 flex flex-col items-center bg-white">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Reports Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            {filterStatus === 'all'
              ? 'You have not submitted any incident reports yet.'
              : `No reports found matching status "${filterStatus}".`}
          </p>
          <Link
            to="/report"
            className="mt-5 civic-btn-primary shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Submit First Defect Report</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
