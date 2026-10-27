import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import TopHeader from '../components/TopHeader';
import UserMenuDropdown from '../components/UserMenuDropdown';
import SignOutModal from '../components/SignOutModal';
import WatermarkBackground from '../components/WatermarkBackground';
import Logo from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
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
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

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
    setShowSignOutConfirm(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: t('dashboard', 'Dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('reportedIssues', 'Reported Issues'), path: '/admin/issues', icon: Layers },
    { name: t('analytics', 'Analytics'), path: '/admin/analytics', icon: Activity },
    { name: t('users', 'Users'), path: '/admin/users', icon: Users },
    { name: t('announcements', 'Announcements'), path: '/admin/announcements', icon: Bell },
    { name: t('settings', 'Settings'), path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen h-[100dvh] bg-[#F6EBE8] overflow-hidden text-[#191636] font-sans selection:bg-[#302B69] selection:text-white relative">
      <WatermarkBackground />
      
      {/* Mobile Header */}
      <header className="lg:hidden shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E2E5] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-[#191636] p-1.5 rounded-lg hover:bg-[#F6F6FC] transition-colors mr-1"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#302B69] flex items-center justify-center text-white">
            <Eye className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-[#191636] tracking-tight">Urban EYE Admin</span>
        </div>
        <div className="flex items-center space-x-2">
          <UserMenuDropdown />
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-md border-r border-[#E8E2E5] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:relative lg:shrink-0 lg:h-screen flex flex-col shadow-xs
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-20 w-72 max-w-[85vw]' : 'lg:w-64 w-72 max-w-[85vw]'}
      `}>
        {/* Brand Area & Collapse Toggle */}
        {isCollapsed ? (
          <div className="h-16 flex flex-col items-center justify-center border-b border-[#E8E2E5] py-2 relative">
            <Link to="/admin" className="group" title="Urban EYE Admin">
              <Logo size="sm" subtitle="" showText={false} />
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center mt-1 p-1 rounded-lg text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC] transition-all group/btn relative cursor-pointer"
              title="Expand Sidebar (Ctrl + B)"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#E8E2E5]">
            <Link to="/admin" className="flex items-center space-x-3 group min-w-0 flex-1" title="Urban EYE Admin">
              <Logo size="md" subtitle="Command Center" showText={true} />
            </Link>
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC] transition-all border border-[#E8E2E5] cursor-pointer"
              title="Minimize Sidebar (Ctrl + B)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden flex items-center justify-center p-1.5 rounded-lg text-[#57536E] hover:text-rose-600 hover:bg-[#F6F6FC] transition-all border border-[#E8E2E5] shrink-0 ml-1 cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`
                  flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group relative
                  ${isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'}
                  ${active 
                    ? 'bg-[#F6F6FC] text-[#302B69] border-l-2 border-[#302B69] shadow-xs' 
                    : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC] border-l-2 border-transparent hover:translate-x-0.5'
                  }
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  active ? 'bg-[#302B69] text-white shadow-xs' : 'bg-[#F6F6FC] text-[#57536E] group-hover:text-[#302B69]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Floating Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#191636] text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className={`border-t border-[#E8E2E5] bg-white transition-all duration-300 ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <div className="flex flex-col truncate min-w-0 pr-2">
                  <span className="text-xs font-bold text-[#191636] truncate">{user?.name}</span>
                  <span className="text-[10px] text-[#57536E] font-mono truncate">{user?.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-[#57536E] hover:text-rose-600 border border-[#E8E2E5] transition-colors shrink-0 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="mt-2.5 flex items-center justify-center space-x-2">
                <span className="relative flex h-2 w-2">
                  {socketConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                </span>
                <span className={`text-[10px] font-mono font-bold ${socketConnected ? 'text-emerald-700' : 'text-[#57536E]'}`}>
                  {socketConnected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div 
                className="w-9 h-9 rounded-xl bg-[#302B69] text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
                title={`${user?.name} (${user?.email})`}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>

              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#F6F6FC] hover:bg-rose-50 text-[#57536E] hover:text-rose-600 border border-[#E8E2E5] transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

              <div className="mt-1 flex items-center justify-center" title={socketConnected ? 'System Online' : 'System Offline'}>
                <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative z-10 w-full max-w-full">
        {/* Top Header */}
        <div className="hidden lg:block shrink-0">
          <TopHeader />
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative flex flex-col min-h-0 w-full max-w-full bg-[#F6EBE8]">
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-full relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#191636]/40 backdrop-blur-xs z-40 lg:hidden"
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
