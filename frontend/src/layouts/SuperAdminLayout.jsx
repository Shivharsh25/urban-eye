import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  UserCheck,
  Users,
  FileCheck2,
  Cpu,
  UserCog,
  History,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Activity
} from 'lucide-react';

export default function SuperAdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const res = await client.get('/api/super-admin/requests?status=pending');
        setPendingRequestsCount(res.data.count || (res.data.requests || []).length || 0);
      } catch (err) {
        // silent fail
      }
    }
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Platform Overview', path: '/super-admin', icon: LayoutDashboard },
    { label: 'Departments', path: '/super-admin/departments', icon: Building2 },
    {
      label: 'Admin Requests',
      path: '/super-admin/requests',
      icon: UserCheck,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null
    },
    { label: 'Department Admins', path: '/super-admin/admins', icon: Users },
    { label: 'Citywide Reports', path: '/super-admin/reports', icon: FileCheck2 },
    { label: 'AI & Routing Rules', path: '/super-admin/ai-config', icon: Cpu },
    { label: 'Platform Users', path: '/super-admin/users', icon: UserCog },
    { label: 'Audit Logs', path: '/super-admin/audit-logs', icon: History }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-[#051317] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-[#00897B] selection:text-white">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-[#081C21] border-r border-teal-950/80 sticky top-0 h-screen z-30 shrink-0">
        
        {/* Logo and System Emblem */}
        <div className="p-5 border-b border-teal-950 flex items-center justify-between">
          <Link to="/super-admin" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005C66] to-[#00897B] flex items-center justify-center shadow-lg shadow-teal-950/60 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#081C21] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-black tracking-wider uppercase text-white">Urban EYE</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">SUPER ADMIN</span>
                <span className="text-[9px] px-1 rounded bg-teal-950 text-teal-300 font-mono">v2.0</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Live System Indicator */}
        <div className="mx-4 my-3 px-3.5 py-2 rounded-xl bg-[#051317]/80 border border-teal-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-semibold text-slate-300">City Grid Active</span>
          </div>
          <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">ONLINE</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/super-admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#005C66] to-[#00897B] text-white shadow-md shadow-teal-950/50 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0b242a]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-bounce">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Super Admin User Footer */}
        <div className="p-4 border-t border-teal-950 bg-[#06171B]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-teal-800/60 border border-teal-600/40 flex items-center justify-center text-teal-200 font-bold text-xs uppercase">
                {user?.name ? user.name.slice(0, 2) : 'SA'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Root Super Admin'}</p>
                <p className="text-[10px] text-teal-400 truncate">{user?.email || 'superadmin@urbaneye.local'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/dashboard"
              target="_blank"
              className="flex-1 py-1.5 px-2 rounded-lg bg-teal-950/70 border border-teal-900/60 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center space-x-1 transition-colors"
              title="Open Citizen Portal in new tab"
            >
              <span>Citizen View</span>
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
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-[#081C21] border-b border-teal-950 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00897B] flex items-center justify-center text-white font-black text-xs">
            UE
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white">Urban EYE</span>
            <span className="text-[9px] block text-teal-400 font-semibold">Super Admin Portal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#0b242a] text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#06171B]/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-teal-900">
            <span className="text-sm font-bold text-teal-300">Super Admin Navigation</span>
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
                className="flex items-center justify-between p-3 rounded-xl bg-[#092227] text-sm font-semibold"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
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

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        {/* Sub-header / Top Status bar */}
        <div className="bg-[#081C21]/60 backdrop-blur-md border-b border-teal-950/80 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Urban EYE Executive Command</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-teal-300 font-medium">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/super-admin' && location.pathname.startsWith(i.path)))?.label || 'Overview'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {pendingRequestsCount > 0 && (
              <Link
                to="/super-admin/requests"
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors"
              >
                <Bell className="w-3 h-3 text-amber-400" />
                <span>{pendingRequestsCount} Pending Approvals</span>
              </Link>
            )}
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI ONNX: LIVE</span>
            </div>
          </div>
        </div>

        {/* Page Content Viewport */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
