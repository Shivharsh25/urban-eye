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
  ArrowRight
} from 'lucide-react';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function WebcamCapture({ onCapture, onClose }) {
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

  // Camera state: 'live' | 'review'
  const [cameraMode, setCameraMode] = useState('live');
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);

  // Real-time automatic live detection state
  const [liveDetections, setLiveDetections] = useState([]);
  const [livePrimaryType, setLivePrimaryType] = useState(null);
  const [liveConfidencePercent, setLiveConfidencePercent] = useState(0);
  const [isScanningFrame, setIsScanningFrame] = useState(false);

  // Demo test feed (allows testing on desktop without needing real potholes on the desk)
  const [demoSample, setDemoSample] = useState(null); // null | 'pothole' | 'garbage'

  // Confirmed detection result for captured frame
  const [confirmedDetection, setConfirmedDetection] = useState(null);

  // Lock background scroll and attach key listeners
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

  // Enumerate camera devices
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

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);

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

      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities) {
        const capabilities = videoTrack.getCapabilities();
        setTorchSupported(!!(capabilities && capabilities.torch));
      }
    } catch (err) {
      console.error('[Webcam] Camera access error:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        setError('Camera access denied or unavailable. Please grant camera permission in your browser settings.');
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

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!stream || !torchSupported) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const nextState = !torchOn;
        await videoTrack.applyConstraints({ advanced: [{ torch: nextState }] });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Could not toggle torch:', err);
      }
    }
  };

  // Switch Front/Rear Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTorchOn(false);
  };

  // ========================================================
  // AUTOMATIC REAL-TIME LIVE DEFECT SCANNING LOOP
  // ========================================================
  useEffect(() => {
    let isActive = true;
    let timerId = null;
    let isProcessing = false;

    const performAutomaticScan = async () => {
      if (!isActive || cameraMode !== 'live') return;

      if (!isProcessing && ((videoRef.current && videoRef.current.readyState >= 2) || demoSample)) {
        isProcessing = true;
        setIsScanningFrame(true);

        try {
          let base64Payload = null;

          if (demoSample) {
            const sampleUrl = demoSample === 'pothole' ? '/test_real_pothole.jpg' : '/test_real_garbage.jpg';
            const sampleRes = await fetch(sampleUrl);
            const blob = await sampleRes.blob();
            base64Payload = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          } else if (videoRef.current) {
            const video = videoRef.current;
            const tempCanvas = document.createElement('canvas');
            const targetW = 640;
            const targetH = Math.round((video.videoHeight / (video.videoWidth || 640)) * 640) || 480;
            tempCanvas.width = targetW;
            tempCanvas.height = targetH;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(video, 0, 0, targetW, targetH);
            base64Payload = tempCanvas.toDataURL('image/jpeg', 0.72);
          }

          if (base64Payload) {
            const res = await client.post('/api/detect/scan', {
              imageBase64: base64Payload
            }, {
              timeout: 5000
            });

            if (isActive && res.data) {
              if (res.data.detected && res.data.detections && res.data.detections.length > 0) {
                setLiveDetections(res.data.detections);
                setLivePrimaryType(res.data.primaryType);
                setLiveConfidencePercent(res.data.confidencePercent || Math.round((res.data.confidence || 0) * 100));
              } else {
                setLiveDetections([]);
                setLivePrimaryType(null);
                setLiveConfidencePercent(0);
              }
            }
          }
        } catch (scanErr) {
          // Silent catch for live loop
        } finally {
          isProcessing = false;
          if (isActive) {
            setIsScanningFrame(false);
          }
        }
      }

      if (isActive && cameraMode === 'live') {
        timerId = setTimeout(performAutomaticScan, 450);
      }
    };

    if (cameraMode === 'live') {
      timerId = setTimeout(performAutomaticScan, 500);
    }

    return () => {
      isActive = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [cameraMode, demoSample, stream]);

  // ========================================================
  // TAKE SNAPSHOT
  // ========================================================
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 120);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (demoSample) {
      const img = new Image();
      img.src = demoSample === 'pothole' ? '/test_real_pothole.jpg' : '/test_real_garbage.jpg';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        finishCapture(canvas);
      };
    } else {
      ctx.drawImage(video, 0, 0, width, height);
      finishCapture(canvas);
    }
  };

  const finishCapture = (canvas) => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    setConfirmedDetection({
      primaryType: livePrimaryType,
      confidencePercent: liveConfidencePercent,
      detections: liveDetections
    });

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `urban_eye_${livePrimaryType || 'incident'}_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          setCapturedFile(file);
        }
        setCameraMode('review');
      },
      'image/jpeg',
      0.92
    );
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setConfirmedDetection(null);
    setCameraMode('live');
  };

  // Confirm and proceed to report
  const handleConfirm = () => {
    if (!capturedFile) return;
    onCapture(capturedFile, {
      primaryType: confirmedDetection?.primaryType || livePrimaryType,
      confidence: (confirmedDetection?.confidencePercent || liveConfidencePercent) / 100,
      confidencePercent: confirmedDetection?.confidencePercent || liveConfidencePercent,
      detections: confirmedDetection?.detections || liveDetections
    });
    onClose();
  };

  if (typeof document === 'undefined') return null;

  const currentType = cameraMode === 'review' ? confirmedDetection?.primaryType : livePrimaryType;
  const currentConfidence = cameraMode === 'review' ? confirmedDetection?.confidencePercent : liveConfidencePercent;
  const currentDetections = cameraMode === 'review' ? (confirmedDetection?.detections || []) : liveDetections;

  const isPothole = currentType === 'pothole';
  const isGarbage = currentType === 'garbage';

  return createPortal(
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[999999] w-screen h-screen bg-black text-white overflow-hidden select-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 999999,
        margin: 0,
        padding: 0,
        backgroundColor: '#000000'
      }}
      role="dialog"
      aria-modal="true"
    >
      
      {/* Shutter Flash Animation */}
      {flashEffect && (
        <div className="absolute inset-0 bg-white z-[1000000] pointer-events-none animate-out fade-out duration-150" />
      )}

      {/* ======================================================== */}
      {/* 1. EDGE-TO-EDGE FULL VIEWPORT CAMERA BACKGROUND */}
      {/* ======================================================== */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-rose-400 z-10 bg-stone-950 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-lg font-black text-white">Camera Access Error</h3>
          <p className="text-sm text-stone-300 max-w-sm">{error}</p>
          <button
            type="button"
            onClick={startCamera}
            className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-wider border border-stone-700 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      ) : capturedImage ? (
        /* Captured Snapshot Preview */
        <img
          src={capturedImage}
          alt="Captured Frame"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : demoSample ? (
        /* Demo Defect Sample Feed */
        <img
          src={demoSample === 'pothole' ? '/test_real_pothole.jpg' : '/test_real_garbage.jpg'}
          alt="Demo Defect Feed"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        /* Live Edge-to-Edge Full Screen Video Feed */
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Hidden Canvas for High-Resolution Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ======================================================== */}
      {/* 2. REAL-TIME BOUNDING BOX OVERLAY OVER LIVE VIDEO */}
      {/* ======================================================== */}
      {currentDetections && currentDetections.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {currentDetections.map((det, idx) => {
            const detIsPothole = det.type === 'pothole';
            return (
              <div
                key={idx}
                className="absolute transition-all duration-150 animate-in zoom-in-90"
                style={{
                  left: `${Math.max(5, Math.min(80, (det.bbox.x / (videoRef.current?.videoWidth || 640)) * 100))}%`,
                  top: `${Math.max(15, Math.min(75, (det.bbox.y / (videoRef.current?.videoHeight || 480)) * 100))}%`,
                  width: `${Math.max(15, Math.min(80, (det.bbox.width / (videoRef.current?.videoWidth || 640)) * 100))}%`,
                  height: `${Math.max(15, Math.min(70, (det.bbox.height / (videoRef.current?.videoHeight || 480)) * 100))}%`,
                  border: detIsPothole ? '3px solid #f59e0b' : '3px solid #ef4444',
                  boxShadow: detIsPothole 
                    ? '0 0 35px rgba(245, 158, 11, 0.9), inset 0 0 15px rgba(245, 158, 11, 0.3)' 
                    : '0 0 35px rgba(239, 68, 68, 0.9), inset 0 0 15px rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px'
                }}
              >
                <div 
                  className={`absolute -top-7 left-0 px-2.5 py-1 rounded-md text-[11px] font-mono font-black uppercase text-stone-950 shadow-xl flex items-center gap-1.5 whitespace-nowrap ${
                    detIsPothole ? 'bg-amber-400' : 'bg-rose-500 text-white'
                  }`}
                >
                  <span>{detIsPothole ? '🚧 POTHOLE' : '🗑️ GARBAGE'}</span>
                  <span className="font-extrabold underline">{Math.round(det.confidence * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tactical Optical HUD Reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 border border-white/25 rounded-3xl overflow-hidden backdrop-brightness-105">
          {/* Top-Left Bracket */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl shadow-[0_0_12px_#22d3ee]"></div>
          {/* Top-Right Bracket */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl shadow-[0_0_12px_#22d3ee]"></div>
          {/* Bottom-Left Bracket */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl shadow-[0_0_12px_#22d3ee]"></div>
          {/* Bottom-Right Bracket */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl shadow-[0_0_12px_#22d3ee]"></div>
          
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
            <div className="absolute inset-0 rounded-full border border-cyan-400/80 animate-ping"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-400/80 -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-400/80 -translate-x-1/2"></div>
          </div>

          {/* Animated laser line */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-pulse top-1/3"></div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TOP FLOATING HUD HEADER & DEMO TEST SWITCHER */}
      {/* ======================================================== */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
        
        {/* Optical AI Lens Badge */}
        <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-stone-900/85 border border-stone-700/80 backdrop-blur-md shadow-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-widest text-stone-200 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">URBAN EYE • </span>REAL-TIME AI LENS
          </span>
        </div>

        {/* Demo Switcher & Camera Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Demo Test Switcher */}
          <div className="flex items-center bg-stone-900/85 border border-stone-700/80 rounded-full p-1 backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={() => setDemoSample(null)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${
                demoSample === null 
                  ? 'bg-cyan-500 text-stone-950 shadow-md font-extrabold' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setDemoSample('pothole')}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                demoSample === 'pothole' 
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold' 
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <span>🚧</span>
              <span>Pothole</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoSample('garbage')}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                demoSample === 'garbage' 
                  ? 'bg-rose-500 text-white shadow-md font-extrabold' 
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              <span>🗑️</span>
              <span>Garbage</span>
            </button>
          </div>

          {cameraMode === 'live' && torchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2.5 rounded-full transition-all backdrop-blur-md border shadow-lg ${
                torchOn 
                  ? 'bg-amber-500 text-stone-950 border-amber-400' 
                  : 'bg-stone-900/80 text-stone-300 border-stone-700 hover:text-white'
              }`}
              title="Toggle Flashlight / Torch"
            >
              {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          {cameraMode === 'live' && hasMultipleCameras && (
            <button
              type="button"
              onClick={flipCamera}
              className="p-2.5 rounded-full bg-stone-900/80 text-stone-300 hover:text-white border border-stone-700 backdrop-blur-md transition-all shadow-lg active:rotate-180 duration-300"
              title="Switch Front/Rear Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700 backdrop-blur-md transition-all shadow-lg active:scale-95"
            title="Close Camera (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME LIVE DETECTION BANNER (AUTOMATIC) */}
      {/* ======================================================== */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-11/12 max-w-lg transition-all duration-300">
        {currentType ? (
          <div 
            className={`p-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl flex items-center justify-between gap-4 animate-in zoom-in-95 duration-200 ${
              isPothole 
                ? 'bg-amber-950/90 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]' 
                : 'bg-rose-950/90 border-rose-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner ${
                  isPothole ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50' : 'bg-rose-500/25 text-rose-300 border border-rose-400/50'
                }`}
              >
                {isPothole ? '🚧' : '🗑️'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black font-mono uppercase tracking-wider text-white">
                    {isPothole ? 'ROAD POTHOLE DETECTED' : 'GARBAGE DUMP DETECTED'}
                  </span>
                  <span 
                    className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full shadow-md ${
                      isPothole ? 'bg-amber-400 text-stone-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {currentConfidence}% MATCH
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5 font-medium">
                  {isPothole ? 'Roads & Infrastructure Department' : 'Sanitation & Solid Waste Department'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-black border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4" />
              <span>YOLOv8</span>
            </div>
          </div>
        ) : (
          <div className="px-5 py-2.5 rounded-full bg-black/75 border border-cyan-500/40 backdrop-blur-md text-center shadow-xl flex items-center justify-center space-x-2.5 mx-auto max-w-sm">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              SCANNING LIVE: POTHOLE & GARBAGE DETECTOR
            </span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. BOTTOM FLOATING CONTROLS (SHUTTER / CONFIRM) */}
      {/* ======================================================== */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-6 sm:p-8 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col items-center justify-end pointer-events-auto space-y-3">
        <div className="w-full max-w-lg flex items-center justify-between gap-4">
          {cameraMode === 'live' ? (
            /* Live Camera Shutter Controls */
            <div className="w-full flex items-center justify-between px-4 sm:px-8">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-700 backdrop-blur-md transition-all shadow-lg active:scale-95"
              >
                {t('cancel', 'Cancel')}
              </button>

              {/* Main Circular Shutter Button */}
              <button
                type="button"
                onClick={takeSnapshot}
                className="group relative flex items-center justify-center p-2 rounded-full focus:outline-none"
                aria-label="Capture Photo"
              >
                <div className="w-20 h-20 rounded-full border-4 border-white/80 group-hover:border-cyan-400 group-active:scale-90 transition-all flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_35px_#22d3ee]">
                  <div className="w-16 h-16 rounded-full bg-white group-hover:bg-gradient-to-tr group-hover:from-cyan-400 group-hover:to-white group-active:scale-95 transition-all shadow-inner"></div>
                </div>
              </button>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-mono text-stone-400 bg-stone-900/80 border border-stone-700 px-2.5 py-1 rounded-lg">
                  SPACE: Snap
                </span>
              </div>
              <div className="sm:hidden w-14"></div>
            </div>
          ) : (
            /* Captured Review Controls */
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={retakePhoto}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-700 backdrop-blur-md transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>{t('retake', 'Retake Photo')}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-stone-950 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 hover:from-cyan-300 hover:via-emerald-300 hover:to-amber-300 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
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
