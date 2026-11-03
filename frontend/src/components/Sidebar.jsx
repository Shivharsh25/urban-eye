import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home,
  LayoutDashboard, 
  Camera, 
  FileText,
  Layers, 
  UserCircle, 
  Shield, 
  Bell, 
  Map, 
  Settings, 
  HelpCircle, 
  Activity,
  Compass,
  Radio,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

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

  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`
        sidebar-dark fixed inset-y-0 left-0 z-50 h-full flex flex-col transition-all duration-300
        lg:static lg:relative lg:translate-x-0 lg:shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-20 w-72 max-w-[85vw]' : 'w-64 max-w-[85vw]'}
        overflow-hidden select-none border-r border-[#0E3841]
      `}
      style={{ backgroundColor: '#06252B', color: '#FFFFFF' }}
    >
      {/* Brand Header & Integrated Collapse Toggle / Mobile Close Button */}
      <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#0E3841] relative z-10 shrink-0`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center justify-center">
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="group flex items-center justify-center" title="Urban EYE • Active Watch">
              <Logo size="sm" subtitle="" showText={false} />
            </Link>
            <button 
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center mt-2 p-1 rounded-md text-teal-400/60 hover:text-teal-200 hover:bg-white/5 transition-all"
              title="Expand Sidebar (Ctrl + B)"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              className="lg:hidden mt-2 p-1 rounded-md text-rose-400 hover:text-rose-300 hover:bg-white/5 transition-all"
              title="Close Navigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2.5 group min-w-0 flex-1" title="Urban EYE • Active Watch">
              <Logo size="sm" subtitle="Active Watch" showText={true} />
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
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              className="lg:hidden flex items-center justify-center p-1.5 rounded-lg text-teal-400/60 hover:text-rose-400 hover:bg-white/5 transition-all shrink-0 ml-1"
              title="Close Navigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
        {user && (
          <>
            {isAdmin ? (
              <>
                <SidebarItem to="/admin" icon={LayoutDashboard} label={t('dashboard', 'Dashboard')} isActive={isActive('/admin')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
                <SidebarItem to="/report" icon={Camera} label={t('reportIssue', 'Report Issue')} isActive={isActive('/report')} isCollapsed={isCollapsed} onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} badge="AI Scan" />
              </>
            ) : (
              <>
                {/* Core Navigation Items */}
                <SidebarItem 
                  to="/dashboard" 
                  icon={Home} 
                  label={t('dashboard', 'Dashboard')} 
                  isActive={isActive('/dashboard')} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                />
                <SidebarItem 
                  to="/my-reports" 
                  icon={FileText} 
                  label={t('reports', 'Reports')} 
                  isActive={isActive('/my-reports') || isActive('/reports')} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                />
                <SidebarItem 
                  to="/report" 
                  icon={PlusCircle} 
                  label={t('reportIssue', 'Report Issue')} 
                  isActive={isActive('/report')} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                />
                <SidebarItem 
                  to="/tracking" 
                  icon={Layers} 
                  label={t('myTracking', 'My Tracking')} 
                  isActive={isActive('/tracking')} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                />

                {/* Section 1: CITY NETWORK */}
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-3 pt-5 pb-1.5 text-[10px] font-bold tracking-wider text-teal-400/70 uppercase">
                    <span>{t('cityNetwork', 'CITY NETWORK')}</span>
                    <div className="h-px flex-1 bg-[#0E3841]"></div>
                  </div>
                )}
                <SidebarItem 
                  to="/map" 
                  icon={Map} 
                  label={t('liveMap', 'Live Map')} 
                  isActive={isActive('/map')} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                  badge="Live" 
                  isLiveDot={true}
                />
                <SidebarItem 
                  to="/alerts" 
                  icon={Bell} 
                  label={t('communityAlerts', 'Community Alerts')} 
                  isActive={isActive('/alerts')} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                />
                <SidebarItem 
                  to="/activity" 
                  icon={Activity} 
                  label={t('cityActivity', 'City Activity')} 
                  isActive={isActive('/activity')} 
                  isCollapsed={isCollapsed} 
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                />

                {/* Section 2: ACCOUNT */}
                <div className="pt-2">
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2 px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-wider text-teal-400/70 uppercase">
                      <span>{t('account', 'ACCOUNT')}</span>
                      <div className="h-px flex-1 bg-[#0E3841]"></div>
                    </div>
                  )}
                  <SidebarItem 
                    to="/profile" 
                    icon={UserCircle} 
                    label={t('citizenProfile', 'Citizen Profile')} 
                    isActive={isActive('/profile')} 
                    isCollapsed={isCollapsed} 
                    onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                  />
                  <SidebarItem 
                    to="/settings" 
                    icon={Settings} 
                    label={t('settings', 'Settings')} 
                    isActive={isActive('/settings')} 
                    isCollapsed={isCollapsed} 
                    onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                  />
                  <SidebarItem 
                    to="/support" 
                    icon={HelpCircle} 
                    label={t('helpSupport', 'Help & Support')} 
                    isActive={isActive('/support')} 
                    isCollapsed={isCollapsed} 
                    onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
                  />
                </div>
              </>
            )}
          </>
        )}
      </nav>

      {/* Futuristic Skyline Vector Illustration at Bottom matching the UI screenshot */}
      {!isCollapsed && (
        <div className="relative shrink-0 w-full px-2 pt-2 pointer-events-none select-none opacity-90 overflow-hidden">
          <svg viewBox="0 0 240 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* City Silhouette Outlines */}
            <path d="M8 80 V62 H20 V80" stroke="#00A896" strokeWidth="1.2" fill="#042026" />
            <path d="M22 80 V48 H36 V80" stroke="#00A896" strokeWidth="1.2" fill="#042026" />
            <line x1="29" y1="48" x2="29" y2="40" stroke="#00A896" strokeWidth="1" />
            
            <path d="M38 80 V34 H52 V80" stroke="#00D2B4" strokeWidth="1.2" fill="#05262E" />
            <line x1="45" y1="34" x2="45" y2="22" stroke="#00D2B4" strokeWidth="1" />
            {/* Window dots */}
            <circle cx="42" cy="42" r="0.8" fill="#2DD4BF" />
            <circle cx="48" cy="42" r="0.8" fill="#2DD4BF" />
            <circle cx="42" cy="50" r="0.8" fill="#2DD4BF" />
            <circle cx="48" cy="50" r="0.8" fill="#2DD4BF" />
            <circle cx="42" cy="58" r="0.8" fill="#2DD4BF" />
            <circle cx="48" cy="58" r="0.8" fill="#2DD4BF" />

            <path d="M54 80 V52 H66 V80" stroke="#00A896" strokeWidth="1.2" fill="#042026" />
            <path d="M68 80 V38 H82 V80" stroke="#00D2B4" strokeWidth="1.2" fill="#05262E" />
            <line x1="75" y1="38" x2="75" y2="28" stroke="#00D2B4" strokeWidth="1" />

            <path d="M84 80 V58 H96 V80" stroke="#00A896" strokeWidth="1.2" fill="#042026" />
            <path d="M98 80 V28 H114 V80" stroke="#00D2B4" strokeWidth="1.2" fill="#05262E" />
            <line x1="106" y1="28" x2="106" y2="14" stroke="#00D2B4" strokeWidth="1" />
            {/* High-rise antenna */}
            <circle cx="106" cy="14" r="1.5" fill="#2DD4BF" />

            <path d="M116 80 V45 H128 V80" stroke="#00A896" strokeWidth="1.2" fill="#042026" />
            <path d="M130 80 V32 H144 V80" stroke="#00D2B4" strokeWidth="1.2" fill="#05262E" />
            <line x1="137" y1="32" x2="137" y2="20" stroke="#00D2B4" strokeWidth="1" />

            <path d="M146 80 V54 H158 V80" stroke="#00A896" strokeWidth="1.2" fill="#042026" />
            <path d="M160 80 V42 H172 V80" stroke="#00A896" strokeWidth="1.2" fill="#042026" />

            {/* Glowing Contour Waves at base */}
            <path d="M0 72 Q 60 62, 120 70 T 240 66 L 240 85 L 0 85 Z" fill="url(#skylineWaveGrad)" />
            <path d="M0 74 Q 80 66, 160 72 T 240 68" stroke="#00E5FF" strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M0 78 Q 70 72, 140 76 T 240 73" stroke="#00A896" strokeWidth="1" fill="none" opacity="0.4" />
            
            <defs>
              <linearGradient id="skylineWaveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A896" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#042026" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </aside>
  );
}

function SidebarItem({ to, icon: Icon, label, isActive, isCollapsed, onClick, badge, isLiveDot }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'} rounded-xl transition-all duration-200 group relative ${
        isActive
          ? 'bg-[#005C66] text-white font-semibold shadow-xs'
          : 'text-slate-300 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-teal-300'}`} />

      {!isCollapsed && (
        <span className="text-xs font-medium tracking-wide truncate flex-1">
          {label}
        </span>
      )}

      {!isCollapsed && badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 uppercase tracking-wider">
          {isLiveDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
          {badge}
        </span>
      )}

      {/* Collapsed Tooltip */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 border border-teal-500/30">
          {label}
        </div>
      )}
    </Link>
  );
}
