import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Users,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Power,
  Search,
  RefreshCw,
  Mail,
  Clock,
  AlertCircle
} from 'lucide-react';

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
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
      setError('Could not retrieve administrators.');
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
      await client.patch(`/api/super-admin/admins/${adminUser._id}/status`, { status: nextStatus });
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${actionText.toLowerCase()} administrator.`);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.departmentName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-teal-400" />
            <span>Department Administrators</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active and suspended municipal department officers with access to department-level issue dispatch and resolution.
          </p>
        </div>

        <button
          onClick={fetchAdmins}
          className="p-2.5 rounded-xl bg-[#081C21] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#081C21] p-3 rounded-2xl border border-teal-950">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#051317] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400 pr-2">
          {filteredAdmins.length} administrators
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading administrators...
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#081C21] border border-teal-950 rounded-2xl">
          No administrators found matching your search.
        </div>
      ) : (
        <div className="bg-[#081C21] border border-teal-950 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#051317] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-teal-950">
                <tr>
                  <th className="py-3.5 px-4">Officer Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assigned Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Account Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-950/60">
                {filteredAdmins.map((adminUser) => {
                  const isActive = adminUser.status === 'active';
                  return (
                    <tr key={adminUser._id} className="hover:bg-[#0b252b]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-[10px]">
                            {adminUser.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{adminUser.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {adminUser.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#051317] border border-teal-900 text-teal-300 font-medium">
                          <Building2 className="w-3 h-3 text-teal-400" />
                          <span>{adminUser.departmentName || 'Not Assigned'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {adminUser.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(adminUser.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(adminUser)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                            isActive
                              ? 'bg-rose-950/30 text-rose-300 border-rose-900/50 hover:bg-rose-900/40'
                              : 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/40'
                          }`}
                        >
                          {isActive ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
