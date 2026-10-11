import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Camera, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Eye, 
  RefreshCw, 
  Compass, 
  PhoneCall, 
  Layers, 
  TrendingUp, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Building,
  Construction,
  Trash2,
  Droplets,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DetectionModal from '../components/DetectionModal';
import api from '../api/client';
import { subscribeToDetections } from '../api/socket';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [reportsRes, annRes] = await Promise.all([
        api.get('/api/detections'),
        api.get('/api/announcements')
      ]);

      setReports(reportsRes.data?.detections || []);
      setAnnouncements(annRes.data || []);
    } catch (err) {
      console.error('[Dashboard Error]:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => setReports(prev => [newDoc, ...prev]),
      onUpdated: (doc) => setReports(prev => prev.map(d => (d.id === doc.id || d._id === doc.id) ? doc : d)),
      onDeleted: ({ id }) => setReports(prev => prev.filter(d => d.id !== id && d._id !== id))
    });

    return () => unsubscribe();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter.toLowerCase()) return false;
      if (typeFilter !== 'ALL' && !r.type?.toLowerCase().includes(typeFilter.toLowerCase())) return false;
      return true;
    });
  }, [reports, statusFilter, typeFilter]);

  // Derived metrics
  const totalCount = reports.length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const activeCount = totalCount - resolvedCount;
  const criticalCount = reports.filter(r => r.severity === 'high').length;
  const velocityRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Category Icon helper
  const getCategoryIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('pothole') || t.includes('road')) return { icon: Construction, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (t.includes('garbage') || t.includes('waste')) return { icon: Trash2, color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (t.includes('water') || t.includes('leak')) return { icon: Droplets, color: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (t.includes('light') || t.includes('lamp')) return { icon: Lightbulb, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
    return { icon: ShieldAlert, color: 'text-blue-700 bg-blue-50 border-blue-200' };
  };

  const resolveImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* 1. Precision Municipal Command Header */}
      <div className="civic-hero p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MUNICIPAL SENSOR GRID ACTIVE</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-600">WARD 04</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Civic Operations & Incident Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Welcome back, <strong className="text-slate-900 font-bold">{user?.name || 'Citizen'}</strong>. Real-time municipal defect tracking, automated computer vision dispatch, and public infrastructure velocity.
          </p>
        </div>

        {/* Quick Action Dock */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/report')}
            className="civic-btn-primary shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Report Defect</span>
          </button>

          <button
            onClick={() => navigate('/map')}
            className="civic-btn-secondary shadow-xs"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Live Radar</span>
          </button>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
            title="Refresh feeds"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Four Precision Swiss Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="civic-panel p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">{totalCount}</span>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Ward Density</span>
              <span className="text-blue-700 font-bold">100% Synced</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="civic-panel p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Issues</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight tabular-nums">{resolvedCount}</span>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Resolution Velocity</span>
              <span className="text-emerald-700 font-bold">{velocityRate}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${velocityRate}%` }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="civic-panel p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Triage</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-800 tracking-tight tabular-nums">{activeCount}</span>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Field Dispatch</span>
              <span className="text-amber-800 font-bold">{totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="civic-panel p-5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Hazards</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-rose-700 tracking-tight tabular-nums">{criticalCount}</span>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Immediate Response</span>
              <span className="text-rose-700 font-bold">{totalCount > 0 ? Math.round((criticalCount / totalCount) * 100) : 0}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-600 h-full rounded-full" style={{ width: `${totalCount > 0 ? (criticalCount / totalCount) * 100 : 0}%` }}></div>
          </div>
        </div>

      </div>

      {/* 3. Main Operational Incident Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Incident List */}
        <div className="lg:col-span-8 civic-panel p-5 sm:p-6 bg-white space-y-5">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Infrastructure Incidents</h2>
              <p className="text-xs text-slate-500 mt-0.5">Verified citizen reports monitored across city sectors</p>
            </div>

            {/* Segmented Status Pill Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              {['ALL', 'NEW', 'ASSIGNED', 'RESOLVED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st 
                      ? 'bg-white text-blue-700 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Items */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Querying municipal telemetry database...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No matching incidents in current filter</p>
              <button
                onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); }}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map(report => {
                const { icon: CatIcon, color: catColor } = getCategoryIcon(report.type);
                const isResolved = report.status === 'resolved';
                const isCritical = report.severity === 'high';
                const imgUrl = resolveImage(report.imageUrl);

                return (
                  <div
                    key={report._id || report.id}
                    onClick={() => setSelectedDetection(report)}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-2xs hover:shadow-xs group bg-white"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      
                      {/* Image Thumbnail / Icon Tile */}
                      {imgUrl ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                          <img src={imgUrl} alt={report.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-xl shrink-0 border flex items-center justify-center ${catColor}`}>
                          <CatIcon className="w-6 h-6" />
                        </div>
                      )}

                      {/* Content Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 capitalize truncate group-hover:text-blue-700 transition-colors">
                            {report.type?.replace('_', ' ') || 'Infrastructure Incident'}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            report.severity === 'medium' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {report.severity?.toUpperCase() || 'MEDIUM'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 truncate flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{report.address || `GPS: ${Number(report.lat || 0).toFixed(4)}, ${Number(report.lng || 0).toFixed(4)}`}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="text-blue-700 font-semibold">{report.assignedDepartment || 'Public Works'}</span>
                          <span>•</span>
                          <span className={isResolved ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            {report.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* View Button */}
                    <div className="shrink-0 self-end sm:self-center">
                      <span className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-1 transition-colors">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Inspect</span>
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right 4 Cols: Municipal Advisory Feed & Emergency Notice */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Municipal Bulletins */}
          <div className="civic-panel p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Municipal Bulletins</span>
              </h3>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                LIVE
              </span>
            </div>

            <div className="space-y-3">
              {announcements.length > 0 ? announcements.slice(0, 3).map((ann, i) => (
                <div key={ann.id || ann._id || i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Today</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{ann.message}</p>
                </div>
              )) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  All municipal services running normally in Ward 04.
                </div>
              )}
            </div>
          </div>

          {/* Quick Emergency Dispatch Box */}
          <div className="civic-panel p-5 sm:p-6 bg-white space-y-3 border-l-4 border-l-rose-600">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Urgent Municipal Hotline</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For open power lines, active water main ruptures, or collapsed roads requiring immediate barricades.
            </p>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs font-mono font-bold text-rose-900">
              <span>TOLL FREE DISPATCH:</span>
              <span className="text-sm">1800-URBAN-EYE</span>
            </div>
          </div>

        </div>

      </div>

      {/* Detection Inspection Modal */}
      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
        />
      )}

    </div>
  );
}
