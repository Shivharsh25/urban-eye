import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  SwitchCamera, 
  Zap, 
  ZapOff, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Loader2,
  ArrowRight
} from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function WebcamCapture({ onCapture, onClose, onQuickSubmit }) {
  const { t } = useLanguage();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Camera stream state
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  // Snapshot & Detection state
  // Mode: 'live' | 'analyzing' | 'review'
  const [cameraMode, setCameraMode] = useState('live');
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  
  // AI Detection result from trained model
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 1280, height: 720 });

  // Prevent background scrolling and attach ESC/Space listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && cameraMode === 'live') {
        e.preventDefault();
        takeSnapshot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, cameraMode]);

  // Check camera devices
  useEffect(() => {
    async function checkDevices() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          if (videoInputs.length > 1) {
            setHasMultipleCameras(true);
          }
        }
      } catch (err) {
        console.warn('[Webcam] Enumerate devices error:', err);
      }
    }
    checkDevices();
  }, []);

  // Initialize and switch camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Stop any existing stream tracks first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Check torch / flashlight support
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities) {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      }
    } catch (err) {
      console.error('[Webcam] Access error:', err);
      // Fallback: try default without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        setError('Camera access denied or unavailable. Please grant camera permission in browser settings.');
      }
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!stream || !torchSupported) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const nextState = !torchOn;
        await videoTrack.applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Could not toggle torch:', err);
      }
    }
  };

  // Flip Camera (Front / Back)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTorchOn(false);
  };

  // Take Snapshot & run Model Detection
  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger haptic vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    // Trigger shutter flash effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 120);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    
    canvas.width = width;
    canvas.height = height;
    setImageDimensions({ width, height });

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    setCameraMode('analyzing');
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    // Convert canvas to blob & File
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setCameraMode('review');
          setIsScanning(false);
          return;
        }

        const file = new File([blob], `urban_eye_capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        setCapturedBlob(blob);
        setCapturedFile(file);

        // Run trained YOLOv8 model inference via fast scan endpoint
        try {
          const formData = new FormData();
          formData.append('image', file);

          const res = await client.post('/api/detect/scan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 10000
          });

          setScanResult(res.data);
        } catch (scanErr) {
          console.warn('[Camera AI Scan Error]:', scanErr);
          setScanError('Fast AI scan unavailable. Model will re-evaluate during report triage.');
        } finally {
          setIsScanning(false);
          setCameraMode('review');
        }
      },
      'image/jpeg',
      0.92
    );
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setCapturedFile(null);
    setScanResult(null);
    setScanError(null);
    setCameraMode('live');
  };

  // Confirm and proceed to report
  const handleConfirm = () => {
    if (!capturedFile) return;
    onCapture(capturedFile, scanResult);
    onClose();
  };

  // Quick submit directly from camera if requested
  const handleDirectSubmit = () => {
    if (!capturedFile) return;
    if (onQuickSubmit) {
      onQuickSubmit(capturedFile, scanResult);
      onClose();
    } else {
      handleConfirm();
    }
  };

  if (typeof document === 'undefined') return null;

  const primaryDetection = scanResult?.detections && scanResult.detections.length > 0 
    ? scanResult.detections[0] 
    : null;

  const isPothole = primaryDetection?.type === 'pothole';
  const isGarbage = primaryDetection?.type === 'garbage';

  return createPortal(
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[99999] w-screen h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
      style={{ margin: 0, padding: 0 }}
      role="dialog"
      aria-modal="true"
    >
      
      {/* Shutter Flash Animation Overlay */}
      {flashEffect && (
        <div className="absolute inset-0 bg-white z-[100000] pointer-events-none animate-out fade-out duration-150" />
      )}

      {/* ======================================================== */}
      {/* 1. TOP FLOATING HUD HEADER */}
      {/* ======================================================== */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        
        {/* Optical Lens System Badge */}
        <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-stone-900/80 border border-stone-700/80 backdrop-blur-md shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-widest text-stone-200 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>URBAN EYE • FULL OPTICAL CAMERA</span>
          </span>
        </div>

        {/* Action Controls (Torch, Flip, Close) */}
        <div className="flex items-center space-x-2.5">
          {cameraMode === 'live' && torchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-3 rounded-full transition-all backdrop-blur-md border shadow-lg ${
                torchOn 
                  ? 'bg-amber-500 text-stone-950 border-amber-400' 
                  : 'bg-stone-900/80 text-stone-300 border-stone-700 hover:text-white'
              }`}
              title="Toggle Flashlight / Torch"
              aria-label="Toggle Flashlight"
            >
              {torchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          {cameraMode === 'live' && hasMultipleCameras && (
            <button
              type="button"
              onClick={flipCamera}
              className="p-3 rounded-full bg-stone-900/80 text-stone-300 hover:text-white border border-stone-700 backdrop-blur-md transition-all shadow-lg active:rotate-180 duration-300"
              title="Switch Front/Rear Camera"
              aria-label="Switch Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-full bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700 backdrop-blur-md transition-all shadow-lg active:scale-95"
            title="Close Camera (Esc)"
            aria-label="Close Camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FULL VIEWPORT VIEWFINDER (Live Video or Captured Image) */}
      {/* ======================================================== */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-rose-400 max-w-md mx-auto space-y-4 z-20">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-lg font-black text-white">Camera Access Error</h3>
            <p className="text-sm text-stone-300">{error}</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-wider border border-stone-700 transition-all shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          /* Snapshot Preview Container */
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={capturedImage}
              alt="Captured Frame"
              className="w-full h-full object-contain md:object-cover"
            />

            {/* Bounding Box Visualizer for Detected Defect */}
            {cameraMode === 'review' && primaryDetection && primaryDetection.bbox && (
              <div 
                className="absolute pointer-events-none transition-all duration-300"
                style={{
                  left: `${(primaryDetection.bbox.x / imageDimensions.width) * 100}%`,
                  top: `${(primaryDetection.bbox.y / imageDimensions.height) * 100}%`,
                  width: `${(primaryDetection.bbox.width / imageDimensions.width) * 100}%`,
                  height: `${(primaryDetection.bbox.height / imageDimensions.height) * 100}%`,
                  border: isPothole ? '3px solid #f59e0b' : '3px solid #ef4444',
                  boxShadow: isPothole 
                    ? '0 0 25px rgba(245, 158, 11, 0.6), inset 0 0 15px rgba(245, 158, 11, 0.2)' 
                    : '0 0 25px rgba(239, 68, 68, 0.6), inset 0 0 15px rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px'
                }}
              >
                {/* Detection Tag Badge above box */}
                <div 
                  className={`absolute -top-7 left-0 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black uppercase text-stone-950 shadow-md ${
                    isPothole ? 'bg-amber-400' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isPothole ? '🚧 POTHOLE' : '🗑️ GARBAGE'} {(primaryDetection.confidence * 100).toFixed(0)}%
                </div>
              </div>
            )}

            {/* Scanning / Analyzing Wave Animation */}
            {isScanning && (
              <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                {/* Laser scan beam */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse top-1/2 -translate-y-1/2 w-full"></div>
                
                <div className="relative p-6 rounded-3xl bg-stone-900/90 border border-cyan-500/40 shadow-2xl flex flex-col items-center text-center space-y-3 max-w-sm mx-4 backdrop-blur-xl">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white tracking-wide uppercase font-mono">
                      YOLOv8 AI Inference
                    </h4>
                    <p className="text-xs text-stone-300 mt-1">
                      Analyzing frame for hazardous potholes & municipal garbage dumps...
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Live Camera Feed */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Smart City Optical Targeting Reticle / HUD */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              
              {/* Central Target Reticle Frame */}
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 border border-white/20 rounded-3xl overflow-hidden backdrop-brightness-105">
                
                {/* Top-Left Corner Bracket */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl shadow-[0_0_10px_#22d3ee]"></div>
                {/* Top-Right Corner Bracket */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl shadow-[0_0_10px_#22d3ee]"></div>
                {/* Bottom-Left Corner Bracket */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl shadow-[0_0_10px_#22d3ee]"></div>
                {/* Bottom-Right Corner Bracket */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl shadow-[0_0_10px_#22d3ee]"></div>
                
                {/* Central Crosshair Pulse */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                  <div className="absolute inset-0 rounded-full border border-cyan-400/80 animate-ping"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-400/80 -translate-y-1/2"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-400/80 -translate-x-1/2"></div>
                </div>

                {/* Laser Sweep Scan Line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-pulse top-1/3"></div>

              </div>

              {/* Viewfinder Alignment Prompt */}
              <div className="absolute bottom-32 sm:bottom-36 text-center">
                <span className="px-4 py-1.5 rounded-full bg-black/60 border border-stone-700/80 text-[11px] font-mono tracking-wider text-stone-200 backdrop-blur-md shadow-lg">
                  FRAME ISSUE INSIDE RETICLE • ROAD POTHOLE OR GARBAGE
                </span>
              </div>

            </div>
          </>
        )}

        {/* Hidden Canvas for High-Resolution Capture */}
        <canvas ref={canvasRef} className="hidden" />

      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM FLOATING CONTROLS & DETECTION VERDICT */}
      {/* ======================================================== */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 sm:p-8 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col items-center justify-end pointer-events-auto space-y-4">
        
        {/* Detection Result Card in Review Mode */}
        {cameraMode === 'review' && (
          <div className="w-full max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
            {primaryDetection ? (
              <div 
                className={`p-4 sm:p-5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center justify-between gap-4 ${
                  isPothole 
                    ? 'bg-amber-950/80 border-amber-500/50 shadow-amber-500/20' 
                    : 'bg-rose-950/80 border-rose-500/50 shadow-rose-500/20'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0 ${
                      isPothole ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {isPothole ? '🚧' : '🗑️'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                        {isPothole ? 'Pothole Detected' : 'Garbage Dump Detected'}
                      </span>
                      <span 
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isPothole ? 'bg-amber-400 text-stone-950' : 'bg-rose-400 text-stone-950'
                        }`}
                      >
                        {(primaryDetection.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5 font-medium">
                      {isPothole 
                        ? 'Department: Roads & Works Infrastructure' 
                        : 'Department: Municipal Solid Waste & Sanitation'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 hidden sm:flex items-center text-xs text-emerald-400 font-bold gap-1 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI Verified</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-700/80 backdrop-blur-xl text-stone-300 flex items-center space-x-3 shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">No Defect Detected Above Confidence Threshold</span>
                  <span className="text-stone-400 text-[11px]">
                    You can still use this photo to file a report or retake for clearer lighting.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="w-full max-w-lg flex items-center justify-between gap-4">
          
          {cameraMode === 'live' ? (
            /* Live Camera Shutter Controls */
            <div className="w-full flex items-center justify-between px-4 sm:px-8">
              
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-700 backdrop-blur-md transition-all shadow-lg active:scale-95"
              >
                {t('cancel', 'Cancel')}
              </button>

              {/* Central Main Shutter Trigger Button */}
              <button
                type="button"
                onClick={takeSnapshot}
                className="group relative flex items-center justify-center p-2 rounded-full focus:outline-none"
                aria-label="Capture Photo"
              >
                {/* Outer Ring */}
                <div className="w-20 h-20 rounded-full border-4 border-white/80 group-hover:border-cyan-400 group-active:scale-90 transition-all flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_30px_#22d3ee]">
                  {/* Inner Trigger Disc */}
                  <div className="w-16 h-16 rounded-full bg-white group-hover:bg-gradient-to-tr group-hover:from-cyan-400 group-hover:to-white group-active:scale-95 transition-all shadow-inner"></div>
                </div>
              </button>

              {/* Desktop keyboard hint */}
              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-mono text-stone-400 bg-stone-900/80 border border-stone-700 px-2.5 py-1 rounded-lg">
                  SPACE: Snap
                </span>
              </div>
              <div className="sm:hidden w-14"></div>

            </div>
          ) : (
            /* Post-Snapshot Review Controls */
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              
              <button
                type="button"
                onClick={retakePhoto}
                disabled={isScanning}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-700 backdrop-blur-md transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>{t('retake', 'Retake Photo')}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isScanning}
                className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-stone-950 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 hover:from-cyan-300 hover:via-emerald-300 hover:to-amber-300 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t('usePhotoAndProceed', 'Use Photo & Review Report')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

            </div>
          )}

        </div>

      </div>

    </div>,
    document.body
  );
}
