import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Tag,
  AlertCircle,
  Search,
  RefreshCw,
  Power,
  X
} from 'lucide-react';

export default function SuperAdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    code: '',
    description: '',
    categories: '',
    contactEmail: '',
    contactPhone: '',
    slaHours: 48
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/api/super-admin/departments');
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError('Could not retrieve departments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingDept(null);
    setModalForm({
      name: '',
      code: '',
      description: '',
      categories: '',
      contactEmail: '',
      contactPhone: '',
      slaHours: 48
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDept(dept);
    setModalForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      categories: (dept.categories || []).join(', '),
      contactEmail: dept.contactEmail || '',
      contactPhone: dept.contactPhone || '',
      slaHours: dept.slaHours || 48
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError(null);

    const payload = {
      name: modalForm.name,
      code: modalForm.code,
      description: modalForm.description,
      categories: modalForm.categories.split(',').map(s => s.trim()).filter(Boolean),
      contactEmail: modalForm.contactEmail,
      contactPhone: modalForm.contactPhone,
      slaHours: Number(modalForm.slaHours) || 48
    };

    try {
      if (editingDept) {
        await client.patch(`/api/super-admin/departments/${editingDept._id}`, payload);
      } else {
        await client.post('/api/super-admin/departments', payload);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to save department.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    const newStatus = dept.status === 'active' ? 'inactive' : 'active';
    try {
      await client.patch(`/api/super-admin/departments/${dept._id}`, { status: newStatus });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update department status.');
    }
  };

  const filteredDepts = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            <span>Municipal Departments</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure municipal agencies, their assigned issue categories, response SLAs, and authorized contact endpoints.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDepartments}
            className="p-2.5 rounded-xl bg-[#081C21] border border-teal-900/60 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#005C66] to-[#00897B] hover:from-[#004d55] hover:to-[#00796B] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-teal-950/50 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#081C21] p-3 rounded-2xl border border-teal-950">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by department name, code, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#051317] border border-teal-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400 pr-2">
          {filteredDepts.length} departments
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          Loading municipal departments...
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-[#081C21] border border-teal-950 rounded-2xl">
          No departments found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((dept) => {
            const isActive = dept.status === 'active';
            return (
              <div
                key={dept._id}
                className="bg-[#081C21] border border-teal-950 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-teal-800 transition-all relative group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{dept.name}</h3>
                        <span className="text-[10px] font-mono text-teal-400 font-semibold uppercase">
                          CODE: {dept.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {dept.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-4 line-clamp-2">
                    {dept.description || 'No description provided.'}
                  </p>

                  {/* Categories Tags */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span>Issue Categories</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(dept.categories || []).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#051317] border border-teal-950 text-[10px] text-teal-300 font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metadata: SLA & Contact */}
                  <div className="space-y-1.5 pt-3 border-t border-teal-950 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resolution SLA:</span>
                      </span>
                      <span className="font-semibold text-slate-200">{dept.slaHours || 48} Hours</span>
                    </div>

                    {dept.contactEmail && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Contact:</span>
                        </span>
                        <span className="text-slate-300 truncate max-w-[160px]">{dept.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-5 pt-3 border-t border-teal-950 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(dept)}
                    className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      isActive
                        ? 'text-rose-300 bg-rose-950/30 border-rose-900/40 hover:bg-rose-900/40'
                        : 'text-emerald-300 bg-emerald-950/30 border-emerald-900/40 hover:bg-emerald-900/40'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(dept)}
                    className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-950/60 border border-teal-800/50 text-teal-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#081C21] border border-teal-800/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-teal-900 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <span>{editingDept ? 'Edit Municipal Department' : 'Create New Department'}</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  placeholder="e.g. Roads & Public Works"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051317] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department Code * (lowercase, unique)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingDept}
                  value={modalForm.code}
                  onChange={(e) => setModalForm({ ...modalForm, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="e.g. roads"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051317] border border-teal-900 text-white focus:outline-none focus:border-teal-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Responsibilities and civic scope..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051317] border border-teal-900 text-white focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Categories (comma separated)</label>
                <input
                  type="text"
                  value={modalForm.categories}
                  onChange={(e) => setModalForm({ ...modalForm, categories: e.target.value })}
                  placeholder="e.g. POTHOLE, ROAD_DAMAGE, SIDEWALK"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#051317] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={modalForm.contactEmail}
                    onChange={(e) => setModalForm({ ...modalForm, contactEmail: e.target.value })}
                    placeholder="roads@urbaneye.local"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#051317] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Resolution SLA (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={modalForm.slaHours}
                    onChange={(e) => setModalForm({ ...modalForm, slaHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#051317] border border-teal-900 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-teal-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-bold tracking-wider uppercase disabled:opacity-50"
                >
                  {modalSubmitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

