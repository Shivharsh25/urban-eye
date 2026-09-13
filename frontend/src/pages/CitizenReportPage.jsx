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
  Download
} from 'lucide-react';
import client from '../api/client';
import { subscribeToJob } from '../api/socket';
import { compressImageClientSide } from '../components/ImageCompressor';
import WebcamCapture from '../components/WebcamCapture';
import UploadStepper from '../components/UploadStepper';
import MapView from '../components/MapView';
import DetectionModal from '../components/DetectionModal';
import { generateReportPDF } from '../utils/pdfGenerator';
import exifr from 'exifr';

export default function CitizenReportPage() {
  const navigate = useNavigate();

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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fileInputRef = useRef(null);

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
      setCurrentStage(data.stage);
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

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResultDetection(null);
    setPipelineError(null);

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
      
      // Auto Submit Pipeline Trigger removed so user can review/edit location
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
      // Auto Submit Pipeline Trigger removed
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

      setResultDetection(res.data.detection);
      setCurrentStage('completed');
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

  const handleCameraCapture = (file) => {
    handleFileSelect(file);
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

      setResultDetection(res.data.detection);
      setCurrentStage('completed');
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
    setCurrentJobId(null);
    setCurrentStage(null);
    setProgressData(null);
    setPipelineError(null);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      
      {/* Hero / Page Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl glass-card border border-stone-800 shadow-2xl z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-stone-900/90 to-stone-950"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between z-10 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center shadow-inner">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Automated AI Triage & Dispatch
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-200 to-stone-400 tracking-tight drop-shadow-sm mb-3">
              Intelligent Incident Reporting
            </h1>
            <p className="text-sm sm:text-base text-stone-400 font-medium leading-relaxed">
              Snap a photo or upload an image. Urban EYE will automatically pinpoint the location, analyze the infrastructure defect with AI, and dispatch work orders directly to municipal departments.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/my-reports')}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-300 bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 transition-all shadow-lg flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Track Past Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Pipeline Stepper - Spans Full Width so all 6 stages have plenty of room */}
      {(isSubmitting || currentStage || resultDetection) && (
        <div className="mb-8 transition-all duration-500">
          <UploadStepper
            currentStage={currentStage}
            progressData={progressData}
            error={pipelineError}
          />
        </div>
      )}

      {/* Confirmation & Result Card - Displayed prominently upon completion */}
      {resultDetection && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-stone-900/95 border border-emerald-500/40 shadow-2xl space-y-6 glow-emerald relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-wide text-emerald-400 uppercase">
                  Incident Dispatched Successfully!
                </h4>
                <p className="text-xs text-stone-400">
                  Municipal authority has been notified with high-priority assignment.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-stone-950 text-stone-300 border border-stone-800 shadow-inner">
              REF #{resultDetection.id || resultDetection._id}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono relative z-10">
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
              <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">CATEGORY</span>
              <span className="font-bold text-amber-400 text-sm uppercase">{resultDetection.type}</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
              <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">SEVERITY</span>
              <span className="font-bold text-rose-400 text-sm uppercase">{resultDetection.severity}</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
              <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">ASSIGNED DEPT</span>
              <span className="font-bold text-stone-200 text-sm truncate block">{resultDetection.assignedDepartment}</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
              <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">CITIZEN REPORTS</span>
              <span className="font-bold text-stone-200 text-sm">{resultDetection.reportCount || 1} reported</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPDF}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {downloadingPdf ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4 text-cyan-200" />
              )}
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect AI Details</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-reports')}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-stone-300 bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4 text-stone-400" />
              <span>View in My Reports</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-700 transition-colors flex items-center justify-center space-x-2 ml-auto"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Report Another Incident</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Balanced Grid: Left = Photo & Category, Right = Big Map & Location */}
      <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Photo Evidence & Category & Submit */}
        <div className="lg:col-span-6 space-y-6 flex flex-col">
          
          {/* Card 1: Image Upload / Camera Dropzone */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700"></div>
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <label className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                <span>Upload Evidence Photo</span>
              </label>
              <span className="text-[11px] text-stone-400 font-medium">JPG, PNG, WEBP</span>
            </div>

            {previewUrl ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl group/preview z-10">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                />
                <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center space-x-3 backdrop-blur-sm">
                  {isSubmitting ? (
                    <div className="text-amber-400 font-bold flex items-center bg-stone-900/80 px-4 py-2 rounded-xl">
                      <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-800/90 text-white hover:bg-stone-700 border border-stone-600 transition-colors shadow-lg"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWebcam(true)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25"
                      >
                        Take New Photo
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-stone-700/60 hover:border-amber-500/80 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all bg-stone-950/40 hover:bg-stone-900/50 cursor-pointer shadow-inner relative z-10"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-stone-900 group-hover:bg-amber-950/50 text-stone-400 group-hover:text-amber-400 border border-stone-800 group-hover:border-amber-500/30 flex items-center justify-center mb-4 shadow-xl transition-all duration-300">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-stone-200">
                  Tap to select or drop incident photo
                </h4>
                <p className="text-xs text-stone-400 mt-1.5 max-w-sm">
                  Automatic GPS extraction & client-side compression enabled
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors shadow-md"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-rose-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
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
          <div className="p-6 sm:p-8 rounded-3xl glass-card relative overflow-hidden space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">2</span>
                <span>Select Defect Category</span>
              </label>
              <span className="text-[11px] text-stone-500">Auto-classified if unsure</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'pothole', name: 'Pothole & Road', dept: 'Roads & Works', emoji: '🚧' },
                { id: 'garbage', name: 'Garbage Dump', dept: 'Sanitation', emoji: '🗑️' },
                { id: 'water_leak', name: 'Water Pipe Leak', dept: 'Water Supply', emoji: '💧' },
                { id: 'streetlight', name: 'Broken Streetlight', dept: 'Electrical Dept', emoji: '💡' },
              ].map((cat) => {
                const isSelected = typeHint === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTypeHint(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-stone-950/40 border-stone-800/80 hover:bg-stone-900/60 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{cat.emoji}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-stone-200'}`}>
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-0.5 truncate">
                      {cat.dept}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Submit Action */}
          <div className="p-6 rounded-3xl glass-card space-y-4 shadow-xl">
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="w-full py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-amber-400 shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running AI Triage & Dispatch...</span>
                </div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Incident Report</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-stone-500 leading-relaxed">
              Upon submission, our AI will cluster nearby reports within 50m to avoid duplicates, route to municipal engineers, and trigger verified email dispatches.
            </p>
          </div>

        </div>

        {/* Right Column: Prominent Large Interactive Map & Connected Location Inputs */}
        <div className="lg:col-span-6 space-y-6 flex flex-col">
          
          <div className="p-6 sm:p-8 rounded-3xl glass-card relative overflow-hidden shadow-xl space-y-5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header with GPS Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
              <label className="text-sm font-bold text-stone-200 uppercase tracking-wider flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">3</span>
                <span>Pinpoint Exact Location</span>
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-bold bg-amber-950/50 border border-amber-500/30 px-3 py-1 rounded-xl shadow-inner">
                {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400 bg-stone-950/50 border border-stone-800 px-4 py-2.5 rounded-2xl relative z-10">
              <span className="flex items-center gap-1.5 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Drag the pin or click on the map to position</span>
              </span>
              <span className="text-[10px] text-stone-500 hidden sm:inline">Real-time address sync</span>
            </div>

            {/* Expansive, Prominent Map (480px Height) */}
            <div className="rounded-2xl overflow-hidden border border-stone-700/80 shadow-2xl relative z-10">
              <MapView
                center={[pinLocation.lat, pinLocation.lng]}
                zoom={15}
                height="480px"
                allowPinDrop={true}
                selectedLocation={pinLocation}
                onLocationSelect={(loc) => setPinLocation(loc)}
              />
            </div>

            {/* Connected Location Inputs Directly Below the Map */}
            <div className="space-y-4 pt-1 relative z-10">
              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1.5 flex items-center justify-between">
                  <span>Detected Landmark & Street Address</span>
                  <span className="text-[10px] text-amber-500 font-normal">Auto-filled from pin</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near D-Mart, Sector 1, Greater Noida"
                    className="w-full px-4 py-3.5 rounded-2xl bg-stone-950/70 border border-stone-700/80 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={pinLocation.lat}
                    onChange={(e) => setPinLocation({ ...pinLocation, lat: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={pinLocation.lng}
                    onChange={(e) => setPinLocation({ ...pinLocation, lng: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all"
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

