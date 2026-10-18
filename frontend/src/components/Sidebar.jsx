import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  LayoutDashboard, 
  Camera, 
  FileText, 
  UserCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  PanelLeftClose,
  PanelLeftOpen,
  Shield, 
  Radio, 
  Bell, 
  Map, 
  Settings, 
  HelpCircle, 
  Activity,
  Sparkles,
  Flame,
  RadioTower,
  X
} from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('citizen_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('citizen_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

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

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 h-full border-r border-[#EAE7DD] bg-white/95 backdrop-blur-md flex flex-col transition-transform duration-300 shadow-xs
      lg:static lg:relative lg:translate-x-0 lg:shrink-0
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isCollapsed ? 'lg:w-20 w-72 max-w-[85vw]' : 'w-72 sm:w-64 max-w-[85vw]'}
      overflow-hidden
    `}>
      {/* Brand Header & Integrated Collapse Toggle / Mobile Close Button */}
      {isCollapsed ? (
        <div className="h-16 flex flex-col items-center justify-center border-b border-[#EAE7DD] relative z-10 bg-white/95 py-2">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="group" title="Urban EYE">
            <Logo size="sm" subtitle="" showText={false} />
          </Link>
          <button 
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center mt-1 p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#FAF9F5] transition-all group/btn"
            title="Expand Sidebar (Ctrl + B)"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden mt-1 p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-[#FAF9F5] transition-all"
            title="Close Navigation Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="h-16 px-4 border-b border-[#EAE7DD] flex items-center justify-between relative z-10 bg-white/95">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group min-w-0 flex-1" title="Urban EYE">
            <Logo size="md" subtitle="Active Watch" showText={true} />
          </Link>
          {/* Desktop Collapse Toggle */}
          <button 
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#FAF9F5] transition-all border border-[#EAE7DD] shrink-0 ml-1"
            title="Minimize Sidebar (Ctrl + B)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          {/* Mobile Drawer Close Button */}
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-[#FAF9F5] transition-all border border-[#EAE7DD] shrink-0 ml-1"
            title="Close Navigation Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 py-3 px-3 pb-8 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
        {user && (
          <>
            {isAdmin ? (
              <>
                <NavItem to="/admin" icon={LayoutDashboard} label={t('dashboard')} isActive={isActive('/admin')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <NavItem to="/report" icon={Camera} label={t('reportIssue')} isActive={isActive('/report')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="AI Scan" badgeColor="bg-[#FAF9F5] text-[#6B503B] border-[#EAE7DD]" />
              </>
            ) : (
              <>
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-3 mb-1.5 mt-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                    <span>{t('coreAccess')}</span>
                    <div className="h-px flex-1 bg-[#EAE7DD]"></div>
                  </div>
                )}
                <NavItem to="/dashboard" icon={LayoutDashboard} label={t('dashboard')} isActive={isActive('/dashboard')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <NavItem to="/report" icon={Camera} label={t('newReport')} isActive={isActive('/report')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="AI" badgeColor="bg-[#FAF9F5] text-[#6B503B] border-[#EAE7DD]" />
                <NavItem to="/my-reports" icon={FileText} label={t('myReports')} isActive={isActive('/my-reports')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-3 mb-1.5 mt-4 text-[10px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                    <span>{t('cityNetwork')}</span>
                    <div className="h-px flex-1 bg-[#EAE7DD]"></div>
                  </div>
                )}
                <NavItem to="/map" icon={Map} label={t('liveMap')} isActive={isActive('/map')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="LIVE" badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200" isLivePulse={true} />
                <NavItem to="/alerts" icon={Bell} label={t('alerts')} isActive={isActive('/alerts')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <NavItem to="/activity" icon={Activity} label={t('activity')} isActive={isActive('/activity')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />

                <div className="pt-2.5 mt-2.5 border-t border-[#EAE7DD]">
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2 px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                      <span>{t('account')}</span>
                      <div className="h-px flex-1 bg-[#EAE7DD]"></div>
                    </div>
                  )}
                  <NavItem to="/profile" icon={UserCircle} label={t('profile')} isActive={isActive('/profile')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                  <NavItem to="/settings" icon={Settings} label={t('settings')} isActive={isActive('/settings')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                  <NavItem to="/support" icon={HelpCircle} label={t('support')} isActive={isActive('/support')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                </div>
              </>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label, isActive, isCollapsed, onClick, badge, badgeColor, isLivePulse }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2'} rounded-xl transition-all duration-200 group relative overflow-hidden ${
        isActive
          ? 'bg-[#FAF9F5] text-[#6B503B] border-l-2 border-[#99775C] font-semibold shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF9F5] border-l-2 border-transparent hover:translate-x-0.5'
      }`}
    >
      {/* Icon container */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
        isActive 
          ? 'bg-[#99775C] text-white shadow-xs' 
          : 'bg-[#FAF9F5] text-slate-500 border border-[#EAE7DD] group-hover:text-[#99775C] group-hover:bg-white group-hover:border-[#99775C]/40'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      {!isCollapsed && (
        <span className="text-xs font-semibold tracking-wide truncate flex-1">
          {label}
        </span>
      )}

      {!isCollapsed && badge && (
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider flex items-center gap-1 ${badgeColor || 'bg-[#FAF9F5] text-[#6B503B] border-[#EAE7DD]'}`}>
          {isLivePulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
          {badge}
        </span>
      )}

      {/* Collapsed Tooltip */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
