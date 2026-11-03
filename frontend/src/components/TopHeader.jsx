import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import { 
  Bell, 
  Moon, 
  Sun, 
  CheckCheck, 
  ChevronDown,
  ChevronRight,
  Home,
  Trash2
} from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

export default function TopHeader() {
  const { user, isAdmin } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Socket state
  const [socketConnected, setSocketConnected] = useState(false);

  // Dropdowns state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const notifRef = useRef(null);
  const langRef = useRef(null);

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
      setNotifications(prev => [newNotif, ...prev]);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('announcement:created', onAnnouncementCreated);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('announcement:created', onAnnouncementCreated);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const updatedReadIds = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(updatedReadIds);
    localStorage.setItem('urban_eye_read_notif_ids', JSON.stringify(updatedReadIds));
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleMarkItemRead = (id) => {
    if (!readNotifIds.includes(id)) {
      const updated = [...readNotifIds, id];
      setReadNotifIds(updated);
      localStorage.setItem('urban_eye_read_notif_ids', JSON.stringify(updated));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const getInitials = () => {
    if (!user || !user.name) return 'RA';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const currentPath = location.pathname;

  return (
    <header className="h-16 px-6 lg:px-8 flex items-center justify-between border-b border-[#E2F1EE] bg-transparent relative z-20">
      
      {/* ================================================================= */}
      {/* 1. LEFT: BREADCRUMB OR NAVIGATION TABS                           */}
      {/* ================================================================= */}
      {currentPath === '/report' ? (
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <Link to="/dashboard" className="p-1 text-slate-500 hover:text-[#005C66] transition-colors flex items-center" title="Dashboard">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-[#0B2027]">Report Issue</span>
        </div>
      ) : (currentPath === '/my-reports' || currentPath === '/tracking') ? (
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <Link to="/dashboard" className="p-1 text-slate-500 hover:text-[#005C66] transition-colors flex items-center" title="Dashboard">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-[#0B2027]">My Tracking</span>
        </div>
      ) : currentPath === '/alerts' ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
            <Bell className="w-5 h-5 text-[#00897B]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2027] tracking-tight leading-tight">
              Community Alerts
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden md:block">
              Real-time city updates, emergency notices and important announcements.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link
            to="/dashboard"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              currentPath === '/dashboard'
                ? 'bg-[#003840] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t('overview', 'Overview')}
          </Link>
          <Link
            to="/activity"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              currentPath === '/activity'
                ? 'bg-[#003840] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t('activity', 'Activity')}
          </Link>
          <Link
            to="/my-reports"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              currentPath === '/my-reports'
                ? 'bg-[#003840] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t('reports', 'Reports')}
          </Link>
          <Link
            to={isAdmin ? "/admin" : "/activity"}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              currentPath === '/analytics' || currentPath === '/admin'
                ? 'bg-[#003840] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t('analytics', 'Analytics')}
          </Link>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. RIGHT: LANGUAGE DROPDOWN, MOON THEME, NOTIFICATION BELL, AVATAR*/}
      {/* ================================================================= */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Language Dropdown (English v) */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D5EFEA] bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 shadow-xs transition-all cursor-pointer"
            title="Select Language"
          >
            <span>{lang === 'hi' ? 'हिन्दी' : 'English'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-[#D5EFEA] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => { setLang('en'); setIsLangOpen(false); }}
                className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#F2FBF9] ${
                  lang === 'en' ? 'text-[#005C66] font-bold bg-[#F2FBF9]' : 'text-slate-700'
                }`}
              >
                <span>English</span>
                {lang === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#005C66]"></span>}
              </button>
              <button
                type="button"
                onClick={() => { setLang('hi'); setIsLangOpen(false); }}
                className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#F2FBF9] ${
                  lang === 'hi' ? 'text-[#005C66] font-bold bg-[#F2FBF9]' : 'text-slate-700'
                }`}
              >
                <span>हिन्दी (Hindi)</span>
                {lang === 'hi' && <span className="w-1.5 h-1.5 rounded-full bg-[#005C66]"></span>}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle (Crescent Moon icon) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
          className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all flex items-center justify-center cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-500 transition-colors" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:text-teal-600 transition-colors" />
          )}
        </button>

        {/* Notification Bell with alert dot */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            aria-label="View notifications"
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all flex items-center justify-center relative cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-700 hover:text-teal-600 transition-colors" />
            
            {/* Dynamic unread badge dot */}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D5EFEA] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-[#F7FCFB] border-b border-[#E2F1EE] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{t('civicNotifications', 'Civic Notifications')}</span>
                  {unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-rose-50 text-rose-700 rounded border border-rose-200">
                      {unreadCount} {t('unread', 'Unread')}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                      All caught up
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
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
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
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
                      className={`p-3.5 hover:bg-[#F9FDFC] transition-colors cursor-pointer relative ${n.unread ? 'bg-teal-50/30' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                          )}
                          <h4 className={`text-xs font-bold truncate ${n.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                            {n.title}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed pl-3.5">{n.desc}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">{t('noNotifications', 'No new civic notifications')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('allCaughtUpDesc', 'You are up-to-date with all community notices.')}</p>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-[#F7FCFB] border-t border-[#E2F1EE] text-center">
                <Link
                  to="/alerts"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-[#005C66] hover:text-[#004C54] transition-colors inline-flex items-center gap-1"
                >
                  <span>{t('viewAllAlerts', 'View All Community Alerts')}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar (RA) */}
        <UserMenuDropdown 
          customTrigger={
            <div 
              className="w-8 h-8 rounded-full bg-[#004D56] hover:bg-[#003B42] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-all cursor-pointer ring-1 ring-white"
              title={user ? `${user.name} (${user.email})` : 'Account Menu'}
            >
              {getInitials()}
            </div>
          }
        />

      </div>
    </header>
  );
}
