import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket, subscribeToDetections } from '../api/socket';
import SignOutModal from '../components/SignOutModal';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Building2, 
  MessageSquare, 
  BarChart2, 
  Settings, 
  Search, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  PanelLeftClose, 
  PanelLeftOpen,
  Shield,
  Layers,
  Users,
  UserCheck
} from 'lucide-react';
import client from '../api/client';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [incomingCount, setIncomingCount] = useState(24);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Socket & Live Updates
  useEffect(() => {
    const s = getSocket();
    setSocketConnected(s.connected);
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    // Initial count fetch
    client.get('/api/detections').then((res) => {
      const all = res.data?.detections || [];
      const pending = all.filter(d => d.status === 'new' || d.status === 'pending');
      if (pending.length > 0) setIncomingCount(pending.length);
    }).catch(() => {});

    // Listen to real-time events
    const unsub = subscribeToDetections({
      onCreated: () => setIncomingCount(prev => prev + 1)
    });

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      unsub();
    };
  }, []);

  // Keyboard shortcut (Ctrl + B) to toggle sidebar, (Ctrl + K) for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('admin-global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setShowSignOutConfirm(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: LayoutDashboard,
      active: location.pathname === '/admin'
    },
    { 
      name: 'Incoming Reports', 
      path: '/admin/issues', 
      icon: FileText,
      badge: incomingCount > 0 ? incomingCount : '24',
      active: (location.pathname === '/admin/issues' || location.pathname === '/admin/incoming' || location.pathname === '/admin/incoming-reports') && !location.search.includes('view=triage')
    },
    { 
      name: 'Triage & Assign', 
      path: '/admin/triage', 
      icon: UserCheck,
      active: location.pathname === '/admin/triage' || location.search.includes('view=triage')
    },
    { 
      name: 'Departments', 
      path: '/admin/departments', 
      icon: Building2,
      active: location.pathname === '/admin/departments' || location.pathname === '/admin/users'
    },
    { 
      name: 'Citizen Communication', 
      path: '/admin/announcements', 
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : '3',
      active: location.pathname === '/admin/announcements'
    },
    { 
      name: 'Analytics', 
      path: '/admin/analytics', 
      icon: BarChart2,
      active: location.pathname === '/admin/analytics'
    },
    { 
      name: 'Settings', 
      path: '/admin/settings', 
      icon: Settings,
      active: location.pathname === '/admin/settings'
    },
  ];

  const adminInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD';

  return (
    <div className="flex h-screen h-[100dvh] bg-[#F3F9F8] overflow-hidden text-[#0B2027] font-sans relative">
      
      {/* =================================================================== */}
      {/* 1. LEFT SIDEBAR (DARK PETROL TEAL - #06252B)                        */}
      {/* =================================================================== */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300
          lg:static lg:relative lg:translate-x-0 lg:shrink-0 lg:h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20 w-72 max-w-[85vw]' : 'w-64 max-w-[85vw]'}
          overflow-hidden select-none border-r border-[#0E3841] shadow-xl
        `}
        style={{ backgroundColor: '#06252B', color: '#FFFFFF' }}
      >
        {/* Brand Header */}
        <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#0E3841] relative z-10 shrink-0`}>
          {isCollapsed ? (
            <div className="flex flex-col items-center justify-center">
              <Link to="/admin" className="group flex items-center justify-center" title="Urban EYE • Admin Command Center">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-400/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Shield className="w-4 h-4 text-teal-400" />
                </div>
              </Link>
              <button 
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center mt-2 p-1 rounded-md text-teal-400/60 hover:text-teal-200 hover:bg-white/5 transition-all"
                title="Expand Sidebar (Ctrl + B)"
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/admin" className="flex items-center space-x-2.5 group min-w-0 flex-1" title="Urban EYE • Admin Command Center">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Shield className="w-4 h-4 text-teal-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-white text-sm tracking-wider leading-tight">URBAN EYE</span>
                  <span className="text-[9px] font-mono tracking-widest text-teal-300 flex items-center gap-1 leading-tight mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Admin Command Center
                  </span>
                </div>
              </Link>

              {/* Desktop Collapse Toggle */}
              <button 
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-teal-400/60 hover:text-teal-200 hover:bg-white/5 transition-all shrink-0 ml-1"
                title="Minimize Sidebar (Ctrl + B)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button 
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden flex items-center justify-center p-1.5 rounded-lg text-teal-400/60 hover:text-rose-400 hover:bg-white/5 transition-all shrink-0 ml-1"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.active;

            return (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group relative
                  ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'}
                  ${isItemActive 
                    ? 'bg-[#00897B] text-white shadow-xs font-bold' 
                    : 'text-teal-100/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isItemActive ? 'text-white' : 'text-teal-300/70 group-hover:text-teal-200'}`} />
                
                {!isCollapsed && (
                  <span className="truncate flex-1 tracking-wide">{item.name}</span>
                )}

                {/* Badge counter */}
                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                    isItemActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#005C66] text-teal-200 border border-teal-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#003840] text-teal-100 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-[#0E3841] z-50 flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/30 text-teal-300 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Decorative City Skyline Illustration (Exact reference aesthetic) */}
        {!isCollapsed && (
          <div className="px-3 pb-2 pt-1 pointer-events-none opacity-40">
            <svg viewBox="0 0 240 60" fill="none" className="w-full h-auto text-teal-400">
              <path d="M5 58h230" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M15 58V34h12v24M35 58V24h14v34M55 58V38h8v20M68 58V14h18v44M90 58V28h12v30M108 58V18h16v40M130 58V32h14v26M150 58V12h20v46M176 58V26h12v32M194 58V36h14v22M214 58V20h12v38" stroke="currentColor" strokeWidth="1.2" />
              <path d="M77 14V6M160 12V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="77" cy="5" r="1.5" fill="currentColor" />
              <circle cx="160" cy="3" r="1.5" fill="currentColor" />
              <path d="M0 56c40-10 80-2 120-10 40-8 80-2 120-10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* Bottom Profile Strip (Exact reference layout) */}
        <div className="border-t border-[#0E3841] p-3 relative z-10 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-[#005C66] border border-teal-400/40 text-teal-200 font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                  {adminInitials}
                </div>
                <div className="flex flex-col min-w-0 truncate">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {user?.name || 'Admin'}
                  </span>
                  <span className="text-[10px] text-teal-300/80 font-medium truncate mt-0.5 leading-tight">
                    Municipal Control
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-lg text-teal-400/70 hover:text-rose-400 hover:bg-white/5 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-9 h-9 rounded-full bg-[#005C66] border border-teal-400/40 text-teal-200 font-bold text-xs flex items-center justify-center shadow-inner cursor-pointer"
                title={`${user?.name || 'Admin'} (Municipal Control)`}
              >
                {adminInitials}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-white/5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MAIN RIGHT PANE                                                  */}
      {/* =================================================================== */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative z-10 w-full max-w-full">
        
        {/* Top Header Bar with Search & Notifications */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#D5EFEA] flex items-center justify-between shrink-0 shadow-2xs z-20">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm text-[#0B2027]">Admin Command</span>
          </div>

          {/* Center Search Bar (Exact Reference Component) */}
          <div className="hidden sm:flex items-center flex-1 max-w-lg mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-global-search"
                type="text"
                placeholder="Search by report ID, location or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2 rounded-full bg-[#F3F9F8] border border-[#D5EFEA] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded border border-slate-300 bg-white">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Right: Notifications & Profile Avatar */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Bell Icon with pulsing indicator */}
            <Link
              to="/admin/announcements"
              className="relative p-2 rounded-full bg-[#F3F9F8] hover:bg-slate-100 text-slate-600 hover:text-[#00897B] transition-colors border border-[#D5EFEA]"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </Link>

            {/* Dark Teal Circular Avatar (AD) */}
            <div 
              className="w-9 h-9 rounded-full bg-[#06252B] border border-teal-500/30 text-teal-200 font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
              title="Admin Account"
              onClick={() => navigate('/admin/settings')}
            >
              {adminInitials}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F3F9F8] relative flex flex-col min-h-0 w-full max-w-full">
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-full relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sign Out Confirmation Modal */}
      <SignOutModal 
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
}
