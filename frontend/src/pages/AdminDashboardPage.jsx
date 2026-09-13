import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Flame, 
  MapPin, 
  Layers, 
  Filter, 
  Search, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Users, 
  Bell, 
  Download,
  ArrowRight,
  Cpu,
  Zap,
  Radio,
  ShieldCheck
} from 'lucide-react';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';
import StatsOverview from '../components/StatsOverview';
import MapView from '../components/MapView';
import DetectionModal from '../components/DetectionModal';

export default function AdminDashboardPage() {
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Notifications
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [liveToasts, setLiveToasts] = useState([]);
  const [mapFilter, setMapFilter] = useState('all');

  // Filtered detections for map
  const displayedMapDetections = useMemo(() => {
    if (mapFilter === 'all') return detections;
    if (mapFilter === 'high') return detections.filter(d => d.severity === 'high');
    return detections.filter(d => d.type === mapFilter);
  }, [detections, mapFilter]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [detectionsRes, statsRes] = await Promise.all([
        client.get('/api/detections'),
        client.get('/api/stats/summary')
      ]);

      setDetections(detectionsRes.data.detections || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('[Admin Dashboard] Fetch error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to live events
    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => {
        console.log('[Admin Socket] New detection created:', newDoc);
        setDetections((prev) => [newDoc, ...prev]);
        addToast({
          id: Date.now(),
          type: 'created',
          title: `New Incident #${newDoc.id || newDoc._id}`,
          message: `${newDoc.type.toUpperCase()} detected at ${newDoc.address || 'Metro area'} (${newDoc.severity.toUpperCase()})`
        });
        // Refresh stats
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      },
      onMerged: ({ detection, details }) => {
        console.log('[Admin Socket] Duplicate merged:', detection);
        setDetections((prev) =>
          prev.map((d) => (d.id === detection.id || d._id === detection.id ? detection : d))
        );
        addToast({
          id: Date.now(),
          type: 'merged',
          title: `Incident #${detection.id || detection._id} Clustered`,
          message: `Surged to ${detection.reportCount} reports (${detection.severity.toUpperCase()})`
        });
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      },
      onUpdated: (updatedDoc) => {
        console.log('[Admin Socket] Detection updated:', updatedDoc);
        setDetections((prev) =>
          prev.map((d) => (d.id === updatedDoc.id || d._id === updatedDoc.id ? updatedDoc : d))
        );
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      },
      onDeleted: ({ id }) => {
        console.log('[Admin Socket] Detection deleted:', id);
        setDetections((prev) => prev.filter((d) => d.id !== id && d._id !== id));
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addToast = (toast) => {
    setLiveToasts((prev) => [toast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setLiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 6000);
  };



  const severityBadge = (sev) => {
    const styles = {
      high: 'bg-rose-500/20 text-rose-500 border-rose-500/40',
      medium: 'bg-amber-500/20 text-amber-500 border-amber-500/40',
      low: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase border ${styles[sev] || styles.medium}`}>
        {sev}
      </span>
    );
  };

  const statusBadge = (st) => {
    const styles = {
      new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      assigned: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase border ${styles[st] || styles.new}`}>
        {st}
      </span>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-8">
      
      {/* Live Toast Feed */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
        {liveToasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 rounded-2xl glass-card border-l-4 border-l-cyan-500 shadow-2xl flex items-start space-x-4 pointer-events-auto animate-bounce-short"
          >
            <div className="p-2 bg-cyan-500/10 rounded-xl shrink-0">
              <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold font-sans text-white">{toast.title}</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              City Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Overview of all reported infrastructure issues across the city
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>
        </div>
      </div>

      {/* Realtime Mission Control Telemetry Bar */}
      <div className="p-3 rounded-2xl glass-card border border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>YOLOv8 VISION INFERENCE ONLINE</span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:flex items-center text-slate-400 font-mono text-[11px]">
            Model: <span className="text-slate-200 font-bold ml-1">yolov8n-urban-v2</span>
          </span>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:flex items-center text-slate-400 font-mono text-[11px]">
            Confidence Cutoff: <span className="text-cyan-400 font-bold ml-1">0.65</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 ml-auto text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="text-slate-500">WebSocket Ping:</span>
            <span className="text-emerald-400 font-bold">18ms</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="text-slate-500">City Hotspots:</span>
            <span className="text-cyan-400 font-bold">{detections.length}</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <StatsOverview stats={stats} />

      {/* Interactive Map & Live Heatmap */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>City Map Overview</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-cyan-400 border border-slate-700">
                {displayedMapDetections.length} plotted
              </span>
            </h3>
          </div>

          {/* Quick Map Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800/80">
            {[
              { id: 'all', label: 'All' },
              { id: 'high', label: 'Critical Only', dot: 'bg-rose-400' },
              { id: 'pothole', label: 'Potholes', dot: 'bg-amber-400' },
              { id: 'garbage', label: 'Garbage', dot: 'bg-emerald-400' },
              { id: 'water_leak', label: 'Water Leaks', dot: 'bg-sky-400' },
              { id: 'streetlight', label: 'Streetlights', dot: 'bg-yellow-400' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMapFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  mapFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`}></span>}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <MapView
          detections={displayedMapDetections}
          onSelectDetection={(d) => setSelectedDetection(d)}
          height="480px"
          enableHeatmapToggle={true}
        />
      </div>

      {/* City Operations Quick Triage & Priority Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Recent Priority Alerts Strip (Spans 2 columns) */}
        <div className="lg:col-span-2 rounded-3xl glass-card border border-slate-800/80 shadow-2xl overflow-hidden bg-slate-900/40 flex flex-col">
          <div className="p-5 border-b border-slate-800/60 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Recent Priority Incidents</span>
                  <span className="text-[11px] font-mono text-cyan-400 font-normal">({detections.length} total)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Latest municipal defect reports requiring assessment
                </p>
              </div>
            </div>

            <Link
              to="/admin/issues"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm group shrink-0 w-fit"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open Reported Issues Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/50 flex-1">
            {detections.slice(0, 5).length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs">
                No active incidents recorded.
              </div>
            ) : (
              detections.slice(0, 5).map((d) => (
                <div
                  key={d.id || d._id}
                  onClick={() => setSelectedDetection(d)}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 shadow-inner">
                      {d.imageUrl ? (
                        <img 
                          src={d.imageUrl.startsWith('http') ? d.imageUrl : `https://urban-eye-wi2j.onrender.com${d.imageUrl}`} 
                          alt={d.type} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">N/A</div>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          #{d.id ? d.id.slice(-8).toUpperCase() : (d._id ? d._id.slice(-8).toUpperCase() : 'INCIDENT')}
                        </span>
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                          {d.type?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5" title={d.address}>
                        {d.address || `${Number(d.lat).toFixed(4)}, ${Number(d.lng).toFixed(4)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0">
                    {severityBadge(d.severity)}
                    {statusBadge(d.status)}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDetection(d);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Inspect AI Details & Letter"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-950/40 border-t border-slate-800/60 text-center">
            <Link
              to="/admin/issues"
              className="text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors inline-flex items-center space-x-1.5"
            >
              <span>View full filterable registry with search & CSV export in Reported Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Operational Dispatch & Department Load (Spans 1 column) */}
        <div className="rounded-3xl glass-card border border-slate-800/80 shadow-2xl p-5 bg-slate-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800/60">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Department Workload
                </h3>
                <p className="text-[11px] text-slate-400">
                  Active municipal dispatch distribution
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Roads & Public Works', count: detections.filter(d => (d.assignedDepartment || '').includes('Roads') || d.type === 'pothole').length, dot: 'bg-amber-400' },
                { name: 'Sanitation Dept', count: detections.filter(d => (d.assignedDepartment || '').includes('Sanitation') || d.type === 'garbage').length, dot: 'bg-emerald-400' },
                { name: 'Electrical & Lighting', count: detections.filter(d => (d.assignedDepartment || '').includes('Electrical') || d.type === 'streetlight').length, dot: 'bg-cyan-400' },
                { name: 'Water & Sewage Board', count: detections.filter(d => (d.assignedDepartment || '').includes('Water') || d.type === 'water_leak').length, dot: 'bg-sky-400' },
              ].map((dept) => (
                <div key={dept.name} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${dept.dot}`}></span>
                    <span className="text-xs text-slate-300 font-medium truncate">{dept.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-200 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/60">
            <Link
              to="/admin/issues"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all group"
            >
              <Layers className="w-4 h-4" />
              <span>Go to Reported Issues Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

      {/* Detection Inspection & Triage Modal */}
      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onStatusUpdated={(updated) => {
            setDetections((prev) =>
              prev.map((d) => (d.id === updated.id || d._id === updated.id ? updated : d))
            );
            setSelectedDetection(updated);
          }}
        />
      )}

    </div>
  );
}
