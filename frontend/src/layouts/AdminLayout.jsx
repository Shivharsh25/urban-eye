import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import { 
  Eye, 
  LogOut, 
  LayoutDashboard, 
  Settings,
  Users,
  Activity,
  Menu,
  X,
  Bell,
  Layers,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const s = getSocket();
    setSocketConnected(s.connected);
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  // Keyboard shortcut (Ctrl + B) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Reported Issues', path: '/admin/issues', icon: Layers },
    { name: 'Analytics', path: '/admin/analytics', icon: Activity },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#090d16] overflow-hidden text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full z-50 glass-panel border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-lg text-white tracking-tight">Urban EYE Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 glass-panel border-r border-slate-800/80 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-20 w-64' : 'lg:w-64 w-64'}
      `}>
        {/* Brand Area & Collapse Toggle */}
        {isCollapsed ? (
          <div className="h-20 flex flex-col items-center justify-center border-b border-slate-800/60 py-2 relative">
            <Link to="/admin" className="group" title="Urban EYE Admin">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
                <Eye className="w-5 h-5 text-white animate-pulse" />
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center mt-1 p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-all group/btn relative"
              title="Expand Sidebar (Ctrl + B)"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-cyan-300 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                Expand Sidebar (Ctrl+B)
              </div>
            </button>
          </div>
        ) : (
          <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/60 mt-12 lg:mt-0">
            <Link to="/admin" className="flex items-center space-x-3 group min-w-0" title="Urban EYE Admin">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Eye className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex-1 truncate">
                <span className="block text-base font-bold tracking-tight text-white leading-tight truncate">Urban EYE</span>
                <span className="block text-[9px] text-cyan-400 font-mono tracking-widest truncate">COMMAND CENTER</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-all border border-slate-800/60"
              title="Minimize Sidebar (Ctrl + B)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.path}
                title={isCollapsed ? item.name : undefined}
                className={`
                  flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group relative
                  ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-3'}
                  ${active 
                    ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 shadow-sm shadow-cyan-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'
                  }
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Floating Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-200 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Bottom Nav Minimize/Expand Quick Action */}
          <div className="pt-3 mt-3 border-t border-slate-800/60 hidden lg:block">
            <button
              type="button"
              onClick={toggleCollapse}
              className={`
                flex items-center w-full rounded-xl text-xs font-semibold text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-all duration-200 group relative
                ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'}
              `}
              title={isCollapsed ? 'Expand Sidebar (Ctrl + B)' : 'Minimize Sidebar (Ctrl + B)'}
            >
              {isCollapsed ? (
                <>
                  <PanelLeftOpen className="w-5 h-5 text-cyan-400" />
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-cyan-300 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                    Expand Sidebar (Ctrl+B)
                  </div>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
                  <span className="truncate">Minimize Sidebar</span>
                  <span className="ml-auto text-[10px] font-mono text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">Ctrl+B</span>
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Bottom User Area */}
        <div className={`border-t border-slate-800/60 bg-slate-900/30 transition-all duration-300 ${isCollapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-4'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                <div className="flex flex-col truncate min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-200 truncate">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="mt-3 flex items-center justify-center space-x-2">
                <span className="relative flex h-2 w-2">
                  {socketConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
                <span className={`text-[10px] font-mono font-bold ${socketConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {socketConnected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div 
                className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-inner group relative cursor-pointer"
                title={`${user?.name} (${user?.email})`}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-200 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                  {user?.name || 'Administrator'}
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors group relative"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-rose-300 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                  Sign Out
                </div>
              </button>

              <div className="mt-1 flex items-center justify-center" title={socketConnected ? 'System Online' : 'System Offline'}>
                <span className="relative flex h-2 w-2">
                  {socketConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#090d16] mt-16 lg:mt-0 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        {children}
      </main>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
