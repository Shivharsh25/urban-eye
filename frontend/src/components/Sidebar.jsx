import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

const DEFAULT_WIDTH = 256;
const MIN_WIDTH = 80;

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

  // Sidebar width state: clamped between MIN_WIDTH and DEFAULT_WIDTH (strictly cannot be maximized)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const stored = localStorage.getItem('citizen_sidebar_width');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (parsed >= MIN_WIDTH && parsed <= DEFAULT_WIDTH) return parsed;
      }
    } catch {}
    return DEFAULT_WIDTH;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_WIDTH);
  const currentWidthRef = useRef(sidebarWidth);
  const currentCollapsedRef = useRef(isCollapsed);

  currentWidthRef.current = sidebarWidth;
  currentCollapsedRef.current = isCollapsed;

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('citizen_sidebar_collapsed', String(next));
      } catch {}
      // When restoring, guarantee it returns to DEFAULT_WIDTH, never more
      if (!next && sidebarWidth < 200) {
        setSidebarWidth(DEFAULT_WIDTH);
        try {
          localStorage.setItem('citizen_sidebar_width', String(DEFAULT_WIDTH));
        } catch {}
      }
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
  }, [sidebarWidth]);

  // Drag-to-minimize logic on the right edge handle (<->)
  const startDragging = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = isCollapsed ? MIN_WIDTH : sidebarWidth;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const delta = e.clientX - dragStartXRef.current;
      const rawWidth = dragStartWidthRef.current + delta;

      // STRICT CONSTRAINT: "only minimize not for maximizing it"
      // Ceiling is strictly DEFAULT_WIDTH (256px). Can only be minimized narrower, NEVER maximized wider!
      const clampedWidth = Math.min(DEFAULT_WIDTH, Math.max(MIN_WIDTH, rawWidth));

      if (clampedWidth <= 120) {
        setIsCollapsed(true);
        currentCollapsedRef.current = true;
      } else {
        setIsCollapsed(false);
        setSidebarWidth(clampedWidth);
        currentCollapsedRef.current = false;
        currentWidthRef.current = clampedWidth;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem('citizen_sidebar_collapsed', String(currentCollapsedRef.current));
        localStorage.setItem('citizen_sidebar_width', String(currentWidthRef.current));
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Cursor and text-selection styles while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const isActive = (path) => location.pathname === path;
  const activeDesktopWidth = isCollapsed ? MIN_WIDTH : sidebarWidth;

  return (
    <aside 
      className={`
        sidebar-dark sidebar-resizable fixed inset-y-0 left-0 z-50 h-full flex flex-col
        ${isDragging ? '' : 'transition-[width,transform] duration-300 ease-in-out'}
        lg:static lg:relative lg:translate-x-0 lg:shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 max-w-[85vw] lg:max-w-none
        overflow-hidden select-none border-r border-[#0E3841] relative
      `}
      style={{ 
        '--sidebar-w': `${activeDesktopWidth}px`,
        backgroundColor: '#06252B', 
        color: '#FFFFFF' 
      }}
    >
      {/* Brand Header & Minimize / Mobile Close Controls */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#0E3841] relative z-10 shrink-0">
        {isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link to="/dashboard" className="group flex items-center justify-center shrink-0" title="Urban EYE • Active Watch">
              <Logo size="sm" subtitle="" showText={false} />
            </Link>

            <div className="flex items-center space-x-1">
              <button 
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-teal-400/90 hover:text-white hover:bg-white/10 transition-all border border-teal-500/20 cursor-pointer shadow-xs"
                title="Restore Sidebar (<->)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-white/5 transition-all cursor-pointer"
                title="Close Navigation Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link to="/dashboard" className="flex items-center space-x-2.5 group min-w-0 flex-1 overflow-hidden" title="Urban EYE • Active Watch">
              <Logo size="sm" subtitle="Active Watch" showText={sidebarWidth >= 170} />
            </Link>

            {/* Desktop Minimize Toggle */}
            <div className="flex items-center space-x-1 shrink-0">
              <button 
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-teal-400/80 hover:text-white hover:bg-white/10 transition-all border border-teal-500/20 cursor-pointer shadow-xs"
                title="Minimize Sidebar (<->)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button 
                type="button"
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                className="lg:hidden flex items-center justify-center p-1.5 rounded-lg text-teal-400/60 hover:text-rose-400 hover:bg-white/5 transition-all shrink-0 cursor-pointer"
                title="Close Navigation Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
        {user && (
          <>
            {/* Core Navigation Items */}
            <SidebarItem 
              to="/dashboard" 
              icon={Home} 
              label={t('dashboard', 'Dashboard')} 
              isActive={isActive('/dashboard')} 
              isCollapsed={isCollapsed} 
              sidebarWidth={activeDesktopWidth}
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
            />
            <SidebarItem 
              to="/my-reports" 
              icon={FileText} 
              label={t('reports', 'Reports')} 
              isActive={isActive('/my-reports') || isActive('/reports')} 
              isCollapsed={isCollapsed} 
              sidebarWidth={activeDesktopWidth}
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
            />
            <SidebarItem 
              to="/report" 
              icon={PlusCircle} 
              label={t('reportIssue', 'Report Issue')} 
              isActive={isActive('/report')} 
              isCollapsed={isCollapsed} 
              sidebarWidth={activeDesktopWidth}
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
            />
            <SidebarItem 
              to="/tracking" 
              icon={Layers} 
              label={t('myTracking', 'My Tracking')} 
              isActive={isActive('/tracking')} 
              isCollapsed={isCollapsed} 
              sidebarWidth={activeDesktopWidth}
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
            />

            {/* Section 1: CITY NETWORK */}
            {!isCollapsed && activeDesktopWidth >= 170 && (
              <div className="flex items-center space-x-2 px-3 pt-5 pb-1.5 text-[10px] font-bold tracking-wider text-teal-400/70 uppercase">
                <span className="truncate">{t('cityNetwork', 'CITY NETWORK')}</span>
                <div className="h-px flex-1 bg-[#0E3841]"></div>
              </div>
            )}

            <SidebarItem 
              to="/map" 
              icon={Map} 
              label={t('liveMap', 'Live Map')} 
              isActive={isActive('/map')} 
              isCollapsed={isCollapsed} 
              sidebarWidth={activeDesktopWidth}
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
              sidebarWidth={activeDesktopWidth}
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
            />
            <SidebarItem 
              to="/activity" 
              icon={Activity} 
              label={t('cityActivity', 'City Activity')} 
              isActive={isActive('/activity')} 
              isCollapsed={isCollapsed} 
              sidebarWidth={activeDesktopWidth}
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
            />

            {/* Section 2: ACCOUNT */}
            <div className="pt-2">
              {!isCollapsed && activeDesktopWidth >= 170 && (
                <div className="flex items-center space-x-2 px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-wider text-teal-400/70 uppercase">
                  <span className="truncate">{t('account', 'ACCOUNT')}</span>
                  <div className="h-px flex-1 bg-[#0E3841]"></div>
                </div>
              )}

              <SidebarItem 
                to="/profile" 
                icon={UserCircle} 
                label={t('citizenProfile', 'Citizen Profile')} 
                isActive={isActive('/profile')} 
                isCollapsed={isCollapsed} 
                sidebarWidth={activeDesktopWidth}
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
              />
              <SidebarItem 
                to="/settings" 
                icon={Settings} 
                label={t('settings', 'Settings')} 
                isActive={isActive('/settings')} 
                isCollapsed={isCollapsed} 
                sidebarWidth={activeDesktopWidth}
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
              />
              <SidebarItem 
                to="/support" 
                icon={HelpCircle} 
                label={t('helpSupport', 'Help & Support')} 
                isActive={isActive('/support')} 
                isCollapsed={isCollapsed} 
                sidebarWidth={activeDesktopWidth}
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} 
              />
            </div>
          </>
        )}
      </nav>

      {/* Futuristic Skyline Vector Illustration at Bottom (Visible when expanded) */}
      {!isCollapsed && activeDesktopWidth >= 200 && (
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

      {/* Horizontal Resize & Quick-Minimize Handle (<->) */}
      <div
        onMouseDown={startDragging}
        className="hidden lg:flex absolute top-0 right-0 w-3 h-full cursor-col-resize group/resizer items-center justify-center z-30 select-none hover:bg-teal-500/10 transition-colors"
        title={isCollapsed ? "Click to restore sidebar (<->)" : "Drag left to minimize (<->) or click to collapse"}
      >
        {/* Subtle border accent line */}
        <div className={`w-[2px] h-full transition-colors ${isDragging ? 'bg-teal-400' : 'bg-transparent group-hover/resizer:bg-teal-400/60'}`} />

        {/* Quick-Minimize Pill Button on Border */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
          className={`absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-[#06252B] border border-[#0E3841] hover:border-teal-400 text-teal-300 hover:text-white flex items-center justify-center shadow-lg transition-all z-40 cursor-pointer ${
            isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover/resizer:opacity-100 hover:scale-110'
          }`}
          title={isCollapsed ? "Restore sidebar (<->)" : "Minimize sidebar (<->)"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ to, icon: Icon, label, isActive, isCollapsed, sidebarWidth = 256, onClick, badge, isLiveDot }) {
  const showLabel = !isCollapsed && sidebarWidth >= 140;

  return (
    <Link
      to={to}
      onClick={onClick}
      title={!showLabel ? label : undefined}
      className={`flex items-center ${!showLabel ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'} rounded-xl transition-all duration-200 group relative ${
        isActive
          ? 'bg-[#005C66] text-white font-semibold shadow-xs'
          : 'text-slate-300 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-teal-300'}`} />

      {showLabel && (
        <span className="text-xs font-medium tracking-wide truncate flex-1">
          {label}
        </span>
      )}

      {showLabel && badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 uppercase tracking-wider shrink-0">
          {isLiveDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
          {badge}
        </span>
      )}

      {/* Tooltip when label is hidden */}
      {!showLabel && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 border border-teal-500/30">
          {label}
        </div>
      )}
    </Link>
  );
}
