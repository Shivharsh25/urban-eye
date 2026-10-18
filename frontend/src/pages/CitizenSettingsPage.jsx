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
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#EAE7DD]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#99775C]/10 border border-[#99775C]/25 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#99775C]" />
              </div>
              <span>{t('preferences', 'Preferences')}</span>
            </h1>
            <p className="text-slate-600 mt-2 text-xs sm:text-sm font-medium">
              {t('settingsSubtitle', 'Manage your Urban EYE account settings and notifications.')}
            </p>
          </div>
          
          <button 
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center space-x-2 bg-[#99775C] hover:bg-[#85654c] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm w-full sm:w-auto shrink-0"
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#EAE7DD] shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 mb-6">
              <Bell className="w-5 h-5 text-[#99775C]" />
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#EAE7DD] shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-emerald-600" />
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#EAE7DD] shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 mb-6">
              <Moon className="w-5 h-5 text-indigo-600" />
              <span>{t('appPreferences', 'App Preferences')}</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">{t('theme', 'Theme')}</label>
                <select className="w-full bg-[#FAF9F5] border border-[#EAE7DD] rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-[#99775C]">
                  <option value="light">Urban Theme (Narvik & Warm Linen)</option>
                  <option value="high-contrast">High Contrast Mode</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 mt-4 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[#99775C] inline" />
                  <span>{t('language', 'Language')}</span>
                </label>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7DD] rounded-xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-[#99775C]"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/80 border border-rose-200 shadow-sm">
            <h2 className="text-lg font-bold text-rose-700 flex items-center space-x-2 mb-4">
              <Trash2 className="w-5 h-5" />
              <span>{t('dangerZone', 'Danger Zone')}</span>
            </h2>
            <p className="text-sm text-slate-700 mb-6 font-medium leading-relaxed">
              {t('deleteAccountWarning', 'Permanently delete your account and all associated report history. This action cannot be undone.')}
            </p>
            <button className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all w-full sm:w-auto shadow-sm">
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
    <div className="flex items-start justify-between group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors" onClick={onChange}>
      <div className="flex items-start space-x-3">
        {Icon && <Icon className="w-5 h-5 text-[#99775C] mt-0.5" />}
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">{desc}</p>
        </div>
      </div>
      <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 shrink-0 ${checked ? 'bg-[#99775C]' : 'bg-slate-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
