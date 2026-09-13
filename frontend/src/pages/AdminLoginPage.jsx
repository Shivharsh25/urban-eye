import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Lock, 
  Mail, 
  AlertTriangle, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Crosshair, 
  KeyRound,
  Zap,
  Activity,
  ShieldAlert,
  Server
} from 'lucide-react';

export default function AdminLoginPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setLoading(true);

    try {
      const loggedInUser = await login(adminEmail, adminPassword);
      if (loggedInUser.role !== 'admin') {
        setAdminError('ACCESS DENIED // Unauthorized role. Only municipal command operators may authenticate.');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setAdminError(err.response?.data?.error || 'Authentication failed. Check your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setAdminEmail('admin@urbaneye.local');
    setAdminPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#040711] font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Futuristic Cyber Ambient Lighting & Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse-glow"></div>
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[160px]"></div>

        {/* 3D Perspective Cyber Floor Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

        {/* Horizontal Laser Scanning Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-[150%] animate-[scan_6s_linear_infinite]"></div>
      </div>

      {/* 2. Main Login Terminal Card */}
      <div className="w-full max-w-lg relative z-10 flex flex-col items-center">
        
        {/* Outer Command Center Terminal Shell */}
        <div className="w-full bg-[#080d1a]/85 backdrop-blur-3xl border border-indigo-500/30 rounded-[2.5rem] p-7 sm:p-10 shadow-[0_0_60px_rgba(79,70,229,0.25)] relative overflow-hidden group">
          
          {/* Top Neon Laser Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"></div>

          {/* Futuristic Terminal Corner Brackets */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-400/70 rounded-tl pointer-events-none"></div>
          <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-400/70 rounded-tr pointer-events-none"></div>
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-400/70 rounded-bl pointer-events-none"></div>
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-400/70 rounded-br pointer-events-none"></div>

          {/* Top Security Status Capsule */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                TUNNEL: SHA-256 TLS
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-mono text-indigo-400/80 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              <ShieldAlert className="w-3 h-3 text-indigo-400" />
              <span>SECURITY LEVEL 4</span>
            </div>
          </div>

          {/* Holographic Shield & Biometric Emblem Header */}
          <div className="flex flex-col items-center text-center mb-7">
            
            {/* 3D Animated Levitating Emblem */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-4 animate-float-slow">
              
              {/* Multi-Color Cyber Aura */}
              <div className="absolute inset-[-6px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 rounded-3xl opacity-50 blur-xl animate-pulse-glow"></div>
              
              {/* Rotating Dashed Orbital Cyber Ring */}
              <div className="absolute inset-[-4px] rounded-3xl border border-dashed border-indigo-400/50 animate-[spin_10s_linear_infinite] pointer-events-none"></div>
              
              {/* Inner Shield Capsule */}
              <div className="relative w-full h-full rounded-2xl bg-slate-950/90 border border-indigo-500/50 shadow-2xl flex items-center justify-center backdrop-blur-md overflow-hidden group-hover:border-indigo-400 transition-colors">
                
                {/* Background Crosshairs */}
                <Crosshair className="absolute w-14 h-14 text-indigo-500/20" strokeWidth={1} />
                
                {/* Center Glowing Shield */}
                <Shield className="w-9 h-9 text-indigo-400 filter drop-shadow-[0_0_12px_rgba(129,140,248,0.8)] relative z-10" />

                {/* Sweeping Laser Scanner Bar */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-400/25 to-transparent h-[200%] animate-[scan_2.5s_linear_infinite] pointer-events-none"></div>
              </div>
            </div>

            {/* Typography */}
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center justify-center gap-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <span>Command</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]">
                Center
              </span>
            </h2>

            <p className="text-[11px] text-slate-400 font-mono mt-1.5 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>RESTRICTED ACCESS // AUTHORIZED PERSONNEL ONLY</span>
            </p>
          </div>

          {/* Error Message */}
          {adminError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-3 text-rose-300 animate-shake shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs font-mono font-semibold leading-relaxed">{adminError}</div>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            
            {/* Admin Identifier */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  <span>&gt; ADMIN_IDENTIFIER</span>
                </label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group/q"
                  title="Auto-fill demo administrator login"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400 group-hover/q:rotate-12 transition-transform" />
                  <span>Fill Demo Credentials</span>
                </button>
              </div>

              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@urbaneye.local"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
                />
              </div>
            </div>

            {/* Secure Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-indigo-400" />
                  <span>&gt; ACCESS_PASSPHRASE</span>
                </label>
              </div>

              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-300 transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Biometric Authenticate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 relative group/btn overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {/* Shimmer Sheen Layer */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>

              <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-3.5 px-6 rounded-[23px] flex items-center justify-center space-x-2.5 text-white">
                {loading ? (
                  <div className="flex items-center space-x-2 font-mono text-xs font-bold tracking-widest">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>VERIFYING CREDENTIALS...</span>
                  </div>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 text-cyan-300 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs font-mono font-bold tracking-[0.18em] uppercase">
                      Authenticate Access
                    </span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Warning & Back Link */}
          <div className="mt-7 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>UNAUTHORIZED ACCESS IS STRICTLY MONITORED &amp; LOGGED</span>
            </p>
            
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-indigo-400 hover:text-cyan-300 transition-colors group/back"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover/back:-translate-x-1" />
              <span>Return to Citizen Portal</span>
            </button>
          </div>
        </div>

        {/* 3. Floating Infrastructure Telemetry Badges Under Card */}
        <div className="mt-5 grid grid-cols-3 gap-3 w-full text-center">
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
            <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">AI INFERENCE</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              YOLOv8 ONLINE
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
            <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">ENCRYPTION</span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 mt-0.5 block">
              AES-256 GCM
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
            <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">MUNICIPAL HUB</span>
            <span className="text-[10px] font-mono font-bold text-indigo-300 mt-0.5 block">
              DELHI-NCR 01
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
