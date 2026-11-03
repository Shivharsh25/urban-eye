import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Save,
  RefreshCw,
  Power,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export default function SuperAdminAIConfigPage() {
  const [config, setConfig] = useState(null);
  const [rules, setRules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingRuleId, setSavingRuleId] = useState(null);
  const [saveSuccessId, setSaveSuccessId] = useState(null);

  const fetchAIConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const [aiRes, deptRes] = await Promise.all([
        client.get('/api/super-admin/config/ai'),
        client.get('/api/super-admin/departments')
      ]);

      setConfig(aiRes.data);
      setRules(aiRes.data.rules || []);
      setDepartments(deptRes.data.departments || []);
    } catch (err) {
      console.error('Failed to load AI config:', err);
      setError('Could not retrieve AI routing configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIConfig();
  }, []);

  const handleRuleChange = (ruleId, field, value) => {
    setRules(prev =>
      prev.map(r => (r._id === ruleId ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRule = async (rule) => {
    try {
      setSavingRuleId(rule._id);
      setSaveSuccessId(null);
      await client.patch(`/api/super-admin/config/ai/rules/${rule._id}`, {
        minConfidenceThreshold: Number(rule.minConfidenceThreshold),
        autoDispatchEnabled: Boolean(rule.autoDispatchEnabled),
        departmentId: rule.departmentId,
        departmentName: rule.departmentName,
        defaultSeverity: rule.defaultSeverity
      });

      setSaveSuccessId(rule._id);
      setTimeout(() => setSaveSuccessId(null), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update rule.');
    } finally {
      setSavingRuleId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            <span>AI Detection & Auto-Dispatch Rules</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure YOLOv8 neural network thresholds and automated department dispatch rules.
          </p>
        </div>

        <button
          onClick={fetchAIConfig}
          className="p-2.5 rounded-xl bg-[#081C21] border border-teal-900/60 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Model Health / Telemetry Card */}
      <div className="bg-[#081C21] border border-teal-950 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">YOLOv8 Civic Inference Engine</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ONNX Runtime Server-Side Model with zero external API dependencies.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-300 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">GLOBAL THRESHOLD</span>
              <span className="text-teal-300 font-bold">{(config?.globalThreshold || 0.45) * 100}%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ACTIVE RULES</span>
              <span className="text-white font-bold">{rules.length} Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Editor List */}
      <div className="bg-[#081C21] border border-teal-950 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>Category-to-Department Routing Mappings</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-500">
            Loading routing rules...
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => {
              const isSaving = savingRuleId === rule._id;
              const isSaved = saveSuccessId === rule._id;

              return (
                <div
                  key={rule._id}
                  className="bg-[#051317] border border-teal-950 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Category Info */}
                  <div className="lg:w-1/4">
                    <span className="font-mono text-teal-300 text-xs font-bold block">{rule.categoryKey}</span>
                    <span className="text-xs text-white font-semibold">{rule.categoryLabel}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(rule.keywords || []).slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-[9px] px-1 rounded bg-[#081C21] text-slate-400 border border-teal-950">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Department Selector */}
                  <div className="lg:w-1/4">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Target Department</label>
                    <select
                      value={rule.departmentId || ''}
                      onChange={(e) => {
                        const targetDept = departments.find(d => d._id === e.target.value);
                        handleRuleChange(rule._id, 'departmentId', e.target.value);
                        if (targetDept) {
                          handleRuleChange(rule._id, 'departmentName', targetDept.name);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#081C21] border border-teal-950 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Confidence Threshold Slider */}
                  <div className="lg:w-1/4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Min Confidence</span>
                      <span className="font-mono text-teal-300 font-bold">
                        {Math.round(rule.minConfidenceThreshold * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="0.95"
                      step="0.05"
                      value={rule.minConfidenceThreshold}
                      onChange={(e) => handleRuleChange(rule._id, 'minConfidenceThreshold', parseFloat(e.target.value))}
                      className="w-full accent-teal-400"
                    />
                  </div>

                  {/* Auto-Dispatch Toggle & Save Button */}
                  <div className="flex items-center space-x-4 lg:w-1/5 justify-end">
                    <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.autoDispatchEnabled}
                        onChange={(e) => handleRuleChange(rule._id, 'autoDispatchEnabled', e.target.checked)}
                        className="rounded border-teal-500 text-teal-500 bg-transparent"
                      />
                      <span className="text-[11px] font-medium">Auto-Dispatch</span>
                    </label>

                    <button
                      onClick={() => handleSaveRule(rule)}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                        isSaved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#00897B] hover:bg-[#00796B] text-white shadow-sm'
                      }`}
                    >
                      {isSaving ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : isSaved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

