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
      setError(err.response?.data?.error || err.message || 'Failed to create announcement');
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
      case 'warning': return <AlertCircle className="w-5 h-5 text-[#302B69]" />;
      case 'error': return <ShieldAlert className="w-5 h-5 text-[#191636]" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-[#302B69]" />;
      default: return <Info className="w-5 h-5 text-[#302B69]" />;
    }
  };

  const getTypeColor = () => {
    return 'border-[#E8E2E5] bg-[#F6F6FC] text-[#302B69]';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-6xl mx-auto font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E2E5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191636] flex items-center tracking-tight">
            <Bell className="w-6 h-6 mr-3 text-[#302B69]" />
            Municipal Announcements
          </h1>
          <p className="text-xs text-[#57536E] mt-1 font-medium">Broadcast notices and emergency alerts to all citizens in real-time.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs font-semibold flex items-start space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#302B69]" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E8E2E5] shadow-sm">
            <h2 className="text-base font-bold text-[#191636] mb-4 flex items-center">
              <Plus className="w-5 h-5 text-[#302B69] mr-2" />
              New Announcement
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#57536E] mb-1 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs font-medium focus:outline-none focus:border-[#302B69] shadow-sm"
                  placeholder="e.g., Road Closure & Maintenance"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#57536E] mb-1 uppercase tracking-wider">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs font-medium focus:outline-none focus:border-[#302B69] min-h-[110px] shadow-sm"
                  placeholder="Enter the broadcast notification details..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#57536E] mb-1 uppercase tracking-wider">Category / Priority</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs font-semibold focus:outline-none focus:border-[#302B69] shadow-sm"
                >
                  <option value="info">General Advisory</option>
                  <option value="warning">Important Caution</option>
                  <option value="error">Critical Emergency Alert</option>
                  <option value="success">Resolved Update</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-[#302B69] hover:bg-[#242052] disabled:opacity-50 transition-colors shadow-sm"
              >
                {creating ? 'Broadcasting...' : 'Broadcast Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* Active Announcements List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-[#E8E2E5] shadow-sm h-full flex flex-col">
            <h2 className="text-base font-bold text-[#191636] mb-4">Active Broadcasts</h2>
            
            {loading ? (
              <div className="flex justify-center p-8 flex-1 items-center">
                <div className="w-8 h-8 border-2 border-[#302B69]/20 border-t-[#302B69] rounded-full animate-spin"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#E8E2E5] rounded-xl bg-[#F6F6FC] flex-1 flex flex-col justify-center items-center">
                <Bell className="w-8 h-8 text-[#8C87A6] mb-2" />
                <p className="text-xs text-[#57536E] font-medium">No active broadcasts currently active.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {announcements.map((ann) => (
                  <div key={ann._id} className="group relative p-4 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-start gap-3.5 hover:border-[#302B69]/30 transition-all">
                    <div className={`p-2.5 rounded-xl border ${getTypeColor(ann.type)} shadow-sm shrink-0`}>
                      {getTypeIcon(ann.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-bold text-[#191636]">{ann.title}</h3>
                        <span className="text-[11px] text-[#8C87A6] shrink-0 font-medium">{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-[#57536E] mt-1 whitespace-pre-wrap">{ann.message}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-[#8C87A6] hover:text-[#191636] hover:bg-white rounded-lg transition-all"
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
