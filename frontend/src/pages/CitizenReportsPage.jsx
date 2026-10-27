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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 text-[#191636]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 gap-4 border-b border-[#E8E2E5]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F6FC] flex items-center justify-center border border-[#E8E2E5] shadow-xs shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#302B69]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191636] tracking-tight">
              {t('mySubmittedReports')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5] text-[10px] font-mono font-bold">
              {t('liveTracking')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#57536E] mt-1 font-medium">
            {t('reportsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReports}
            className="p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] hover:border-[#302B69]/40 text-[#191636] transition-colors shadow-xs shrink-0 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 text-[#302B69] ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/report"
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#302B69] hover:bg-[#242052] shadow-xs transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{t('reportNewIssue')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2.5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'new', 'assigned', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              filterStatus === status
                ? 'bg-[#302B69] text-white border-[#302B69] shadow-xs'
                : 'bg-white text-[#57536E] hover:bg-[#F6F6FC] border-[#E8E2E5]'
            }`}
          >
            {status === 'all' ? `${t('allReports')} (${reports.length})` : t(status, status)}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-3 border-[#302B69]/20 border-t-[#302B69] rounded-full animate-spin"></div>
          <p className="text-xs font-mono font-bold text-[#302B69] tracking-wider">{t('syncing')}</p>
        </div>
      ) : error ? (
        <div className="p-5 rounded-2xl bg-white border border-rose-200 text-rose-700 text-sm flex items-center space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E8E2E5] flex flex-col items-center shadow-xs relative overflow-hidden">
          <div className="w-16 h-16 bg-[#F6F6FC] rounded-2xl flex items-center justify-center mb-4 border border-[#E8E2E5]">
            <FileText className="w-8 h-8 text-[#302B69]" />
          </div>
          <h3 className="text-xl font-bold text-[#191636]">{t('noReportsFound')}</h3>
          <p className="text-xs sm:text-sm text-[#57536E] mt-1 max-w-sm mx-auto font-medium">
            {filterStatus === 'all'
              ? t('noReportsSubmittedYet')
              : `${t('noReportsFound')} (${t(filterStatus, filterStatus)}).`}
          </p>
          <Link
            to="/report"
            className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#302B69] hover:bg-[#242052] transition-all shadow-xs active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{t('submitFirstReport')}</span>
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
