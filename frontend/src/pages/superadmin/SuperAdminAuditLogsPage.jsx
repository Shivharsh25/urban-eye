import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  History,
  Shield,
  Search,
  RefreshCw,
  Clock,
  User,
  Activity,
  Layers
} from 'lucide-react';

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/super-admin/audit-logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError('Could not retrieve audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.actorName?.toLowerCase().includes(q) ||
      l.targetEntity?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-teal-400" />
            <span>Tamper-Proof Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system event logs tracking administrative actions, approvals, routing modifications, and security audits.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-[#081C21] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4 bg-[#081C21] p-3 rounded-2xl border border-teal-950">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, actor, or entity..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#051317] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400 pr-2">
          {filteredLogs.length} audit records
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading audit trail...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#081C21] border border-teal-950 rounded-2xl">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="bg-[#081C21] border border-teal-950 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#051317] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-teal-950">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">IP / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-950/60 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#0b252b]/50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-teal-300">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-white">
                      <div>{log.actorName || 'System'}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{log.actorRole}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#051317] border border-teal-950 text-slate-300">
                        {log.targetEntity}: {log.targetId ? log.targetId.slice(-6) : 'N/A'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details || {})}>
                      {log.ipAddress && <span className="text-slate-500 mr-2">[{log.ipAddress}]</span>}
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
