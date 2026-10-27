import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { Eye, User, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Phone, Globe } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import WatermarkBackground from '../components/WatermarkBackground';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  // Password requirements state
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[\W_]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!Object.values(requirements).every(Boolean)) {
        setError('Please meet all password requirements before registering.');
        setLoading(false);
        return;
      }

      await register(name, email, phone, password);
      navigate('/report');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative selection:bg-[#99775C] selection:text-white">
      <WatermarkBackground />
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xs border border-[#EAE7DD] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Top Language Toggle */}
        <div className="flex justify-end mb-4 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-slate-100 border border-slate-200 rounded-xl p-1">
            <Globe className="w-3.5 h-3.5 text-slate-600 ml-1.5 mr-0.5" />
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  lang === l.code
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center shadow-xs mb-3">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            {t('citizenRegistration', 'Citizen Registration')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t('joinGrid', 'Join the city-wide intelligent reporting grid')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-Up */}
        <div className="mb-6 relative z-10">
          <GoogleAuthButton 
            mode="signup"
            onSuccess={(user) => {
              if (user?.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            }}
            onError={(err) => setError(err)}
          />

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
              {t('orRegisterWithEmail', 'Or register with email')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('fullName', 'Full Name')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-600 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Citizen"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('emailAddress', 'Email Address')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-600 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('phoneNumber', 'Phone Number')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-600 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('password', 'Password')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-600 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-xs"
              />
            </div>
            
            {/* Password Requirements UI */}
            <div className="mt-2.5 space-y-1 px-1">
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.length ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.length ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                <span>At least 8 characters</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.uppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.uppercase ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                <span>One uppercase letter</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.lowercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.lowercase ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                <span>One lowercase letter</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.number ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.number ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                <span>One number</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.special ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.special ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                <span>One special character (!@#$...)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">Citizen role automatically assigned. Password securely hashed.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{t('register', 'Complete Registration')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
          <span>{t('alreadyRegistered', 'Already have an account?')} </span>
          <Link to="/login" className="text-sky-600 hover:text-sky-700 font-semibold ml-1">
            {t('signIn', 'Sign in')}
          </Link>
        </div>

      </div>
    </div>
  );
}
