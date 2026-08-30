import React, { useState } from 'react';
import { Save, Shield, Bell, Database, Globe, Smartphone, Zap } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    autoTriage: true,
    emailAlerts: true,
    smsAlerts: false,
    maintenanceMode: false,
    publicMapVisibility: true,
    dataRetentionDays: 90
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-slate-400 mt-1">Configure global platform parameters and notifications.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center space-x-2 shadow-lg shadow-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-3">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Settings saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core System */}
        <div className="glass-card rounded-3xl p-6 border-t border-t-white/5 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800/60 pb-4">
            <Database className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-200">Core System</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">AI Auto-Triage</p>
                <p className="text-xs text-slate-400 mt-1">Automatically categorize and prioritize new reports using AI.</p>
              </div>
              <button 
                onClick={() => handleToggle('autoTriage')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoTriage ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.autoTriage ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Maintenance Mode</p>
                <p className="text-xs text-slate-400 mt-1">Disable citizen reporting temporarily. Admins can still access.</p>
              </div>
              <button 
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-slate-200 font-medium">Data Retention (Days)</p>
                <p className="text-xs text-slate-400 mt-1">How long to keep resolved reports before archiving.</p>
              </div>
              <input 
                type="number" 
                value={settings.dataRetentionDays}
                onChange={(e) => { setSettings({...settings, dataRetentionDays: e.target.value}); setSaved(false); }}
                className="w-20 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Visibility */}
        <div className="glass-card rounded-3xl p-6 border-t border-t-white/5 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800/60 pb-4">
            <Globe className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-200">Visibility & Alerts</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Admin Email Alerts</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Receive emails for critical incidents immediately.</p>
              </div>
              <button 
                onClick={() => handleToggle('emailAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span>SMS Dispatch Alerts</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Send SMS to on-call city teams for high priority items.</p>
              </div>
              <button 
                onClick={() => handleToggle('smsAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.smsAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.smsAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-slate-200 font-medium">Public Map Visibility</p>
                <p className="text-xs text-slate-400 mt-1">Allow citizens to see anonymized reports from others on maps.</p>
              </div>
              <button 
                onClick={() => handleToggle('publicMapVisibility')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.publicMapVisibility ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.publicMapVisibility ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
