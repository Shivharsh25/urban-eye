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
  Globe,
  Trash2,
  Palette
} from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

export default function TopHeader({ title, subtitle, showBreadcrumb = true }) {
  const { user, isAdmin } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme, isSlateMode } = useTheme();
  const location = useLocation();

  // Socket state
  const [socketConnected, setSocketConnected] = useState(false);

  // Toast indicator for feedback
  const [feedbackToast, setFeedbackToast] = useState('');

  // Dropdowns state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Read notifications tracking
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem('urban_eye_read_notif_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState([]);

  // Fetch announcements & notifications from server + initial realistic civic items
  const loadNotifications = async () => {
    try {
      const res = await api.get('/api/announcements');
      const announcementsData = res.data || [];
      
      const serverNotifs = announcementsData.map(ann => ({
        id: ann.id || ann._id,
        title: ann.title,
        desc: ann.message,
        time: new Date(ann.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: ann.type || 'info',
        source: 'announcement'
      }));

      // Base default system notifications
      const baseNotifs = [
        {
          id: 'base-1',
          title: 'Road Repair Initiated',
          desc: 'Ward 14 crew dispatched for pothole #9124 on MG Road.',
          time: '15m ago',
          type: 'info'
        },
        {
          id: 'base-2',
          title: 'AI Hazard Detected',
          desc: 'High-confidence garbage overflow identified near Sector 7.',
          time: '35m ago',
          type: 'warning'
        },
        {
          id: 'base-3',
          title: 'Civic Advisory',
          desc: 'Monsoon drainage pre-clearing in progress across central zone.',
          time: '2h ago',
          type: 'info'
        }
      ];

      const combined = [...serverNotifs, ...baseNotifs];
      
      // Determine unread status based on readNotifIds
      const readSet = new Set(readNotifIds);
      const withUnread = combined.map(item => ({
        ...item,
        unread: !readSet.has(item.id)
      }));

      setNotifications(withUnread);
    } catch (err) {
      console.warn('Could not fetch server notifications:', err.message);
      // Fallback notifications with accurate unread
      const fallbackNotifs = [
        {
          id: 'fb-1',
          title: 'Road Repair Initiated',
          desc: 'Ward 14 crew dispatched for pothole #9124 on MG Road.',
          time: '15m ago',
          type: 'info',
          unread: !readNotifIds.includes('fb-1')
        },
        {
          id: 'fb-2',
          title: 'AI Hazard Detected',
          desc: 'High-confidence garbage overflow identified near Sector 7.',
          time: '35m ago',
          type: 'warning',
          unread: !readNotifIds.includes('fb-2')
        }
      ];
      setNotifications(fallbackNotifs);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Compute exact unread count from notifications array
  const unreadCount = notifications.filter(n => n.unread).length;

  // Socket connection tracking & live notification push
  useEffect(() => {
    const s = getSocket();
    setSocketConnected(s.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onAnnouncementCreated = (newAnn) => {
      const newNotif = {
        id: newAnn.id || newAnn._id || `ann-${Date.now()}`,
        title: newAnn.title,
        desc: newAnn.message,
        time: 'Just now',
        type: newAnn.type || 'info',
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);
      setFeedbackToast(`New Broadcast: ${newAnn.title}`);
      setTimeout(() => setFeedbackToast(''), 3000);
    };

    const onDetectionCreated = (detection) => {
      const newNotif = {
        id: `det-${detection._id || detection.id || Date.now()}`,
        title: 'New Incident Reported',
        desc: `${(detection.type || 'Civic issue').toUpperCase()} identified in ${detection.address || 'your locality'}.`,
        time: 'Just now',
        type: detection.severity === 'high' || detection.severity === 'critical' ? 'warning' : 'info',
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 15)]);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('announcement:created', onAnnouncementCreated);
    s.on('detection:created', onDetectionCreated);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('announcement:created', onAnnouncementCreated);
      s.off('detection:created', onDetectionCreated);
    };
  }, []);

  // Click outside for menus
  useEffect(() => {
    function handleClickOutside(event) {
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
    const willBeSlate = !isSlateMode;
    setFeedbackToast(willBeSlate ? 'Civic Slate Theme Activated' : 'Pure White Theme Activated');
    setTimeout(() => setFeedbackToast(''), 2200);
  };

  const handleSelectLang = (code, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setLang(code);
    setFeedbackToast(code === 'hi' ? 'भाषा: हिन्दी' : 'Language: English');
    setTimeout(() => setFeedbackToast(''), 2000);
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem('urban_eye_read_notif_ids', JSON.stringify(allIds));
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleMarkItemRead = (id) => {
    const nextReadIds = [...readNotifIds, id];
    setReadNotifIds(nextReadIds);
    try {
      localStorage.setItem('urban_eye_read_notif_ids', JSON.stringify(nextReadIds));
    } catch {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    const allIds = notifications.map(n => n.id);
    try {
      localStorage.setItem('urban_eye_read_notif_ids', JSON.stringify(allIds));
    } catch {}
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
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between transition-colors shadow-2xs">
      
      {/* Toast popup */}
      {feedbackToast && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-5 py-2.5 bg-white border border-slate-200 text-slate-900 font-semibold text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedbackToast}</span>
        </div>,
        document.body
      )}

      {/* Left Area: Breadcrumbs / Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold tracking-wide text-blue-700 uppercase truncate hidden sm:inline">
              {pageInfo.section}
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Live Socket Feed Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium">
          <span className="relative flex h-1.5 w-1.5">
            {socketConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${socketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span className={socketConnected ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
            {socketConnected ? t('liveFeed') : t('offline')}
          </span>
        </div>
      </div>

      {/* Right Area: Action Icons Matching Screenshot */}
      <div className="flex items-center space-x-2 sm:space-x-3.5">
        
        {/* ================================================================= */}
        {/* 1. LANGUAGE SWITCHER: HINDI & ENGLISH SIDE BY SIDE                */}
        {/* ================================================================= */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold shadow-inner">
          <button
            type="button"
            onClick={(e) => handleSelectLang('en', e)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="English"
          >
            <span className="hidden sm:inline">English</span>
            <span className="sm:hidden font-mono">EN</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleSelectLang('hi', e)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              lang === 'hi'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="हिन्दी (Hindi)"
          >
            <span className="hidden sm:inline">हिन्दी</span>
            <span className="sm:hidden font-mono">HI</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. THEME MODE TOGGLE: Pure White / Civic Slate                    */}
        {/* ================================================================= */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold shadow-inner">
          <button
            type="button"
            onClick={() => {
              if (isSlateMode) toggleTheme();
              setFeedbackToast('Pure White Theme Activated');
              setTimeout(() => setFeedbackToast(''), 2000);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              !isSlateMode
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title="Pure White Theme"
          >
            <span className="w-2 h-2 rounded-full bg-slate-200 border border-slate-400"></span>
            <span className="hidden sm:inline">White</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isSlateMode) toggleTheme();
              setFeedbackToast('Civic Slate Theme Activated');
              setTimeout(() => setFeedbackToast(''), 2000);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isSlateMode
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title="Civic Slate Theme"
          >
            <span className="w-2 h-2 rounded-full bg-blue-300"></span>
            <span className="hidden sm:inline">Civic Slate</span>
            <span className="sm:hidden font-mono text-[10px]">SLATE</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* 3. NOTIFICATION BELL WITH ACCURATE DYNAMIC BADGE                  */}
        {/* ================================================================= */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            aria-label="View notifications"
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center relative group cursor-pointer border border-transparent hover:border-slate-200"
          >
            <Bell className="w-4.5 h-4.5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            
            {/* Dynamic badge - strictly reflects real unread count */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white pointer-events-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{t('civicNotifications', 'Civic Notifications')}</span>
                  {unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 rounded border border-rose-200">
                      {unreadCount} {t('unread', 'Unread')}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                      All caught up
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{t('markAllRead', 'Mark all read')}</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearNotifications}
                      className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title={t('clearAllNotifs', 'Clear all')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkItemRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer relative ${n.unread ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                          <h4 className={`text-xs font-semibold truncate ${n.unread ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                            {n.title}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed pl-3.5">{n.desc}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-slate-700">{t('noNotifications', 'No new civic notifications')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('allCaughtUpDesc', 'You are up-to-date with all community notices.')}</p>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <Link
                  to="/alerts"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  <span>{t('viewAllAlerts', 'View All Community Alerts')}</span>
                  <span>→</span>
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
