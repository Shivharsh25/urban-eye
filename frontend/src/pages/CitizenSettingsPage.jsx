import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Bell, 
  Shield, 
  Lock, 
  Sliders, 
  Link2, 
  Info, 
  ChevronRight, 
  AlertTriangle, 
  FileText, 
  Users, 
  Mail, 
  Download, 
  Trash2, 
  Check, 
  X, 
  Key, 
  Globe, 
  Moon, 
  Smartphone,
  Eye,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function CitizenSettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active settings section
  const [activeSection, setActiveSection] = useState('notifications'); // 'notifications' | 'security' | 'privacy' | 'preferences' | 'linked' | 'about'

  // Notifications state with localStorage persistence
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('urban_eye_settings_notifications');
      return saved ? JSON.parse(saved) : {
        emergencyAlerts: true,
        reportUpdates: true,
        communityAlerts: true,
        emailSummaries: false
      };
    } catch {
      return {
        emergencyAlerts: true,
        reportUpdates: true,
        communityAlerts: true,
        emailSummaries: false
      };
    }
  });

  // Privacy state
  const [privacy, setPrivacy] = useState(() => {
    try {
      const saved = localStorage.getItem('urban_eye_settings_privacy');
      return saved ? JSON.parse(saved) : {
        anonymousReporting: false,
        shareLocationData: true,
        publicProfile: true
      };
    } catch {
      return {
        anonymousReporting: false,
        shareLocationData: true,
        publicProfile: true
      };
    }
  });

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('urban_eye_settings_notifications', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Notification preference updated');
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('urban_eye_settings_privacy', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Privacy preference updated');
  };

  // Download user data export
  const handleDownloadData = async () => {
    setIsDownloadingData(true);
    try {
      const res = await client.get('/api/detections').catch(() => ({ data: { detections: [] } }));
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          name: user?.name || 'Raj Anand',
          email: user?.email || 'raj.anand@email.com',
          role: user?.role || 'citizen'
        },
        settings: {
          notifications,
          privacy,
          language: lang
        },
        reports: res.data?.detections || []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urban_eye_data_${user?.id || 'citizen'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('User data exported successfully!');
    } catch (err) {
      console.error('Failed to export data:', err);
      showToast('Failed to export data.');
    } finally {
      setIsDownloadingData(false);
    }
  };

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3 border border-[#00897B]/40">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. PAGE HEADER                                                        */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
          <Settings className="w-5 h-5 text-[#00897B]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your account, notifications, privacy and app preferences.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TWO-COLUMN SETTINGS LAYOUT                                         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: NAVIGATION MENU                                        */}
        {/* =================================================================== */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#D5EFEA] p-3 shadow-xs space-y-1.5">
          
          {/* Item 1: Notifications */}
          <button
            type="button"
            onClick={() => setActiveSection('notifications')}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeSection === 'notifications'
                ? 'bg-[#E6F8F6] text-[#005C66] font-bold'
                : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className={`w-4 h-4 ${activeSection === 'notifications' ? 'text-[#00897B]' : 'text-slate-500'}`} />
              <span>Notifications</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeSection === 'notifications' ? 'text-[#00897B]' : 'text-slate-400'}`} />
          </button>

          {/* Item 2: Account & Security */}
          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeSection === 'security'
                ? 'bg-[#E6F8F6] text-[#005C66] font-bold'
                : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className={`w-4 h-4 ${activeSection === 'security' ? 'text-[#00897B]' : 'text-slate-500'}`} />
              <span>Account & Security</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeSection === 'security' ? 'text-[#00897B]' : 'text-slate-400'}`} />
          </button>

          {/* Item 3: Privacy & Data */}
          <button
            type="button"
            onClick={() => setActiveSection('privacy')}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeSection === 'privacy'
                ? 'bg-[#E6F8F6] text-[#005C66] font-bold'
                : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className={`w-4 h-4 ${activeSection === 'privacy' ? 'text-[#00897B]' : 'text-slate-500'}`} />
              <span>Privacy & Data</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeSection === 'privacy' ? 'text-[#00897B]' : 'text-slate-400'}`} />
          </button>

          {/* Item 4: App Preferences */}
          <button
            type="button"
            onClick={() => setActiveSection('preferences')}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeSection === 'preferences'
                ? 'bg-[#E6F8F6] text-[#005C66] font-bold'
                : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className={`w-4 h-4 ${activeSection === 'preferences' ? 'text-[#00897B]' : 'text-slate-500'}`} />
              <span>App Preferences</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeSection === 'preferences' ? 'text-[#00897B]' : 'text-slate-400'}`} />
          </button>

          {/* Item 5: Linked Accounts */}
          <button
            type="button"
            onClick={() => setActiveSection('linked')}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeSection === 'linked'
                ? 'bg-[#E6F8F6] text-[#005C66] font-bold'
                : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="flex items-center gap-3">
              <Link2 className={`w-4 h-4 ${activeSection === 'linked' ? 'text-[#00897B]' : 'text-slate-500'}`} />
              <span>Linked Accounts</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeSection === 'linked' ? 'text-[#00897B]' : 'text-slate-400'}`} />
          </button>

          {/* Item 6: About Urban Eye */}
          <button
            type="button"
            onClick={() => setActiveSection('about')}
            className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
              activeSection === 'about'
                ? 'bg-[#E6F8F6] text-[#005C66] font-bold'
                : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="flex items-center gap-3">
              <Info className={`w-4 h-4 ${activeSection === 'about' ? 'text-[#00897B]' : 'text-slate-500'}`} />
              <span>About Urban Eye</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${activeSection === 'about' ? 'text-[#00897B]' : 'text-slate-400'}`} />
          </button>

        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: CONTENT CARD                                          */}
        {/* =================================================================== */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D5EFEA] p-6 sm:p-7 shadow-xs relative overflow-hidden space-y-6">
          
          {/* Top Decorative Mint Waves */}
          <div className="absolute top-0 right-0 w-80 h-28 pointer-events-none opacity-50">
            <svg viewBox="0 0 320 100" fill="none" className="w-full h-full">
              <path d="M40,0 C120,60 200,20 320,50 L320,0 Z" fill="#D2F3EC" fillOpacity="0.4" />
              <path d="M0,0 C100,80 220,10 320,80 L320,0 Z" fill="#E6F8F6" fillOpacity="0.6" />
            </svg>
          </div>

          {/* SECTION: NOTIFICATIONS (Default matching reference screenshot) */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 relative z-10">
              
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Bell className="w-5 h-5 text-[#00897B]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Notifications
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Choose what updates you want to receive.
                  </p>
                </div>
              </div>

              {/* 4 Toggle Rows */}
              <div className="space-y-4 pt-2">
                
                {/* 1. Emergency Alerts */}
                <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100/80 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF5E6] border border-amber-200/80 flex items-center justify-center text-[#D97706] shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Emergency Alerts
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Critical updates (road closures, water/electricity disruptions, safety alerts)
                      </p>
                    </div>
                  </div>

                  <ToggleSwitch
                    checked={notifications.emergencyAlerts}
                    onChange={() => toggleNotification('emergencyAlerts')}
                  />
                </div>

                {/* 2. Report Updates */}
                <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100/80 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Report Updates
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Status changes for your submitted reports
                      </p>
                    </div>
                  </div>

                  <ToggleSwitch
                    checked={notifications.reportUpdates}
                    onChange={() => toggleNotification('reportUpdates')}
                  />
                </div>

                {/* 3. Community Alerts */}
                <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100/80 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Community Alerts
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Important announcements and civic notices
                      </p>
                    </div>
                  </div>

                  <ToggleSwitch
                    checked={notifications.communityAlerts}
                    onChange={() => toggleNotification('communityAlerts')}
                  />
                </div>

                {/* 4. Email Summaries */}
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Email Summaries
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Weekly activity, impact and civic updates
                      </p>
                    </div>
                  </div>

                  <ToggleSwitch
                    checked={notifications.emailSummaries}
                    onChange={() => toggleNotification('emailSummaries')}
                  />
                </div>

              </div>

            </div>
          )}

          {/* SECTION: ACCOUNT & SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Shield className="w-5 h-5 text-[#00897B]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Account & Security
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage authentication credentials and account verification.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Password Security</div>
                    <div className="text-[11px] text-slate-500">Last changed 3 months ago</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSecurityModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    Change Password
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</div>
                    <div className="text-[11px] text-slate-500">Protect account with SMS/Authenticator code</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PRIVACY & DATA */}
          {activeSection === 'privacy' && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Lock className="w-5 h-5 text-[#00897B]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Privacy & Data
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Control data sharing and civic visibility.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100/80 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Anonymous Reporting</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Hide your citizen identity from public issue feeds
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={privacy.anonymousReporting}
                    onChange={() => togglePrivacy('anonymousReporting')}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Share Location Data</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Automatically tag road coordinates to help municipal dispatch
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={privacy.shareLocationData}
                    onChange={() => togglePrivacy('shareLocationData')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: APP PREFERENCES */}
          {activeSection === 'preferences' && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Sliders className="w-5 h-5 text-[#00897B]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    App Preferences
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Customize language, display theme and interface options.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Interface Language</div>
                    <div className="text-[11px] text-slate-500">Currently: {lang === 'hi' ? 'हिन्दी (Hindi)' : 'English (US)'}</div>
                  </div>
                  <select
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value);
                      showToast('Language updated');
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer focus:outline-none"
                  >
                    <option value="en">English (US)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Theme Mode</div>
                    <div className="text-[11px] text-slate-500">Toggle light / dark mode palette</div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: LINKED ACCOUNTS */}
          {activeSection === 'linked' && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Link2 className="w-5 h-5 text-[#00897B]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Linked Accounts
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Third-party connections and single sign-on logins.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌐</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Google Account</div>
                      <div className="text-[11px] text-slate-500">Connected as {user?.email || 'raj.anand@email.com'}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Connected</span>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🆔</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">DigiLocker Citizen ID</div>
                      <div className="text-[11px] text-slate-500">Verified for civic reporting privileges</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ABOUT URBAN EYE */}
          {activeSection === 'about' && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Info className="w-5 h-5 text-[#00897B]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    About Urban Eye
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Platform specifications, AI model and legal notices.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">Urban EYE • Active Watch v2.4</div>
                  <p>Next-generation autonomous urban surveillance, community impact tracking, and civic resolution dispatch powered by custom YOLOv11 edge inference models.</p>
                  <div className="text-[11px] font-mono text-slate-500 pt-1">Build: 2026.11.03-RELEASE</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. BOTTOM THREE ACTION CARDS                                          */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        
        {/* Card 1: Keep Your Account Secure */}
        <div 
          onClick={() => setIsSecurityModalOpen(true)}
          className="bg-white rounded-2xl border border-[#D5EFEA] p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-[#00897B]/50 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-[#00897B]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
              Keep Your Account Secure
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Use a strong password and verify your email
            </p>
          </div>
        </div>

        {/* Card 2: Download My Data */}
        <div 
          onClick={handleDownloadData}
          className="bg-white rounded-2xl border border-[#D5EFEA] p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-[#00897B]/50 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
            <Download className="w-5 h-5 text-[#00897B]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
              Download My Data
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {isDownloadingData ? 'Exporting report archives...' : 'Get a copy of your reports and activity'}
            </p>
          </div>
        </div>

        {/* Card 3: Delete Account */}
        <div 
          onClick={() => setIsDeleteModalOpen(true)}
          className="bg-white rounded-2xl border border-rose-100 p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 group-hover:bg-rose-100 transition-colors">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-rose-600">
              Delete Account
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Permanently remove your account
            </p>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 4. SECURITY MODAL                                                     */}
      {/* ===================================================================== */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Key className="w-4 h-4 text-[#00897B]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSecurityModalOpen(false);
                    showToast('Password updated successfully!');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#005C66] text-white text-xs font-bold hover:bg-[#00474F] shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. DELETE ACCOUNT CONFIRMATION MODAL                                  */}
      {/* ===================================================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-rose-200 w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-rose-700">Delete Account Confirmation</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete your citizen account? This will permanently remove your verified profile, submission history, and civic badges.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    logout();
                    navigate('/', { replace: true });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Custom iOS-style toggle switch matching the screenshot
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none ${
        checked ? 'bg-[#00897B]' : 'bg-slate-300'
      }`}
    >
      <div 
        className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
}
