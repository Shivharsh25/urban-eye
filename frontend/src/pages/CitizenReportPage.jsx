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
  FileText 
} from 'lucide-react';
import client from '../api/client';
import { subscribeToJob } from '../api/socket';
import { compressImageClientSide } from '../components/ImageCompressor';
import WebcamCapture from '../components/WebcamCapture';
import UploadStepper from '../components/UploadStepper';
import MapView from '../components/MapView';
import DetectionModal from '../components/DetectionModal';
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

  const fileInputRef = useRef(null);

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
        const res = await client.get(`/api/geocode?lat=${pinLocation.lat}&lng=${pinLocation.lng}`);
        if (res.data && res.data.address) {
          setAddress(res.data.address);
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
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
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10">
      
      {/* Hero / Page Header (Cooler Design) */}
      <div className="relative mb-12 overflow-hidden rounded-3xl glass-card border border-stone-800 shadow-2xl z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-stone-900/80 to-stone-950"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between z-10">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center shadow-inner">
                <Sparkles className="w-3 h-3 mr-2" />
                Auto-Triage Enabled
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-200 to-stone-400 tracking-tight drop-shadow-sm mb-4">
              Intelligent Incident Reporting
            </h1>
            <p className="text-base md:text-lg text-stone-400 font-medium">
              Simply snap a photo. Our system will automatically geotag your location, run AI detection, and instantly dispatch a report to the municipal authorities via Gmail.
            </p>
          </div>

          {/* Demo Quick Sample Buttons */}
          <div className="mt-8 md:mt-0 flex flex-col items-start md:items-end space-y-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">Override AI Fallback Type</span>
            <div className="relative">
              <select
                value={typeHint}
                onChange={(e) => setTypeHint(e.target.value)}
                className="appearance-none pl-5 pr-10 py-3 rounded-xl bg-stone-950/80 border border-stone-700 text-sm font-bold text-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xl transition-all cursor-pointer backdrop-blur-md"
              >
                <option value="pothole">Pothole (Roads & Works)</option>
                <option value="garbage">Garbage / Dumping (Sanitation)</option>
                <option value="water_leak">Water Leak (Water Dept)</option>
                <option value="streetlight">Streetlight (Electrical)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-8">
          
          <form onSubmit={handleSubmitReport} className="space-y-8">
            
            {/* Image Upload / Camera Dropzone */}
            <div className="p-8 rounded-3xl glass-card relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700"></div>
              <label className="block text-sm font-bold text-stone-300 uppercase tracking-wider mb-6 flex items-center space-x-2 relative z-10">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs">1</span>
                <span>Snap a Photo</span>
              </label>

              {previewUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl group/preview z-10">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                  />
                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center space-x-4 backdrop-blur-sm">
                    {isSubmitting ? (
                      <div className="text-amber-400 font-bold flex items-center bg-stone-900/80 px-4 py-2 rounded-xl">
                        <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mr-2"></div>
                        Auto-analyzing...
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 rounded-xl text-sm font-bold bg-stone-800/80 text-white hover:bg-stone-700 border border-stone-600 transition-colors shadow-lg"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWebcam(true)}
                          className="px-6 py-3 rounded-xl text-sm font-bold bg-amber-500/90 text-white hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25"
                        >
                          Use Camera
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-stone-700/60 hover:border-amber-500/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all bg-stone-950/30 hover:bg-stone-900/50 cursor-pointer shadow-inner relative z-10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 rounded-3xl bg-stone-900 group-hover:bg-amber-950/50 text-stone-400 group-hover:text-amber-400 border border-stone-800 group-hover:border-amber-500/30 flex items-center justify-center mb-6 shadow-2xl transition-all duration-300">
                    <Upload className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-black text-stone-200">
                    Tap to select or drop a photo here
                  </h4>
                  <p className="text-sm text-stone-400 mt-2 font-medium">
                    Supports JPG, PNG, WEBP with automatic client-side compression
                  </p>

                  <div className="mt-8 flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 rounded-xl text-sm font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors shadow-lg"
                    >
                      Browse Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWebcam(true)}
                      className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-rose-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Camera className="w-5 h-5" />
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

            {/* Address & Coordinate Inputs */}
            <div className="p-8 rounded-3xl glass-card relative overflow-hidden space-y-5 shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <label className="block text-sm font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-2 relative z-10">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xs">2</span>
                <span>Where did you spot it?</span>
              </label>

              <div className="relative z-10">
                <label className="block text-xs font-bold text-stone-400 mb-2">
                  Add a landmark or street name (optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 420 Grand Avenue, opposite Metro Station"
                  className="w-full px-5 py-3.5 rounded-2xl bg-stone-950/60 border border-stone-700/80 text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
              </div>


              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-2">
                    LATITUDE
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={pinLocation.lat}
                    onChange={(e) => setPinLocation({ ...pinLocation, lat: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-950/60 border border-stone-700/80 text-stone-100 text-sm font-mono focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-2">
                    LONGITUDE
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={pinLocation.lng}
                    onChange={(e) => setPinLocation({ ...pinLocation, lng: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-950/60 border border-stone-700/80 text-stone-100 text-sm font-mono focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="w-full sm:flex-1 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Report...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Report</span>
                  </>
                )}
              </button>
              
              {resultDetection && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto py-4 px-6 rounded-2xl text-sm font-bold text-stone-900 bg-amber-500 hover:bg-amber-400 shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Report Another</span>
                </button>
              )}
            </div>

          </form>

        </div>

        {/* Right Column: Live Stepper, Map Picker, & Immediate Results */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Progress Stepper (Active during upload/processing) */}
          {(isSubmitting || currentStage || resultDetection) && (
            <UploadStepper
              currentStage={currentStage}
              progressData={progressData}
              error={pipelineError}
            />
          )}

          {/* Result Card upon completion */}
          {resultDetection && (
            <div className="p-8 rounded-3xl bg-stone-900 border border-emerald-500/40 shadow-2xl space-y-6 glow-emerald relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-base font-black tracking-wide text-emerald-400 uppercase">
                    Report Sent Successfully!
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-stone-950 text-stone-300 border border-stone-800">
                  #{resultDetection.id || resultDetection._id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono relative z-10">
                <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
                  <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">CATEGORY</span>
                  <span className="font-bold text-amber-500 text-sm uppercase">{resultDetection.type}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
                  <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">SEVERITY</span>
                  <span className="font-bold text-rose-500 text-sm uppercase">{resultDetection.severity}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
                  <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">ASSIGNED DEPT</span>
                  <span className="font-bold text-stone-200 text-sm truncate block">{resultDetection.assignedDepartment}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-inner">
                  <span className="text-stone-500 block text-[10px] font-bold mb-1 tracking-wider">REPORT COUNT</span>
                  <span className="font-bold text-stone-200 text-sm">{resultDetection.reportCount || 1} citizens</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(true)}
                  className="w-full sm:flex-1 py-3 rounded-2xl text-sm font-bold text-stone-900 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/my-reports')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold text-stone-300 bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors shadow-lg flex items-center justify-center"
                >
                  My Reports
                </button>
              </div>
            </div>
          )}

          {/* Interactive Map Location Selector */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden shadow-xl border-t border-t-white/5">
            <div className="flex items-center justify-between mb-5 relative z-10">
              <label className="text-sm font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Pin Location on Map</span>
              </label>
              <span className="text-[10px] text-amber-500 font-mono font-bold bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg shadow-inner">
                Lat: {pinLocation.lat.toFixed(4)}, Lng: {pinLocation.lng.toFixed(4)}
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-700/80 shadow-2xl relative z-10">
              <MapView
                center={[pinLocation.lat, pinLocation.lng]}
                zoom={14}
                height="320px"
                allowPinDrop={true}
                selectedLocation={pinLocation}
                onLocationSelect={(loc) => setPinLocation(loc)}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none"></div>
          </div>

        </div>

      </div>

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
