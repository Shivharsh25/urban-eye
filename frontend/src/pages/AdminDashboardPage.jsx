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
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border border-[#E8E2E5] bg-[#F6F6FC] text-[#302B69]">
        {sev}
      </span>
    );
  };

  const statusBadge = (st) => {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border border-[#E8E2E5] bg-white text-[#191636]">
        {st}
      </span>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-8 bg-[#F6EBE8] font-sans">
      
      {/* Live Toast Feed */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
        {liveToasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 rounded-2xl bg-white border border-[#E8E2E5] shadow-xs flex items-start space-x-4 pointer-events-auto animate-bounce-short"
          >
            <div className="p-2 bg-[#F6F6FC] rounded-xl shrink-0 text-[#302B69]">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold font-sans text-[#191636]">{toast.title}</p>
              <p className="text-xs text-[#57536E] mt-1 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6F6FC] flex items-center justify-center border border-[#E8E2E5] text-[#302B69] shadow-xs">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[#191636] tracking-tight">
              City Dashboard
            </h1>
          </div>
          <p className="text-sm text-[#57536E] mt-1 font-medium">
            Overview of all reported infrastructure issues across the city
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F6FC] text-[#191636] hover:text-[#302B69] border border-[#E8E2E5] text-xs font-bold transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>
        </div>
      </div>

      {/* Realtime Mission Control Telemetry Bar */}
      <div className="p-3 rounded-2xl bg-white border border-[#E8E2E5] flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs text-[#191636]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] font-mono font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#302B69] animate-pulse"></span>
            <span>YOLOv8 VISION INFERENCE ONLINE</span>
          </div>
          <span className="hidden sm:inline text-[#E8E2E5]">|</span>
          <span className="hidden sm:flex items-center text-[#57536E] font-mono text-[11px]">
            Model: <span className="text-[#191636] font-bold ml-1">yolov8n-urban-v2</span>
          </span>
          <span className="hidden md:inline text-[#E8E2E5]">|</span>
          <span className="hidden md:flex items-center text-[#57536E] font-mono text-[11px]">
            Confidence Cutoff: <span className="text-[#302B69] font-bold ml-1">0.65</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 ml-auto text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 text-[#57536E]">
            <span>WebSocket Ping:</span>
            <span className="text-[#191636] font-bold">18ms</span>
          </div>
          <span className="text-[#E8E2E5]">|</span>
          <div className="flex items-center space-x-1.5 text-[#57536E]">
            <span>City Hotspots:</span>
            <span className="text-[#302B69] font-bold">{detections.length}</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <StatsOverview stats={stats} />

      {/* Interactive Map & Live Heatmap */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#302B69]" />
            <h3 className="text-lg font-bold text-[#191636] flex items-center gap-2">
              <span>City Map Overview</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F6F6FC] text-[11px] font-mono text-[#302B69] border border-[#E8E2E5]">
                {displayedMapDetections.length} plotted
              </span>
            </h3>
          </div>

          {/* Quick Map Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E8E2E5] shadow-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'high', label: 'Critical Only' },
              { id: 'pothole', label: 'Potholes' },
              { id: 'garbage', label: 'Garbage' },
              { id: 'water_leak', label: 'Water Leaks' },
              { id: 'streetlight', label: 'Streetlights' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMapFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mapFilter === tab.id
                    ? 'bg-[#302B69] text-white shadow-xs'
                    : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC]'
                }`}
              >
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
        <div className="lg:col-span-2 rounded-3xl bg-white border border-[#E8E2E5] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E8E2E5] bg-[#F6F6FC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E2E5] flex items-center justify-center shrink-0 text-[#302B69]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#191636] tracking-wide flex items-center gap-2">
                  <span>Recent Priority Incidents</span>
                  <span className="text-[11px] font-mono text-[#302B69] font-normal">({detections.length} total)</span>
                </h3>
                <p className="text-[11px] text-[#57536E]">
                  Latest municipal defect reports requiring assessment
                </p>
              </div>
            </div>

            <Link
              to="/admin/issues"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#302B69] text-[#302B69] hover:text-white border border-[#E8E2E5] text-xs font-bold transition-all shadow-xs group shrink-0 w-fit"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open Reported Issues Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-[#E8E2E5] flex-1">
            {detections.slice(0, 5).length === 0 ? (
              <div className="p-10 text-center text-[#57536E] text-xs">
                No active incidents recorded.
              </div>
            ) : (
              detections.slice(0, 5).map((d) => (
                <div
                  key={d.id || d._id}
                  onClick={() => setSelectedDetection(d)}
                  className="p-4 hover:bg-[#F6F6FC] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F6F6FC] border border-[#E8E2E5] shrink-0">
                      {d.imageUrl ? (
                        <img 
                          src={d.imageUrl.startsWith('http') ? d.imageUrl : `https://urban-eye-wi2j.onrender.com${d.imageUrl}`} 
                          alt={d.type} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8C87A6] font-mono">N/A</div>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#191636] group-hover:text-[#302B69] transition-colors">
                          #{d.id ? d.id.slice(-8).toUpperCase() : (d._id ? d._id.slice(-8).toUpperCase() : 'INCIDENT')}
                        </span>
                        <span className="text-[11px] font-bold text-[#302B69] uppercase tracking-wider">
                          {d.type?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#57536E] truncate mt-0.5" title={d.address}>
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
                      className="p-1.5 rounded-lg bg-[#F6F6FC] hover:bg-[#302B69] border border-[#E8E2E5] text-[#302B69] hover:text-white transition-colors"
                      title="Inspect AI Details & Letter"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-[#F6F6FC] border-t border-[#E8E2E5] text-center">
            <Link
              to="/admin/issues"
              className="text-xs text-[#57536E] hover:text-[#302B69] font-semibold transition-colors inline-flex items-center space-x-1.5"
            >
              <span>View full filterable registry with search & CSV export in Reported Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Operational Dispatch & Department Load (Spans 1 column) */}
        <div className="rounded-3xl bg-white border border-[#E8E2E5] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[#E8E2E5]">
              <div className="w-9 h-9 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center shrink-0 text-[#302B69]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#191636] tracking-wide">
                  Department Workload
                </h3>
                <p className="text-[11px] text-[#57536E]">
                  Active municipal dispatch distribution
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Roads & Public Works', count: detections.filter(d => (d.assignedDepartment || '').includes('Roads') || d.type === 'pothole').length },
                { name: 'Sanitation Dept', count: detections.filter(d => (d.assignedDepartment || '').includes('Sanitation') || d.type === 'garbage').length },
                { name: 'Electrical & Lighting', count: detections.filter(d => (d.assignedDepartment || '').includes('Electrical') || d.type === 'streetlight').length },
                { name: 'Water & Sewage Board', count: detections.filter(d => (d.assignedDepartment || '').includes('Water') || d.type === 'water_leak').length },
              ].map((dept) => (
                <div key={dept.name} className="p-3 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#302B69]"></span>
                    <span className="text-xs text-[#191636] font-medium truncate">{dept.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#302B69] px-2.5 py-0.5 rounded-lg bg-white border border-[#E8E2E5]">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E8E2E5]">
            <Link
              to="/admin/issues"
              className="w-full py-2.5 px-4 rounded-xl bg-[#302B69] hover:bg-[#242052] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all group"
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
