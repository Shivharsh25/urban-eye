import React, { useState } from 'react';
import { Save, Shield, Bell, Database, Globe, Smartphone, Zap, CheckCircle2, Sliders, Server, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
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
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans relative z-10 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Sliders className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>System Settings & Governance</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                ADMIN
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure automated AI pipeline parameters, telemetry thresholds, and notification dispatches
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-3 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration updated and propagated to live microservices.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core AI & Data Pipeline */}
        <div className="bento-card p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Triage & Ingestion</h2>
              <p className="text-[11px] text-slate-500">Autonomous defect categorization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-900">YOLOv8 Automated Auto-Triage</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Categorize and score severity with vision inference on image drop.</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('autoTriage')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${settings.autoTriage ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.autoTriage ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-900">Emergency Maintenance Lock</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Temporarily pause new citizen uploads while maintaining triage queues.</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90">
              <div>
                <p className="text-xs font-bold text-slate-900">Data Retention Window</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Days to keep resolved cases before compliance archival.</p>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <input 
                  type="number" 
                  value={settings.dataRetentionDays}
                  onChange={(e) => { setSettings({...settings, dataRetentionDays: e.target.value}); setSaved(false); }}
                  className="w-16 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold text-center focus:outline-none focus:border-blue-600"
                />
                <span className="text-[11px] text-slate-500 font-medium">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Dispatch */}
        <div className="bento-card p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dispatch & Telemetry Alerts</h2>
              <p className="text-[11px] text-slate-500">Live notification routing</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Department Email Dispatch</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Instantly forward verified reports to municipal zonal head.</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('emailAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${settings.emailAlerts ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Field SMS Dispatch</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Send high-priority SMS alerts to on-duty rapid response crews.</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('smsAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${settings.smsAlerts ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.smsAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-900">Public Live Radar Visibility</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Display real-time cluster markers on the public civic portal map.</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('publicMapVisibility')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${settings.publicMapVisibility ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.publicMapVisibility ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Global Visual Theme Preference */}
        <div className="bento-card p-6 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">System Theme Palette</h2>
                <p className="text-[11px] text-slate-500">Standardized municipal high-contrast layout</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {theme === 'slate' ? 'Civic Slate Active' : 'Pure White Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div 
              onClick={() => setTheme('white')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                theme === 'white' 
                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-2xs' 
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                {theme === 'white' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pure White Canvas</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ultra-clean pure white background with 1px slate hairline borders and high-contrast typography.
                </p>
              </div>
            </div>

            <div 
              onClick={() => setTheme('slate')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                theme === 'slate' 
                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-2xs' 
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                {theme === 'slate' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Civic Slate Canvas</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Subtle municipal slate background (#f1f5f9) framing crisp white Bento cards for maximum visual hierarchy.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
