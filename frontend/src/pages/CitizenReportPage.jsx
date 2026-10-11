import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Eye, 
  FileText,
  Download,
  Edit3,
  Check,
  RefreshCw,
  Construction,
  Trash2,
  Info,
  ShieldCheck,
  ArrowRight
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
  const [pinLocation, setPinLocation] = useState({ lat: 28.5355, lng: 77.3910 });
  const [typeHint, setTypeHint] = useState('');

  // Pipeline state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [pipelineError, setPipelineError] = useState(null);
  const [resultDetection, setResultDetection] = useState(null);
  const [noIssueMessage, setNoIssueMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [editedLetterText, setEditedLetterText] = useState('');
  const [savingLetter, setSavingLetter] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  // Handle GPS from EXIF
  const handleFileSelect = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      const output = await exifr.parse(file, { gps: true });
      if (output && output.latitude && output.longitude) {
        setPinLocation({ lat: output.latitude, lng: output.longitude });
      }
    } catch (err) {
      console.warn('EXIF GPS parse failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please upload photo evidence first.');
      return;
    }

    setIsSubmitting(true);
    setPipelineError(null);
    setResultDetection(null);
    setNoIssueMessage(null);

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentJobId(jobId);
    setCurrentStage('received');
    setProgressData({ stage: 'received', step: 1, message: 'Compressing and preprocessing photo payload...' });

    try {
      const compressedImage = await compressImageClientSide(selectedFile);
      const formData = new FormData();
      formData.append('image', compressedImage);
      formData.append('jobId', jobId);
      formData.append('lat', pinLocation.lat);
      formData.append('lng', pinLocation.lng);
      formData.append('address', address.trim());
      formData.append('typeHint', typeHint);

      const res = await client.post('/api/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.detected === false || !res.data.detection) {
        setResultDetection(null);
        setNoIssueMessage(res.data.message || 'No municipal issue detected in this image');
        setCurrentStage('completed');
        setProgressData({ stage: 'completed', step: 6, message: res.data.message || 'No municipal issue detected in this image' });
        return;
      }

      setResultDetection(res.data.detection);
      setCurrentStage('completed');
    } catch (err) {
      console.error('[Upload Error]:', err);
      setPipelineError(err.response?.data?.error || err.message || 'Detection failed.');
      setCurrentStage('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultDetection) return;
    try {
      setDownloadingPdf(true);
      await generateReportPDF(resultDetection, previewUrl);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not download PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSaveLetter = async () => {
    if (!resultDetection) return;
    try {
      setSavingLetter(true);
      const res = await client.patch(`/api/detections/${resultDetection.id || resultDetection._id}`, {
        reportText: editedLetterText
      });
      setResultDetection(res.data.detection);
      setIsEditingLetter(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Could not update grievance letter.');
    } finally {
      setSavingLetter(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="civic-hero p-6 sm:p-8 bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>YOLOV8 COMPUTER VISION DISPATCH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            File Infrastructure Defect
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Upload incident photo evidence. Our vision models automatically pinpoint coordinates, assess severity, and draft formal municipal grievances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/my-reports')}
          className="civic-btn-secondary shrink-0 self-start sm:self-center"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>My Reports</span>
        </button>
      </div>

      {/* Upload Progress Stepper */}
      {(isSubmitting || currentStage || resultDetection || noIssueMessage) && (
        <UploadStepper
          currentStage={currentStage}
          progressData={progressData}
          error={pipelineError}
        />
      )}

      {/* No Issue Detected Notification */}
      {noIssueMessage && (
        <div className="civic-panel p-6 bg-amber-50/90 border-2 border-amber-300 text-amber-900 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">
                No Municipal Issue Detected in This Image
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Our YOLOv8 AI model scanned this photo and did not detect any road potholes or garbage accumulation. No incident ticket was registered.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Formal Grievance Letter */}
      {resultDetection && (
        <div className="civic-panel p-6 sm:p-8 bg-white border-2 border-emerald-500/50 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-800">
                  Incident Dispatched to Municipal Authorities
                </h3>
                <p className="text-xs text-slate-500">Official work order generated and queued for zonal crew</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800">
              REF #{resultDetection.id || resultDetection._id}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Category</span>
              <span className="text-sm font-bold text-slate-900 uppercase">{resultDetection.type}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Severity</span>
              <span className={`text-sm font-bold uppercase ${
                parseInt(resultDetection.severity) >= 70 ? 'text-rose-700' :
                parseInt(resultDetection.severity) >= 40 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {resultDetection.severity || '50%'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Assigned Dept</span>
              <span className="text-sm font-bold text-blue-700 truncate block">{resultDetection.assignedDepartment || 'Roads & Works'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Reports Merged</span>
              <span className="text-sm font-bold text-emerald-700">{resultDetection.reportCount || 1} verified</span>
            </div>
          </div>

          {/* Grievance Preview Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-blue-600" />
                Formal Municipal Grievance Letter
              </span>
              <button
                type="button"
                onClick={() => setIsEditingLetter(!isEditingLetter)}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingLetter ? 'Done Editing' : 'Edit Letter'}</span>
              </button>
            </div>

            {isEditingLetter ? (
              <textarea
                value={editedLetterText}
                onChange={(e) => setEditedLetterText(e.target.value)}
                rows={8}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            ) : (
              <pre className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {editedLetterText}
              </pre>
            )}

            {isEditingLetter && (
              <button
                type="button"
                onClick={handleSaveLetter}
                disabled={savingLetter}
                className="civic-btn-primary text-xs py-1.5 px-3"
              >
                {savingLetter ? 'Saving...' : 'Save Letter Changes'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="civic-btn-primary shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingPdf ? 'Exporting PDF...' : 'Download Official PDF Report'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              className="civic-btn-secondary shadow-xs"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Inspect Raw Vision Telemetry</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 6 Cols: Photo & Category Selection */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Photo Dropzone */}
          <div className="civic-panel p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                <span>Visual Defect Evidence</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">JPG, PNG, WEBP</span>
            </div>

            {previewUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 shadow-md cursor-pointer"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 sm:p-10 border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl bg-slate-50/70 hover:bg-blue-50/30 transition-all text-center cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Click to upload photo evidence</h4>
                <p className="text-xs text-slate-500 mt-1">Automatic EXIF GPS extraction & client compression</p>
                
                <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="civic-btn-secondary text-xs py-1.5 px-3"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="civic-btn-primary text-xs py-1.5 px-3"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
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

          {/* Defect Category Grid */}
          <div className="civic-panel p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
                <span>Defect Classification</span>
              </h2>
              <span className="text-[11px] text-slate-500">Auto-refined by AI</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'pothole', name: 'Pothole & Road Hazard', dept: 'Roads & Works', icon: Construction, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                { id: 'garbage', name: 'Waste & Garbage Dump', dept: 'Sanitation', icon: Trash2, color: 'text-rose-700 bg-rose-50 border-rose-200' },
              ].map(cat => {
                const IconComponent = cat.icon;
                const isSelected = typeHint === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTypeHint(typeHint === cat.id ? '' : cat.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-2xs' 
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cat.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{cat.dept}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedFile}
            className="w-full civic-btn-primary py-3 text-sm justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Executing Computer Vision Inference...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit & Dispatch Work Order</span>
              </>
            )}
          </button>

        </div>

        {/* Right 6 Cols: Geospatial Mapping & Coordinates */}
        <div className="lg:col-span-6 civic-panel p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
              <span>Geospatial Pinpoint Location</span>
            </h2>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)}
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
            <MapView
              center={[pinLocation.lat, pinLocation.lng]}
              zoom={15}
              height="380px"
              allowPinDrop={true}
              selectedLocation={pinLocation}
              onLocationSelect={(loc) => setPinLocation(loc)}
            />
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street Address / Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near City Center Metro Pillar 42, Sector 12"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={pinLocation.lat}
                  onChange={(e) => setPinLocation({ ...pinLocation, lat: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={pinLocation.lng}
                  onChange={(e) => setPinLocation({ ...pinLocation, lng: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* Modals */}
      {showWebcam && (
        <WebcamCapture
          onCapture={(file) => {
            handleFileSelect(file);
            setShowWebcam(false);
          }}
          onClose={() => setShowWebcam(false)}
        />
      )}

      {showDetailModal && resultDetection && (
        <DetectionModal
          detection={resultDetection}
          onClose={() => setShowDetailModal(false)}
        />
      )}

    </div>
  );
}
