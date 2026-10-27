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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in font-sans bg-[#F6EBE8]">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2E5]">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69] shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#191636] tracking-tight">
                Reported Issues
              </h1>
              <p className="text-xs text-[#57536E] font-medium">
                Centralized municipal infrastructure defect registry & status triage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F6FC] text-[#191636] border border-[#E8E2E5] text-xs font-bold transition-all shadow-xs"
            title="Export filtered records to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#302B69]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={fetchDetections}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F6FC] text-[#191636] border border-[#E8E2E5] text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#302B69] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>
        </div>
      </div>

      {/* 4 Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Issues */}
        <div className="rounded-2xl p-4 bg-white border border-[#E8E2E5] shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#57536E] uppercase tracking-wider">Total Issues</span>
            <div className="p-2 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#191636] tracking-tight">{detections.length}</span>
            <span className="text-[10px] font-mono text-[#302B69] font-semibold">Live Mongo Feed</span>
          </div>
          <div className="mt-2 text-[11px] text-[#57536E] flex items-center gap-1">
            <span>Filtered count:</span>
            <span className="font-bold text-[#191636]">{filteredDetections.length}</span>
          </div>
        </div>

        {/* Critical & High Priority */}
        <div className="rounded-2xl p-4 bg-white border border-[#E8E2E5] shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#57536E] uppercase tracking-wider">High / Critical</span>
            <div className="p-2 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#191636] tracking-tight">
              {detections.filter(d => ['high', 'critical'].includes((d.severity || '').toLowerCase())).length}
            </span>
            <span className="text-[10px] font-mono text-[#302B69] font-bold px-1.5 py-0.5 rounded bg-[#F6F6FC] border border-[#E8E2E5]">Action Required</span>
          </div>
          <div className="mt-2 text-[11px] text-[#57536E]">
            Urgent road hazards & safety defects
          </div>
        </div>

        {/* In Triage / Assigned */}
        <div className="rounded-2xl p-4 bg-white border border-[#E8E2E5] shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#57536E] uppercase tracking-wider">Active Triage</span>
            <div className="p-2 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#191636] tracking-tight">
              {detections.filter(d => ['new', 'assigned'].includes((d.status || '').toLowerCase())).length}
            </span>
            <span className="text-[10px] font-mono text-[#302B69] font-bold">Assigned to Depts</span>
          </div>
          <div className="mt-2 text-[11px] text-[#57536E]">
            Pending field crew resolution
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-2xl p-4 bg-white border border-[#E8E2E5] shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#57536E] uppercase tracking-wider">Resolved Cases</span>
            <div className="p-2 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#191636] tracking-tight">
              {detections.filter(d => (d.status || '').toLowerCase() === 'resolved').length}
            </span>
            <span className="text-[10px] font-mono text-[#302B69] font-bold">
              {detections.length > 0 ? `${Math.round((detections.filter(d => (d.status || '').toLowerCase() === 'resolved').length / detections.length) * 100)}% Rate` : '0%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#57536E]">
            Successfully closed & verified
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-3xl bg-white border border-[#E8E2E5] flex flex-col shadow-xs overflow-hidden">
        
        {/* Search & Filter Controls Header */}
        <div className="p-5 border-b border-[#E8E2E5] bg-[#F6F6FC] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-[#191636] uppercase tracking-wider">
              Filter Records
            </span>
            <span className="text-xs text-[#57536E] font-mono">
              ({filteredDetections.length} of {detections.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C87A6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search address, ID, dept..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E8E2E5] text-xs text-[#191636] placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] w-full sm:w-56 font-mono shadow-xs"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-[#E8E2E5] text-xs text-[#191636] font-mono focus:outline-none focus:border-[#302B69]"
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
              className="px-3 py-2 rounded-xl bg-white border border-[#E8E2E5] text-xs text-[#191636] font-mono focus:outline-none focus:border-[#302B69]"
            >
              <option value="all">All Severities</option>
              <option value="high">High / Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-[#E8E2E5] text-xs text-[#191636] font-mono focus:outline-none focus:border-[#302B69]"
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
                className="px-2.5 py-2 rounded-xl text-xs font-bold text-[#57536E] hover:text-[#191636] bg-white border border-[#E8E2E5] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-sans whitespace-nowrap">
            <thead className="bg-[#F6F6FC] border-b border-[#E8E2E5] text-[11px] text-[#57536E] uppercase tracking-wider font-bold">
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
            <tbody className="divide-y divide-[#E8E2E5]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-[#57536E]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#302B69]/20 border-t-[#302B69] rounded-full animate-spin"></div>
                      <span>Loading reported issues...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDetections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-[#57536E]">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Layers className="w-8 h-8 text-[#8C87A6] mb-1" />
                      <span className="font-bold text-[#191636]">No issues found</span>
                      <span className="text-[#57536E] text-[11px]">Try adjusting your search criteria or filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDetections.map((d) => (
                  <tr
                    key={d.id || d._id}
                    className="hover:bg-[#F6F6FC] transition-colors group cursor-pointer"
                    onClick={() => setSelectedDetection(d)}
                  >
                    {/* Ref ID & Image Thumbnail */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F6F6FC] border border-[#E8E2E5] shrink-0 shadow-xs">
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
                        <span className="font-bold text-[#191636] group-hover:text-[#302B69] transition-colors font-mono">
                          #{d.id ? d.id.slice(-8).toUpperCase() : (d._id ? d._id.slice(-8).toUpperCase() : 'NEW')}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-3.5 uppercase font-bold tracking-wider text-[#302B69] text-xs">
                      {d.type?.replace('_', ' ') || 'UNKNOWN'}
                    </td>

                    {/* Severity */}
                    <td className="px-6 py-3.5">
                      {severityBadge(d.severity)}
                    </td>

                    {/* Assigned Dept */}
                    <td className="px-6 py-3.5 text-[#191636] font-medium">
                      {d.assignedDepartment || 'Municipal Operations'}
                    </td>

                    {/* Address */}
                    <td className="px-6 py-3.5 text-[#57536E] max-w-xs truncate font-medium">
                      <span className="flex items-center gap-1.5 truncate" title={d.address}>
                        <MapPin className="w-3 h-3 text-[#302B69] shrink-0" />
                        <span className="truncate">{d.address || `${Number(d.lat).toFixed(4)}, ${Number(d.lng).toFixed(4)}`}</span>
                      </span>
                    </td>

                    {/* Reports Count */}
                    <td className="px-6 py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F6F6FC] border border-[#E8E2E5] font-mono font-bold text-[#191636] text-xs">
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
                          className="p-1.5 rounded-lg bg-white hover:bg-[#302B69] border border-[#E8E2E5] text-[#302B69] hover:text-white transition-colors"
                          title="Inspect AI Details & Formal Letter"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateReportPDF(d)}
                          className="p-1.5 rounded-lg bg-white hover:bg-[#302B69] border border-[#E8E2E5] text-[#302B69] hover:text-white transition-colors"
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
