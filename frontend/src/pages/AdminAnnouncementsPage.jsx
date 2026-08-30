import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Bell, Plus, Trash2, AlertCircle, Info, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setCreating(true);
    try {
      await api.post('/api/announcements', { title, message, type });
      setTitle('');
      setMessage('');
      setType('info');
      fetchAnnouncements(); // Refresh the list
    } catch (err) {
      console.error(err);
      setError('Failed to create announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      setError('Failed to delete announcement');
    }
  };

  const getTypeIcon = (t) => {
    switch (t) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'error': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getTypeColor = (t) => {
    switch (t) {
      case 'warning': return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
      case 'error': return 'border-rose-500/20 bg-rose-500/10 text-rose-400';
      case 'success': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
      default: return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Bell className="w-6 h-6 mr-3 text-cyan-400" />
            Announcements
          </h1>
          <p className="text-sm text-slate-400 mt-1">Broadcast messages to all citizens in real-time.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border-t border-t-white/5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 text-indigo-400 mr-2" />
              New Announcement
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black/20 border border-white/5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., Severe Weather Alert"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black/20 border border-white/5 text-white text-sm focus:outline-none focus:border-cyan-500/50 min-h-[100px]"
                  placeholder="Enter the announcement details..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Orange)</option>
                  <option value="error">Critical (Red)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Broadcasting...' : 'Broadcast Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* Active Announcements List */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6 border-t border-t-white/5 h-full">
            <h2 className="text-lg font-semibold text-white mb-4">Active Broadcasts</h2>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-700/50 rounded-xl bg-slate-900/20">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No active announcements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann._id} className="group relative p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-4">
                    <div className={`p-2 rounded-lg border ${getTypeColor(ann.type)}`}>
                      {getTypeIcon(ann.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-slate-200">{ann.title}</h3>
                        <span className="text-xs text-slate-500">{new Date(ann.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">{ann.message}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
