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
  CheckCircle2
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
    if (fontSize === 'large') {
      root.style.fontSize = '17px';
    } else if (fontSize === 'xlarge') {
      root.style.fontSize = '18.5px';
    } else {
      root.style.fontSize = '16.75px';
    }
    localStorage.setItem('urban_eye_a11y_font', fontSize);
  }, [fontSize]);

  const handleSignOutClick = () => {
    setIsOpen(false);
    setShowSignOutConfirm(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'C';
    if (user.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
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
      icon: Eye
    },
    {
      title: 'AI-Powered Detection',
      subtitle: 'Instant Pothole & Garbage Recognition',
      desc: 'Snap a photo or upload an image. Our on-device & server-side neural models analyze road damage, water leaks, unlit streetlights, and sanitation hazards with high accuracy.',
      icon: Camera
    },
    {
      title: 'Real-Time City Map',
      subtitle: 'Geotagged Incident Hotspots',
      desc: 'Interactive live maps plot citizen reports with verified GPS coordinates and cluster analytics, preventing duplicate reports and accelerating municipal dispatch.',
      icon: MapPin
    },
    {
      title: 'Transparent Resolution',
      subtitle: 'Track Your Impact from Start to Finish',
      desc: 'Get live status updates via WebSockets as municipal crews verify, assign, and resolve your reports. Earn verified citizen karma points for improving your city.',
      icon: Activity
    },
    {
      title: t('proTipsTitle', 'Pro Tips for Faster Resolution'),
      subtitle: 'Best Practices for Citizen Incident Reporting',
      desc: 'Follow these 3 essential tips to help municipal dispatch and road maintenance teams quickly locate and resolve reported hazards:',
      icon: Sparkles,
      tips: [
        {
          num: 1,
          title: t('tip1Title', 'Capture Wide Angle:'),
          desc: t('tip1Desc', 'Include road dividers or nearby storefronts to help field teams locate the issue.')
        },
        {
          num: 2,
          title: t('tip2Title', 'Verify Map Pin:'),
          desc: t('tip2Desc', 'Fine-tune the GPS pin on the map preview if reporting after leaving the site.')
        },
        {
          num: 3,
          title: t('tip3Title', 'Download Official PDF:'),
          desc: t('tip3Desc', 'Use the generated PDF dispatch report if escalating to your local RWA or ward councillor.')
        }
      ]
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
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
          className="relative group p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#302B69] focus:ring-offset-2 transition-transform active:scale-95 cursor-pointer"
        >
          {/* Avatar in Indigo Purple (#302B69) */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#302B69] hover:bg-[#242052] flex items-center justify-center shadow-xs transition-all border border-white">
            <span className="text-white text-xs sm:text-sm font-bold tracking-tight select-none">
              {getInitials()}
            </span>
          </div>

          {/* Badge at Bottom-Right */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#302B69] border-2 border-white flex items-center justify-center shadow-xs">
            <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
          </div>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-56 sm:w-60 bg-white rounded-2xl shadow-xl border border-[#E8E2E5] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-[#191636]`}
          role="menu"
          aria-orientation="vertical"
        >
          {/* 1. View Profile */}
          <button
            type="button"
            onClick={() => handleNavigate('/profile')}
            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#191636] hover:bg-[#F6F6FC] hover:text-[#302B69] transition-colors flex items-center justify-between group cursor-pointer"
            role="menuitem"
          >
            <span>{t('viewProfile', 'View Profile')}</span>
            {user?.role && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F6F6FC] text-[#302B69] border border-[#E8E2E5] font-bold">
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
            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#191636] hover:bg-[#F6F6FC] hover:text-[#302B69] transition-colors cursor-pointer"
            role="menuitem"
          >
            {t('getStartedTour', 'Get Started Tour')}
          </button>

          {/* 3. Privacy Policy */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setShowPrivacyModal(true);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#191636] hover:bg-[#F6F6FC] hover:text-[#302B69] transition-colors cursor-pointer"
            role="menuitem"
          >
            {t('privacyPolicy', 'Privacy Policy')}
          </button>

          {/* 4. Accessibility */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setShowA11yModal(true);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#191636] hover:bg-[#F6F6FC] hover:text-[#302B69] transition-colors cursor-pointer"
            role="menuitem"
          >
            {t('accessibility', 'Accessibility')}
          </button>

          {/* 5. Settings */}
          <button
            type="button"
            onClick={() => handleNavigate(isAdmin ? '/admin/settings' : '/settings')}
            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#191636] hover:bg-[#F6F6FC] hover:text-[#302B69] transition-colors cursor-pointer"
            role="menuitem"
          >
            {t('settings', 'Settings')}
          </button>

          {/* 6. Sign Out or Sign In */}
          {user ? (
            <button
              type="button"
              onClick={handleSignOutClick}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#57536E] hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-between cursor-pointer border-t border-[#E8E2E5] mt-1 pt-2.5"
              role="menuitem"
            >
              <span>{t('signOut', 'Sign Out')}</span>
              <LogOut className="w-3.5 h-3.5 text-[#8C87A6]" />
            </button>
          ) : (
            <div className="pt-1 mt-1 border-t border-[#E8E2E5]">
              <button
                type="button"
                onClick={() => handleNavigate('/login')}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#191636] hover:bg-[#F6F6FC] hover:text-[#302B69] transition-colors flex items-center justify-between cursor-pointer"
                role="menuitem"
              >
                <span>{t('signIn', 'Sign In')}</span>
                <LogIn className="w-3.5 h-3.5 text-[#8C87A6]" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/register')}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#302B69] hover:bg-[#F6F6FC] transition-colors flex items-center justify-between cursor-pointer"
                role="menuitem"
              >
                <span>{t('register', 'Register')}</span>
                <UserPlus className="w-3.5 h-3.5 text-[#302B69]" />
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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#191636]/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowTourModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-lg m-auto rounded-3xl bg-white border border-[#E8E2E5] p-6 sm:p-8 text-[#191636] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2E5]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#302B69]"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#302B69]">
                  Urban EYE Tour • Step {tourStep + 1} of {tourSteps.length}
                </span>
              </div>
              <button
                onClick={() => setShowTourModal(false)}
                className="p-1.5 rounded-xl text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC] transition-colors cursor-pointer"
                title="Close Tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Step Content */}
            <div className="py-5 sm:py-6">
              {React.createElement(tourSteps[tourStep].icon, {
                className: "w-12 h-12 text-[#302B69] mb-3.5 p-2.5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] shadow-xs"
              })}
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191636] mb-1">
                {tourSteps[tourStep].title}
              </h3>
              <p className="text-xs font-mono text-[#302B69] font-semibold mb-3">
                {tourSteps[tourStep].subtitle}
              </p>
              <p className="text-sm text-[#57536E] leading-relaxed">
                {tourSteps[tourStep].desc}
              </p>

              {tourSteps[tourStep].tips && (
                <div className="mt-4 space-y-2.5 pt-3 border-t border-[#E8E2E5]">
                  {tourSteps[tourStep].tips.map((tip) => (
                    <div key={tip.num} className="flex items-start gap-3 p-3 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 bg-[#302B69] text-white">
                        {tip.num}
                      </span>
                      <div className="text-xs leading-relaxed">
                        <strong className="text-[#191636] mr-1">{tip.title}</strong>
                        <span className="text-[#57536E]">{tip.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step Progress Indicators */}
            <div className="flex items-center justify-center space-x-2 my-2">
              {tourSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTourStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === tourStep ? 'w-8 bg-[#302B69]' : 'w-2 bg-[#E8E2E5] hover:bg-[#302B69]/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-[#E8E2E5] mt-4">
              <button
                type="button"
                disabled={tourStep === 0}
                onClick={() => setTourStep(prev => prev - 1)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  tourStep === 0 ? 'text-[#8C87A6] cursor-not-allowed' : 'text-[#57536E] hover:bg-[#F6F6FC] hover:text-[#191636]'
                }`}
              >
                Previous
              </button>

              {tourStep < tourSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setTourStep(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#302B69] hover:bg-[#242052] text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTourModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#302B69] hover:bg-[#242052] text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#191636]/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowPrivacyModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-lg m-auto rounded-3xl bg-white border border-[#E8E2E5] p-6 sm:p-8 text-[#191636] shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2E5] shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#191636]">Urban EYE Privacy Policy</h3>
                  <span className="text-[10px] text-[#57536E] font-mono">Civic Data Protection Charter</span>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 rounded-xl text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#57536E] custom-scrollbar pr-1">
              <div className="p-3.5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <h4 className="font-bold text-[#191636] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#302B69]" />
                  <span>Geospatial & GPS Coordinates</span>
                </h4>
                <p className="text-xs text-[#57536E]">
                  Location data is recorded strictly to verify the municipal coordinates of the reported infrastructure issue. Personal device locations outside active reports are never stored or tracked.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <h4 className="font-bold text-[#191636] mb-1 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#302B69]" />
                  <span>Image Sanitization & Facial Privacy</span>
                </h4>
                <p className="text-xs text-[#57536E]">
                  Uploaded road and civic issue photos pass through automated privacy filters. License plates and civilian faces detected in background frames are obscured before publishing to public city feeds.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <h4 className="font-bold text-[#191636] mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#302B69]" />
                  <span>Anonymous Citizen Reporting</span>
                </h4>
                <p className="text-xs text-[#57536E]">
                  Citizens may flag any report as anonymous. In such cases, your name, telephone, and email remain hidden from public view and are accessible only to authorized municipal ward officers for status confirmation.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E2E5] shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#302B69] hover:bg-[#242052] text-white transition-colors cursor-pointer"
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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#191636]/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          style={{ minHeight: '100vh', width: '100vw' }}
          onClick={() => setShowA11yModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-md m-auto rounded-3xl bg-white border border-[#E8E2E5] p-6 text-[#191636] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2E5]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center text-[#302B69]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#191636]">Accessibility Options</h3>
                  <span className="text-[10px] text-[#57536E] font-mono">Customize View & Ergonomics</span>
                </div>
              </div>
              <button
                onClick={() => setShowA11yModal(false)}
                className="p-1.5 rounded-xl text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#191636]">High Contrast Mode</div>
                  <div className="text-[11px] text-[#57536E]">Increases text and border legibility</div>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${highContrast ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Text Size Selector */}
              <div className="p-3.5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <div className="text-xs sm:text-sm font-bold text-[#191636] mb-2">Display Font Scaling</div>
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
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        fontSize === item.key
                          ? 'bg-[#302B69] text-white border-[#302B69]'
                          : 'bg-white text-[#57536E] border-[#E8E2E5] hover:bg-[#F6F6FC]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#191636]">Reduced Motion</div>
                  <div className="text-[11px] text-[#57536E]">Minimizes animation and parallax effects</div>
                </div>
                <button
                  type="button"
                  onClick={() => setReducedMotion(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${reducedMotion ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E2E5] flex justify-end">
              <button
                type="button"
                onClick={() => setShowA11yModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#302B69] hover:bg-[#242052] text-white transition-colors cursor-pointer"
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
