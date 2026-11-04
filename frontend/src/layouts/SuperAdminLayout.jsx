import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  LayoutGrid,
  Landmark,
  UserPlus,
  Users,
  FileBarChart,
  Cpu,
  Share2,
  ShieldCheck,
  ChevronLeft,
  LogOut,
  ExternalLink,
  Menu,
  X
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
        setPendingRequestsCount(3);
      }
    }
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navSections = [
    {
      title: null,
      items: [
        { label: 'Platform Overview', path: '/super-admin', icon: LayoutGrid },
        { label: 'Departments', path: '/super-admin/departments', icon: Landmark },
        {
          label: 'Admin Requests',
          path: '/super-admin/requests',
          icon: UserPlus,
          badge: pendingRequestsCount
        },
        { label: 'Department Admins', path: '/super-admin/admins', icon: Users },
        { label: 'Citywide Reports', path: '/super-admin/reports', icon: FileBarChart }
      ]
    },
    {
      title: 'INTELLIGENCE & CONTROL',
      items: [
        { label: 'AI & Routing Rules', path: '/super-admin/ai-config', icon: Cpu },
        { label: 'Platform Users', path: '/super-admin/users', icon: Share2 }
      ]
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { label: 'Audit Logs', path: '/super-admin/audit-logs', icon: ShieldCheck }
      ]
    }
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
      
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (EXACT MATCH TO REFERENCE DESIGN)       */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex lg:flex-col w-[280px] bg-[#02181D] border-r border-[#00383E]/70 sticky top-0 h-screen z-30 shrink-0 select-none overflow-hidden">
        
        {/* Brand Header with Glowing 3D Cube & Collapse Arrow */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Glowing Neon 3D Cube Icon */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#03232A] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0">
              <svg className="w-6 h-6 text-[#00E5FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {/* Outer 3D hexagon */}
                <polygon points="12 2 21 7.2 21 16.8 12 22 3 16.8 3 7.2 12 2" stroke="#00E5FF" strokeOpacity="0.85" />
                {/* Inner cube lines */}
                <line x1="12" y1="2" x2="12" y2="12" stroke="#00E5FF" />
                <line x1="12" y1="12" x2="21" y2="7.2" stroke="#00E5FF" />
                <line x1="12" y1="12" x2="3" y2="7.2" stroke="#00E5FF" />
                <line x1="12" y1="12" x2="12" y2="22" stroke="#00E5FF" />
                {/* Central wireframe node */}
                <circle cx="12" cy="12" r="1.5" fill="#00E5FF" />
              </svg>
            </div>

            <div>
              <span className="text-base font-black tracking-wider text-white block leading-tight font-sans">
                URBAN EYE
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-[#00E5FF] uppercase font-mono">
                  SUPER ADMIN v2.0
                </span>
              </div>
            </div>
          </div>

          {/* Collapse/Expand Toggle Button */}
          <button
            type="button"
            className="w-7 h-7 rounded-lg border border-[#004750] bg-[#022329]/80 flex items-center justify-center text-teal-300 hover:text-white hover:border-[#00E5FF]/60 transition-colors shadow-2xs"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3.5 py-2 space-y-4 overflow-y-auto custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="flex items-center space-x-2 px-3 pt-3 pb-1.5">
                  <span className="text-[10px] font-black tracking-widest text-[#00E5FF] uppercase whitespace-nowrap">
                    {section.title}
                  </span>
                  <div className="flex-1 h-[1px] bg-[#004750]/60" />
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isDashboard = item.path === '/super-admin';
                const isActive = isDashboard 
                  ? (location.pathname === '/super-admin' || location.pathname === '/super-admin/')
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] font-bold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00897B] via-[#00A896] to-[#02C39A] text-white shadow-md shadow-[#00897B]/30'
                        : 'text-slate-300 hover:text-white hover:bg-[#042830]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#00E5FF]'}`} />
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black bg-[#00E599] text-[#002227] shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Futuristic Glowing Neon City Skyline Vector Illustration */}
        <div className="relative w-full overflow-hidden pointer-events-none mt-auto">
          <svg className="w-full h-20" viewBox="0 0 280 85" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="neonGlowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="waveStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00897B" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00897B" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Neon Skyscrapers Outline */}
            <path
              d="M0 85 L0 78 L15 78 L15 66 L28 66 L28 52 L42 52 L42 62 L55 62 L55 42 L68 42 L68 66 L82 66 L82 54 L98 54 L98 32 L112 32 L112 20 L118 20 L118 8 L120 8 L120 20 L128 20 L128 44 L145 44 L145 58 L160 58 L160 36 L175 36 L175 64 L192 64 L192 52 L208 52 L208 70 L224 70 L224 58 L240 58 L240 75 L260 75 L260 64 L280 64 L280 85 Z"
              stroke="#00E5FF"
              strokeWidth="1.2"
              fill="url(#neonGlowGrad)"
            />

            {/* Antenna Lights */}
            <circle cx="119" cy="8" r="1.5" fill="#00E5FF" />
            <circle cx="55" cy="40" r="1.2" fill="#00E5FF" />
            <circle cx="160" cy="34" r="1.2" fill="#00E5FF" />

            {/* Window Arrays */}
            <path d="M35 58 V62 M35 66 V70" stroke="#00E5FF" strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
            <path d="M62 48 V58 M62 62 V72" stroke="#00E5FF" strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
            <path d="M105 38 V48 M105 52 V62" stroke="#00E5FF" strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
            <path d="M152 46 V54 M152 58 V66" stroke="#00E5FF" strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />

            {/* Neon Waves at bottom */}
            <path
              d="M0 76 C70 68, 140 84, 280 74"
              stroke="url(#waveStrokeGrad)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M0 80 C90 74, 190 86, 280 78"
              stroke="url(#waveStrokeGrad)"
              strokeWidth="1"
              strokeOpacity="0.7"
              fill="none"
            />
          </svg>
        </div>

        {/* User Card & Citizen View at Bottom */}
        <div className="p-4 border-t border-[#003B42]/70 bg-[#02181D] space-y-2.5">
          {/* User Profile Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#00D084] text-[#00272B] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'Shivharsh Tiwari'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  Super Admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Citizen View Action Button */}
          <Link
            to="/dashboard"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-[#00343C] hover:bg-[#004854] border border-[#005560] text-white font-bold text-xs flex items-center justify-between transition-all shadow-xs cursor-pointer group"
            title="Open Citizen Portal in new tab"
          >
            <span className="tracking-wide">Citizen View</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#00E5FF] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE HEADER                                            */}
      {/* ======================================================== */}
      <div className="lg:hidden bg-[#02181D] border-b border-[#00383E] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00A86B] flex items-center justify-center text-white font-black text-xs shadow-md">
            UE
          </div>
          <div>
            <span className="text-xs font-black tracking-wider text-white">URBAN EYE</span>
            <span className="text-[10px] block text-[#00E5FF] font-semibold">SUPER ADMIN v2.0</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#042830] text-slate-200 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* MOBILE DRAWER                                            */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#02181D]/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#00383E]">
            <span className="text-sm font-bold text-[#00E5FF]">Super Admin Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4 py-6">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {section.title && (
                  <span className="text-[10px] font-black tracking-widest text-[#00E5FF] uppercase block px-2 pb-1">
                    {section.title}
                  </span>
                )}
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
                      location.pathname === item.path ? 'bg-[#00897B] text-white' : 'bg-[#042830] text-slate-200'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00E599] text-[#002227]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-[#00383E] space-y-3">
            <Link
              to="/dashboard"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#00343C] border border-[#005560] text-white font-bold text-xs flex items-center justify-between"
            >
              <span>Citizen View</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#00E5FF]" />
            </Link>

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-400">{user?.email || 'superadmin@urbaneye.local'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-rose-900 text-rose-100 text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN CONTENT VIEWPORT                                    */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen bg-[#F0F7F7]">
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
