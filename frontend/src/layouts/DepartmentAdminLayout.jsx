import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  Users2,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Wrench
} from 'lucide-react';

export default function DepartmentAdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('urbaneye_deptadmin_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('urbaneye_deptadmin_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const deptName = user?.departmentName || 'Municipal Operations';

  const navItems = [
    { label: 'Department Dashboard', path: '/dept-admin', icon: LayoutDashboard },
    { label: 'Assigned Reports', path: '/dept-admin/reports', icon: FileText },
    { label: 'In-Progress Jobs', path: '/dept-admin/in-progress', icon: Clock },
    { label: 'Resolved Archive', path: '/dept-admin/resolved', icon: CheckCircle2 },
    { label: 'Field Response Teams', path: '/dept-admin/teams', icon: Users2 },
    { label: 'SLA & Analytics', path: '/dept-admin/analytics', icon: BarChart3 },
    { label: 'Priority Alerts', path: '/dept-admin/notifications', icon: Bell }
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#06181D] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-[#00897B] selection:text-white">
      
      {/* SIDEBAR (Desktop) */}
      <aside className={`hidden lg:flex lg:flex-col ${isCollapsed ? 'w-20' : 'w-72'} bg-[#082027] border-r border-teal-950/80 sticky top-0 h-screen z-30 shrink-0 select-none overflow-hidden transition-all duration-300 relative`}>
        
        {/* Department Header */}
        <div className="p-4 border-b border-teal-950">
          <div className="flex items-center justify-between">
            <Link to="/dept-admin" className="flex items-center space-x-3 group min-w-0" title="Urban EYE Department Portal">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005C66] to-[#00897B] flex items-center justify-center shadow-lg shadow-teal-950/60 group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="text-sm font-black tracking-wider uppercase text-white block truncate">Urban EYE</span>
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block truncate">Department Portal</span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-teal-800/60 hover:border-teal-500 bg-[#06181D] text-teal-300 hover:text-white transition-all cursor-pointer shrink-0 ml-1"
              title={isCollapsed ? 'Restore Sidebar (<->)' : 'Minimize Sidebar (<->)'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Prominent Department Active Pill */}
          {!isCollapsed && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#06181D] border border-teal-900/60 flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Assigned Division</span>
                <span className="text-xs font-bold text-teal-200 truncate block">{deptName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dept-admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#005C66] to-[#00897B] text-white shadow-md shadow-teal-950/50 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0b2830]'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 border border-teal-500/30">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Department Officer Info & Logout */}
        <div className="p-3 border-t border-teal-950 bg-[#06181D]">
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-teal-800/60 border border-teal-600/40 flex items-center justify-center text-teal-200 font-bold text-xs uppercase shrink-0">
                    {user?.name ? user.name.slice(0, 2) : 'DO'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Department Officer'}</p>
                    <p className="text-[10px] text-teal-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  target="_blank"
                  className="flex-1 py-1.5 px-2 rounded-lg bg-teal-950/70 border border-teal-900/60 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center space-x-1 transition-colors"
                >
                  <span>Citizen Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-300 hover:text-rose-100 hover:bg-rose-900/50 text-[11px] font-medium flex items-center space-x-1 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Link
                to="/dashboard"
                target="_blank"
                className="w-9 h-9 rounded-xl bg-teal-950/70 border border-teal-900/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Citizen Portal"
              >
                <ExternalLink className="w-4 h-4 text-teal-300" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-rose-950/40 border border-rose-900/40 text-rose-300 hover:text-rose-100 hover:bg-rose-900/50 flex items-center justify-center transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Resize & Quick-Minimize Handle (<->) */}
        <div
          onClick={toggleSidebar}
          className="hidden lg:flex absolute top-0 right-0 w-3 h-full cursor-col-resize group/resizer items-center justify-center z-30 select-none hover:bg-teal-500/10 transition-colors"
          title={isCollapsed ? "Click to restore sidebar (<->)" : "Click to minimize sidebar (<->)"}
        >
          <div className="w-[2px] h-full bg-transparent group-hover/resizer:bg-teal-400/60 transition-colors" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-[#082027] border border-teal-800 hover:border-teal-400 text-teal-300 hover:text-white flex items-center justify-center shadow-lg transition-all opacity-0 group-hover/resizer:opacity-100 hover:scale-110 z-40 cursor-pointer"
            title={isCollapsed ? "Restore sidebar (<->)" : "Minimize sidebar (<->)"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-[#082027] border-b border-teal-950 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00897B] flex items-center justify-center text-white font-black text-xs">
            UE
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white">Urban EYE</span>
            <span className="text-[9px] block text-teal-400 font-semibold truncate max-w-[180px]">{deptName}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#0b2830] text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#06181D]/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-teal-900">
            <span className="text-sm font-bold text-teal-300">{deptName}</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2 py-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#09272f] text-sm font-semibold"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-teal-900 flex justify-between items-center">
            <span className="text-xs text-slate-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-rose-900 text-rose-100 text-xs font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        {/* Sub-header / Breadcrumbs */}
        <div className="bg-[#082027]/60 backdrop-blur-md border-b border-teal-950/80 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="text-teal-400 font-semibold">{deptName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-medium">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/dept-admin' && location.pathname.startsWith(i.path)))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-teal-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SLA ACTIVE</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

