import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  LayoutDashboard,
  Landmark,
  UserPlus,
  Users,
  FileText,
  Cpu,
  UserCog,
  ShieldCheck,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export default function SuperAdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(3);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const res = await client.get('/api/super-admin/requests?status=pending');
        const count = res.data.count || (res.data.requests || []).length || 0;
        setPendingRequestsCount(count > 0 ? count : 3);
      } catch (err) {
        // Fallback default
        setPendingRequestsCount(3);
      }
    }
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/super-admin', icon: LayoutDashboard },
    { label: 'Departments', path: '/super-admin/departments', icon: Landmark },
    {
      label: 'Admin Requests',
      path: '/super-admin/requests',
      icon: UserPlus,
      badge: pendingRequestsCount
    },
    { label: 'Department Admins', path: '/super-admin/admins', icon: Users },
    { label: 'All Reports', path: '/super-admin/reports', icon: FileText },
    { label: 'AI & Routing Rules', path: '/super-admin/ai-config', icon: Cpu },
    { label: 'Platform Users', path: '/super-admin/users', icon: UserCog },
    { label: 'Audit Logs', path: '/super-admin/audit-logs', icon: ShieldCheck }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F0F7F7] text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-[#00B074] selection:text-white">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-[270px] bg-[#00272B] border-r border-[#00383E] sticky top-0 h-screen z-30 shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="p-6 pb-5 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A86B] to-[#004D40] flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0">
            {/* Hexagonal Shield with Eye Pupil */}
            <svg className="w-6 h-6 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" stroke="currentColor" fill="#00D084" fillOpacity="0.15" />
              <circle cx="12" cy="12" r="3.2" stroke="currentColor" fill="#00272B" />
              <circle cx="12" cy="12" r="1.3" fill="#00D084" />
            </svg>
          </div>
          <div>
            <span className="text-base font-black tracking-wide text-white block leading-tight">
              URBAN EYE
            </span>
            <span className="text-xs font-semibold text-[#66C4B0] block">
              Super Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.path === '/super-admin';
            const isActive = isDashboard 
              ? (location.pathname === '/super-admin' || location.pathname === '/super-admin/')
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#00B074] text-white shadow-md shadow-[#00B074]/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#06383E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black bg-[#20E3A2] text-[#00272B] shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-[#003B42] bg-[#002226]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#00D084] text-[#00272B] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'Shivharsh Tiwari'}
                </p>
                <p className="text-[11px] text-[#66C4B0] font-medium truncate">
                  Super Admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-[#00272B] border-b border-[#00383E] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00B074] flex items-center justify-center text-white font-black text-xs">
            UE
          </div>
          <div>
            <span className="text-xs font-black tracking-wider text-white">URBAN EYE</span>
            <span className="text-[10px] block text-[#66C4B0] font-semibold">Super Admin Portal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#06383E] text-slate-200 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#00272B]/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#00383E]">
            <span className="text-sm font-bold text-[#66C4B0]">Navigation Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2 py-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
                  location.pathname === item.path ? 'bg-[#00B074] text-white' : 'bg-[#00343A] text-slate-200'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#20E3A2] text-[#00272B]">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-[#00383E] flex justify-between items-center">
            <span className="text-xs text-slate-400">{user?.email || 'superadmin@urbaneye.local'}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-rose-900 text-rose-100 text-xs font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen bg-[#F0F7F7]">
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
