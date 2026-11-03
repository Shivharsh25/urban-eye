import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Lightbulb, 
  Droplets, 
  Leaf, 
  LayoutGrid, 
  ChevronRight, 
  Plus, 
  X, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  BarChart2,
  CheckSquare
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [selectedDeptId, setSelectedDeptId] = useState('roads');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(null);
  const [departments, setDepartments] = useState([
    {
      id: 'roads',
      name: 'Roads & Public Works',
      subtitle: 'Pothole, road damage, blockade',
      icon: AlertTriangle,
      iconBg: 'bg-[#EAF7EE]',
      iconColor: 'text-emerald-700',
      activeCount: 18,
      resolutionRate: '86%',
      color: '#10B981',
      percentage: '27%',
      head: 'Rajesh Mehra',
      teams: 6,
      slaTarget: '48h'
    },
    {
      id: 'sanitation',
      name: 'Sanitation & Waste',
      subtitle: 'Garbage, landfill, cleanliness',
      icon: Trash2,
      iconBg: 'bg-[#EAF7EE]',
      iconColor: 'text-emerald-700',
      activeCount: 12,
      resolutionRate: '90%',
      color: '#3B82F6',
      percentage: '18%',
      head: 'Sunita Sharma',
      teams: 4,
      slaTarget: '24h'
    },
    {
      id: 'electrical',
      name: 'Electrical & Lighting',
      subtitle: 'Streetlight, power, public lighting',
      icon: Lightbulb,
      iconBg: 'bg-[#FEF6E8]',
      iconColor: 'text-amber-600',
      activeCount: 8,
      resolutionRate: '87%',
      color: '#F59E0B',
      percentage: '12%',
      head: 'Vikas Kumar',
      teams: 3,
      slaTarget: '36h'
    },
    {
      id: 'water',
      name: 'Water & Drainage',
      subtitle: 'Water leak, drainage, overflow',
      icon: Droplets,
      iconBg: 'bg-[#EAF4FF]',
      iconColor: 'text-blue-600',
      activeCount: 6,
      resolutionRate: '92%',
      color: '#A855F7',
      percentage: '9%',
      head: 'Anil Gupta',
      teams: 2,
      slaTarget: '24h'
    },
    {
      id: 'parks',
      name: 'Parks & Environment',
      subtitle: 'Park maintenance, greenery, cleanliness',
      icon: Leaf,
      iconBg: 'bg-[#EAF7EE]',
      iconColor: 'text-emerald-700',
      activeCount: 4,
      resolutionRate: '90%',
      color: '#14B8A6',
      percentage: '6%',
      head: 'Priya Verma',
      teams: 2,
      slaTarget: '72h'
    },
    {
      id: 'others',
      name: 'Other Services',
      subtitle: 'Miscellaneous civic issues',
      icon: LayoutGrid,
      iconBg: 'bg-[#E6F8F6]',
      iconColor: 'text-[#00897B]',
      activeCount: 5,
      resolutionRate: '84%',
      color: '#CBD5E1',
      percentage: '28%',
      head: 'Naveen Joshi',
      teams: 1,
      slaTarget: '48h'
    }
  ]);

  const [fieldTeams, setFieldTeams] = useState([
    {
      id: 'R3',
      name: 'Team-R3 (Sector 60–70)',
      deptName: 'Roads & Public Works',
      deptIcon: AlertTriangle,
      deptColor: 'text-amber-600',
      activeTasks: 6,
      status: 'in_progress',
      statusLabel: 'In Progress',
      statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
      lead: 'Inspector Ramesh',
      contact: '+91 98765 43210'
    },
    {
      id: 'S1',
      name: 'Team-S1 (Central Zone)',
      deptName: 'Sanitation & Waste',
      deptIcon: Trash2,
      deptColor: 'text-emerald-600',
      activeTasks: 4,
      status: 'in_progress',
      statusLabel: 'In Progress',
      statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
      lead: 'Supervisor Manoj',
      contact: '+91 98765 43211'
    },
    {
      id: 'E2',
      name: 'Team-E2 (North Zone)',
      deptName: 'Electrical & Lighting',
      deptIcon: Lightbulb,
      deptColor: 'text-amber-500',
      activeTasks: 3,
      status: 'active',
      statusLabel: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      lead: 'Officer Suresh',
      contact: '+91 98765 43212'
    }
  ]);

  // Form states for Add Department modal
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptSubtitle, setNewDeptSubtitle] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptSla, setNewDeptSla] = useState('48h');

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const newDept = {
      id: `dept_${Date.now()}`,
      name: newDeptName.trim(),
      subtitle: newDeptSubtitle.trim() || 'Civic infrastructure maintenance',
      icon: LayoutGrid,
      iconBg: 'bg-[#E6F8F6]',
      iconColor: 'text-[#00897B]',
      activeCount: 1,
      resolutionRate: '90%',
      color: '#00897B',
      percentage: '5%',
      head: newDeptHead.trim() || 'Officer in Charge',
      teams: 1,
      slaTarget: newDeptSla
    };

    setDepartments(prev => [...prev, newDept]);
    setNewDeptName('');
    setNewDeptSubtitle('');
    setNewDeptHead('');
    setShowAddModal(false);
  };

  // Performance bars data
  const performanceBars = [
    { label: 'Roads', rate: 86 },
    { label: 'Sanitation', rate: 90 },
    { label: 'Electrical', rate: 87 },
    { label: 'Water', rate: 92 },
    { label: 'Parks', rate: 90 }
  ];

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* =================================================================== */}
      {/* 1. PAGE HEADER ROW (Matching Reference Exact Layout)                */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Title with Department Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              Departments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Manage municipal departments, field teams and their workloads.
            </p>
          </div>
        </div>

        {/* Top-Right: + Add Department Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#005C66] hover:bg-[#06252B] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 2. 4 METRIC KPI CARDS (Exact Reference Style)                       */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Departments */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              {departments.length}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              Departments
            </div>
          </div>
        </div>

        {/* Card 2: Field Teams */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EBFDF5] border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              18
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              Field Teams
            </div>
          </div>
        </div>

        {/* Card 3: Active Assignments */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              67
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              Active Assignments
            </div>
          </div>
        </div>

        {/* Card 4: On-time Resolution */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D5EFEA] shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EBFDF5] border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              88%
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              On-time Resolution
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. ROW 2: DEPARTMENTS OVERVIEW & WORKLOAD / PERFORMANCE             */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Departments Overview 2-Column Grid (approx 7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <h2 className="text-sm sm:text-base font-bold text-[#0B2027]">
            Departments Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {departments.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDeptId === dept.id;

              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex flex-col justify-between group ${
                    isSelected 
                      ? 'border-[#00897B] bg-[#F0FAF8]' 
                      : 'border-[#D5EFEA] hover:border-[#00897B]/50 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${dept.iconBg} ${dept.iconColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-[#0B2027] truncate">
                          {dept.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {dept.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>

                  {/* Badges footer */}
                  <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.activeCount} Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{dept.resolutionRate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Department Workload & Resolution Performance (approx 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: Department Workload Donut Chart */}
          <div className="bg-white rounded-2xl border border-[#D5EFEA] shadow-2xs p-5 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[#0B2027]">
              Department Workload
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-1">
              
              {/* Donut Multi-color Progress Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Outer circle segments representing workload distribution */}
                  {/* Segment 1: Roads (27% ~ 81 deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="14"
                    strokeDasharray="78 211"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Sanitation (18% ~ 52 deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="14"
                    strokeDasharray="52 237"
                    strokeDashoffset="-78"
                  />
                  {/* Segment 3: Electrical (12% ~ 35 deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    strokeDasharray="35 254"
                    strokeDashoffset="-130"
                  />
                  {/* Segment 4: Water (9% ~ 26 deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="14"
                    strokeDasharray="26 263"
                    strokeDashoffset="-165"
                  />
                  {/* Segment 5: Parks (6% ~ 17 deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="14"
                    strokeDasharray="17 272"
                    strokeDashoffset="-191"
                  />
                  {/* Segment 6: Other (28% ~ 81 deg) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="14"
                    strokeDasharray="81 208"
                    strokeDashoffset="-208"
                  />
                </svg>

                {/* Center text: 67 Assignments */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-[#0B2027] tracking-tight">
                    67
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 leading-tight">
                    Assignments
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-1.5 flex-1 w-full text-xs font-semibold">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }}></span>
                      <span className="text-slate-700 truncate">{dept.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0 font-mono">
                      {dept.percentage}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Card 2: Resolution Performance Bar Chart */}
          <div className="bg-white rounded-2xl border border-[#D5EFEA] shadow-2xs p-5 space-y-4">
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00897B]" />
              <h3 className="text-sm sm:text-base font-bold text-[#0B2027]">
                Resolution Performance
              </h3>
            </div>

            {/* Vertical Bar Chart */}
            <div className="pt-2">
              <div className="flex items-end justify-between gap-2 h-36 border-b border-slate-200 pb-2 relative">
                
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 flex items-center justify-start text-[9px] text-slate-400 pl-1">100%</div>
                <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100 flex items-center justify-start text-[9px] text-slate-400 pl-1">75%</div>
                <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100 flex items-center justify-start text-[9px] text-slate-400 pl-1">50%</div>
                <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100 flex items-center justify-start text-[9px] text-slate-400 pl-1">25%</div>

                {/* Bars */}
                {performanceBars.map((b) => (
                  <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full z-10">
                    <span className="text-[10px] font-bold text-slate-700 mb-1 font-mono">
                      {b.rate}%
                    </span>
                    <div
                      style={{ height: `${b.rate}%` }}
                      className="w-full max-w-[34px] rounded-t-lg bg-gradient-to-t from-[#10B981] to-[#34D399] transition-all duration-700"
                    ></div>
                  </div>
                ))}
              </div>

              {/* X-axis Department Labels */}
              <div className="flex items-center justify-between gap-2 pt-2 text-[11px] font-semibold text-slate-600 text-center">
                {performanceBars.map((b) => (
                  <span key={b.label} className="flex-1 truncate">
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. ROW 3: FIELD TEAMS TABLE                                         */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-[#D5EFEA] shadow-2xs p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E6F8F6] text-[#00897B] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#0B2027]">
              Field Teams
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {}}
            className="text-xs font-bold text-[#00897B] hover:text-[#005C66] transition-colors flex items-center gap-1 group"
          >
            <span>View All Teams</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Active Tasks</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {fieldTeams.map((team) => {
                const DeptIcon = team.deptIcon;

                return (
                  <tr
                    key={team.id}
                    onClick={() => setShowTeamModal(team)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Team Name */}
                    <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {team.name}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <DeptIcon className={`w-3.5 h-3.5 ${team.deptColor}`} />
                        <span>{team.deptName}</span>
                      </div>
                    </td>

                    {/* Active Tasks */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                      {team.activeTasks}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${team.statusClass}`}>
                        {team.statusLabel}
                      </span>
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 5. ADD DEPARTMENT MODAL                                             */}
      {/* =================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#D5EFEA] shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6F8F6] text-[#00897B] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2027]">
                    Add New Department
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register a civic division & dispatch SLA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Flood & Drainage Control"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5EFEA] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00897B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Scope / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g., Stormwater drains, flood relief pumps"
                  value={newDeptSubtitle}
                  onChange={(e) => setNewDeptSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5EFEA] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00897B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department Head
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rajesh Sharma"
                    value={newDeptHead}
                    onChange={(e) => setNewDeptHead(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5EFEA] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00897B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SLA Target
                  </label>
                  <select
                    value={newDeptSla}
                    onChange={(e) => setNewDeptSla(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5EFEA] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00897B]"
                  >
                    <option value="24h">24 Hours</option>
                    <option value="36h">36 Hours</option>
                    <option value="48h">48 Hours</option>
                    <option value="72h">72 Hours</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005C66] hover:bg-[#06252B] text-white text-xs font-bold shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. FIELD TEAM INSPECTION MODAL                                      */}
      {/* =================================================================== */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#D5EFEA] shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6F8F6] text-[#00897B] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2027]">
                    {showTeamModal.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {showTeamModal.deptName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F3F9F8] border border-[#D5EFEA] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Team Lead:</span>
                  <span className="font-bold text-slate-800">{showTeamModal.lead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Active Assignments:</span>
                  <span className="font-bold text-slate-800 font-mono">{showTeamModal.activeTasks} tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Dispatch Radio:</span>
                  <span className="font-bold text-slate-800 font-mono">{showTeamModal.contact}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowTeamModal(null)}
                className="px-5 py-2 rounded-xl bg-[#005C66] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
