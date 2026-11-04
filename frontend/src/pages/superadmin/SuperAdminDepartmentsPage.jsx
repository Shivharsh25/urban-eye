import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Landmark,
  Plus,
  Edit2,
  XCircle,
  Clock,
  Mail,
  Tag,
  Search,
  RefreshCw,
  X,
  Trash2,
  Droplets,
  Zap,
  Leaf,
  CheckCircle2
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
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  // Department icon helper based on code
  const getDepartmentIcon = (code) => {
    const c = (code || '').toLowerCase();
    if (c.includes('road')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#E8F8F0] text-emerald-600 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="9" y2="3" />
            <line x1="20" y1="21" x2="15" y2="3" />
            <line x1="12" y1="6" x2="12" y2="8" strokeDasharray="2 2" />
            <line x1="12" y1="12" x2="12" y2="14" strokeDasharray="2 2" />
            <line x1="12" y1="18" x2="12" y2="20" strokeDasharray="2 2" />
          </svg>
        </div>
      );
    }
    if (c.includes('sanitation') || c.includes('waste')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#E8F8F0] text-emerald-600 flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5" />
        </div>
      );
    }
    if (c.includes('electric') || c.includes('light')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#FEF6E9] text-amber-500 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
      );
    }
    if (c.includes('water') || c.includes('drain')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#EDF7FC] text-sky-500 flex items-center justify-center shrink-0">
          <Droplets className="w-5 h-5" />
        </div>
      );
    }
    // Parks / environmental default
    return (
      <div className="w-11 h-11 rounded-xl bg-[#E8F8F0] text-emerald-600 flex items-center justify-center shrink-0">
        <Leaf className="w-5 h-5" />
      </div>
    );
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
          <span className="text-[#00A86B] font-bold">Departments</span>
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
      {/* 2. TITLE BAR & CREATE DEPARTMENT BUTTON */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F8F0] border border-emerald-100/80 flex items-center justify-center shrink-0 shadow-2xs">
            <Landmark className="w-6 h-6 text-[#00A86B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A262C] tracking-tight">
              Municipal Departments
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure municipal departments, define issue categories, response SLAs, and authorized contact endpoints.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={fetchDepartments}
            className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-xs font-bold tracking-wide transition-all shadow-xs hover:shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Department</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SEARCH BAR MATCHING SCREENSHOT PILL LAYOUT */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by department name, code, or description..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 text-xs font-bold text-slate-700 whitespace-nowrap">
          <span>{filteredDepts.length} departments</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. DEPARTMENTS 3-COLUMN GRID MATCHING SCREENSHOT */}
      {/* ======================================================== */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-[#00B074] rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 tracking-wider">
            Loading municipal departments...
          </span>
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-white border border-slate-200/80 rounded-3xl shadow-2xs">
          No departments found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => {
            const isActive = dept.status === 'active';
            return (
              <div
                key={dept._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Icon, Name + Code, Active Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getDepartmentIcon(dept.code)}
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-[#0A262C] leading-snug">
                          {dept.name}
                        </h3>
                        <span className="text-xs font-mono font-bold text-[#00A86B] tracking-wide block mt-0.5 uppercase">
                          CODE: {dept.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                        isActive
                          ? 'bg-[#D4F4E4] text-[#00695C]'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed my-3 line-clamp-2">
                    {dept.description || 'Public municipal infrastructure maintenance and operations management.'}
                  </p>

                  {/* Issue Categories with Label and Mint Pills */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase text-slate-700 tracking-wider mb-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>ISSUE CATEGORIES</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(dept.categories && dept.categories.length > 0 ? dept.categories : ['general issue']).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full bg-[#E1F7EC] text-[#00695C] text-xs font-bold font-sans"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Resolution SLA & Contact */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Resolution SLA:</span>
                      </span>
                      <span className="font-bold text-[#0A262C]">
                        {dept.slaHours || 48} Hours
                      </span>
                    </div>

                    {dept.contactEmail && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Contact:</span>
                        </span>
                        <span className="font-bold text-[#0A262C] truncate max-w-[170px]" title={dept.contactEmail}>
                          {dept.contactEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons: Deactivate / Edit */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(dept)}
                    className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-rose-200 bg-[#FFF5F5] hover:bg-[#FFEBEB] text-rose-600'
                        : 'border-emerald-200 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-emerald-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(dept)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-emerald-300/80 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-emerald-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. CREATE / EDIT MODAL (CLEAN LIGHT EXECUTIVE STYLING) */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-black text-[#0A262C] flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E6F8F0] flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-[#00A86B]" />
                </div>
                <span>{editingDept ? 'Edit Municipal Department' : 'Create New Department'}</span>
              </h2>
              <button 
                onClick={() => setModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  placeholder="e.g. Roads & Public Works"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074] transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Department Code * (lowercase, unique)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingDept}
                  value={modalForm.code}
                  onChange={(e) => setModalForm({ ...modalForm, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="e.g. roads"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074] disabled:opacity-60 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Responsibilities and civic scope..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074] resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Categories (comma separated)</label>
                <input
                  type="text"
                  value={modalForm.categories}
                  onChange={(e) => setModalForm({ ...modalForm, categories: e.target.value })}
                  placeholder="e.g. pothole, road damage, road blockage"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={modalForm.contactEmail}
                    onChange={(e) => setModalForm({ ...modalForm, contactEmail: e.target.value })}
                    placeholder="pwd.roads@urbaneye.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Resolution SLA (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={modalForm.slaHours}
                    onChange={(e) => setModalForm({ ...modalForm, slaHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-bold tracking-wide transition-all shadow-xs disabled:opacity-50"
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
