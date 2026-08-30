import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Phone, CheckCircle, MapPin, Users, Activity, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
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
        callback: (response) => {
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
        await login(citizenEmail, citizenPassword);
        navigate('/dashboard');
      } else {
        if (!window.confirmationResult) {
          throw new Error('Please request an OTP first.');
        }
        const result = await window.confirmationResult.confirm(otp);
        const firebaseUser = result.user;
        const idToken = await firebaseUser.getIdToken();
        
        await loginWithPhone(firebaseUser.phoneNumber || citizenPhone, idToken);
        navigate('/dashboard');
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
    
    const formattedPhone = citizenPhone.startsWith('+') ? citizenPhone : `+1${citizenPhone.replace(/\D/g, '')}`;
    
    setCitizenError(null);
    setOtpSuccessMsg('');
    setLoading(true);
    
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      
      setOtpSent(true);
      setOtpSuccessMsg('OTP sent successfully via Firebase!');
    } catch (err) {
      console.error('Firebase SMS Error:', err);
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
    <div className="min-h-screen flex bg-[#05080f] selection:bg-cyan-500 selection:text-white">
      
      {/* LEFT SIDE: Hero / Stats Split Screen */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 border-r border-slate-800">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/80 via-slate-900/90 to-black/90"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          {/* Logo Area */}
          <Logo size="lg" subtitle="Active Watch" />

          {/* Hero Content */}
          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Empowering citizens.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Improving cities.
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-md">
              Join thousands of residents actively monitoring and reporting urban infrastructure issues in real-time.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="glass-panel p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                <Users className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-2xl font-bold text-white">{stats.activeCitizens}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Citizens</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                <div className="text-2xl font-bold text-white">{stats.issuesResolved}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Issues Resolved</div>
              </div>
            </div>
          </div>

          <div className="flex items-center text-slate-400 text-sm space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure & encrypted connection</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Mobile background (hidden on desktop) */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-900/0 to-transparent"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center justify-center space-x-4 mb-10">
            <Logo size="md" subtitle="" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Sign in to your citizen portal to continue.</p>
          </div>

          {/* Login Method Tabs */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl mb-8 shadow-inner border border-white/5">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setCitizenError(null); }}
              className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-all ${
                loginMethod === 'email' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setCitizenError(null); }}
              className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-all ${
                loginMethod === 'phone' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Phone (OTP)
            </button>
          </div>

          {citizenError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{citizenError}</span>
            </div>
          )}

          {otpSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCitizenSubmit} className="space-y-6">
            {loginMethod === 'email' ? (
              <>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-300 mb-2 uppercase tracking-wider">Email Address</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-slate-300 mb-2 uppercase tracking-wider">Password</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={citizenPassword}
                      onChange={(e) => setCitizenPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-300 mb-2 uppercase tracking-wider">Phone Number</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      required
                      disabled={otpSent}
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner disabled:opacity-50"
                    />
                  </div>
                </div>
                
                {otpSent && (
                  <div className="animate-fade-in">
                    <label className="block text-[12px] font-semibold text-slate-300 mb-2 uppercase tracking-wider">One-Time Password</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner tracking-widest font-mono text-lg"
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
                className="w-full py-4 rounded-xl text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || (loginMethod === 'phone' && !otpSent)}
                className="w-full py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{loginMethod === 'phone' ? 'Verify & Sign In' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
            
            <div id="recaptcha-container"></div>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              New to Urban EYE?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold">
                Create account
              </Link>
            </p>
            <Link to="/admin-login" className="text-[10px] uppercase font-bold tracking-widest text-slate-600 hover:text-indigo-400 transition-colors">
              Official Access
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
