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
    <div className="min-h-screen flex items-center justify-center p-4 relative selection:bg-[#302B69] selection:text-white bg-[#F6EBE8] font-sans">
      <WatermarkBackground />
      <div className="w-full max-w-md bg-white border border-[#E8E2E5] rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden text-[#191636]">
        
        {/* Top Language Toggle */}
        <div className="flex justify-end mb-4 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-[#F6F6FC] border border-[#E8E2E5] rounded-xl p-1">
            <Globe className="w-3.5 h-3.5 text-[#57536E] ml-1.5 mr-0.5" />
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  lang === l.code
                    ? 'bg-white text-[#191636] font-bold shadow-xs border border-[#E8E2E5]'
                    : 'text-[#57536E] hover:text-[#191636]'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#302B69] flex items-center justify-center shadow-xs mb-3 text-white">
            <Eye className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#191636] mb-1">
            {t('citizenRegistration', 'Citizen Registration')}
          </h2>
          <p className="text-xs text-[#57536E] font-medium">
            {t('joinGrid', 'Join the city-wide intelligent reporting grid')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-Up */}
        <div className="mb-5 relative z-10">
          <GoogleAuthButton 
            mode="signup"
            className="!bg-white !border-[#E8E2E5] !text-[#191636] hover:!bg-[#F6F6FC] shadow-xs"
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
            <div className="border-t border-[#E8E2E5] w-full"></div>
            <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-[#787399] absolute">
              {t('orRegisterWithEmail', 'Or register with email')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-[#57536E] uppercase tracking-wider mb-1.5">
              {t('fullName', 'Full Name')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C87A6] group-focus-within:text-[#302B69] transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Citizen"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs sm:text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#57536E] uppercase tracking-wider mb-1.5">
              {t('emailAddress', 'Email Address')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C87A6] group-focus-within:text-[#302B69] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs sm:text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#57536E] uppercase tracking-wider mb-1.5">
              {t('phoneNumber', 'Phone Number')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C87A6] group-focus-within:text-[#302B69] transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs sm:text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#57536E] uppercase tracking-wider mb-1.5">
              {t('password', 'Password')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C87A6] group-focus-within:text-[#302B69] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs sm:text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] transition-all shadow-xs"
              />
            </div>
            
            {/* Password Requirements UI */}
            <div className="mt-2.5 space-y-1 px-1">
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.length ? 'text-[#302B69] font-medium' : 'text-[#8C87A6]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.length ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}></div>
                <span>At least 8 characters</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.uppercase ? 'text-[#302B69] font-medium' : 'text-[#8C87A6]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.uppercase ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}></div>
                <span>One uppercase letter</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.lowercase ? 'text-[#302B69] font-medium' : 'text-[#8C87A6]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.lowercase ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}></div>
                <span>One lowercase letter</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.number ? 'text-[#302B69] font-medium' : 'text-[#8C87A6]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.number ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}></div>
                <span>One number</span>
              </div>
              <div className={`text-[11px] flex items-center space-x-2 transition-colors ${requirements.special ? 'text-[#302B69] font-medium' : 'text-[#8C87A6]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${requirements.special ? 'bg-[#302B69]' : 'bg-[#E8E2E5]'}`}></div>
                <span>One special character (!@#$...)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] text-[11px] text-[#57536E] flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#302B69] shrink-0 mt-0.5" />
            <span className="leading-relaxed">Citizen role automatically assigned. Password securely hashed.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#302B69] hover:bg-[#242052] shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{t('register', 'Complete Registration')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E8E2E5] text-center text-xs text-[#57536E]">
          <span>{t('alreadyRegistered', 'Already have an account?')} </span>
          <Link to="/login" className="text-[#302B69] hover:text-[#242052] font-semibold ml-1">
            {t('signIn', 'Sign in')}
          </Link>
        </div>

      </div>
    </div>
  );
}
