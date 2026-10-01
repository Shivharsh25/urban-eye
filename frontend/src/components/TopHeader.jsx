import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import { 
  Bell, 
  Moon, 
  Sun, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Layers,
  ChevronDown,
  Globe
} from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function TopHeader({ title, subtitle, showBreadcrumb = true }) {
  const { user, isAdmin } = useAuth();
  const { lang, setLang, t, supportedLanguages, currentLanguageName } = useLanguage();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const location = useLocation();

  // Socket state
  const [socketConnected, setSocketConnected] = useState(false);

  // Toast indicator for feedback
  const [feedbackToast, setFeedbackToast] = useState('');

  // Dropdowns state
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langRef = useRef(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(9);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Road Repair Initiated',
      desc: 'Ward 14 crew dispatched for pothole #9124 on MG Road.',
      time: '5m ago',
      type: 'info',
      unread: true
    },
    {
      id: 2,
      title: 'AI Hazard Detected',
      desc: 'High-confidence garbage overflow identified near Sector 7.',
      time: '18m ago',
      type: 'warning',
      unread: true
    },
    {
      id: 3,
      title: 'Report Verified',
      desc: '12 citizens verified your unlit streetlight alert.',
      time: '1h ago',
      type: 'success',
      unread: true
    },
    {
      id: 4,
      title: 'Civic Advisory',
      desc: 'Monsoon drainage pre-clearing in progress across central zone.',
      time: '3h ago',
      type: 'info',
      unread: true
    }
  ]);

  // Socket connection tracking
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

  // Click outside for menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTheme = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    toggleTheme();
    const willBeDark = !isDarkMode;
    setFeedbackToast(willBeDark ? 'Dark Mode Activated' : 'Light Mode Activated');
    setTimeout(() => setFeedbackToast(''), 2200);
  };

  const handleSelectLang = (code, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setLang(code);
    setIsLangMenuOpen(false);
    const chosen = supportedLanguages.find(l => l.code === code);
    setFeedbackToast(`Language: ${chosen?.native || code}`);
    setTimeout(() => setFeedbackToast(''), 2200);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  // Determine current page display title with i18n
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { title: t('dashboard'), section: 'Overview' };
    if (path.includes('/report')) return { title: t('reportIssue'), section: 'AI Camera' };
    if (path.includes('/my-reports')) return { title: t('myReports'), section: 'History' };
    if (path.includes('/map')) return { title: t('liveMap'), section: 'Live Geotags' };
    if (path.includes('/alerts')) return { title: t('alerts'), section: 'Civic Watch' };
    if (path.includes('/activity')) return { title: t('activity'), section: 'Network Stream' };
    if (path.includes('/profile')) return { title: t('profile'), section: 'Account' };
    if (path.includes('/settings')) return { title: t('settings'), section: 'Preferences' };
    if (path.includes('/support')) return { title: t('support'), section: 'Civic Services' };
    if (path.includes('/admin/issues')) return { title: 'Reported Issues', section: 'Admin Registry' };
    if (path.includes('/admin/analytics')) return { title: 'Predictive Analytics', section: 'Telemetry' };
    if (path.includes('/admin/users')) return { title: 'User Governance', section: 'Citizens & Staff' };
    if (path.includes('/admin/announcements')) return { title: 'Municipal Broadcasts', section: 'Alerts' };
    if (path.includes('/admin/settings')) return { title: 'System Settings', section: 'Configuration' };
    if (path.includes('/admin')) return { title: 'Command Center', section: 'Executive Panel' };
    return { title: title || t('appTitle'), section: subtitle || t('appSubtitle') };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors">
      
      {/* Toast popup */}
      {feedbackToast && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-5 py-2.5 bg-slate-900/95 border border-cyan-500/50 text-cyan-300 font-bold text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 backdrop-blur-md">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{feedbackToast}</span>
        </div>,
        document.body
      )}

      {/* Left Area: Breadcrumbs / Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 truncate hidden sm:inline">
              {pageInfo.section}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Live Socket Feed Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-mono">
          <span className="relative flex h-1.5 w-1.5">
            {socketConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${socketConnected ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
          </span>
          <span className={socketConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
            {socketConnected ? t('liveFeed') : t('offline')}
          </span>
        </div>
      </div>

      {/* Right Area: Action Icons Matching Screenshot */}
      <div className="flex items-center space-x-2 sm:space-x-3.5">
        
        {/* ================================================================= */}
        {/* 1. LANGUAGE / TRANSLATION ICON (अ ⇄ A Indian Bilingual Icon)      */}
        {/* ================================================================= */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLangMenuOpen(prev => !prev);
            }}
            title="Language / भाषा (Translate)"
            aria-label="Change Language"
            className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center justify-center relative group cursor-pointer"
          >
            {/* Custom Indian Bilingual SVG Icon */}
            <svg 
              className="w-5 h-5 text-slate-300 group-hover:text-cyan-300 transition-colors" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 8c.8 0 1.6-.4 1.6-1.3 0-.8-.7-1.3-1.6-1.3H3" />
              <path d="M5 8c1 0 1.8.6 1.8 1.6 0 1-.8 1.6-2 1.6H3" />
              <path d="M4.5 8h2" />
              <path d="M7.5 5.4v5.8" />
              <path d="M16 6l3.5 7" />
              <path d="M21 13l-1.5-3.5" />
              <path d="M17 10.5h3.5" />
              <path d="M3 17c1.5 2 3.8 3 6.5 3 4 0 7.5-2.2 9-5.5" />
              <polyline points="19 14 18.5 17.5 15.5 16" />
              <path d="M21 7C19.5 5 17.2 4 14.5 4 10.5 4 7 6.2 5.5 9.5" />
              <polyline points="5 10 5.5 6.5 8.5 8" />
            </svg>

            {/* Language Code Pill Badge */}
            <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded px-1 leading-none py-0.5">
              {lang.toUpperCase()}
            </span>
          </button>

          {/* Language Dropdown */}
          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800">
                {t('selectLanguage')}
              </div>
              {supportedLanguages.map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={(e) => handleSelectLang(item.code, e)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    lang === item.code
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.native}</span>
                    <span className="text-slate-500 text-[10px]">({item.label})</span>
                  </span>
                  {lang === item.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 2. THEME TOGGLE ICON (Moon / Sun)                                 */}
        {/* ================================================================= */}
        <button
          type="button"
          onClick={handleToggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
          className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center justify-center group cursor-pointer"
        >
          {isDarkMode ? (
            <Moon className="w-5 h-5 text-slate-300 group-hover:text-amber-300 transition-colors" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500 group-hover:text-amber-400 transition-colors" />
          )}
        </button>

        {/* ================================================================= */}
        {/* 3. NOTIFICATION BELL WITH "9+" BADGE                              */}
        {/* ================================================================= */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            aria-label="View notifications"
            className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center justify-center relative group"
          >
            <Bell className="w-5 h-5 text-slate-300 group-hover:text-cyan-300 transition-colors" />
            
            {/* Red 9+ Badge exactly as in screenshot */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md shadow-rose-500/30 border border-slate-900 pointer-events-none animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Civic Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 hover:bg-slate-800/50 transition-colors ${n.unread ? 'bg-cyan-950/15' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 text-center">
                <Link
                  to="/alerts"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View All Community Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 4. USER PROFILE AVATAR DROPDOWN (TAP OPTION & LOGOUT MENU)        */}
        {/* ================================================================= */}
        <UserMenuDropdown />

      </div>
    </header>
  );
}
