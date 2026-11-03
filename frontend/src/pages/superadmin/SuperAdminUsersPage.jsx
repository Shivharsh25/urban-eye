import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  UserCog,
  Search,
  Filter,
  Shield,
  RefreshCw,
  Power,
  Mail,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = roleFilter !== 'all' ? `?role=${roleFilter}` : '';
      const res = await client.get(`/api/super-admin/users${query}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Could not retrieve user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    const actionText = nextStatus === 'active' ? 'Reactivate' : 'Suspend';

    if (!window.confirm(`${actionText} account for ${targetUser.name} (${targetUser.email})?`)) {
      return;
    }

    try {
      await client.patch(`/api/super-admin/users/${targetUser._id}/status`, { status: nextStatus });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${actionText.toLowerCase()} user.`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <UserCog className="w-6 h-6 text-teal-400" />
            <span>Platform User Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global directory of verified citizens, department administrators, and platform operators.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-[#081C21] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#081C21] p-3 rounded-2xl border border-teal-950">
        
        {/* Role Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'user', label: 'Citizens' },
            { id: 'department_admin', label: 'Dept Admins' },
            { id: 'super_admin', label: 'Super Admins' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-gradient-to-r from-[#005C66] to-[#00897B] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#051317]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#051317] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#081C21] border border-teal-950 rounded-2xl">
          No users match the search criteria.
        </div>
      ) : (
        <div className="bg-[#081C21] border border-teal-950 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#051317] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-teal-950">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department / Ward</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-950/60">
                {filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  const isSuper = u.role === 'super_admin';

                  return (
                    <tr key={u._id} className="hover:bg-[#0b252b]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-[10px]">
                            {u.name?.slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white">{u.name || 'Anonymous User'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'super_admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.role === 'department_admin'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {u.departmentName || u.ward || 'General Citizen'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isSuspended
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isSuper && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                              isSuspended
                                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50 hover:bg-emerald-900/40'
                                : 'bg-rose-950/30 text-rose-300 border-rose-900/50 hover:bg-rose-900/40'
                            }`}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
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
