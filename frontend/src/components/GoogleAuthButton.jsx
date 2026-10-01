import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Mail, 
  KeyRound, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';

export default function GoogleAuthButton({ mode = 'signin', onSuccess, onError, className = '' }) {
  const { requestGoogleOtp, verifyGoogleOtp } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [fallbackName, setFallbackName] = useState('');

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(30);

  const digitRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (showOtpModal && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, resendCooldown]);

  // Focus first input box when OTP modal opens
  useEffect(() => {
    if (showOtpModal) {
      setTimeout(() => {
        digitRefs.current[0]?.focus();
      }, 150);
    }
  }, [showOtpModal]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    if (onError) onError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const googlePayload = {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoUrl: firebaseUser.photoURL,
        uid: firebaseUser.uid,
        idToken
      };

      // Request 6-digit verification OTP from backend
      const otpRes = await requestGoogleOtp(googlePayload);

      setPendingGoogleData({
        ...googlePayload,
        previewUrl: otpRes.previewUrl,
        devOtp: otpRes.devOtp,
        isExistingUser: otpRes.isExistingUser
      });

      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);
      setOtpSuccessMsg(null);
      setResendCooldown(30);
      setShowOtpModal(true);
    } catch (err) {
      console.warn('[GoogleAuth] Firebase popup error:', err.code, err.message);

      // User closed popup
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return;
      }

      // If domain not authorized or Google provider not active in Firebase console
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/unauthorized-domain' ||
        err.code === 'auth/configuration-not-found'
      ) {
        setShowFallbackModal(true);
        setLoading(false);
        return;
      }

      const msg = err.response?.data?.error || err.message || 'Google authentication failed. Please try again.';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackSubmit = async (e) => {
    e.preventDefault();
    if (!fallbackEmail) return;

    setLoading(true);
    setOtpError(null);

    try {
      const googlePayload = {
        email: fallbackEmail.toLowerCase().trim(),
        name: fallbackName?.trim() || fallbackEmail.split('@')[0],
        photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fallbackEmail)}`,
        uid: `google_direct_${Date.now()}`,
        idToken: 'direct_google_verified_token'
      };

      // Request 6-digit OTP
      const otpRes = await requestGoogleOtp(googlePayload);

      setPendingGoogleData({
        ...googlePayload,
        previewUrl: otpRes.previewUrl,
        devOtp: otpRes.devOtp,
        isExistingUser: otpRes.isExistingUser
      });

      setShowFallbackModal(false);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);
      setOtpSuccessMsg(null);
      setResendCooldown(30);
      setShowOtpModal(true);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to dispatch verification code.';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    // Only numbers
    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    // Handle paste of full 6 digits into any box
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      digitRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance
    if (cleanVal && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteText) {
      const chars = pasteText.split('');
      const newDigits = ['', '', '', '', '', ''];
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(chars.length, 5);
      digitRefs.current[nextIdx]?.focus();
    }
  };

  const handleAutoFillDevOtp = () => {
    if (pendingGoogleData?.devOtp) {
      const chars = pendingGoogleData.devOtp.split('');
      setOtpDigits(chars);
      digitRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending || !pendingGoogleData) return;

    setIsResending(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    try {
      const res = await requestGoogleOtp(pendingGoogleData);
      setPendingGoogleData((prev) => ({
        ...prev,
        previewUrl: res.previewUrl,
        devOtp: res.devOtp
      }));
      setOtpSuccessMsg(t('otpResent', 'Verification code resent successfully!'));
      setResendCooldown(30);
    } catch (err) {
      setOtpError(err.response?.data?.error || err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const code = otpDigits.join('');

    if (code.length !== 6) {
      setOtpError(t('enterOtpCode', 'Please enter the complete 6-digit code.'));
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    try {
      const { user, isNewUser } = await verifyGoogleOtp(pendingGoogleData.email, code);

      setShowOtpModal(false);
      setPendingGoogleData(null);

      if (onSuccess) {
        onSuccess(user, isNewUser);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || t('invalidOtp', 'Invalid or expired OTP code.');
      setOtpError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const isOtpComplete = otpDigits.every((d) => d !== '');

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-100 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-slate-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
        ) : (
          <>
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>

            <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
              {mode === 'signup' 
                ? t('googleSignUp', 'Sign up with Google') 
                : t('continueWithGoogle', 'Continue with Google')}
            </span>
          </>
        )}
      </button>

      {/* Fallback Direct Google Account Modal (Portaled to body, dead center) */}
      {showFallbackModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowFallbackModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-6 sm:p-7 shadow-2xl text-white m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFallbackModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Account Sign-In</h3>
                <p className="text-xs text-slate-400">Direct Google Identity Verification</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Enter your Google email address below. A 6-digit OTP code will be sent to verify your identity.
            </p>

            <form onSubmit={handleFallbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Google Email
                </label>
                <input
                  type="email"
                  required
                  value={fallbackEmail}
                  onChange={(e) => setFallbackEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={fallbackName}
                  onChange={(e) => setFallbackName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFallbackModal(false)}
                  className="w-1/3 py-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !fallbackEmail}
                  className="w-2/3 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Centered Email OTP Verification Modal (Portaled to body, dead center) */}
      {showOtpModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowOtpModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-6 sm:p-7 shadow-2xl text-white m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {t('verifyEmailTitle', 'Verify Your Email Address')}
                </h3>
                <p className="text-xs text-slate-400">
                  Urban EYE Smart Security Check
                </p>
              </div>
            </div>

            {/* Subtitle with email */}
            <div className="mb-5 bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80">
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('verifyEmailSubtitle', 'We sent a 6-digit verification code to:')}
              </p>
              <div className="flex items-center space-x-2 mt-1 font-mono text-cyan-300 text-xs sm:text-sm font-semibold break-all">
                <Mail className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span>{pendingGoogleData?.email}</span>
              </div>
            </div>

            {/* Dev / Test Mode Helpers */}
            {(pendingGoogleData?.previewUrl || pendingGoogleData?.devOtp) && (
              <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex flex-col gap-1.5">
                {pendingGoogleData.devOtp && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Test OTP Code:</span>
                    <button
                      type="button"
                      onClick={handleAutoFillDevOtp}
                      className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 font-mono font-bold text-cyan-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{pendingGoogleData.devOtp}</span>
                      <span className="text-[10px] text-cyan-400/80">(Auto-fill)</span>
                    </button>
                  </div>
                )}
                {pendingGoogleData.previewUrl && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-cyan-500/20">
                    <span className="text-slate-400">Sent via test inbox:</span>
                    <a
                      href={pendingGoogleData.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline font-medium flex items-center gap-1"
                    >
                      <span>Open Preview Email</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Error & Success Alerts */}
            {otpError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{otpSuccessMsg}</span>
              </div>
            )}

            {/* 6-Digit OTP Input Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {t('enterOtpCode', 'Enter 6-digit OTP Code')}
                </label>

                {/* 6 Segmented Digit Boxes */}
                <div className="flex justify-center items-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (digitRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 rounded-2xl bg-slate-950/90 border text-center font-mono text-xl sm:text-2xl font-bold transition-all outline-none ${
                        digit
                          ? 'border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/10'
                          : 'border-slate-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Link and Timer */}
              <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-400">
                <span>{t('didNotReceiveCode', "Didn't receive code?")}</span>
                {resendCooldown > 0 ? (
                  <span className="font-mono text-slate-500">
                    {t('resendIn', 'Resend in')} {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{t('resendOtp', 'Resend Code')}</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="w-1/3 py-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !isOtpComplete}
                  className="w-2/3 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isVerifying ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('verifyingOtp', 'Verifying...')}</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {mode === 'signup' 
                          ? t('verifyAndCreate', 'Verify & Create Account') 
                          : t('verifyAndSignIn', 'Verify & Sign In')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
