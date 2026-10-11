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
      fixed inset-y-0 left-0 z-50 h-full border-r border-slate-200 bg-white flex flex-col transition-transform duration-300 shadow-2xs
      lg:static lg:relative lg:translate-x-0 lg:shrink-0
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isCollapsed ? 'lg:w-20 w-72 max-w-[85vw]' : 'w-72 sm:w-64 max-w-[85vw]'}
      overflow-hidden
    `}>
      {/* Brand Header & Integrated Collapse Toggle / Mobile Close Button */}
      {isCollapsed ? (
        <div className="h-20 flex flex-col items-center justify-center border-b border-slate-200 relative z-10 py-2">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="group" title="Urban EYE">
            <Logo size="sm" subtitle="" showText={false} />
          </Link>
          <button 
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center mt-1 p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all group/btn"
            title="Expand Sidebar (Ctrl + B)"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden mt-1 p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-all"
            title="Close Navigation Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="h-20 px-3.5 border-b border-slate-200 flex items-center justify-between relative z-10">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group min-w-0 flex-1" title="Urban EYE">
            <Logo size="md" subtitle="Civic Watch" showText={true} />
          </Link>
          {/* Desktop Collapse Toggle */}
          <button 
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200 hover:border-slate-300 shrink-0 ml-1"
            title="Minimize Sidebar (Ctrl + B)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          {/* Mobile Drawer Close Button */}
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-all border border-slate-200 shrink-0 ml-1"
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
                <NavItem to="/report" icon={Camera} label={t('reportIssue')} isActive={isActive('/report')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="Scan" badgeColor="bg-blue-50 text-blue-700 border-blue-200" />
              </>
            ) : (
              <>
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-3 mb-1.5 mt-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
                    <span>{t('coreAccess')}</span>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                )}
                <NavItem to="/dashboard" icon={LayoutDashboard} label={t('dashboard')} isActive={isActive('/dashboard')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <NavItem to="/report" icon={Camera} label={t('newReport')} isActive={isActive('/report')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="Report" badgeColor="bg-blue-50 text-blue-700 border-blue-200" />
                <NavItem to="/my-reports" icon={FileText} label={t('myReports')} isActive={isActive('/my-reports')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-3 mb-1.5 mt-4 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
                    <span>{t('cityNetwork')}</span>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                )}
                <NavItem to="/map" icon={Map} label={t('liveMap')} isActive={isActive('/map')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="LIVE" badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200" isLivePulse={true} />
                <NavItem to="/alerts" icon={Bell} label={t('alerts')} isActive={isActive('/alerts')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <NavItem to="/activity" icon={Activity} label={t('activity')} isActive={isActive('/activity')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />

                <div className="pt-2.5 mt-2.5 border-t border-slate-200">
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2 px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
                      <span>{t('account')}</span>
                      <div className="h-px flex-1 bg-slate-200"></div>
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
      className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'} rounded-xl transition-all duration-150 group relative ${
        isActive
          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/90 shadow-2xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
      }`}
    >
      {/* Icon container */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-2xs' 
          : 'bg-slate-100 text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-200'
      }`}>
        <Icon className="w-4 h-4" />
      </div>

      {!isCollapsed && (
        <span className="text-xs tracking-tight truncate flex-1 font-semibold">
          {label}
        </span>
      )}

      {!isCollapsed && badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 ${badgeColor || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
          {isLivePulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
          {badge}
        </span>
      )}

      {/* Collapsed Tooltip */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-slate-100 text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border border-slate-700 z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
