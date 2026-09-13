import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Shield, 
  CheckCircle2, 
  Clock, 
  Download, 
  UserCheck, 
  ShieldAlert, 
  Sparkles, 
  FileSpreadsheet,
  RefreshCw,
  Award,
  Filter
} from 'lucide-react';
import client from '../api/client';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'user' | 'admin'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/users');
      setUsers(res.data.users || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users from the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await client.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => (u.id === userId || u._id === userId) ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update user role.');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const matchName = user.name && user.name.toLowerCase().includes(term);
      const matchEmail = user.email && user.email.toLowerCase().includes(term);
      return matchName || matchEmail;
    });
  }, [users, roleFilter, searchTerm]);

  // Derived user statistics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const citizenCount = totalUsers - adminCount;

  // Export Users CSV
  const handleExportCSV = () => {
    if (!filteredUsers.length) return alert('No users to export.');
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Date Joined'];
    const rows = filteredUsers.map(u => [
      u.id || u._id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.role || 'user',
      new Date(u.createdAt || Date.now()).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanEye_Users_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in relative z-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Civic Accounts & Access Management</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage registered citizens, role permissions, and platform administrators
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition-all shadow-sm group"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Export Roster</span>
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 4 User Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-3xl glass-card border border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accounts</p>
            <p className="text-3xl font-black text-white mt-1">{totalUsers}</p>
            <p className="text-[11px] text-slate-500 mt-1">Platform registered users</p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Civic Citizens</p>
            <p className="text-3xl font-black text-sky-400 mt-1">{citizenCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Community reporters</p>
          </div>
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Command Admins</p>
            <p className="text-3xl font-black text-amber-400 mt-1">{adminCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Municipal dispatchers</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Civic Trust Rating</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">98.4%</p>
            <p className="text-[11px] text-slate-500 mt-1">Authentic submissions</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table Container */}
      <div className="rounded-3xl glass-card border border-slate-800/80 shadow-2xl overflow-hidden bg-slate-900/40">
        
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-slate-800/60 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Role Filter Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-fit">
            {[
              { id: 'all', label: `All Users (${totalUsers})` },
              { id: 'user', label: `Citizens (${citizenCount})` },
              { id: 'admin', label: `Admins (${adminCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roleFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user name or email..."
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64 font-mono shadow-inner"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap font-sans">
            <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Citizen Profile</th>
                <th className="px-6 py-4">Access Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Civic Badge</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                    No accounts matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isAdmin = user.role === 'admin';
                  const initials = (user.name || 'U').slice(0, 2).toUpperCase();

                  return (
                    <tr key={user.id || user._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-indigo-600/30 border border-slate-700/60 flex items-center justify-center font-bold text-slate-200 text-xs shadow-inner">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 text-xs group-hover:text-cyan-400 transition-colors">{user.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center mt-0.5 font-mono">
                              <Mail className="w-3 h-3 mr-1 text-slate-500" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Shield className="w-3 h-3 mr-1.5" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            <Users className="w-3 h-3 mr-1.5" />
                            Citizen
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isAdmin 
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {isAdmin ? 'System Dispatcher' : 'Verified Reporter'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <button 
                          onClick={() => handleToggleRole(user.id || user._id, user.role)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                            isAdmin 
                              ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/15 shadow-sm'
                              : 'border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/15 shadow-sm'
                          }`}
                          title={`Toggle ${user.name}'s role between Citizen and Administrator`}
                        >
                          {isAdmin ? 'Demote to Citizen' : 'Promote to Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

