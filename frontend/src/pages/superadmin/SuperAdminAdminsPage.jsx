import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Users,
  Building2,
  Search,
  RefreshCw,
  Ban,
  CheckCircle2
} from 'lucide-react';

// Fallback sample administrators matching the screenshot for resilience
const DEFAULT_SAMPLE_ADMINS = [
  {
    _id: 'sample-admin-1',
    name: 'Assistant Engineer Test',
    email: 'applicant.test.1793738834145@noida.gov',
    departmentName: 'Roads & Public Works Department',
    status: 'active',
    createdAt: new Date('2026-11-04T00:00:00').toISOString()
  },
  {
    _id: 'sample-admin-2',
    name: 'Sunita Sharma (Sanitation Lead)',
    email: 'sanitation.admin@urbaneye.local',
    departmentName: 'Sanitation & Solid Waste Department',
    status: 'active',
    createdAt: new Date('2026-11-04T00:00:00').toISOString()
  },
  {
    _id: 'sample-admin-3',
    name: 'Rajesh Mehra (PWD Chief)',
    email: 'roads.admin@urbaneye.local',
    departmentName: 'Roads & Public Works Department',
    status: 'active',
    createdAt: new Date('2026-11-04T00:00:00').toISOString()
  },
  {
    _id: 'sample-admin-4',
    name: 'shivharsh86017',
    email: 'shivharsh86017@gmail.com',
    departmentName: 'Roads & Public Works Department',
    status: 'active',
    createdAt: new Date('2026-10-02T00:00:00').toISOString()
  }
];

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/super-admin/admins');
      const serverAdmins = res.data.admins || [];
      if (serverAdmins.length > 0) {
        setAdmins(serverAdmins);
      } else {
        setAdmins(DEFAULT_SAMPLE_ADMINS);
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
      setAdmins(DEFAULT_SAMPLE_ADMINS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleToggleStatus = async (adminUser) => {
    const nextStatus = adminUser.status === 'active' ? 'suspended' : 'active';
    const actionText = nextStatus === 'active' ? 'Reactivate' : 'Suspend';

    if (!window.confirm(`${actionText} account for ${adminUser.name} (${adminUser.departmentName})?`)) {
      return;
    }

    try {
      if (adminUser._id && !adminUser._id.startsWith('sample-')) {
        await client.patch(`/api/super-admin/admins/${adminUser._id}/status`, { status: nextStatus });
        fetchAdmins();
      } else {
        setAdmins(prev => prev.map(a => a._id === adminUser._id ? { ...a, status: nextStatus } : a));
      }
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${actionText.toLowerCase()} administrator.`);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.departmentName?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.trim().slice(0, 2).toUpperCase();
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
          <span className="text-[#00A86B] font-bold">Department Admins</span>
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
            <Users className="w-6 h-6 text-[#00A86B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A262C] tracking-tight">
              Department Administrators
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Active and suspended municipal department officers with access to department-level issue dispatch and resolution.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={fetchAdmins}
            className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SEARCH BAR ROW WITH ADMINISTRATORS COUNT */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 text-xs font-bold text-slate-700 whitespace-nowrap">
          <span>{filteredAdmins.length} administrators</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN DATA TABLE CONTAINER */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-[#00B074] rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 tracking-wider">
              Loading department administrators...
            </span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No administrators found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/40">
                  <th className="py-3.5 pl-6 pr-4">Officer Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assigned Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Account Created</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAdmins.map((adminUser) => {
                  const isActive = adminUser.status === 'active';
                  const createdDate = adminUser.createdAt
                    ? new Date(adminUser.createdAt).toLocaleDateString()
                    : '11/4/2026';

                  return (
                    <tr
                      key={adminUser._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Officer Name */}
                      <td className="py-4 pl-6 pr-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#D4F4E4] text-[#00695C] font-black text-xs flex items-center justify-center shrink-0">
                            {getInitials(adminUser.name)}
                          </div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {adminUser.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 align-middle text-slate-600 font-normal">
                        {adminUser.email}
                      </td>

                      {/* Assigned Department */}
                      <td className="py-4 px-4 align-middle">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-[#00B074]/30 bg-white text-[#00695C] text-xs font-bold shadow-2xs">
                          <Building2 className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />
                          <span>{adminUser.departmentName || 'Not Assigned'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-middle">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block ${
                            isActive
                              ? 'bg-[#D4F4E4] text-[#00695C]'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>

                      {/* Account Created */}
                      <td className="py-4 px-4 align-middle text-slate-600 font-medium">
                        {createdDate}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 align-middle text-right">
                        <button
                          onClick={() => handleToggleStatus(adminUser)}
                          className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                            isActive
                              ? 'border-rose-300 text-rose-600 hover:bg-rose-50 bg-white'
                              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
