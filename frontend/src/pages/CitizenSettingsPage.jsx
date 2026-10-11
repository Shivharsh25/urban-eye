import React, { useState } from 'react';
import { Settings, Bell, Shield, Smartphone, Mail, Globe, Trash2, CheckCircle, Palette } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function CitizenSettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false
  });
  
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareLocation: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-10 relative font-sans">
      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <span>{t('preferences', 'Preferences')}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm">
              {t('settingsSubtitle', 'Manage your Urban EYE account settings and notifications.')}
            </p>
          </div>
          
          <button 
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-xs w-full sm:w-auto shrink-0 cursor-pointer"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-200" />
                <span>{t('saved', 'Saved!')}</span>
              </>
            ) : (
              <span>{t('saveChanges', 'Save Changes')}</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Notifications Card */}
          <div className="bento-card p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-6">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>{t('notificationsTitle', 'Notifications')}</span>
            </h2>
            
            <div className="space-y-5">
              <ToggleRow 
                icon={Smartphone} 
                title={t('pushNotifications', 'Push Notifications')} 
                desc={t('pushNotificationsDesc', 'Receive alerts directly on your device.')}
                checked={notifications.push}
                onChange={() => setNotifications(prev => ({...prev, push: !prev.push}))}
              />
              <ToggleRow 
                icon={Mail} 
                title={t('emailUpdates', 'Email Updates')} 
                desc={t('emailUpdatesPrefDesc', 'Weekly summaries and critical alerts.')}
                checked={notifications.email}
                onChange={() => setNotifications(prev => ({...prev, email: !prev.email}))}
              />
            </div>
          </div>

          {/* Privacy Card */}
          <div className="bento-card p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>{t('privacyAndData', 'Privacy & Data')}</span>
            </h2>
            
            <div className="space-y-5">
              <ToggleRow 
                title={t('anonymousReporting', 'Anonymous Reporting')} 
                desc={t('anonymousReportingDesc', 'Hide your name from public community reports.')}
                checked={!privacy.publicProfile}
                onChange={() => setPrivacy(prev => ({...prev, publicProfile: !prev.publicProfile}))}
              />
              <ToggleRow 
                title={t('shareLocationData', 'Share Location Data')} 
                desc={t('shareLocationDataDesc', 'Help city planners map infrastructure hotspots.')}
                checked={privacy.shareLocation}
                onChange={() => setPrivacy(prev => ({...prev, shareLocation: !prev.shareLocation}))}
              />
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bento-card p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-6">
              <Palette className="w-5 h-5 text-blue-600" />
              <span>{t('appPreferences', 'App Appearance & Language')}</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">{t('theme', 'Visual Theme')}</label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="white">Pure White (Clean Municipal Canvas)</option>
                  <option value="slate">Civic Slate (Bento Slate Framing)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 mt-4 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600 inline" />
                  <span>{t('language', 'Language')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      lang === 'en'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('hi')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      lang === 'hi'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bento-card p-6 sm:p-7 border border-rose-200 shadow-xs">
            <h2 className="text-base font-bold text-rose-600 flex items-center space-x-2 mb-3">
              <Trash2 className="w-5 h-5" />
              <span>{t('dangerZone', 'Danger Zone')}</span>
            </h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {t('deleteAccountWarning', 'Permanently delete your account and all associated report history. This action cannot be undone.')}
            </p>
            <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold py-2.5 px-5 text-xs rounded-xl transition-all w-full sm:w-auto shadow-xs cursor-pointer">
              {t('deleteAccount', 'Delete Account')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between group cursor-pointer" onClick={onChange}>
      <div className="flex items-start space-x-3">
        {Icon && <Icon className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors" />}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className={`w-10 h-5 rounded-full flex items-center transition-colors px-0.5 shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
