import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Trash2,
  Download,
  Edit3,
  Save,
  RotateCcw,
  FileText
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateReportPDF } from '../utils/pdfGenerator';
import { generateFormalComplaintLetter } from '../utils/formalReportTemplate';

export default function DetectionModal({ detection, onClose, onStatusUpdated }) {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [currentDetection, setCurrentDetection] = useState(detection);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedReportText, setEditedReportText] = useState('');
  const [savingReport, setSavingReport] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    setCurrentDetection(detection);
    if (detection) {
      const initialText = (detection.reportText && detection.reportText.includes('FORMAL'))
        ? detection.reportText
        : generateFormalComplaintLetter({
            id: detection.id || detection._id,
            type: detection.type || 'pothole',
            severity: detection.severity || 'medium',
            address: detection.address,
            lat: detection.lat,
            lng: detection.lng,
            reportCount: detection.reportCount || 1,
            createdAt: detection.createdAt,
            assignedDepartment: detection.assignedDepartment
          });
      setEditedReportText(initialText);
    }
  }, [detection]);

  // Handle body overflow and escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (detection) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [detection, onClose]);

  if (!currentDetection || typeof document === 'undefined') return null;

  const handleDownloadPdf = async () => {
    if (!currentDetection) return;
    try {
      setDownloadingPdf(true);
      await generateReportPDF(currentDetection);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF report.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await client.patch(`/api/detections/${currentDetection.id || currentDetection._id}/status`, {
        status: newStatus
      });
      setCurrentDetection(res.data);
      if (onStatusUpdated) onStatusUpdated(res.data);
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('confirmDeleteReport', 'Are you sure you want to permanently delete this report?'))) return;
    try {
      setUpdatingStatus(true);
      await client.delete(`/api/detections/${currentDetection.id || currentDetection._id}`);
      if (onStatusUpdated) onStatusUpdated({ ...currentDetection, deleted: true });
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete report.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const copyReportText = () => {
    const textToCopy = currentDetection.reportText || editedReportText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveReportText = async () => {
    try {
      setSavingReport(true);
      const res = await client.patch(`/api/detections/${currentDetection.id || currentDetection._id}`, {
        reportText: editedReportText
      });
      setCurrentDetection(res.data);
      setIsEditingReport(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save updated complaint text:', err);
      alert('Failed to save updated text.');
    } finally {
      setSavingReport(false);
    }
  };

  const handleResetTemplate = () => {
    if (window.confirm('Reset this complaint letter back to the standard official formal template? Any manual edits will be overwritten.')) {
      const template = generateFormalComplaintLetter({
        id: currentDetection.id || currentDetection._id,
        type: currentDetection.type || 'pothole',
        severity: currentDetection.severity || 'medium',
        address: currentDetection.address,
        lat: currentDetection.lat,
        lng: currentDetection.lng,
        reportCount: currentDetection.reportCount || 1,
        createdAt: currentDetection.createdAt,
        assignedDepartment: currentDetection.assignedDepartment
      });
      setEditedReportText(template);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99998] bg-[#191636]/50 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      style={{ minHeight: '100vh', width: '100vw' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-4xl bg-white border border-[#E8E2E5] rounded-3xl shadow-2xl overflow-hidden m-auto flex flex-col max-h-[92vh] text-[#191636]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8E2E5] bg-[#F6F6FC] gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <span className="text-[10px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 rounded-lg bg-white border border-[#E8E2E5] text-[#302B69] font-bold shadow-xs shrink-0">
              #{String(currentDetection.id || currentDetection._id).slice(-6)}
            </span>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[#191636] uppercase tracking-wide truncate">
              {currentDetection.type?.replace('_', ' ')} {t('incidentRecord', 'Record')}
            </h3>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#302B69] hover:bg-[#242052] shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{downloadingPdf ? t('generatingPdf', 'Exporting...') : t('downloadPdf', 'Export PDF')}</span>
              <span className="sm:hidden">{downloadingPdf ? '...' : t('downloadPdf', 'PDF')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#57536E] hover:text-[#191636] hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Top Section: Annotated Image + Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Annotated Image */}
            <div className="md:col-span-7">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#F6F6FC] border border-[#E8E2E5] shadow-xs">
                {currentDetection.imageUrl ? (
                  <div ref={imageContainerRef} className="relative w-full h-full">
                    <img 
                      src={currentDetection.imageUrl.startsWith('http') ? currentDetection.imageUrl : `https://urban-eye-wi2j.onrender.com${currentDetection.imageUrl}`} 
                      alt="Incident Evidence" 
                      className="w-full h-full object-cover"
                    />
                    {/* Visual Bounding Box Indicator */}
                    <div 
                      className="absolute border-2 border-[#302B69] bg-[#302B69]/10 pointer-events-none rounded-sm transition-all"
                      style={{
                        top: '20%',
                        left: '20%',
                        width: '55%',
                        height: '55%'
                      }}
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#302B69] text-white text-[10px] font-mono font-bold uppercase shadow-xs">
                        {currentDetection.type} ({(Number(currentDetection.confidence || 0.9) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#57536E] font-mono text-xs">
                    {t('noImageCaptured', 'NO IMAGE ASSET AVAILABLE')}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics & Parameters */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                
                {/* Severity Card */}
                <div className="p-3 rounded-xl border border-[#E8E2E5] bg-[#F6F6FC] flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-[#57536E]">{t('severityLevel', 'SEVERITY LEVEL')}</span>
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-white border border-[#E8E2E5] text-[#191636]">
                    {t(currentDetection.severity, currentDetection.severity)}
                  </span>
                </div>

                {/* Status Card */}
                <div className="p-3 rounded-xl border border-[#E8E2E5] bg-[#F6F6FC] flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-[#57536E]">{t('incidentStatus', 'INCIDENT STATUS')}</span>
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#302B69]/10 text-[#302B69] border border-[#302B69]/20">
                    {t(currentDetection.status, currentDetection.status)}
                  </span>
                </div>

                {/* Report Count */}
                <div className="p-3 rounded-xl border border-[#E8E2E5] bg-[#F6F6FC] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-[#302B69]" />
                    <span className="text-xs font-bold font-mono text-[#57536E]">{t('citizenReportsCount', 'CITIZEN REPORTS')}</span>
                  </div>
                  <span className="text-xs font-bold text-[#191636] font-mono">
                    {currentDetection.reportCount || 1} {t('verifiedReports', 'verified reports')}
                  </span>
                </div>

                {/* Department Info */}
                <div className="p-3 rounded-xl border border-[#E8E2E5] bg-[#F6F6FC] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#302B69]" />
                    <span className="text-xs font-bold font-mono text-[#57536E]">{t('assignedDept', 'ASSIGNED DEPT')}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#191636]">
                    {currentDetection.assignedDepartment || 'Municipal Operations'}
                  </span>
                </div>

              </div>

              {/* Timestamp */}
              <div className="text-[11px] text-[#57536E] font-mono flex items-center space-x-1.5 pt-2 border-t border-[#E8E2E5]">
                <Calendar className="w-3.5 h-3.5 text-[#302B69]" />
                <span>{t('dateReported', 'Detected')}: {new Date(currentDetection.createdAt).toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Location & Address Bar */}
          <div className="p-4 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E2E5] flex items-center justify-center shrink-0 text-[#302B69]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#57536E] font-mono uppercase tracking-wider">{t('locationCoordinates', 'LOCATION & ADDRESS')}</p>
                <p className="text-xs sm:text-sm text-[#191636] font-medium mt-0.5">{currentDetection.address}</p>
                <p className="text-[11px] text-[#8C87A6] font-mono mt-0.5">
                  LAT: {Number(currentDetection.lat).toFixed(6)} | LNG: {Number(currentDetection.lng).toFixed(6)}
                </p>
              </div>
            </div>

            <a
              href={`https://www.openstreetmap.org/?mlat=${currentDetection.lat}&mlon=${currentDetection.lng}#map=18/${currentDetection.lat}/${currentDetection.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#302B69] hover:text-[#242052] bg-white border border-[#E8E2E5] hover:bg-[#F6F6FC] transition-colors shadow-xs"
            >
              <span>{t('viewOnGoogleMaps', 'View on Map')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Official Formal Grievance Complaint Letter */}
          <div className="p-5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8E2E5]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#302B69]" />
                <h4 className="text-xs font-bold text-[#191636] uppercase tracking-wider">
                  {t('generatedComplaintLetter', 'Official Formal Municipal Grievance Letter')}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('saved', 'Saved Successfully')}
                  </span>
                )}

                {!isEditingReport ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingReport(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#191636] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] transition-colors shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#302B69]" />
                      <span>{t('editLetter', 'Edit Letter')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyReportText}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#191636] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] transition-colors shadow-xs cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#302B69]" />}
                      <span>{copied ? t('copied', 'Copied') : t('copyLetter', 'Copy Letter')}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleResetTemplate}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#57536E] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] transition-colors cursor-pointer"
                      title="Reset to standard formal template"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('resetOfficialTemplate', 'Reset')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedReportText(currentDetection.reportText || '');
                        setIsEditingReport(false);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#57536E] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] transition-colors cursor-pointer"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={savingReport}
                      onClick={handleSaveReportText}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#302B69] hover:bg-[#242052] transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingReport ? t('saving', 'Saving...') : t('saveFormalLetter', 'Save Letter')}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditingReport ? (
              <div className="space-y-2">
                <textarea
                  value={editedReportText}
                  onChange={(e) => setEditedReportText(e.target.value)}
                  rows={12}
                  className="w-full p-4 rounded-xl bg-white border border-[#E8E2E5] text-xs font-mono text-[#191636] focus:outline-none focus:border-[#302B69] leading-relaxed custom-scrollbar shadow-xs"
                  placeholder="Enter formal complaint letter text..."
                />
              </div>
            ) : (
              <pre className="p-4 rounded-xl bg-white border border-[#E8E2E5] text-xs font-mono text-[#191636] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-xs">
                {currentDetection.reportText || editedReportText}
              </pre>
            )}
          </div>

          {/* Admin-Only Status Triage Controls */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#302B69]" />
                  <h5 className="text-xs font-bold text-[#191636] font-mono">
                    {t('adminStatusTriage', 'ADMINISTRATIVE STATUS TRIAGE')}
                  </h5>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={updatingStatus || currentDetection.status === 'new'}
                  onClick={() => handleStatusChange('new')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentDetection.status === 'new'
                      ? 'bg-[#302B69] text-white shadow-xs'
                      : 'bg-white text-[#57536E] hover:text-[#191636] border border-[#E8E2E5]'
                  }`}
                >
                  {t('markNew', 'Mark New')}
                </button>

                <button
                  type="button"
                  disabled={updatingStatus || currentDetection.status === 'assigned'}
                  onClick={() => handleStatusChange('assigned')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentDetection.status === 'assigned'
                      ? 'bg-[#302B69] text-white shadow-xs'
                      : 'bg-white text-[#57536E] hover:text-[#191636] border border-[#E8E2E5]'
                  }`}
                >
                  {t('markAssigned', 'Mark Assigned')}
                </button>

                <button
                  type="button"
                  disabled={updatingStatus || currentDetection.status === 'resolved'}
                  onClick={() => handleStatusChange('resolved')}
                  className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentDetection.status === 'resolved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('markResolved', 'Mark Resolved')}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E8E2E5] bg-[#F6F6FC] flex items-center justify-between">
          <div>
            {(isAdmin || (currentDetection.reporterIds && currentDetection.reporterIds.includes(user?.id))) && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleDelete}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('deleteReport', 'Delete Report')}</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#302B69] hover:bg-[#242052] shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? t('generatingPdf', 'Generating PDF...') : t('downloadPdfReport', 'Download Official PDF')}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57536E] hover:text-[#191636] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] transition-colors cursor-pointer shadow-xs"
            >
              {t('closeInspector', 'Close')}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
