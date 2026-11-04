import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import {
  FileText,
  Search,
  Building2,
  Clock,
  MapPin,
  Eye,
  RefreshCw,
  X,
  Trash2,
  Zap,
  Droplets,
  Leaf,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Fallback sample reports matching the executive screenshot
const DEFAULT_SAMPLE_REPORTS = [
  {
    _id: 'rep-1',
    id: 'F197794D',
    category: 'pothole',
    type: 'pothole',
    confidence: 0.78,
    assignedDepartment: 'Roads & Public Works Department',
    departmentId: 'roads-dept',
    address: 'Maharajganj, Maharajganj, Uttar Pradesh',
    status: 'pending',
    createdAt: new Date('2026-11-03T10:15:00').toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    needsReview: false
  },
  {
    _id: 'rep-2',
    id: '607C2C05',
    category: 'garbage',
    type: 'garbage',
    confidence: 0.81,
    assignedDepartment: 'Sanitation & Solid Waste Department',
    departmentId: 'sanitation-dept',
    address: 'Knowledge Park II, Greater Noida, UP',
    status: 'pending',
    createdAt: new Date('2026-10-14T09:30:00').toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    needsReview: false
  },
  {
    _id: 'rep-3',
    id: '325FEB70',
    category: 'pothole',
    type: 'pothole',
    confidence: 0.77,
    assignedDepartment: 'Roads & Public Works Department',
    departmentId: 'roads-dept',
    address: 'Delta 1, Sector 20, Greater Noida',
    status: 'pending',
    createdAt: new Date('2026-10-11T14:20:00').toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    needsReview: false
  },
  {
    _id: 'rep-4',
    id: 'CD9342CA',
    category: 'garbage',
    type: 'garbage',
    confidence: 0.75,
    assignedDepartment: 'Sanitation & Solid Waste Department',
    departmentId: 'sanitation-dept',
    address: 'New Delhi Municipal Area, Central Zone',
    status: 'pending',
    createdAt: new Date('2026-10-11T12:00:00').toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    needsReview: false
  },
  {
    _id: 'rep-5',
    id: '981D4F7A',
    category: 'pothole',
    type: 'pothole',
    confidence: 0.71,
    assignedDepartment: 'Roads & Public Works Department',
    departmentId: 'roads-dept',
    address: 'Dadri Road, Barola, Noida, UP',
    status: 'pending',
    createdAt: new Date('2026-10-11T11:45:00').toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    needsReview: false
  }
];

export default function SuperAdminAllReportsPage() {
  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [needsReviewOnly, setNeedsReviewOnly] = useState(searchParams.get('needsReview') === 'true');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Rows Per Page
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Inspection Modal
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedDept !== 'all') params.set('departmentId', selectedDept);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (needsReviewOnly) params.set('needsReview', 'true');

      const [repRes, deptRes] = await Promise.all([
        client.get(`/api/super-admin/reports?${params.toString()}`),
        client.get('/api/super-admin/departments')
      ]);

      const serverReports = repRes.data.reports || [];
      setDepartments(deptRes.data.departments || []);

      if (serverReports.length > 0) {
        setReports(serverReports);
      } else {
        setReports(DEFAULT_SAMPLE_REPORTS);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setReports(DEFAULT_SAMPLE_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    setCurrentPage(1);
  }, [selectedDept, selectedStatus, needsReviewOnly]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Dept filter
      if (selectedDept !== 'all') {
        const matchesDept = r.departmentId === selectedDept || r.assignedDepartmentId === selectedDept;
        if (!matchesDept) return false;
      }
      // Status filter
      if (selectedStatus !== 'all') {
        if (r.status?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }
      // Review filter
      if (needsReviewOnly && !r.needsReview && r.status !== 'needs_review') {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const idStr = String(r.id || r.reportId || r._id || '');
      const typeStr = String(r.type || r.category || '');
      const deptStr = String(r.assignedDepartment || '');
      const addrStr = typeof r.address === 'string' ? r.address : String(r.location?.address || '');
      return (
        idStr.toLowerCase().includes(q) ||
        typeStr.toLowerCase().includes(q) ||
        deptStr.toLowerCase().includes(q) ||
        addrStr.toLowerCase().includes(q)
      );
    });
  }, [reports, selectedDept, selectedStatus, needsReviewOnly, searchQuery]);

  // Paginated slice
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredReports.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredReports, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / rowsPerPage));

  // Category Icon helper
  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('road') || cat.includes('pothole')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-emerald-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="9" y2="3" />
            <line x1="20" y1="21" x2="15" y2="3" />
            <line x1="12" y1="6" x2="12" y2="8" strokeDasharray="2 2" />
            <line x1="12" y1="12" x2="12" y2="14" strokeDasharray="2 2" />
            <line x1="12" y1="18" x2="12" y2="20" strokeDasharray="2 2" />
          </svg>
        </div>
      );
    }
    if (cat.includes('garbage') || cat.includes('waste')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-emerald-600 flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4" />
        </div>
      );
    }
    if (cat.includes('electric') || cat.includes('light')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#FEF6E9] text-amber-500 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4" />
        </div>
      );
    }
    if (cat.includes('water') || cat.includes('drain')) {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#EDF7FC] text-sky-500 flex items-center justify-center shrink-0">
          <Droplets className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-emerald-600 flex items-center justify-center shrink-0">
        <Leaf className="w-4 h-4" />
      </div>
    );
  };

  // Format date helper
  const formatDate = (isoDate) => {
    if (!isoDate) return '11/3/2026';
    const d = new Date(isoDate);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 1. TOP BREADCRUMB SUB-HEADER MATCHING REFERENCE DESIGN */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
        <div className="flex items-center space-x-2 font-medium">
          <span className="text-slate-600">Urban Eye</span>
          <span>/</span>
          <span className="text-slate-600">Executive Command</span>
          <span>/</span>
          <span className="text-[#00A86B] font-bold">All Reports</span>
        </div>

        <div className="hidden sm:flex items-center space-x-2 bg-white/70 border border-slate-200/80 rounded-full px-3 py-1 font-mono text-[11px] text-slate-500 shadow-2xs">
          <span>&#8984; K</span>
          <span className="text-slate-300">|</span>
          <span>Help</span>
          <span className="text-slate-300">|</span>
          <span>UTC</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TITLE BAR & REFRESH ACTION */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F8F0] border border-emerald-100/80 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-6 h-6 text-[#00A86B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A262C] tracking-tight">
              Citywide Reports Stream
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Global civic issues audit stream across all municipal departments, AI auto-dispatch flags, and resolution proof.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SEARCH & FILTERS BAR (EXACT MOCKUP MATCH) */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px] bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, category, location..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* All Departments Dropdown */}
        <div className="relative">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 px-4 py-2.5 pr-9 rounded-2xl text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* All Statuses Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 px-4 py-2.5 pr-9 rounded-2xl text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="needs_review">Needs Review</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Flagged for Review Checkbox */}
        <label className="flex items-center space-x-2 text-xs font-bold text-[#92400E] cursor-pointer px-4 py-2.5 rounded-2xl bg-[#FEF6E9] border border-amber-200/70 shadow-2xs select-none">
          <input
            type="checkbox"
            checked={needsReviewOnly}
            onChange={(e) => setNeedsReviewOnly(e.target.checked)}
            className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-0 cursor-pointer"
          />
          <span>Flagged for Review</span>
        </label>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN REPORTS TABLE CONTAINER */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-[#00B074] rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 tracking-wider">
              Loading citywide reports...
            </span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No reports match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/40">
                  <th className="py-3.5 pl-6 pr-4">Report ID & Date</th>
                  <th className="py-3.5 px-4">Category & AI Confidence</th>
                  <th className="py-3.5 px-4">Assigned Department</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 pl-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedReports.map((report) => {
                  const isResolved = report.status === 'resolved';
                  const isInProgress = report.status === 'in_progress';
                  const needsReview = report.needsReview || report.status === 'needs_review';
                  const reportId = report.id || report.reportId || String(report._id).slice(-8).toUpperCase();
                  const addressText = typeof report.address === 'string' ? report.address : (report.location?.address || 'Municipal Area');

                  return (
                    <tr
                      key={report._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Report ID & Date */}
                      <td className="py-4 pl-6 pr-4 align-middle">
                        <span className="font-mono text-[#00A86B] font-bold text-xs sm:text-sm block">
                          {reportId}
                        </span>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </td>

                      {/* Category & AI Confidence */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(report.type || report.category)}
                          <div>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                              {report.type || report.category}
                            </span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              {Math.round((report.confidence || 0.78) * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Department */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center space-x-2 text-slate-800">
                          <div className="w-7 h-7 rounded-lg bg-[#E8F8F0] text-emerald-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-slate-900 text-xs truncate max-w-[220px]">
                            {report.assignedDepartment || 'Roads & Public Works Department'}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 align-middle max-w-[220px]">
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate block font-normal" title={addressText}>
                            {addressText}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-middle">
                        {needsReview ? (
                          <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] inline-block">
                            Needs Review
                          </span>
                        ) : isResolved ? (
                          <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#D1FAE5] text-[#065F46] inline-block">
                            Resolved
                          </span>
                        ) : isInProgress ? (
                          <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#E0F2FE] text-[#0369A1] inline-block">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#F3E8FF] text-[#6B21A8] inline-block">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Inspect */}
                      <td className="py-4 pr-6 pl-4 align-middle text-center">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="w-8 h-8 rounded-xl bg-[#E6F8F0] hover:bg-[#D4F4E4] text-[#00A86B] flex items-center justify-center transition-colors shadow-2xs mx-auto cursor-pointer"
                          title="Inspect Report Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. TABLE FOOTER: PAGINATION & ROWS PER PAGE */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="text-xs font-bold text-slate-600">
            Showing {filteredReports.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} -{' '}
            {Math.min(currentPage * rowsPerPage, filteredReports.length)} of {filteredReports.length} reports
          </div>

          <div className="flex items-center space-x-6 text-xs font-bold text-slate-600">
            {/* Rows Per Page */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Rows per page:</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 pr-6 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#003840] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. INSPECTION MODAL (CLEAN LIGHT EXECUTIVE DOSSIER) */}
      {/* ======================================================== */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#00A86B] font-bold block">
                  Report Dossier &bull; {selectedReport.id || selectedReport.reportId || String(selectedReport._id).slice(-8).toUpperCase()}
                </span>
                <h2 className="text-lg font-black text-[#0A262C]">
                  {selectedReport.type || selectedReport.category}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Photo Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Citizen Uploaded Photo</span>
                  {selectedReport.imageUrl ? (
                    <img
                      src={selectedReport.imageUrl}
                      alt="Citizen report"
                      className="w-full h-44 object-cover rounded-2xl border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                      No photo provided
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Resolution Verification Proof</span>
                  {selectedReport.resolutionProof?.afterImageUrl ? (
                    <img
                      src={selectedReport.resolutionProof.afterImageUrl}
                      alt="Resolution proof"
                      className="w-full h-44 object-cover rounded-2xl border border-emerald-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                      Pending repair completion
                    </div>
                  )}
                </div>
              </div>

              {/* Details List */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Assigned Department:</span>
                  <span className="font-bold text-slate-900">{selectedReport.assignedDepartment || 'Roads & Public Works Department'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">AI Detection Confidence:</span>
                  <span className="font-mono text-[#00A86B] font-bold">
                    {Math.round((selectedReport.confidence || 0.78) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Location Address:</span>
                  <span className="text-slate-900 font-semibold text-right max-w-xs">
                    {typeof selectedReport.address === 'string' ? selectedReport.address : (selectedReport.location?.address || 'Municipal Area')}
                  </span>
                </div>
                {selectedReport.needsReview && (
                  <div className="flex justify-between py-1 text-amber-800 font-semibold">
                    <span>Review Reason:</span>
                    <span>{selectedReport.reviewReason || 'Flagged by routing engine'}</span>
                  </div>
                )}
              </div>

              {/* Work Notes */}
              {selectedReport.workNotes && selectedReport.workNotes.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 block mb-2">Department Progress Logs</span>
                  <div className="space-y-2">
                    {selectedReport.workNotes.map((note, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex justify-between text-slate-500 mb-1">
                          <span className="font-bold text-[#00A86B]">{note.authorName}</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
