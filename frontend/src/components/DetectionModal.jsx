import React, { useRef, useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Building2, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Send,
  Trash2
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DetectionModal({ detection, onClose, onStatusUpdated }) {
  const { user, isAdmin } = useAuth();
  const [currentDetection, setCurrentDetection] = useState(detection);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    setCurrentDetection(detection);
  }, [detection]);

  if (!currentDetection) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await client.patch(`/api/detections/${currentDetection.id || currentDetection._id}/status`, {
        status: newStatus
      });
      setCurrentDetection(res.data.detection);
      if (onStatusUpdated) onStatusUpdated(res.data.detection);
    } catch (err) {
      alert(`Failed to update status: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete this report? This action cannot be undone.")) return;
    
    try {
      setUpdatingStatus(true);
      await client.delete(`/api/detections/${currentDetection.id || currentDetection._id}`);
      onClose();
    } catch (err) {
      alert(`Failed to delete report: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const copyReportText = () => {
    if (currentDetection.reportText) {
      navigator.clipboard.writeText(currentDetection.reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const severityColor = {
    high: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
    medium: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
    low: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
  }[currentDetection.severity] || 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';

  const bbox = currentDetection.bbox || { x: 50, y: 50, width: 200, height: 150 };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/90 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh] glass-panel">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 font-bold shadow-inner">
              #{currentDetection.id || currentDetection._id}
            </span>
            <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
              {currentDetection.type?.replace('_', ' ')} Incident Record
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-6">
          
          {/* Top Section: Annotated Image + Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Annotated Image with Bounding Box Overlay */}
            <div className="md:col-span-7">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-700/50 shadow-inner group">
                {currentDetection.imageUrl ? (
                  <div ref={imageContainerRef} className="relative w-full h-full">
                    <img 
                      src={currentDetection.imageUrl} 
                      alt="Incident Evidence" 
                      className="w-full h-full object-cover"
                    />
                    {/* Visual Bounding Box Indicator */}
                    <div 
                      className="absolute border-2 border-cyan-400 bg-cyan-400/10 pointer-events-none rounded-sm transition-all"
                      style={{
                        top: '20%',
                        left: '20%',
                        width: '55%',
                        height: '55%'
                      }}
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold uppercase shadow">
                        {currentDetection.type} ({(Number(currentDetection.confidence || 0.9) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                    NO IMAGE ASSET AVAILABLE
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics & Parameters */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                
                {/* Severity Card */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${severityColor}`}>
                  <span className="text-xs font-bold font-mono">SEVERITY LEVEL</span>
                  <span className="text-sm font-black uppercase tracking-wider">{currentDetection.severity}</span>
                </div>

                {/* Status Card */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-400">INCIDENT STATUS</span>
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {currentDetection.status}
                  </span>
                </div>

                {/* Report Count (Community Surge) */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold font-mono text-slate-400">CITIZEN REPORTS</span>
                  </div>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    {currentDetection.reportCount || 1} distinct report{currentDetection.reportCount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Department Info */}
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold font-mono text-slate-400">ASSIGNED DEPT</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {currentDetection.assignedDepartment || 'Municipal Operations'}
                  </span>
                </div>

              </div>

              {/* Timestamp */}
              <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5 pt-2 border-t border-slate-800">
                <Calendar className="w-3.5 h-3.5" />
                <span>Detected: {new Date(currentDetection.createdAt).toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Location & Address Bar */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 font-mono">LOCATION & ADDRESS</p>
                <p className="text-sm text-slate-200 font-medium">{currentDetection.address}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  LAT: {Number(currentDetection.lat).toFixed(6)} | LNG: {Number(currentDetection.lng).toFixed(6)}
                </p>
              </div>
            </div>

            <a
              href={`https://www.openstreetmap.org/?mlat=${currentDetection.lat}&mlon=${currentDetection.lng}#map=18/${currentDetection.lat}/${currentDetection.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-950 border border-cyan-500/30 transition-colors"
            >
              <span>View on Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Verifiable Dispatch Email Preview Link (Nodemailer Ethereal) */}
          {currentDetection.dispatchPreviewUrl && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-900/20 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-cyan-300 font-mono">
                    VERIFIABLE DISPATCH EMAIL SENT
                  </h5>
                  <p className="text-xs text-slate-400">
                    Real email dispatched via Nodemailer Ethereal to {currentDetection.assignedDepartment}
                  </p>
                </div>
              </div>

              <a
                href={currentDetection.dispatchPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Open Email Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Auto-Generated Municipal Report Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-slate-400">
                AUTONOMOUSLY GENERATED WORK ORDER REPORT
              </span>
              <button
                onClick={copyReportText}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY REPORT'}</span>
              </button>
            </div>
            <pre className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {currentDetection.reportText || 'Generating official dispatch report...'}
            </pre>
          </div>

          {/* Admin-Only Status Triage Controls */}
          {isAdmin && (
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-amber-500/30 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <h5 className="text-xs font-bold text-amber-300 font-mono">
                    ADMINISTRATIVE STATUS TRIAGE
                  </h5>
                </div>
                <span className="text-[11px] text-slate-400">
                  Resolving triggers automatic citizen notification emails
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={updatingStatus || currentDetection.status === 'new'}
                  onClick={() => handleStatusChange('new')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    currentDetection.status === 'new'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Mark New
                </button>

                <button
                  type="button"
                  disabled={updatingStatus || currentDetection.status === 'assigned'}
                  onClick={() => handleStatusChange('assigned')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    currentDetection.status === 'assigned'
                      ? 'bg-cyan-600 text-white ring-2 ring-cyan-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Mark Assigned
                </button>

                <button
                  type="button"
                  disabled={updatingStatus || currentDetection.status === 'resolved'}
                  onClick={() => handleStatusChange('resolved')}
                  className={`flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    currentDetection.status === 'resolved'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-emerald-600/80 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Resolved (Notify All Reporters)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            {(isAdmin || (currentDetection.reporterIds && currentDetection.reporterIds.includes(user?.id))) && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleDelete}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Report</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
