import React, { useState } from 'react';
import { Settings, Bell, Shield, Smartphone, Mail, Moon, Globe, Trash2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenSettingsPage() {
  const { lang, setLang, t } = useLanguage();

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
    <div className="min-h-full p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
              </div>
              <span>{t('preferences', 'Preferences')}</span>
            </h1>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">
              {t('settingsSubtitle', 'Manage your Urban EYE account settings and notifications.')}
            </p>
          </div>
          
          <button 
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] w-full sm:w-auto shrink-0"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>{t('saved', 'Saved!')}</span>
              </>
            ) : (
              <span>{t('saveChanges', 'Save Changes')}</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Notifications Card */}
          <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-6">
              <Bell className="w-5 h-5 text-cyan-400" />
              <span>{t('notificationsTitle', 'Notifications')}</span>
            </h2>
            
            <div className="space-y-6">
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
          <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>{t('privacyAndData', 'Privacy & Data')}</span>
            </h2>
            
            <div className="space-y-6">
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
          <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-6">
              <Moon className="w-5 h-5 text-indigo-400" />
              <span>{t('appPreferences', 'App Preferences')}</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-300 block mb-2">{t('theme', 'Theme')}</label>
                <select className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500">
                  <option>{t('systemDefaultDark', 'System Default (Dark)')}</option>
                  <option>{t('highContrast', 'High Contrast')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-300 block mb-2 mt-4 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-cyan-400 inline" />
                  <span>{t('language', 'Language')}</span>
                </label>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full bg-black/40 border border-cyan-500/40 rounded-xl px-4 py-3 text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="en" className="bg-slate-900 text-white">English (US)</option>
                  <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
                  <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
                  <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel p-8 rounded-3xl bg-rose-950/20 border border-rose-900/30">
            <h2 className="text-lg font-bold text-rose-400 flex items-center space-x-2 mb-4">
              <Trash2 className="w-5 h-5" />
              <span>{t('dangerZone', 'Danger Zone')}</span>
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {t('deleteAccountWarning', 'Permanently delete your account and all associated report history. This action cannot be undone.')}
            </p>
            <button className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold py-3 px-6 rounded-xl transition-all w-full sm:w-auto">
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
        {Icon && <Icon className="w-5 h-5 text-slate-500 mt-0.5 group-hover:text-slate-300 transition-colors" />}
        <div>
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
      </div>
      <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
