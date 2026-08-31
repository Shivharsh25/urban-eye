import React, { useState, useEffect } from 'react';
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
  Download 
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

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState(-1);

  // Modals & Notifications
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [liveToasts, setLiveToasts] = useState([]);

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

  // Filter and Sort Table Data
  const filteredDetections = detections.filter((d) => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (filterSeverity !== 'all' && d.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (filterDept !== 'all' && d.assignedDepartment !== filterDept) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchAddress = d.address && d.address.toLowerCase().includes(term);
      const matchId = (d.id || d._id || '').toLowerCase().includes(term);
      const matchType = d.type && d.type.toLowerCase().includes(term);
      const matchDept = d.assignedDepartment && d.assignedDepartment.toLowerCase().includes(term);
      if (!matchAddress && !matchId && !matchType && !matchDept) return false;
    }

    return true;
  });

  filteredDetections.sort((a, b) => {
    const valA = a[sortField] || 0;
    const valB = b[sortField] || 0;
    if (valA < valB) return sortDir === 1 ? -1 : 1;
    if (valA > valB) return sortDir === 1 ? 1 : -1;
    return 0;
  });

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

      {/* Summary KPI Cards */}
      <StatsOverview stats={stats} />

      {/* Interactive Map & Live Heatmap */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-200">
              City Map Overview
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Displaying {filteredDetections.length} geocoded incidents
          </span>
        </div>

        <MapView
          detections={filteredDetections}
          onSelectDetection={(d) => setSelectedDetection(d)}
          height="480px"
          enableHeatmapToggle={true}
        />
      </div>

      {/* Filterable Incident Triage Table */}
        {/* Table Container */}
        <div className="rounded-3xl glass-card border-t border-t-white/5 flex flex-col shadow-2xl overflow-hidden mt-6">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-500" />
              <span>Reported Issues</span>
            </h2>
            
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-950/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-48 font-mono"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-700/50 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Types</option>
                <option value="pothole">Potholes</option>
                <option value="garbage">Garbage</option>
                <option value="water_leak">Water Leaks</option>
                <option value="streetlight">Streetlights</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-700/50 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-700/50 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 bg-slate-900/20">
            <table className="w-full text-left text-sm font-sans whitespace-nowrap">
              <thead className="bg-slate-950/80 border-b border-slate-800/60 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Ref ID & Asset</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Assigned Dept</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Reports</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredDetections.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      No incidents matching current criteria
                    </td>
                  </tr>
                ) : (
                  filteredDetections.map((d) => (
                    <tr
                      key={d.id || d._id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDetection(d)}
                    >
                      {/* Ref ID & Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                            {d.imageUrl ? (
                              <img src={d.imageUrl.startsWith('http') ? d.imageUrl : `https://urban-eye-wi2j.onrender.com${d.imageUrl}`} alt={d.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">N/A</div>
                            )}
                          </div>
                          <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors font-mono">
                            #{d.id || d._id}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 uppercase font-black tracking-wider text-cyan-400 text-xs">
                        {d.type?.replace('_', ' ') || 'UNKNOWN'}
                      </td>

                      {/* Severity */}
                      <td className="px-6 py-4">
                        {severityBadge(d.severity)}
                      </td>

                      {/* Assigned Dept */}
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        <span className="truncate block max-w-[180px]">
                          {d.assignedDepartment || 'Municipal Ops'}
                        </span>
                      </td>

                      {/* Location & Address */}
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        <span className="truncate block max-w-[220px]">
                          {d.address || `${d.lat}, ${d.lng}`}
                        </span>
                      </td>

                      {/* Reports Count */}
                      <td className="px-6 py-4 font-bold text-slate-200">
                        <span className="px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
                          {d.reportCount || 1}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {statusBadge(d.status)}
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDetection(d)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 hover:text-slate-950 hover:bg-cyan-400 border border-cyan-500/40 transition-all inline-flex items-center space-x-2 shadow-lg shadow-cyan-500/10"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Inspect</span>
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to permanently delete this report?')) {
                                try {
                                  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/detections/${d.id || d._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${localStorage.getItem('urban_eye_token')}`
                                    }
                                  });
                                  if (response.ok) {
                                    setDetections((prev) => prev.filter((item) => item.id !== d.id && item._id !== d._id));
                                  } else {
                                    alert('Failed to delete report');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Error deleting report');
                                }
                              }
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-slate-950 hover:bg-red-400 border border-red-500/40 transition-all inline-flex items-center space-x-2 shadow-lg shadow-red-500/10"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
