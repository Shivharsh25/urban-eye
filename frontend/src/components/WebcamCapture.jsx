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

  // Demo test feed (allows testing on desktop/phone without needing an outdoor defect)
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
          width: { ideal: 1280, min: 480 },
          height: { ideal: 720, min: 360 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Autoplay error:', e));
        };
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
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.warn);
          };
        }
      } catch (fallbackErr) {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
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

      const video = videoRef.current;
      const isVideoReady = video && video.readyState >= 2 && video.videoWidth > 0;

      if (!isProcessing && (isVideoReady || demoSample)) {
        isProcessing = true;

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
          } else if (isVideoReady) {
            const tempCanvas = document.createElement('canvas');
            const targetW = 480;
            const targetH = Math.round((video.videoHeight / video.videoWidth) * targetW) || 360;
            tempCanvas.width = targetW;
            tempCanvas.height = targetH;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(video, 0, 0, targetW, targetH);
            base64Payload = tempCanvas.toDataURL('image/jpeg', 0.65);
          }

          if (base64Payload && isActive) {
            const res = await client.post('/api/detect/scan', {
              imageBase64: base64Payload
            }, {
              timeout: 4500
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
        }
      }

      if (isActive && cameraMode === 'live') {
        timerId = setTimeout(performAutomaticScan, 400);
      }
    };

    if (cameraMode === 'live') {
      timerId = setTimeout(performAutomaticScan, 400);
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
      className="fixed inset-0 z-[999999] w-full h-[100dvh] max-w-full bg-black text-white overflow-hidden select-none touch-none box-border"
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
      {/* 1. EDGE-TO-EDGE FULL-SCREEN BACKGROUND CAMERA FEED */}
      {/* ======================================================== */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-rose-400 z-10 bg-stone-950 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="text-base font-bold text-white">Camera Access Error</h3>
          <p className="text-xs text-stone-300 max-w-xs">{error}</p>
          <button
            type="button"
            onClick={startCamera}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-wider border border-stone-700 transition-all shadow-lg"
          >
            Retry
          </button>
        </div>
      ) : capturedImage ? (
        <img
          src={capturedImage}
          alt="Captured Frame"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : demoSample ? (
        <img
          src={demoSample === 'pothole' ? '/test_real_pothole.jpg' : '/test_real_garbage.jpg'}
          alt="Demo Defect Feed"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* ======================================================== */}
      {/* 2. REAL-TIME BOUNDING BOX OVERLAY OVER LIVE VIDEO */}
      {/* ======================================================== */}
      {currentDetections && currentDetections.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {currentDetections.map((det, idx) => {
            const detIsPothole = det.type === 'pothole';
            return (
              <div
                key={idx}
                className="absolute transition-all duration-150 animate-in zoom-in-90 box-border"
                style={{
                  left: `${Math.max(4, Math.min(78, (det.bbox.x / (videoRef.current?.videoWidth || 640)) * 100))}%`,
                  top: `${Math.max(16, Math.min(72, (det.bbox.y / (videoRef.current?.videoHeight || 480)) * 100))}%`,
                  width: `${Math.max(18, Math.min(75, (det.bbox.width / (videoRef.current?.videoWidth || 640)) * 100))}%`,
                  height: `${Math.max(16, Math.min(65, (det.bbox.height / (videoRef.current?.videoHeight || 480)) * 100))}%`,
                  border: detIsPothole ? '3px solid #f59e0b' : '3px solid #ef4444',
                  boxShadow: detIsPothole 
                    ? '0 0 25px rgba(245, 158, 11, 0.9), inset 0 0 10px rgba(245, 158, 11, 0.3)' 
                    : '0 0 25px rgba(239, 68, 68, 0.9), inset 0 0 10px rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px'
                }}
              >
                <div 
                  className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase text-stone-950 shadow-xl flex items-center gap-1 whitespace-nowrap ${
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

      {/* Center Viewfinder Framing Reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 z-10">
        <div className="relative w-56 h-56 sm:w-80 sm:h-80 border border-white/20 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-cyan-400 rounded-tl-lg shadow-[0_0_8px_#22d3ee]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-cyan-400 rounded-tr-lg shadow-[0_0_8px_#22d3ee]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-cyan-400 rounded-bl-lg shadow-[0_0_8px_#22d3ee]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-cyan-400 rounded-br-lg shadow-[0_0_8px_#22d3ee]"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3">
            <div className="absolute inset-0 rounded-full border border-cyan-400/80 animate-ping"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-400/80 -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-400/80 -translate-x-1/2"></div>
          </div>

          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-pulse top-1/3"></div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. COMPACT MOBILE-RESPONSIVE TOP HEADER */}
      {/* ======================================================== */}
      <div className="absolute top-0 left-0 right-0 z-40 p-3 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent pointer-events-auto">
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-stone-900/80 border border-stone-700/80 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono font-bold text-stone-200 uppercase tracking-wider">
            URBAN EYE AI
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {cameraMode === 'live' && torchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2 rounded-full transition-all backdrop-blur-md border ${
                torchOn 
                  ? 'bg-amber-500 text-stone-950 border-amber-400' 
                  : 'bg-stone-900/80 text-stone-300 border-stone-700'
              }`}
              title="Torch"
            >
              {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          {cameraMode === 'live' && hasMultipleCameras && (
            <button
              type="button"
              onClick={flipCamera}
              className="p-2 rounded-full bg-stone-900/80 text-stone-300 border border-stone-700 backdrop-blur-md"
              title="Flip Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900/80 text-stone-300 hover:text-white border border-stone-700 backdrop-blur-md"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME LIVE DETECTION STATUS BANNER */}
      {/* ======================================================== */}
      <div className="absolute top-14 sm:top-16 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-md z-30 pointer-events-none flex justify-center">
        {currentType ? (
          <div 
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl backdrop-blur-xl border shadow-xl flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200 ${
              isPothole 
                ? 'bg-amber-950/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                : 'bg-rose-950/90 border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">
                {isPothole ? '🚧' : '🗑️'}
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black font-mono uppercase text-white tracking-wider">
                    {isPothole ? 'POTHOLE' : 'GARBAGE'}
                  </span>
                  <span 
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                      isPothole ? 'bg-amber-400 text-stone-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {currentConfidence}% MATCH
                  </span>
                </div>
                <p className="text-[10px] text-stone-300 font-medium">
                  {isPothole ? 'Roads & Infrastructure' : 'Sanitation & Solid Waste'}
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
              YOLOv8
            </span>
          </div>
        ) : (
          <div className="px-4 py-1.5 rounded-full bg-black/75 border border-cyan-500/40 backdrop-blur-md text-center shadow-lg flex items-center justify-center space-x-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              SCANNING LIVE: POTHOLES & GARBAGE
            </span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. BOTTOM FLOATING CONTROLS & TEST SWITCHER */}
      {/* ======================================================== */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-4 sm:p-6 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col items-center justify-end pointer-events-auto space-y-3">
        
        {/* Quick Test Switcher (Pill directly above shutter) */}
        {cameraMode === 'live' && (
          <div className="flex items-center bg-stone-900/90 border border-stone-700/80 rounded-full p-1 backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={() => setDemoSample(null)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${
                demoSample === null 
                  ? 'bg-cyan-500 text-stone-950 shadow-md font-extrabold' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Live Camera
            </button>
            <button
              type="button"
              onClick={() => setDemoSample('pothole')}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                demoSample === 'pothole' 
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold' 
                  : 'text-amber-400/90 hover:text-amber-300'
              }`}
            >
              <span>🚧</span>
              <span>Test Pothole</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoSample('garbage')}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                demoSample === 'garbage' 
                  ? 'bg-rose-500 text-white shadow-md font-extrabold' 
                  : 'text-rose-400/90 hover:text-rose-300'
              }`}
            >
              <span>🗑️</span>
              <span>Test Garbage</span>
            </button>
          </div>
        )}

        {/* Shutter / Review Buttons */}
        <div className="w-full max-w-sm flex items-center justify-between gap-4">
          {cameraMode === 'live' ? (
            <div className="w-full flex items-center justify-between px-2 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-stone-900/80 border border-stone-700 backdrop-blur-md transition-all shadow-lg active:scale-95"
              >
                {t('cancel', 'Cancel')}
              </button>

              <button
                type="button"
                onClick={takeSnapshot}
                className="group relative flex items-center justify-center p-1.5 rounded-full focus:outline-none"
                aria-label="Capture Photo"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-3 border-white/80 group-hover:border-cyan-400 group-active:scale-90 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white group-hover:bg-cyan-300 group-active:scale-95 transition-all shadow-inner"></div>
                </div>
              </button>

              <div className="w-16 text-right">
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={flipCamera}
                    className="p-2.5 rounded-full bg-stone-900/80 text-stone-300 border border-stone-700 backdrop-blur-md active:rotate-180 duration-300 ml-auto"
                    title="Switch Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={retakePhoto}
                className="px-5 py-3 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-stone-900/90 border border-stone-700 backdrop-blur-md transition-all shadow-lg flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('retake', 'Retake')}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-stone-950 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 hover:from-cyan-300 transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t('usePhoto', 'Use Photo')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>,
    document.body
  );
}
