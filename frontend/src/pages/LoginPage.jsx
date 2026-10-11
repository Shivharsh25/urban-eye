import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { Lock, Mail, ArrowRight, AlertCircle, Phone, CheckCircle, MapPin, Users, Activity, ShieldCheck, Globe } from 'lucide-react';
import Logo from '../components/Logo';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import api from '../api/client';

export default function LoginPage() {
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [otpSent, setOtpSent] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  
  const [citizenError, setCitizenError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ activeCitizens: '12.4k+', issuesResolved: '45k+' });

  const { login, loginWithPhone } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  // Fetch Public Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/stats/public-summary');
        setStats({
          activeCitizens: data.activeCitizens > 1000 ? `${(data.activeCitizens / 1000).toFixed(1)}k+` : data.activeCitizens.toString(),
          issuesResolved: data.issuesResolved > 1000 ? `${(data.issuesResolved / 1000).toFixed(1)}k+` : data.issuesResolved.toString()
        });
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Setup reCAPTCHA
  React.useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired.
        }
      });
    }
  }, []);

  const handleCitizenSubmit = async (e) => {
    e.preventDefault();
    setCitizenError(null);
    setLoading(true);

    try {
      if (loginMethod === 'email') {
        const loggedInUser = await login(citizenEmail, citizenPassword);
        if (loggedInUser?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (!window.confirmationResult) {
          throw new Error('Please request an OTP first.');
        }
        const result = await window.confirmationResult.confirm(otp);
        const firebaseUser = result.user;
        const idToken = await firebaseUser.getIdToken();
        
        const loggedInUser = await loginWithPhone(firebaseUser.phoneNumber || citizenPhone, idToken);
        if (loggedInUser?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') {
        setCitizenError('Invalid OTP code. Please try again.');
      } else {
        setCitizenError(err.response?.data?.error || err.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!citizenPhone) {
      setCitizenError('Please enter your phone number.');
      return;
    }

    try {
      setCitizenError(null);
      setLoading(true);

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, citizenPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      
      setOtpSent(true);
      setOtpSuccessMsg('Verification code sent successfully!');
    } catch (err) {
      console.error('SMS Send Error:', err);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          grecaptcha.reset(widgetId);
        });
      }
      setCitizenError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white selection:bg-blue-600 selection:text-white relative font-sans">
      
      {/* LEFT SIDE: Hero / Stats Split Screen */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/40 border-r border-slate-200">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-slate-50/90 to-slate-100/95"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          {/* Logo Area */}
          <Logo size="lg" subtitle="Civic Watch" />

          {/* Hero Content */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              {t('empoweringCitizens', 'Empowering citizens.')}<br />
              <span className="text-blue-600">
                {t('improvingCities', 'Improving cities.')}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-md font-normal leading-relaxed">
              {t('joinThousands', 'Join thousands of residents actively monitoring and reporting urban infrastructure issues in real-time.')}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Users className="w-5 h-5 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-slate-900">{stats.activeCitizens}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t('activeBadge', 'Active Citizens')}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
                <div className="text-2xl font-bold text-slate-900">{stats.issuesResolved}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t('issuesResolved', 'Issues Resolved')}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center text-slate-500 text-sm space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('secureConnection', 'Secure & encrypted connection')}</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-white">
        <div className="w-full max-w-md relative z-10 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Top Side-by-Side Language Toggle */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold shadow-inner">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'hi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center justify-center space-x-4 mb-6">
            <Logo size="md" subtitle="" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1.5">{t('welcomeBack', 'Welcome Back')}</h2>
            <p className="text-slate-500 text-sm">{t('signInSubtitle', 'Sign in to your citizen portal to continue.')}</p>
          </div>

          {/* Google Sign-In */}
          <div className="mb-6">
            <GoogleAuthButton 
              mode="signin"
              onSuccess={(user) => {
                if (user?.role === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/dashboard');
                }
              }}
              onError={(err) => setCitizenError(err)}
            />

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
                {t('orContinueWith', 'Or continue with')}
              </span>
            </div>
          </div>

          {/* Login Method Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shadow-inner border border-slate-200">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setCitizenError(null); }}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                loginMethod === 'email' 
                  ? 'bg-white text-slate-900 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('emailLogin', 'Email Login')}
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setCitizenError(null); }}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                loginMethod === 'phone' 
                  ? 'bg-white text-slate-900 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('phoneOtp', 'Phone (OTP)')}
            </button>
          </div>

          {citizenError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{citizenError}</span>
            </div>
          )}

          {otpSuccessMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start space-x-2.5">
              <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCitizenSubmit} className="space-y-4">
            {loginMethod === 'email' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">{t('emailAddress', 'Email Address')}</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">{t('password', 'Password')}</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={citizenPassword}
                      onChange={(e) => setCitizenPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">{t('phoneNumber', 'Phone Number')}</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="tel"
                      required
                      disabled={otpSent}
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 shadow-sm"
                    />
                  </div>
                </div>
                
                {otpSent && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">{t('oneTimePassword', 'One-Time Password')}</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all tracking-widest font-mono text-base shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {loginMethod === 'phone' && !otpSent ? (
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading || !citizenPhone}
                className="w-full py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                  <span>{t('sendVerificationCode', 'Send Verification Code')}</span>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || (loginMethod === 'phone' && !otpSent)}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{loginMethod === 'phone' ? t('verifyAndSignIn', 'Verify & Sign In') : t('signIn', 'Sign In')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
            
            <div id="recaptcha-container"></div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {t('newToUrbanEye', 'New to Urban EYE?')}{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                {t('createAccount', 'Create account')}
              </Link>
            </p>
            <Link to="/admin-login" className="text-[11px] font-semibold tracking-wider text-slate-500 hover:text-slate-800 transition-colors uppercase">
              {t('officialAccess', 'Official Access')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
