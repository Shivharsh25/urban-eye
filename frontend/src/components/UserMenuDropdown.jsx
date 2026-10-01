import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Check, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Shield, 
  Sparkles, 
  HelpCircle, 
  Eye, 
  MapPin, 
  Camera, 
  Activity, 
  ChevronRight, 
  X, 
  Lock, 
  Sliders, 
  CheckCircle2,
  Volume2,
  ZoomIn
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SignOutModal from './SignOutModal';

export default function UserMenuDropdown({ customTrigger, align = 'right' }) {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Modals state
  const [showTourModal, setShowTourModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showA11yModal, setShowA11yModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Accessibility state
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('urban_eye_a11y_contrast') === 'true';
  });
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('urban_eye_a11y_font') || 'normal';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('urban_eye_a11y_motion') === 'true';
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply Accessibility Preferences
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('contrast-125');
    } else {
      root.classList.remove('contrast-125');
    }
    localStorage.setItem('urban_eye_a11y_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-[14px]', 'text-[16px]', 'text-[18px]');
    if (fontSize === 'large') {
      root.style.fontSize = '17px';
    } else if (fontSize === 'xlarge') {
      root.style.fontSize = '19px';
    } else {
      root.style.fontSize = '16px';
    }
    localStorage.setItem('urban_eye_a11y_font', fontSize);
  }, [fontSize]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showTourModal || showPrivacyModal || showA11yModal || showSignOutConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showTourModal, showPrivacyModal, showA11yModal, showSignOutConfirm]);

  // Only show avatar dropdown if user is logged in
  if (!user) {
    return null;
  }

  // Compute initials from logged-in user (e.g. "Shivharsh Tiwari" -> "ST")
  const getInitials = () => {
    if (!user || !user.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length === 1) {
      return parts[0].toUpperCase();
    }
    return 'U';
  };

  const handleSignOutClick = () => {
    setIsOpen(false);
    setShowSignOutConfirm(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Tour steps
  const tourSteps = [
    {
      title: 'Welcome to Urban EYE',
      subtitle: 'Next-Generation Municipal Infrastructure Monitoring',
      desc: 'Urban EYE empowers citizens and city authorities to report, detect, and resolve civic hazards in real-time using cutting-edge computer vision and geospatial mapping.',
      icon: Eye,
      color: 'from-amber-500 to-rose-500'
    },
    {
      title: 'AI-Powered Detection',
      subtitle: 'Instant Pothole & Garbage Recognition',
      desc: 'Snap a photo or upload an image. Our on-device & server-side neural models analyze road damage, water leaks, unlit streetlights, and sanitation hazards with high accuracy.',
      icon: Camera,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Real-Time City Map',
      subtitle: 'Geotagged Incident Hotspots',
      desc: 'Interactive live maps plot citizen reports with verified GPS coordinates and cluster analytics, preventing duplicate reports and accelerating municipal dispatch.',
      icon: MapPin,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Transparent Resolution',
      subtitle: 'Track Your Impact from Start to Finish',
      desc: 'Get live status updates via WebSockets as municipal crews verify, assign, and resolve your reports. Earn verified citizen karma points for improving your city.',
      icon: Activity,
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger: Either custom trigger or avatar matching the screenshot */}
      {customTrigger ? (
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {customTrigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          title={user ? `${user.name} (${user.email}) - Open Menu` : 'Account Menu'}
          className="relative group p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-transform active:scale-95"
        >
          {/* Avatar Circle with Initials (e.g. DM) */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#15803d] hover:bg-[#166534] flex items-center justify-center shadow-md transition-all border border-emerald-400/20">
            <span className="text-white text-xs sm:text-sm font-bold tracking-tight select-none">
              {getInitials()}
            </span>
          </div>

          {/* Green Checkmark Badge at Bottom-Right */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#16a34a] border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
            <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
          </div>
        </button>
      )}

      {/* Dropdown Menu - Styled exactly like the user screenshot */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-56 sm:w-60 bg-white rounded-xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-slate-800`}
          role="menu"
          aria-orientation="vertical"
        >
          {/* 1. View Profile */}
          <button
            type="button"
            onClick={() => handleNavigate('/profile')}
            className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors flex items-center justify-between group"
            role="menuitem"
          >
            <span>{t('viewProfile')}</span>
            {user?.role && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-slate-200 text-slate-600 font-semibold">
                {user.role}
              </span>
            )}
          </button>

          {/* 2. 'Get Started' tour */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTourStep(0);
              setShowTourModal(true);
            }}
            className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors"
            role="menuitem"
          >
            {t('getStartedTour')}
          </button>

          {/* 3. Privacy Policy */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setShowPrivacyModal(true);
            }}
            className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors"
            role="menuitem"
          >
            {t('privacyPolicy')}
          </button>

          {/* 4. Accessibility */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setShowA11yModal(true);
            }}
            className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors"
            role="menuitem"
          >
            {t('accessibility')}
          </button>

          {/* 5. Settings */}
          <button
            type="button"
            onClick={() => handleNavigate(isAdmin ? '/admin/settings' : '/settings')}
            className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors"
            role="menuitem"
          >
            {t('settings')}
          </button>

          {/* 6. Sign Out or Sign In (based on auth state) */}
          {user ? (
            <button
              type="button"
              onClick={handleSignOutClick}
              className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-between"
              role="menuitem"
            >
              <span>{t('signOut')}</span>
              <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
            </button>
          ) : (
            <div className="pt-1 mt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleNavigate('/login')}
                className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-colors flex items-center justify-between"
                role="menuitem"
              >
                <span>{t('signIn')}</span>
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/register')}
                className="w-full text-left px-5 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-between"
                role="menuitem"
              >
                <span>{t('register')}</span>
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. GET STARTED TOUR MODAL */}
      {/* ========================================================================= */}
      {showTourModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowTourModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-lg m-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Urban EYE Tour • Step {tourStep + 1} of {tourSteps.length}
                </span>
              </div>
              <button
                onClick={() => setShowTourModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Step Content */}
            <div className="py-6">
              {React.createElement(tourSteps[tourStep].icon, {
                className: "w-12 h-12 text-cyan-400 mb-4 p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20"
              })}
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                {tourSteps[tourStep].title}
              </h3>
              <p className="text-xs font-mono text-cyan-300 font-semibold mb-3">
                {tourSteps[tourStep].subtitle}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tourSteps[tourStep].desc}
              </p>
            </div>

            {/* Step Progress Indicators */}
            <div className="flex items-center justify-center space-x-2 my-2">
              {tourSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTourStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === tourStep ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-4">
              <button
                type="button"
                disabled={tourStep === 0}
                onClick={() => setTourStep(prev => prev - 1)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  tourStep === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Previous
              </button>

              {tourStep < tourSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setTourStep(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTourModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  <span>Finish Tour</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 2. PRIVACY POLICY MODAL */}
      {/* ========================================================================= */}
      {showPrivacyModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowPrivacyModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-lg m-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 text-white shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Urban EYE Privacy Policy</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Civic Data Protection Charter</span>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 custom-scrollbar pr-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Geospatial & GPS Coordinates</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Location data is recorded strictly to verify the municipal coordinates of the reported infrastructure issue. Personal device locations outside active reports are never stored or tracked.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Image Sanitization & Facial Privacy</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Uploaded road and civic issue photos pass through automated privacy filters. License plates and civilian faces detected in background frames are obscured before publishing to public city feeds.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Anonymous Citizen Reporting</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Citizens may flag any report as anonymous. In such cases, your name, telephone, and email remain hidden from public view and are accessible only to authorized municipal ward officers for status confirmation.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 3. ACCESSIBILITY SETTINGS MODAL */}
      {/* ========================================================================= */}
      {showA11yModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowA11yModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-md m-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Accessibility Options</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Customize View & Ergonomics</span>
                </div>
              </div>
              <button
                onClick={() => setShowA11yModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">High Contrast Mode</div>
                  <div className="text-[11px] text-slate-400">Increases text and border legibility</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${highContrast ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Text Size Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs sm:text-sm font-bold text-white mb-2">Display Font Scaling</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'normal', label: 'Default' },
                    { key: 'large', label: 'Large (115%)' },
                    { key: 'xlarge', label: 'XL (130%)' }
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFontSize(item.key)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                        fontSize === item.key
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">Reduced Motion</div>
                  <div className="text-[11px] text-slate-400">Minimizes pulsing and parallax effects</div>
                </div>
                <button
                  type="button"
                  onClick={() => setReducedMotion(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${reducedMotion ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowA11yModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 4. CONFIRM SIGN OUT MODAL */}
      {/* ========================================================================= */}
      <SignOutModal 
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
}
