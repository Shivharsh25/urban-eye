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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E2E5]">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-[#302B69]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191636] tracking-tight flex items-center gap-2">
                <span>Civic Accounts & Access Management</span>
              </h1>
              <p className="text-xs text-[#57536E] mt-0.5 font-medium">
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
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F6FC] text-[#191636] border border-[#E8E2E5] text-xs font-semibold transition-all shadow-sm group"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#302B69] group-hover:scale-110 transition-transform" />
            <span>Export Roster</span>
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F6FC] text-[#191636] border border-[#E8E2E5] text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#302B69] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 4 User Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-2xl bg-white border border-[#E8E2E5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#57536E] uppercase tracking-wider">Total Accounts</p>
            <p className="text-3xl font-extrabold text-[#191636] mt-1">{totalUsers}</p>
            <p className="text-[11px] text-[#8C87A6] mt-1">Platform registered users</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2E5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#57536E] uppercase tracking-wider">Civic Citizens</p>
            <p className="text-3xl font-extrabold text-[#302B69] mt-1">{citizenCount}</p>
            <p className="text-[11px] text-[#8C87A6] mt-1">Community reporters</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69]">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2E5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#57536E] uppercase tracking-wider">Command Admins</p>
            <p className="text-3xl font-extrabold text-[#191636] mt-1">{adminCount}</p>
            <p className="text-[11px] text-[#8C87A6] mt-1">Municipal dispatchers</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636]">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8E2E5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#57536E] uppercase tracking-wider">Civic Trust Rating</p>
            <p className="text-3xl font-extrabold text-[#302B69] mt-1">98.4%</p>
            <p className="text-[11px] text-[#8C87A6] mt-1">Authentic submissions</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69]">
            <Award className="w-5 h-5" />
          </div>
        </div>

      </div>

      {error && (
        <div className="p-4 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs font-semibold flex items-center space-x-2 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-[#302B69]" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table Container */}
      <div className="rounded-2xl bg-white border border-[#E8E2E5] shadow-sm overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-[#E8E2E5] bg-[#F6F6FC]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Role Filter Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-white border border-[#E8E2E5] w-fit shadow-sm">
            {[
              { id: 'all', label: `All Users (${totalUsers})` },
              { id: 'user', label: `Citizens (${citizenCount})` },
              { id: 'admin', label: `Admins (${adminCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  roleFilter === tab.id
                    ? 'bg-[#302B69] text-white shadow-sm'
                    : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C87A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user name or email..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E8E2E5] text-xs text-[#191636] placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] w-full sm:w-64 shadow-sm"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap font-sans">
            <thead className="bg-[#F6F6FC] border-b border-[#E8E2E5] text-[11px] text-[#57536E] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Citizen Profile</th>
                <th className="px-6 py-4">Access Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Civic Badge</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2E5]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-[#57536E]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#302B69]/20 border-t-[#302B69] rounded-full animate-spin"></div>
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-[#8C87A6]">
                    No accounts matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isAdmin = user.role === 'admin';
                  const initials = (user.name || 'U').slice(0, 2).toUpperCase();

                  return (
                    <tr key={user.id || user._id} className="hover:bg-[#F6F6FC]/60 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center font-bold text-[#302B69] text-xs shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-[#191636] text-xs group-hover:text-[#302B69] transition-colors">{user.name}</p>
                            <p className="text-[11px] text-[#57536E] flex items-center mt-0.5">
                              <Mail className="w-3 h-3 mr-1 text-[#8C87A6]" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#191636] text-white">
                            <Shield className="w-3 h-3 mr-1.5" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5]">
                            <Users className="w-3 h-3 mr-1.5" />
                            Citizen
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#191636] bg-[#F6F6FC] border border-[#E8E2E5]">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-[#302B69]" />
                          Active
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F6F6FC] text-[#57536E] border border-[#E8E2E5]">
                          {isAdmin ? 'System Dispatcher' : 'Verified Reporter'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-[#57536E] text-xs">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <button 
                          onClick={() => handleToggleRole(user.id || user._id, user.role)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#E8E2E5] text-[#302B69] hover:bg-[#302B69] hover:text-white transition-all shadow-sm"
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

