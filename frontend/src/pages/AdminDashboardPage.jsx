import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Layers, 
  RefreshCw, 
  Eye, 
  AlertTriangle, 
  Building2, 
  Bell, 
  ArrowRight, 
  Radio
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
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [liveToasts, setLiveToasts] = useState([]);
  const [mapFilter, setMapFilter] = useState('all');

  // Filtered detections for map
  const displayedMapDetections = useMemo(() => {
    if (mapFilter === 'all') return detections;
    if (mapFilter === 'high') return detections.filter(d => d.severity === 'high');
    return detections.filter(d => d.type === mapFilter);
  }, [detections, mapFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detectionsRes, statsRes] = await Promise.all([
        client.get('/api/detections'),
        client.get('/api/stats/summary')
      ]);

      setDetections(detectionsRes.data.detections || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('[Admin Dashboard] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => {
        setDetections((prev) => [newDoc, ...prev]);
        addToast({
          id: Date.now(),
          title: `New Incident #${newDoc.id || newDoc._id}`,
          message: `${newDoc.type.toUpperCase()} recorded (${newDoc.severity.toUpperCase()})`
        });
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      },
      onMerged: ({ detection }) => {
        setDetections((prev) =>
          prev.map((d) => (d.id === detection.id || d._id === detection.id ? detection : d))
        );
        addToast({
          id: Date.now(),
          title: `Incident #${detection.id || detection._id} Clustered`,
          message: `Surged to ${detection.reportCount} reports`
        });
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      },
      onUpdated: (updatedDoc) => {
        setDetections((prev) =>
          prev.map((d) => (d.id === updatedDoc.id || d._id === updatedDoc.id ? updatedDoc : d))
        );
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      },
      onDeleted: ({ id }) => {
        setDetections((prev) => prev.filter((d) => d.id !== id && d._id !== id));
        client.get('/api/stats/summary').then((res) => setStats(res.data)).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, []);

  const addToast = (toast) => {
    setLiveToasts((prev) => [toast, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setLiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 5000);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 font-sans">
      
      {/* Live Toast Feed */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
        {liveToasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 rounded-xl bg-white border-l-4 border-l-blue-600 border border-slate-200 shadow-xl flex items-start space-x-3 pointer-events-auto"
          >
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <Bell className="w-4 h-4 text-blue-600 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{toast.title}</p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Hero Command Bar */}
      <div className="civic-hero p-6 sm:p-7 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center shadow-2xs">
              <Radio className="w-3.5 h-3.5 mr-1.5 text-blue-600 animate-pulse" />
              MUNICIPAL DISPATCH HEADQUARTERS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            City Operations Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
            Real-time telemetry, automated defect clustering, and departmental work order routing.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="civic-btn-secondary shrink-0 self-start md:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Feeds</span>
        </button>
      </div>

      {/* Summary Precision KPI Gauges */}
      <StatsOverview stats={stats} />

      {/* Interactive Jurisdiction Map */}
      <div className="civic-panel p-5 sm:p-6 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Jurisdiction Map & Spatial Radar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-mono text-blue-700 border border-blue-200">
                {displayedMapDetections.length} plotted
              </span>
            </h3>
          </div>

          {/* Map Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {[
              { id: 'all', label: 'All' },
              { id: 'high', label: 'Critical Only', dot: 'bg-rose-500' },
              { id: 'pothole', label: 'Potholes', dot: 'bg-amber-500' },
              { id: 'garbage', label: 'Garbage', dot: 'bg-emerald-500' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMapFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mapFilter === tab.id
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`}></span>}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
          <MapView
            detections={displayedMapDetections}
            onSelectDetection={(d) => setSelectedDetection(d)}
            height="460px"
            enableHeatmapToggle={true}
          />
        </div>
      </div>

      {/* Recent Incidents and Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Incidents (2 cols) */}
        <div className="lg:col-span-2 civic-panel p-5 sm:p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Priority Operational Queue</h3>
                <p className="text-[11px] text-slate-500">Unresolved defects requiring field verification</p>
              </div>
            </div>

            <Link
              to="/admin/issues"
              className="civic-btn-secondary text-xs py-1.5 px-3"
            >
              <span>View All Issues</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {detections.slice(0, 5).map((d) => (
              <div
                key={d.id || d._id}
                onClick={() => setSelectedDetection(d)}
                className="py-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      #{d.id ? d.id.slice(-6).toUpperCase() : (d._id ? d._id.slice(-6).toUpperCase() : 'INCIDENT')}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 uppercase">
                      {d.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {d.address || `${Number(d.lat).toFixed(4)}, ${Number(d.lng).toFixed(4)}`}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    d.severity === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    d.severity === 'medium' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {d.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200">
                    {d.status}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetection(d);
                    }}
                    className="p-1 rounded-md text-slate-500 hover:text-blue-600 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Workload (1 col) */}
        <div className="civic-panel p-5 sm:p-6 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Department Routing</h3>
                <p className="text-[11px] text-slate-500">Active municipal dispatch load</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Roads & Works', count: detections.filter(d => (d.assignedDepartment || '').includes('Roads') || d.type === 'pothole').length, dot: 'bg-amber-500' },
                { name: 'Sanitation', count: detections.filter(d => (d.assignedDepartment || '').includes('Sanitation') || d.type === 'garbage').length, dot: 'bg-rose-500' },
                { name: 'Electrical Board', count: detections.filter(d => (d.assignedDepartment || '').includes('Electrical') || d.type === 'streetlight').length, dot: 'bg-yellow-500' },
                { name: 'Water & Sewage', count: detections.filter(d => (d.assignedDepartment || '').includes('Water') || d.type === 'water_leak').length, dot: 'bg-sky-500' },
              ].map((dept) => (
                <div key={dept.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${dept.dot}`}></span>
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/admin/issues"
            className="civic-btn-primary w-full text-xs py-2.5 justify-center mt-4"
          >
            <span>Full Municipal Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Detection Inspection Modal */}
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
