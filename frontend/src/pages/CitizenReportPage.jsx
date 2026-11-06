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
  RotateCcw,
  UploadCloud,
  Folder,
  Trash2,
  Droplets,
  Lightbulb,
  MoreHorizontal,
  BarChart2,
  AlertTriangle,
  X
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
  const [address, setAddress] = useState('Knowledge Park III, Sector 62, Noida, Uttar Pradesh - 201309');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [pinLocation, setPinLocation] = useState({ lat: 28.5355, lng: 77.3910 });
  const [typeHint, setTypeHint] = useState('pothole'); // 'pothole', 'garbage', 'water_leak', 'streetlight', 'other'
  const [severity, setSeverity] = useState('low'); // 'low', 'medium', 'high'
  const [description, setDescription] = useState('');

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
          await tryNominatimFallback();
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }
    };
    
    const tryNominatimFallback = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pinLocation.lat}&lon=${pinLocation.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
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
      const gps = await exifr.gps(file);
      if (gps && gps.latitude && gps.longitude) {
        setPinLocation({ lat: gps.latitude, lng: gps.longitude });
      } else if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          setPinLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        } catch(e) {
          console.warn("Geolocation fallback failed", e);
        }
      }
    } catch (err) {
      console.warn("Could not extract EXIF data:", err);
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          setPinLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        } catch(e) {
          console.warn("Geolocation fallback failed in catch block", e);
        }
      }
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
    if (e) e.preventDefault();
    if (!selectedFile) {
      alert('Please upload an image or choose a photo first.');
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
      formData.append('severity', severity);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

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
    setDescription('');
  };

  return (
    <div className="w-full text-slate-800 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans min-w-0">
      
      {/* ================================================================= */}
      {/* 1. PAGE HEADER & STEPPER (EXACTLY MATCHING SCREENSHOT)            */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2027] tracking-tight">
            Report a City Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Help us keep the city clean, safe and well-maintained.
          </p>
        </div>

        {/* 3-Step Wizard Progress Bar extending full width with proper magnification */}
        <div className="w-full py-3 sm:py-4 flex items-center justify-between">
          {/* Step 1: Issue Details (Active) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00897B] text-white flex items-center justify-center text-sm sm:text-base font-bold shadow-xs shrink-0 ring-4 ring-[#E6F8F5]">
              1
            </span>
            <span className="text-sm sm:text-base font-bold text-[#0B2027] whitespace-nowrap tracking-tight">
              Issue Details
            </span>
          </div>

          <div className="h-0.5 flex-1 bg-gradient-to-r from-[#00897B]/60 to-[#D5EFEA] mx-3 sm:mx-6 md:mx-8"></div>

          {/* Step 2: Location */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E6F3F0] text-[#00897B] flex items-center justify-center text-sm sm:text-base font-bold shrink-0">
              2
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-600 whitespace-nowrap tracking-tight">
              Location
            </span>
          </div>

          <div className="h-0.5 flex-1 bg-[#D5EFEA] mx-3 sm:mx-6 md:mx-8"></div>

          {/* Step 3: Review & Submit */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E6F3F0] text-[#00897B] flex items-center justify-center text-sm sm:text-base font-bold shrink-0">
              3
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-600 whitespace-nowrap tracking-tight">
              Review & Submit
            </span>
          </div>
        </div>
      </div>

      {/* Active Pipeline Stepper when submitting */}
      {(isSubmitting || currentStage) && !resultDetection && !noIssueDetected && (
        <div className="transition-all duration-300">
          <UploadStepper
            currentStage={currentStage}
            progressData={progressData}
            error={pipelineError}
          />
        </div>
      )}

      {/* No Issue Detected Notification Card */}
      {noIssueDetected && (
        <div className="p-6 rounded-3xl bg-[#F7FCFB] border border-[#D5EFEA] shadow-xs space-y-3 relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-200 text-[#00897B] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0B2027]">
                  Analysis Complete: No Municipal Issue Detected
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {noIssueMessage || 'The AI scan analyzed this image and detected no hazardous defect. No work order was created.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-[#005C66] text-white font-bold text-xs shadow-xs hover:bg-[#004B53] transition-all shrink-0 cursor-pointer"
            >
              Upload Another Image
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Result Card - Displayed upon completion */}
      {resultDetection && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D5EFEA] shadow-xs space-y-4 relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2F1EE] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F8F0] flex items-center justify-center border border-[#D1F2E2] text-[#10B981] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0B2027]">
                  Incident Dispatched Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Municipal authority & engineers have been notified via automatic Gmail dispatch.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#F2FBF9] text-[#005C66] border border-[#D5EFEA] self-start sm:self-auto">
              REF #{resultDetection.id || resultDetection._id}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#F9FDFC] border border-[#E5F2EF]">
              <span className="text-slate-400 block text-[10px] font-bold mb-1">CATEGORY</span>
              <span className="font-bold text-[#005C66] text-xs uppercase">{resultDetection.type}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9FDFC] border border-[#E5F2EF]">
              <span className="text-slate-400 block text-[10px] font-bold mb-1">SEVERITY</span>
              <span className="font-bold text-amber-600 text-xs uppercase">{resultDetection.severity}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9FDFC] border border-[#E5F2EF]">
              <span className="text-slate-400 block text-[10px] font-bold mb-1">ASSIGNED DEPT</span>
              <span className="font-bold text-slate-800 text-xs truncate block">{resultDetection.assignedDepartment}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9FDFC] border border-[#E5F2EF]">
              <span className="text-slate-400 block text-[10px] font-bold mb-1">CITIZEN REPORTS</span>
              <span className="font-bold text-slate-800 text-xs block">{resultDetection.reportCount || 1} reported</span>
            </div>
          </div>

          {/* Formal Complaint Letter Preview & Edit */}
          <div className="p-4 rounded-2xl bg-[#F9FDFC] border border-[#E5F2EF] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2F1EE]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00897B]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Generated Formal Municipal Grievance Letter
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingLetter ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingLetter(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-[#005C66] bg-white border border-[#D5EFEA] hover:bg-[#F2FBF9] transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Letter</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingLetter(false)}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingLetter}
                      onClick={handleSaveLetterUpdates}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-white bg-[#005C66] hover:bg-[#004B53] transition-all shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingLetter ? 'Saving...' : 'Save'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditingLetter ? (
              <textarea
                value={editedLetterText}
                onChange={(e) => setEditedLetterText(e.target.value)}
                rows={8}
                className="w-full p-3 rounded-xl bg-white border border-[#D5EFEA] text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00897B]"
              />
            ) : (
              <pre className="p-3 rounded-xl bg-white border border-[#E5F2EF] text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56 custom-scrollbar">
                {resultDetection.reportText || editedLetterText}
              </pre>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#005C66] hover:bg-[#004B53] shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-[#D5EFEA] hover:bg-[#F2FBF9] flex items-center gap-2 cursor-pointer transition-all"
            >
              <Eye className="w-4 h-4 text-[#00897B]" />
              <span>Inspect AI Details</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-reports')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-[#D5EFEA] hover:bg-[#F2FBF9] flex items-center gap-2 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>View in My Reports</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#005C66] bg-[#F2FBF9] border border-[#D5EFEA] hover:bg-[#E5F7F3] flex items-center gap-2 ml-auto cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Report Another Issue</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. MAIN 2-COLUMN BALANCED FORM LAYOUT (EXACTLY LIKE SCREENSHOT)   */}
      {/* ================================================================= */}
      <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* --------------------------------------------------------------- */}
        {/* LEFT COLUMN: Upload Evidence, Category, Describe Issue          */}
        {/* --------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-[#D5EFEA] p-6 shadow-xs shadow-teal-900/5 space-y-6">
          
          {/* Section 1: Upload Evidence */}
          <div>
            <h2 className="text-sm font-bold text-[#0B2027] mb-3">
              Upload Evidence
            </h2>

            {previewUrl ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-[#D5EFEA] shadow-xs group">
                <img
                  src={previewUrl}
                  alt="Evidence Preview"
                  className="w-full h-full object-cover"
                />

                {/* AI Model Detection Badge Overlay */}
                {isQuickScanning ? (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 text-teal-300 border border-teal-400/40 backdrop-blur-md shadow-md animate-pulse">
                    <div className="w-3.5 h-3.5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin shrink-0"></div>
                    <span className="text-xs font-mono font-bold">Analyzing with YOLOv8 Model...</span>
                  </div>
                ) : cameraScanInfo && cameraScanInfo.primaryType ? (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-teal-500/60 text-white backdrop-blur-md shadow-md">
                    <span className="text-base">
                      {cameraScanInfo.primaryType === 'pothole' ? '🚧' : '🗑️'}
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold text-teal-300 uppercase block">
                        {cameraScanInfo.primaryType === 'pothole' ? 'Pothole Detected' : 'Garbage Dump Detected'}
                      </span>
                      <span className="text-[10px] text-slate-300 font-mono block">
                        {(cameraScanInfo.confidence * 100).toFixed(0)}% Confidence • Auto-Assigned
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Change photo overlay on hover */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs p-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 hover:bg-slate-100 shadow-md transition-all cursor-pointer"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#005C66] text-white hover:bg-[#004B53] shadow-md transition-all cursor-pointer"
                  >
                    Take New Photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CEEFE8] hover:border-[#00A896] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-[#F9FDFC] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#00A896] group-hover:scale-105 transition-transform mb-3">
                  <UploadCloud className="w-12 h-12 stroke-[1.5]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Drag & drop a photo or video here
                </p>
                <span className="text-xs text-slate-400 my-1">or</span>

                <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2 rounded-xl bg-white border border-[#D5EFEA] hover:bg-[#F2FBF9] text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Folder className="w-4 h-4 text-slate-500" />
                    <span>Choose File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="px-4 py-2 rounded-xl bg-[#F2FBF9] border border-[#D5EFEA] hover:bg-[#E5F7F3] text-xs font-bold text-[#005C66] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Open Camera"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#00897B]" />
                    <span>Camera</span>
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

          {/* Section 2: Select Issue Category */}
          <div>
            <h2 className="text-sm font-bold text-[#0B2027] mb-3">
              Select Issue Category
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
              {[
                { id: 'pothole', label: 'Roads & Potholes', icon: AlertTriangle },
                { id: 'garbage', label: 'Garbage & Waste', icon: Trash2 },
                { id: 'water_leak', label: 'Water & Leaks', icon: Droplets },
                { id: 'streetlight', label: 'Lighting', icon: Lightbulb },
                { id: 'other', label: 'Others', icon: MoreHorizontal },
              ].map((cat) => {
                const isSelected = typeHint === cat.id;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTypeHint(cat.id)}
                    className={`relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#E6F8F5] border-2 border-[#00A896] text-[#005C66] shadow-xs'
                        : 'bg-white border-[#D5EFEA] hover:bg-[#F9FDFC] text-slate-600'
                    }`}
                  >
                    {/* Green checkmark pill when selected */}
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00A896] text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-2">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Describe the Issue (Optional) */}
          <div>
            <h2 className="text-sm font-bold text-[#0B2027] mb-2">
              Describe the Issue <span className="text-slate-400 font-normal">(Optional)</span>
            </h2>

            <div className="relative">
              <textarea
                value={description}
                maxLength={250}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add a short description..."
                className="w-full p-3.5 rounded-2xl bg-white border border-[#D5EFEA] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A896] shadow-2xs resize-none"
              />
              <span className="absolute right-3.5 bottom-3 text-[10px] font-mono text-slate-400">
                {description.length} / 250
              </span>
            </div>
          </div>

        </div>

        {/* --------------------------------------------------------------- */}
        {/* RIGHT COLUMN: Set Location, Severity Level, Submit Button       */}
        {/* --------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-[#D5EFEA] p-6 shadow-xs shadow-teal-900/5 space-y-6">
          
          {/* Section 1: Set Location */}
          <div>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6F8F5] text-[#00897B] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#0B2027]">
                  Set Location
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pin the exact location of the issue on the map.
                </p>
              </div>
            </div>

            {/* Embedded Map matching screenshot */}
            <div className="rounded-2xl overflow-hidden border border-[#D5EFEA] h-[220px] sm:h-[250px] relative shadow-inner">
              <MapView
                center={[pinLocation.lat, pinLocation.lng]}
                zoom={15}
                height="100%"
                allowPinDrop={true}
                selectedLocation={pinLocation}
                onLocationSelect={(loc) => setPinLocation(loc)}
              />
            </div>

            {/* Address Bar below Map */}
            <div className="mt-3.5 p-3.5 rounded-2xl bg-white border border-[#D5EFEA] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <MapPin className="w-4 h-4 text-[#00897B] shrink-0" />
                {isEditingAddress ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => setIsEditingAddress(false)}
                    autoFocus
                    className="w-full text-xs text-slate-800 bg-transparent border-b border-[#00A896] focus:outline-none"
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-700 truncate" title={address}>
                    {address || 'Knowledge Park III, Sector 62, Noida, Uttar Pradesh - 201309'}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F2FBF9] transition-colors shrink-0 cursor-pointer"
                title="Edit address manually"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Section 2: Severity Level */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-[#00897B]" />
              <h2 className="text-sm font-bold text-[#0B2027]">
                Severity Level
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Low */}
              <button
                type="button"
                onClick={() => setSeverity('low')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  severity === 'low'
                    ? 'bg-[#E8F8F0] border-2 border-[#10B981] text-[#059669] shadow-xs'
                    : 'bg-white border-[#D5EFEA] hover:bg-[#F9FDFC] text-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                <span>Low</span>
              </button>

              {/* Medium */}
              <button
                type="button"
                onClick={() => setSeverity('medium')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  severity === 'medium'
                    ? 'bg-[#FFFBEB] border-2 border-[#F59E0B] text-[#D97706] shadow-xs'
                    : 'bg-white border-[#D5EFEA] hover:bg-[#F9FDFC] text-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                <span>Medium</span>
              </button>

              {/* High */}
              <button
                type="button"
                onClick={() => setSeverity('high')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  severity === 'high'
                    ? 'bg-[#FFF1F2] border-2 border-[#F43F5E] text-[#E11D48] shadow-xs'
                    : 'bg-white border-[#D5EFEA] hover:bg-[#F9FDFC] text-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]"></span>
                <span>High</span>
              </button>
            </div>
          </div>

          {/* Section 3: Submit Incident Report Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="w-full py-3.5 sm:py-4 rounded-2xl text-sm font-bold text-white bg-[#005C66] hover:bg-[#004B53] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running AI Triage & Dispatch...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2]" />
                  <span>Submit Incident Report</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Automated AI verification, geo-deduplication & municipal Gmail dispatch enabled.
            </p>
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
