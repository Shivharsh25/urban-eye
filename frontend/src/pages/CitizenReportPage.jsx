import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Send, 
  Eye, 
  RefreshCw, 
  FileText,
  Download,
  Edit3,
  Save,
  Check,
  RotateCcw
} from 'lucide-react';
import client from '../api/client';
import { subscribeToJob } from '../api/socket';
import { compressImageClientSide } from '../components/ImageCompressor';
import WebcamCapture from '../components/WebcamCapture';
import UploadStepper from '../components/UploadStepper';
import MapView from '../components/MapView';
import DetectionModal from '../components/DetectionModal';
import { generateReportPDF } from '../utils/pdfGenerator';
import { generateFormalComplaintLetter } from '../utils/formalReportTemplate';
import exifr from 'exifr';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenReportPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [address, setAddress] = useState('');
  const [pinLocation, setPinLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [typeHint, setTypeHint] = useState('pothole'); // For debug/demo testing

  // Pipeline execution state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [pipelineError, setPipelineError] = useState(null);
  const [resultDetection, setResultDetection] = useState(null);
  const [noIssueDetected, setNoIssueDetected] = useState(false);
  const [noIssueMessage, setNoIssueMessage] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [editedLetterText, setEditedLetterText] = useState('');
  const [savingLetter, setSavingLetter] = useState(false);
  const [saveLetterSuccess, setSaveLetterSuccess] = useState(false);
  const [cameraScanInfo, setCameraScanInfo] = useState(null);
  const [isQuickScanning, setIsQuickScanning] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (resultDetection) {
      const text = (resultDetection.reportText && resultDetection.reportText.includes('FORMAL'))
        ? resultDetection.reportText
        : generateFormalComplaintLetter({
            id: resultDetection.id || resultDetection._id,
            type: resultDetection.type,
            severity: resultDetection.severity,
            address: resultDetection.address,
            lat: resultDetection.lat,
            lng: resultDetection.lng,
            reportCount: resultDetection.reportCount || 1,
            createdAt: resultDetection.createdAt,
            assignedDepartment: resultDetection.assignedDepartment
          });
      setEditedLetterText(text);
    }
  }, [resultDetection]);

  const handleSaveLetterUpdates = async () => {
    if (!resultDetection) return;
    try {
      setSavingLetter(true);
      const res = await client.patch(`/api/detections/${resultDetection.id || resultDetection._id}`, {
        reportText: editedLetterText
      });
      setResultDetection(res.data.detection);
      setIsEditingLetter(false);
      setSaveLetterSuccess(true);
      setTimeout(() => setSaveLetterSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update letter:', err);
      alert('Could not save updates to formal report.');
    } finally {
      setSavingLetter(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultDetection) return;
    try {
      setDownloadingPdf(true);
      await generateReportPDF(resultDetection, previewUrl);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate PDF report. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Subscribe to real-time pipeline events when jobId changes
  useEffect(() => {
    if (!currentJobId) return;

    const unsubscribe = subscribeToJob(currentJobId, (data) => {
      console.log('[Pipeline WS Progress]:', data);
      if (data.details?.detected === false || data.message?.toLowerCase().includes('no municipal issue')) {
        setCurrentStage('no_issue');
        setNoIssueDetected(true);
        setNoIssueMessage(data.message || 'No municipal issue detected in this image.');
      } else {
        setCurrentStage(data.stage);
      }
      setProgressData(data);
    });

    return () => {
      unsubscribe();
    };
  }, [currentJobId]);

  // Reverse geocoding to automatically fill address when pinLocation changes
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        // 1. Try Google Maps JS API Geocoder if loaded
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: pinLocation.lat, lng: pinLocation.lng } }, async (results, status) => {
            if (status === 'OK' && results[0]) {
              setAddress(results[0].formatted_address);
            } else {
              await tryNominatimFallback();
            }
          });
        } else {
          // If Google Maps API is not ready, try Nominatim
          await tryNominatimFallback();
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }
    };
    
    const tryNominatimFallback = async () => {
      try {
        // 2. OpenStreetMap Nominatim fallback
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pinLocation.lat}&lon=${pinLocation.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          // 3. Fallback to backend
          const backendRes = await client.get(`/api/geocode?lat=${pinLocation.lat}&lng=${pinLocation.lng}`);
          if (backendRes.data && backendRes.data.address) {
            setAddress(backendRes.data.address);
          }
        }
      } catch (err) {
        console.error("Nominatim fallback failed:", err);
      }
    };

    fetchAddress();
  }, [pinLocation]);

  const handleFileSelect = async (file, scanData = null) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResultDetection(null);
    setNoIssueDetected(false);
    setNoIssueMessage('');
    setPipelineError(null);

    // If scanData was already evaluated in the full-screen camera:
    if (scanData && scanData.primaryType) {
      setCameraScanInfo(scanData);
      if (['pothole', 'garbage', 'water_leak', 'streetlight'].includes(scanData.primaryType)) {
        setTypeHint(scanData.primaryType);
      }
    } else {
      // Trigger background fast model inference scan
      setIsQuickScanning(true);
      const scanFormData = new FormData();
      scanFormData.append('image', file);
      client.post('/api/detect/scan', scanFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((res) => {
        if (res.data && res.data.primaryType) {
          setCameraScanInfo(res.data);
          if (['pothole', 'garbage', 'water_leak', 'streetlight'].includes(res.data.primaryType)) {
            setTypeHint(res.data.primaryType);
          }
        } else {
          setCameraScanInfo(res.data || null);
        }
      }).catch((err) => {
        console.warn('Fast scan error:', err);
      }).finally(() => {
        setIsQuickScanning(false);
      });
    }

    try {
      let lat = 40.7128;
      let lng = -74.0060;
      let locationFound = false;
      const gps = await exifr.gps(file);
      if (gps && gps.latitude && gps.longitude) {
        setPinLocation({ lat: gps.latitude, lng: gps.longitude });
        lat = gps.latitude;
        lng = gps.longitude;
        locationFound = true;
      } else {
        if ("geolocation" in navigator) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            setPinLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            locationFound = true;
          } catch(e) {
            console.warn("Geolocation fallback failed", e);
          }
        }
      }
    } catch (err) {
      console.warn("Could not extract EXIF data:", err);
      let lat = 40.7128;
      let lng = -74.0060;
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          setPinLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch(e) {
          console.warn("Geolocation fallback failed in catch block", e);
        }
      }
    }
  };

  const triggerAutoSubmit = async (file, lat, lng) => {
    setIsSubmitting(true);
    setPipelineError(null);
    setResultDetection(null);

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setCurrentJobId(jobId);
    setCurrentStage('received');
    setProgressData({ stage: 'received', step: 1, message: 'Compressing image payload in browser...' });

    try {
      const compressedImage = await compressImageClientSide(file);
      const formData = new FormData();
      formData.append('image', compressedImage);
      formData.append('jobId', jobId);
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('address', address.trim()); 
      formData.append('typeHint', typeHint);

      const res = await client.post('/api/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.detected === false || (!res.data.detection && (!res.data.detections || res.data.detections.length === 0))) {
        setNoIssueDetected(true);
        setNoIssueMessage(res.data.message || 'No municipal issue detected in this image.');
        setCurrentStage('no_issue');
      } else {
        setNoIssueDetected(false);
        setResultDetection(res.data.detection);
        setCurrentStage('completed');
      }
    } catch (err) {
      console.error('[Upload Error]:', err);
      const errMsg = err.response?.data?.error || err.message || 'Detection failed.';
      setPipelineError(errMsg);
      setCurrentStage('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCameraCapture = (file, scanData) => {
    handleFileSelect(file, scanData);
    setShowWebcam(false);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please upload an image or capture a photo first.');
      return;
    }

    setIsSubmitting(true);
    setPipelineError(null);
    setResultDetection(null);

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setCurrentJobId(jobId);
    setCurrentStage('received');
    setProgressData({ stage: 'received', step: 1, message: 'Compressing image payload in browser...' });

    try {
      // 1. Client-Side Image Compression
      const compressedImage = await compressImageClientSide(selectedFile);

      // 2. Build FormData
      const formData = new FormData();
      formData.append('image', compressedImage);
      formData.append('jobId', jobId);
      formData.append('lat', pinLocation.lat);
      formData.append('lng', pinLocation.lng);
      formData.append('address', address.trim());
      formData.append('typeHint', typeHint);

      // 3. Post to full automated triage pipeline
      const res = await client.post('/api/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.detected === false || (!res.data.detection && (!res.data.detections || res.data.detections.length === 0))) {
        setNoIssueDetected(true);
        setNoIssueMessage(res.data.message || 'No municipal issue detected in this image.');
        setCurrentStage('no_issue');
      } else {
        setNoIssueDetected(false);
        setResultDetection(res.data.detection);
        setCurrentStage('completed');
      }
    } catch (err) {
      console.error('[Upload Error]:', err);
      const errMsg = err.response?.data?.error || err.message || 'Detection failed.';
      setPipelineError(errMsg);
      setCurrentStage('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultDetection(null);
    setNoIssueDetected(false);
    setNoIssueMessage('');
    setCurrentJobId(null);
    setCurrentStage(null);
    setProgressData(null);
    setPipelineError(null);
    setCameraScanInfo(null);
    setIsQuickScanning(false);
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-10 min-w-0 overflow-x-hidden box-border text-[#191636]">
      
      {/* Hero / Page Header */}
      <div className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-[#E8E2E5] shadow-xs z-10 w-full min-w-0 box-border">
        <div className="relative p-5 sm:p-8 lg:p-10 flex flex-col md:flex-row md:items-center justify-between z-10 gap-4 sm:gap-6 min-w-0 w-full">
          <div className="max-w-2xl min-w-0 flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2.5 sm:mb-3">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#F6F6FC] border border-[#E8E2E5] text-[#302B69] text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center shadow-xs">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-[#302B69]" />
                {t('aiDetection', 'Automated AI Triage & Dispatch')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191636] tracking-tight mb-2 sm:mb-3 break-words">
              {t('intelligentIncidentReporting', 'Intelligent Incident Reporting')}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-[#57536E] font-medium leading-relaxed">
              {t('reportPageSubtitle', 'Snap a photo or upload an image. Urban EYE will automatically pinpoint the location, analyze the infrastructure defect with AI, and dispatch work orders directly to municipal departments.')}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => navigate('/my-reports')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold text-[#191636] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] hover:border-[#302B69]/40 transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#302B69]" />
              <span>{t('trackPastReports', 'Track Past Reports')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Pipeline Stepper */}
      {(isSubmitting || currentStage || resultDetection || noIssueDetected) && (
        <div className="mb-8 transition-all duration-500">
          <UploadStepper
            currentStage={currentStage}
            progressData={progressData}
            error={pipelineError}
          />
        </div>
      )}

      {/* No Issue Detected Notification Card */}
      {noIssueDetected && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2E5] shadow-sm space-y-4 relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200 text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold tracking-wide text-[#191636]">
                  {t('noIssueDetectedTitle', 'Analysis Complete: No Municipal Issue Detected')}
                </h4>
                <p className="text-sm text-[#57536E] mt-1 max-w-2xl">
                  {noIssueMessage || t('noIssueDetectedDesc', 'The AI scan analyzed this image and detected no hazardous road potholes or illegal solid waste dumping. No municipal incident report was created.')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl bg-[#302B69] hover:bg-[#242052] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {t('uploadAnotherImage', 'Upload Another Image')}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Result Card - Displayed prominently upon completion */}
      {resultDetection && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#E8E2E5] shadow-sm space-y-4 sm:space-y-6 relative overflow-hidden w-full min-w-0 box-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 w-full min-w-0">
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200 text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base sm:text-lg font-bold tracking-wide text-[#191636] truncate">
                  {t('incidentDispatched', 'Incident Dispatched Successfully!')}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#57536E] truncate">
                  {t('incidentDispatchedDesc', 'Municipal authority has been notified with high-priority assignment.')}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-[11px] sm:text-xs font-mono font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5] shrink-0">
              REF #{resultDetection.id || resultDetection._id}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs font-mono relative z-10 w-full min-w-0">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] min-w-0">
              <span className="text-[#57536E] block text-[9px] sm:text-[10px] font-bold mb-1 tracking-wider">{t('categoryLabel', 'CATEGORY')}</span>
              <span className="font-bold text-[#191636] text-xs sm:text-sm uppercase block truncate">{resultDetection.type}</span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] min-w-0">
              <span className="text-[#57536E] block text-[9px] sm:text-[10px] font-bold mb-1 tracking-wider">{t('severityLabel', 'SEVERITY')}</span>
              <span className="font-bold text-rose-600 text-xs sm:text-sm uppercase block truncate">{resultDetection.severity}</span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] min-w-0">
              <span className="text-[#57536E] block text-[9px] sm:text-[10px] font-bold mb-1 tracking-wider">{t('assignedDept', 'ASSIGNED DEPT')}</span>
              <span className="font-bold text-[#191636] text-xs sm:text-sm truncate block">{resultDetection.assignedDepartment}</span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] min-w-0">
              <span className="text-[#57536E] block text-[9px] sm:text-[10px] font-bold mb-1 tracking-wider">{t('citizenReportsCount', 'CITIZEN REPORTS')}</span>
              <span className="font-bold text-[#191636] text-xs sm:text-sm block truncate">{resultDetection.reportCount || 1} {t('reportsCount', 'reported')}</span>
            </div>
          </div>

          {/* Formal Municipal Grievance Complaint Letter Card */}
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] space-y-3 relative z-10 w-full min-w-0 box-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E2E5] w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-[#302B69] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-[#191636] uppercase tracking-wider truncate">
                  {t('generatedComplaintLetter', 'Generated Formal Municipal Grievance Letter')}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                {saveLetterSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('saved', 'Saved')}
                  </span>
                )}

                {!isEditingLetter ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingLetter(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#302B69] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('editLetter', 'Edit Letter')}</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedLetterText(resultDetection.reportText || '');
                        setIsEditingLetter(false);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#57536E] hover:text-[#191636] bg-white border border-[#E8E2E5] transition-colors cursor-pointer"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={savingLetter}
                      onClick={handleSaveLetterUpdates}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#302B69] hover:bg-[#242052] transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingLetter ? t('saving', 'Saving...') : t('saveUpdates', 'Save Updates')}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditingLetter ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[#57536E] font-medium">
                  ✏️ You can edit any part of this formal complaint letter, add specific landmark notes, or adjust the problem description before exporting the PDF.
                </p>
                <textarea
                  value={editedLetterText}
                  onChange={(e) => setEditedLetterText(e.target.value)}
                  rows={10}
                  className="w-full p-3 sm:p-4 rounded-xl bg-white border border-[#E8E2E5] text-xs font-mono text-[#191636] focus:outline-none focus:ring-1 focus:ring-[#302B69] leading-relaxed custom-scrollbar"
                  placeholder="Formal complaint letter..."
                />
              </div>
            ) : (
              <pre className="p-3 sm:p-4 rounded-xl bg-white border border-[#E8E2E5] text-xs font-mono text-[#191636] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 sm:max-h-72 custom-scrollbar">
                {resultDetection.reportText || editedLetterText}
              </pre>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 sm:gap-3 pt-1 relative z-10 w-full min-w-0">
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPDF}
              className="w-full lg:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#302B69] hover:bg-[#242052] shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {downloadingPdf ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>{downloadingPdf ? t('generatingPdf', 'Generating PDF...') : t('downloadPdfReport', 'Download PDF Report')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              className="w-full lg:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-[#302B69] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{t('inspectAiDetails', 'Inspect AI Details')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-reports')}
              className="w-full lg:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-[#191636] bg-white hover:bg-[#F6F6FC] border border-[#E8E2E5] transition-colors shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#57536E]" />
              <span>{t('viewInMyReports', 'View in My Reports')}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full lg:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-[#302B69] bg-[#F6F6FC] hover:bg-[#E8E2E5] border border-[#E8E2E5] transition-colors flex items-center justify-center space-x-2 lg:ml-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#302B69]" />
              <span>{t('reportAnotherIncident', 'Report Another Incident')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Balanced Grid: Left = Photo & Category, Right = Big Map & Location */}
      <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start w-full min-w-0">
        
        {/* Left Column: Photo Evidence & Category & Submit */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 flex flex-col w-full min-w-0">
          
          {/* Card 1: Image Upload / Camera Dropzone */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#E8E2E5] shadow-xs relative overflow-hidden group w-full min-w-0 box-border">
            <div className="flex items-center justify-between mb-4 sm:mb-5 relative z-10">
              <label className="text-xs sm:text-sm font-bold text-[#191636] uppercase tracking-wider flex items-center space-x-2 sm:space-x-2.5">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5] flex items-center justify-center text-[10px] sm:text-xs font-bold">1</span>
                <span>{t('uploadEvidencePhoto', 'Upload Evidence Photo')}</span>
              </label>
              <span className="text-[10px] sm:text-[11px] text-[#57536E] font-medium">JPG, PNG, WEBP</span>
            </div>

            {previewUrl ? (
              <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#F6F6FC] border border-[#E8E2E5] shadow-xs group/preview z-10 w-full min-w-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                />

                {/* AI Model Detection Badge Overlay */}
                {isQuickScanning ? (
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/95 border border-[#E8E2E5] backdrop-blur-md shadow-xs animate-pulse max-w-[90%]">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-[#302B69]/30 border-t-[#302B69] rounded-full animate-spin shrink-0"></div>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#302B69] truncate">
                      Analyzing with YOLOv8 Model...
                    </span>
                  </div>
                ) : cameraScanInfo && cameraScanInfo.primaryType ? (
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex items-center gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/95 border border-[#E8E2E5] backdrop-blur-md shadow-xs max-w-[90%]">
                    <span className="text-sm sm:text-base shrink-0">
                      {cameraScanInfo.primaryType === 'pothole' ? '🚧' : '🗑️'}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-[#191636] uppercase block tracking-wider truncate">
                        {cameraScanInfo.primaryType === 'pothole' ? 'Pothole Detected' : 'Garbage Dump Detected'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[#57536E] font-mono block truncate">
                        {(cameraScanInfo.confidence * 100).toFixed(0)}% Confidence • Auto-Assigned
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="absolute inset-0 bg-[#191636]/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center space-x-2 sm:space-x-3 backdrop-blur-xs p-2">
                  {isSubmitting ? (
                    <div className="text-white font-bold flex items-center bg-[#302B69] px-4 py-2 rounded-xl text-xs sm:text-sm">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {t('analyzing', 'Analyzing...')}
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-white text-[#191636] hover:bg-[#F6F6FC] transition-colors shadow-xs cursor-pointer"
                      >
                        {t('changePhoto', 'Change Photo')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWebcam(true)}
                        className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-[#302B69] text-white hover:bg-[#242052] transition-colors shadow-xs cursor-pointer"
                      >
                        {t('takeNewPhoto', 'Take New Photo')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#E8E2E5] hover:border-[#302B69] rounded-xl sm:rounded-2xl p-5 sm:p-10 flex flex-col items-center justify-center text-center transition-all bg-[#F6F6FC] hover:bg-white cursor-pointer shadow-xs relative z-10 w-full min-w-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white text-[#302B69] border border-[#E8E2E5] flex items-center justify-center mb-3 sm:mb-4 shadow-xs transition-all duration-300">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#191636]">
                  {t('tapToSelectPhoto', 'Tap to select or drop incident photo')}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#57536E] mt-1 max-w-sm">
                  {t('gpsAutoExtraction', 'Automatic GPS extraction & client-side compression enabled')}
                </p>

                <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-white hover:bg-[#F6F6FC] text-[#191636] border border-[#E8E2E5] transition-colors shadow-xs text-center cursor-pointer"
                  >
                    {t('browseFiles', 'Browse Files')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-[#302B69] text-white shadow-xs hover:bg-[#242052] transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('takePhoto', 'Take Photo')}</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Card 2: Issue Category Selector */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#E8E2E5] shadow-xs relative overflow-hidden space-y-3 sm:space-y-4 w-full min-w-0 box-border">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-[#191636] uppercase tracking-wider flex items-center space-x-2 sm:space-x-2.5">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5] flex items-center justify-center text-[10px] sm:text-xs font-bold">2</span>
                <span>{t('selectDefectCategory', 'Select Defect Category')}</span>
              </label>
              <span className="text-[10px] sm:text-[11px] text-[#57536E]">{t('autoClassifiedHint', 'Auto-classified')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full min-w-0">
              {[
                { id: 'pothole', name: t('potholes', 'Pothole & Road'), dept: t('roadsAndWorks', 'Roads & Works'), emoji: '🚧' },
                { id: 'garbage', name: t('wasteGarbage', 'Garbage Dump'), dept: t('sanitation', 'Sanitation'), emoji: '🗑️' },
                { id: 'water_leak', name: t('waterLeaks', 'Water Pipe Leak'), dept: t('waterSupply', 'Water Supply'), emoji: '💧' },
                { id: 'streetlight', name: t('streetlights', 'Broken Streetlight'), dept: t('electricalDept', 'Electrical Dept'), emoji: '💡' },
              ].map((cat) => {
                const isSelected = typeHint === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTypeHint(cat.id)}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between min-w-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F6F6FC] border-[#302B69] shadow-xs ring-1 ring-[#302B69]'
                        : 'bg-white border-[#E8E2E5] hover:bg-[#F6F6FC] text-[#57536E]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                      <span className="text-lg sm:text-xl">{cat.emoji}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#302B69]"></span>
                      )}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-bold truncate block ${isSelected ? 'text-[#302B69]' : 'text-[#191636]'}`}>
                      {cat.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#57536E] mt-0.5 truncate block">
                      {cat.dept}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Submit Action */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#E8E2E5] space-y-3 sm:space-y-4 shadow-xs w-full min-w-0 box-border">
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold text-white bg-[#302B69] hover:bg-[#242052] shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('runningAiTriage', 'Running AI Triage & Dispatch...')}</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t('submitIncidentReport', 'Submit Incident Report')}</span>
                </>
              )}
            </button>
            <p className="text-[10px] sm:text-[11px] text-center text-[#57536E] leading-relaxed">
              {t('submitNotice', 'Upon submission, our AI will cluster nearby reports within 50m to avoid duplicates, route to municipal engineers, and trigger verified email dispatches.')}
            </p>
          </div>

        </div>

        {/* Right Column: Prominent Large Interactive Map & Connected Location Inputs */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 flex flex-col w-full min-w-0">
          
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#E8E2E5] shadow-xs space-y-3.5 sm:space-y-5 w-full min-w-0 box-border">
            {/* Header with GPS Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-10 w-full min-w-0">
              <label className="text-xs sm:text-sm font-bold text-[#191636] uppercase tracking-wider flex items-center space-x-2 sm:space-x-2.5">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5] flex items-center justify-center text-[10px] sm:text-xs font-bold">3</span>
                <span>{t('pinpointLocation', 'Pinpoint Exact Location')}</span>
              </label>
              <span className="text-[10px] sm:text-[11px] text-[#302B69] font-mono font-bold bg-[#F6F6FC] border border-[#E8E2E5] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl">
                {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#57536E] bg-[#F6F6FC] border border-[#E8E2E5] px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl relative z-10 w-full min-w-0">
              <span className="flex items-center gap-1.5 text-[#191636] truncate">
                <MapPin className="w-3.5 h-3.5 text-[#302B69] shrink-0" />
                <span className="truncate">{t('dragPinHint', 'Drag the pin or click on the map')}</span>
              </span>
              <span className="text-[10px] text-[#57536E] hidden sm:inline shrink-0">{t('realtimeAddressSync', 'Real-time address sync')}</span>
            </div>

            {/* Responsive Map Container */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8E2E5] shadow-xs relative z-10 w-full min-w-0 h-[320px] sm:h-[480px]">
              <MapView
                center={[pinLocation.lat, pinLocation.lng]}
                zoom={15}
                height="100%"
                allowPinDrop={true}
                selectedLocation={pinLocation}
                onLocationSelect={(loc) => setPinLocation(loc)}
              />
            </div>

            {/* Connected Location Inputs Directly Below the Map */}
            <div className="space-y-3 sm:space-y-4 pt-1 relative z-10 w-full min-w-0">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#57536E] mb-1 flex items-center justify-between">
                  <span>{t('detectedLandmark', 'Landmark & Street Address')}</span>
                  <span className="text-[10px] text-[#302B69] font-normal">{t('autoFilledFromPin', 'Auto-filled')}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near D-Mart, Sector 1, Greater Noida"
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-white border border-[#E8E2E5] text-[#191636] text-xs sm:text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] focus:ring-1 focus:ring-[#302B69]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full min-w-0">
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-[#57536E] uppercase tracking-wider mb-1">
                    {t('latitude', 'Latitude')}
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={pinLocation.lat}
                    onChange={(e) => setPinLocation({ ...pinLocation, lat: Number(e.target.value) })}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636] text-xs font-mono focus:outline-none focus:border-[#302B69] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold text-[#57536E] uppercase tracking-wider mb-1">
                    {t('longitude', 'Longitude')}
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={pinLocation.lng}
                    onChange={(e) => setPinLocation({ ...pinLocation, lng: Number(e.target.value) })}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636] text-xs font-mono focus:outline-none focus:border-[#302B69] transition-all"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

      </form>


      {/* Camera Capture Modal */}
      {showWebcam && (
        <WebcamCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowWebcam(false)}
        />
      )}

      {/* Detection Detail Inspector Modal */}
      {showDetailModal && resultDetection && (
        <DetectionModal
          detection={resultDetection}
          onClose={() => setShowDetailModal(false)}
        />
      )}

    </div>
  );
}

