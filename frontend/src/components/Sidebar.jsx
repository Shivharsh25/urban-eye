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
      fixed inset-y-0 left-0 z-50 h-full border-r border-slate-800/80 bg-[#070b14]/95 backdrop-blur-2xl flex flex-col transition-transform duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.6)]
      lg:static lg:relative lg:translate-x-0 lg:shrink-0
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isCollapsed ? 'lg:w-20 w-72 max-w-[85vw]' : 'w-72 sm:w-64 max-w-[85vw]'}
      overflow-hidden
    `}>
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-28 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      {/* Brand Header & Integrated Collapse Toggle / Mobile Close Button */}
      {isCollapsed ? (
        <div className="h-20 flex flex-col items-center justify-center border-b border-slate-800/80 relative z-10 bg-slate-950/40 backdrop-blur-md py-2">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="group" title="Urban EYE">
            <Logo size="sm" subtitle="" showText={false} />
          </Link>
          <button 
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center mt-1 p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all group/btn"
            title="Expand Sidebar (Ctrl + B)"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden mt-1 p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-all"
            title="Close Navigation Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="h-20 px-3.5 border-b border-slate-800/80 flex items-center justify-between relative z-10 bg-slate-950/40 backdrop-blur-md">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group min-w-0 flex-1" title="Urban EYE">
            <Logo size="md" subtitle="Active Watch" showText={true} />
          </Link>
          {/* Desktop Collapse Toggle */}
          <button 
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all border border-slate-800/70 hover:border-cyan-500/40 shrink-0 ml-1"
            title="Minimize Sidebar (Ctrl + B)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          {/* Mobile Drawer Close Button */}
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-all border border-slate-800/70 hover:border-rose-500/40 shrink-0 ml-1"
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
                <NavItem to="/report" icon={Camera} label={t('reportIssue')} isActive={isActive('/report')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="AI Scan" badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30" />
              </>
            ) : (
              <>
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-3 mb-1.5 mt-1 text-[9px] font-mono font-bold tracking-[0.22em] text-slate-500 uppercase select-none">
                    <span>{t('coreAccess')}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-800 via-cyan-500/20 to-transparent"></div>
                  </div>
                )}
                <NavItem to="/dashboard" icon={LayoutDashboard} label={t('dashboard')} isActive={isActive('/dashboard')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <NavItem to="/report" icon={Camera} label={t('newReport')} isActive={isActive('/report')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="AI" badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30" />
                <NavItem to="/my-reports" icon={FileText} label={t('myReports')} isActive={isActive('/my-reports')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-3 mb-1.5 mt-4 text-[9px] font-mono font-bold tracking-[0.22em] text-slate-500 uppercase select-none">
                    <span>{t('cityNetwork')}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-800 via-cyan-500/20 to-transparent"></div>
                  </div>
                )}
                <NavItem to="/map" icon={Map} label={t('liveMap')} isActive={isActive('/map')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="LIVE" badgeColor="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" isLivePulse={true} />
                <NavItem to="/alerts" icon={Bell} label={t('alerts')} isActive={isActive('/alerts')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <NavItem to="/activity" icon={Activity} label={t('activity')} isActive={isActive('/activity')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />

                <div className="pt-2.5 mt-2.5 border-t border-slate-800/60">
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2 px-3 mb-1.5 text-[9px] font-mono font-bold tracking-[0.22em] text-slate-500 uppercase select-none">
                      <span>{t('account')}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-slate-800 via-cyan-500/20 to-transparent"></div>
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
          ? 'bg-gradient-to-r from-cyan-500/15 via-sky-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_20px_rgba(6,182,212,0.12)] font-semibold'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-l-2 border-transparent hover:translate-x-1'
      }`}
    >
      {/* Icon with glowing container */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
        isActive 
          ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-400/40' 
          : 'bg-slate-900/60 text-slate-400 border border-slate-800/60 group-hover:text-cyan-300 group-hover:bg-slate-800 group-hover:border-cyan-500/30 group-hover:scale-105'
      }`}>
        <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      </div>

      {!isCollapsed && (
        <span className="text-xs font-semibold tracking-wide truncate flex-1">
          {label}
        </span>
      )}

      {!isCollapsed && badge && (
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider flex items-center gap-1 ${badgeColor || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
          {isLivePulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
          {badge}
        </span>
      )}

      {/* Collapsed Tooltip */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-cyan-300 text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl border border-slate-700 z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
