import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  FileText,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  BadgeAlert,
  X
} from 'lucide-react';

export default function SuperAdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await client.get(`/api/super-admin/requests${query}`);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch admin requests:', err);
      setError('Could not retrieve administrator requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (reqItem) => {
    if (!window.confirm(`Approve ${reqItem.applicantName} for ${reqItem.requestedDepartmentName}? This will activate their administrator account immediately.`)) {
      return;
    }

    try {
      setSubmittingAction(true);
      await client.post(`/api/super-admin/requests/${reqItem._id}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve application.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenRejectModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSubmittingAction(true);
      await client.post(`/api/super-admin/requests/${selectedRequest._id}/reject`, {
        rejectionReason: rejectionReason || 'Application credentials could not be verified.'
      });
      setRejectModalOpen(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject application.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.applicantName?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.requestedDepartmentName?.toLowerCase().includes(q) ||
      r.officialDesignation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Page Title & Status Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>Department Administrator Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Vet incoming municipal officer credentials. Approving an application activates their department admin account.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRequests}
            className="p-2.5 rounded-xl bg-[#081C21] border border-teal-900/60 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#081C21] p-3 rounded-2xl border border-teal-950">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Requests' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-[#005C66] to-[#00897B] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#051317]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicants..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#051317] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#081C21] border border-teal-950 rounded-2xl">
          No administrator applications found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((reqItem) => {
            const isPending = reqItem.status === 'pending';
            const isApproved = reqItem.status === 'approved';
            const isRejected = reqItem.status === 'rejected';

            return (
              <div
                key={reqItem._id}
                className="bg-[#081C21] border border-teal-950 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-800 transition-all"
              >
                {/* Left: Applicant info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{reqItem.applicantName}</span>
                    <span className="text-xs text-teal-300 font-medium">({reqItem.officialDesignation || 'Officer'})</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isApproved
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : isRejected
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {reqItem.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-slate-200 font-semibold">{reqItem.requestedDepartmentName}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{reqItem.email}</span>
                    </span>
                    {reqItem.phone && (
                      <span className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{reqItem.phone}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(reqItem.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {reqItem.verificationNotes && (
                    <div className="p-2.5 rounded-xl bg-[#051317] border border-teal-950 text-xs text-slate-300">
                      <span className="text-slate-500 font-medium">Verification Notes: </span>
                      {reqItem.verificationNotes}
                    </div>
                  )}

                  {isRejected && reqItem.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300">
                      <span className="font-semibold">Rejection Reason: </span>
                      {reqItem.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                {isPending && (
                  <div className="flex items-center space-x-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-teal-950">
                    <button
                      onClick={() => handleOpenRejectModal(reqItem)}
                      disabled={submittingAction}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(reqItem)}
                      disabled={submittingAction}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-emerald-950/50 disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Activate</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#081C21] border border-rose-900/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-teal-900 mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Reject Admin Application</span>
              </h2>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Please specify the reason for rejecting <span className="text-white font-semibold">{selectedRequest?.applicantName}</span>'s request for {selectedRequest?.requestedDepartmentName}.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Employee badge verification failed or jurisdiction mismatch."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#051317] border border-teal-900 text-white text-xs focus:outline-none focus:border-rose-400 resize-none"
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider"
                >
                  {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

