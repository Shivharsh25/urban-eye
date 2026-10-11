import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { Eye, User, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Phone, Globe } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#090d16]">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl glass-panel relative overflow-hidden">
        
        {/* Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Language Toggle */}
        <div className="flex justify-end mb-4 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 shadow-md">
            <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  lang === l.code
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4 ring-1 ring-white/10">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-1">
            {t('citizenRegistration', 'Citizen Registration')}
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            {t('joinGrid', 'Join the city-wide intelligent reporting grid')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
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
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 absolute">
              {t('orRegisterWithEmail', 'Or register with email')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('fullName', 'Full Name')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Citizen"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('emailAddress', 'Email Address')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('phoneNumber', 'Phone Number')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('password', 'Password')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
            </div>
            
            {/* Password Requirements UI */}
            <div className="mt-3 space-y-1.5 px-1">
              <div className={`text-[10px] flex items-center space-x-2 transition-colors ${requirements.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.length ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                <span>At least 8 characters</span>
              </div>
              <div className={`text-[10px] flex items-center space-x-2 transition-colors ${requirements.uppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.uppercase ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                <span>One uppercase letter</span>
              </div>
              <div className={`text-[10px] flex items-center space-x-2 transition-colors ${requirements.lowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.lowercase ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                <span>One lowercase letter</span>
              </div>
              <div className={`text-[10px] flex items-center space-x-2 transition-colors ${requirements.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.number ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                <span>One number</span>
              </div>
              <div className={`text-[10px] flex items-center space-x-2 transition-colors ${requirements.special ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.special ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                <span>One special character (!@#$...)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">Citizen role automatically assigned. Password securely hashed with bcrypt.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
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

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>{t('alreadyRegistered', 'Already have an account?')} </span>
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1">
            {t('signIn', 'Sign in')}
          </Link>
        </div>

      </div>
    </div>
  );
}
