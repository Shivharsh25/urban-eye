import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Users, 
  Download,
  ExternalLink,
  ShieldCheck,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';
import DetectionModal from '../components/DetectionModal';
import { generateReportPDF } from '../utils/pdfGenerator';

export default function AdminIssuesPage() {
  const [detections, setDetections] = useState([]);
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

  // Modal
  const [selectedDetection, setSelectedDetection] = useState(null);

  const fetchDetections = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/detections');
      setDetections(res.data.detections || []);
    } catch (err) {
      console.error('[Admin Issues] Fetch error:', err);
      setError('Failed to load reported issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();

    const unsubscribe = subscribeToDetections({
      onCreated: (newDoc) => setDetections((prev) => [newDoc, ...prev]),
      onMerged: ({ detection }) => setDetections((prev) =>
        prev.map((d) => (d.id === detection.id || d._id === detection.id ? detection : d))
      ),
      onUpdated: (updatedDoc) => setDetections((prev) =>
        prev.map((d) => (d.id === updatedDoc.id || d._id === updatedDoc.id ? updatedDoc : d))
      ),
      onDeleted: ({ id }) => setDetections((prev) =>
        prev.filter((d) => d.id !== id && d._id !== id)
      )
    });

    return () => unsubscribe();
  }, []);

  // Filter and Sort Table Data
  const filteredDetections = detections.filter((d) => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (filterSeverity !== 'all') {
      const num = parseInt(d.severity);
      if (!isNaN(num)) {
        if (filterSeverity === 'high' && num < 70) return false;
        if (filterSeverity === 'medium' && (num < 40 || num >= 70)) return false;
        if (filterSeverity === 'low' && num >= 40) return false;
      } else if (d.severity !== filterSeverity) {
        return false;
      }
    }
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
    const raw = sev || '50%';
    const num = parseInt(raw);
    let tier = 'medium';
    let label = raw;

    if (!isNaN(num)) {
      label = `${num}%`;
      if (num >= 70) tier = 'high';
      else if (num >= 40) tier = 'medium';
      else tier = 'low';
    } else {
      tier = String(raw).toLowerCase();
      label = tier.toUpperCase();
    }

    const styles = {
      high: 'bg-rose-50 text-rose-700 border-rose-200',
      critical: 'bg-rose-50 text-rose-700 border-rose-200',
      medium: 'bg-amber-50 text-amber-700 border-amber-200',
      low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border flex items-center gap-1.5 w-fit ${styles[tier] || styles.medium}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {label}
      </span>
    );
  };

  const statusBadge = (st) => {
    const s = (st || 'new').toLowerCase();
    const styles = {
      new: 'bg-blue-50 text-blue-700 border-blue-200',
      assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${styles[s] || styles.new}`}>
        {st}
      </span>
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredDetections.length === 0) return alert('No records to export.');
    
    const headers = ['Ref ID', 'Category', 'Severity', 'Assigned Dept', 'Status', 'Reports', 'Address', 'Latitude', 'Longitude', 'Date'];
    const rows = filteredDetections.map(d => [
      d.id || d._id,
      d.type,
      d.severity,
      `"${(d.assignedDepartment || '').replace(/"/g, '""')}"`,
      d.status,
      d.reportCount || 1,
      `"${(d.address || '').replace(/"/g, '""')}"`,
      d.lat,
      d.lng,
      new Date(d.createdAt).toISOString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanEye_Reported_Issues_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in font-sans">
      
      {/* Bento Hero Header */}
      <div className="bento-hero p-6 sm:p-7 relative overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider flex items-center shadow-2xs">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                MUNICIPAL INFRASTRUCTURE DEFECT REGISTRY
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Reported Issues Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Centralized municipal infrastructure defect registry, verification status, and work order assignment.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Export filtered records to CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchDetections}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Feeds</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Precision Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Issues */}
        <div className="bento-card p-4 sm:p-5 bg-white border border-slate-200 shadow-2xs group hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Defect Logs</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-display tracking-tight tabular-nums">{detections.length}</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">LIVE FEED</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span>Matching current filters:</span>
              <span className="font-bold text-slate-900">{filteredDetections.length}</span>
            </div>
          </div>
        </div>

        {/* Critical & High Priority */}
        <div className="bento-card p-4 sm:p-5 bg-white border border-slate-200 shadow-2xs group hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">High / Critical</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-700 font-display tracking-tight tabular-nums">
                {detections.filter(d => {
                  const num = parseInt(d.severity);
                  return !isNaN(num) ? num >= 70 : ['high', 'critical'].includes((d.severity || '').toLowerCase());
                }).length}
              </span>
              <span className="text-[10px] text-rose-700 font-bold px-2 py-0.5 rounded bg-rose-50 border border-rose-200">URGENT</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Urgent road hazards & defects
            </div>
          </div>
        </div>

        {/* In Triage / Assigned */}
        <div className="bento-card p-4 sm:p-5 bg-white border border-slate-200 shadow-2xs group hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Active Triage</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700 font-display tracking-tight tabular-nums">
                {detections.filter(d => ['new', 'assigned'].includes((d.status || '').toLowerCase())).length}
              </span>
              <span className="text-[10px] text-amber-700 font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">ASSIGNED</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Pending field crew resolution
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bento-card p-4 sm:p-5 bg-white border border-slate-200 shadow-2xs group hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved Cases</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 font-display tracking-tight tabular-nums">
                {detections.filter(d => (d.status || '').toLowerCase() === 'resolved').length}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                {detections.length > 0 ? `${Math.round((detections.filter(d => (d.status || '').toLowerCase() === 'resolved').length / detections.length) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Successfully closed & verified
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl bg-white border border-slate-200 flex flex-col shadow-xs overflow-hidden">
        
        {/* Search & Filter Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Filter Records
            </span>
            <span className="text-xs text-slate-500 font-sans font-medium">
              ({filteredDetections.length} of {detections.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search address, ID, dept..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-full sm:w-56 font-sans shadow-2xs"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-sans focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="pothole">Potholes</option>
              <option value="garbage">Garbage</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-sans focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="high">High / Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-sans focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>

            {(searchTerm || filterType !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterSeverity('all');
                  setFilterStatus('all');
                }}
                className="px-2.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-sans whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Ref ID & Photo</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Assigned Department</th>
                <th className="px-6 py-4">Address / Coordinates</th>
                <th className="px-6 py-4 text-center">Citizen Reports</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="font-medium text-xs">Loading reported issues...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDetections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Layers className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="font-bold text-slate-700">No issues found</span>
                      <span className="text-slate-500 text-[11px]">Try adjusting your search criteria or filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDetections.map((d) => (
                  <tr
                    key={d.id || d._id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedDetection(d)}
                  >
                    {/* Ref ID & Image Thumbnail */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                          {d.imageUrl ? (
                            <img 
                              src={d.imageUrl.startsWith('http') ? d.imageUrl : `https://urban-eye-wi2j.onrender.com${d.imageUrl}`} 
                              alt={d.type} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-sans">N/A</div>
                          )}
                        </div>
                        <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors font-mono">
                          #{d.id ? d.id.slice(-8).toUpperCase() : (d._id ? d._id.slice(-8).toUpperCase() : 'NEW')}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-3.5 uppercase font-bold tracking-wider text-blue-600 text-xs">
                      {d.type?.replace('_', ' ') || 'UNKNOWN'}
                    </td>

                    {/* Severity */}
                    <td className="px-6 py-3.5">
                      {severityBadge(d.severity)}
                    </td>

                    {/* Assigned Dept */}
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      {d.assignedDepartment || 'Municipal Operations'}
                    </td>

                    {/* Address */}
                    <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate font-medium">
                      <span className="flex items-center gap-1.5 truncate" title={d.address}>
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{d.address || `${Number(d.lat).toFixed(4)}, ${Number(d.lng).toFixed(4)}`}</span>
                      </span>
                    </td>

                    {/* Reports Count */}
                    <td className="px-6 py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-sans font-bold text-slate-700 text-xs">
                        {d.reportCount || 1}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      {statusBadge(d.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedDetection(d)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Inspect Details & Formal Letter"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateReportPDF(d)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Download Formal PDF Report"
                        >
                          <Download className="w-4 h-4" />
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

      {/* Detail Inspection & Formal Letter Modal */}
      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onStatusUpdated={(updated) => {
            setDetections((prev) =>
              prev.map((d) => (d.id === updated.id || d._id === updated.id ? updated : d))
            );
          }}
        />
      )}

    </div>
  );
}
