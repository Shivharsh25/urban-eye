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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in relative z-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E2E5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191636] tracking-tight">System Settings</h1>
          <p className="text-xs text-[#57536E] mt-1 font-medium">Configure global platform parameters, automated triage, and emergency dispatch alerts.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#302B69] hover:bg-[#242052] text-white text-xs font-semibold transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] flex items-center space-x-3 shadow-sm">
          <Shield className="w-5 h-5 text-[#302B69]" />
          <span className="text-xs font-semibold">Settings updated and synchronized across all cluster nodes.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core System */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E2E5] shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-[#E8E2E5] pb-4">
            <div className="w-9 h-9 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69]">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#191636]">Core Engine & Telemetry</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#191636]">AI Vision Auto-Triage</p>
                <p className="text-xs text-[#57536E] mt-0.5">Automatically categorize and score defect priority using YOLOv8.</p>
              </div>
              <button 
                onClick={() => handleToggle('autoTriage')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoTriage ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.autoTriage ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#191636]">Maintenance Mode</p>
                <p className="text-xs text-[#57536E] mt-0.5">Pause citizen report ingestion for scheduled platform maintenance.</p>
              </div>
              <button 
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-[#191636]' : 'bg-[#E8E2E5]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-[#191636]">Audit Log Retention (Days)</p>
                <p className="text-xs text-[#57536E] mt-0.5">Lifespan before archiving resolved infrastructure reports.</p>
              </div>
              <input 
                type="number" 
                value={settings.dataRetentionDays}
                onChange={(e) => { setSettings({...settings, dataRetentionDays: e.target.value}); setSaved(false); }}
                className="w-20 px-3 py-1.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] font-semibold text-xs text-center focus:outline-none focus:border-[#302B69] shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Visibility */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E2E5] shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-[#E8E2E5] pb-4">
            <div className="w-9 h-9 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69]">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#191636]">Visibility & Alerts</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#191636] flex items-center space-x-2">
                  <Bell className="w-3.5 h-3.5 text-[#302B69]" />
                  <span>Admin Email Notifications</span>
                </p>
                <p className="text-xs text-[#57536E] mt-0.5">Receive immediate digests for critical severity reports.</p>
              </div>
              <button 
                onClick={() => handleToggle('emailAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailAlerts ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#191636] flex items-center space-x-2">
                  <Smartphone className="w-3.5 h-3.5 text-[#302B69]" />
                  <span>SMS Dispatch Alerts</span>
                </p>
                <p className="text-xs text-[#57536E] mt-0.5">Send high-priority SMS notifications to municipal field crews.</p>
              </div>
              <button 
                onClick={() => handleToggle('smsAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.smsAlerts ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.smsAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-[#191636]">Public Geospatial Map Visibility</p>
                <p className="text-xs text-[#57536E] mt-0.5">Display anonymized community reports on public city dashboards.</p>
              </div>
              <button 
                onClick={() => handleToggle('publicMapVisibility')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.publicMapVisibility ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}
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
