import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertTriangle, Fingerprint, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
        setAdminError('Access denied. Unauthorized role.');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setAdminError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#05080f] font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Immersive Futuristic Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Ambient Neon Orbs */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse-glow"></div>
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] bg-cyan-500/15 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '1.8s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-purple-600/10 rounded-full blur-[160px]"></div>

        {/* Ambient Grid Matrix */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Main Glassmorphic Card */}
        <div className="w-full bg-slate-900/50 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/50 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-500">
          
          {/* Top Glowing Laser Edge */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Holographic Security Emblem Header */}
          <div className="flex flex-col items-center text-center mb-8">
            
            {/* 3D Levitating Emblem with Multi-Ring Orbitals */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-5 animate-float-slow">
              
              {/* Outer Radiant Glow Aura */}
              <div className="absolute inset-[-6px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 rounded-full opacity-40 blur-xl animate-pulse-glow"></div>
              
              {/* Primary Rotating Dashed Orbital Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/40 animate-[spin_12s_linear_infinite] pointer-events-none"></div>

              {/* Secondary Reverse Orbital Ring */}
              <div className="absolute inset-2 rounded-full border border-indigo-400/30 border-t-indigo-400 animate-[spin_8s_linear_infinite_reverse] pointer-events-none"></div>

              {/* Core Glass Shield */}
              <div className="relative w-16 h-16 rounded-2xl bg-slate-950/90 border border-indigo-400/50 shadow-[0_0_25px_rgba(99,102,241,0.4)] flex items-center justify-center backdrop-blur-md overflow-hidden group-hover:border-cyan-400/60 transition-colors">
                <Shield className="w-8 h-8 text-cyan-300 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] relative z-10 transition-transform duration-300 group-hover:scale-105" />
                
                {/* Vertical Laser Scan Beam */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-400/25 to-transparent h-[200%] animate-[scan_2.5s_linear_infinite] pointer-events-none"></div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-1.5">
              Command Center
            </h1>

            <div className="flex items-center space-x-2 text-slate-400 text-xs tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"></span>
              <span className="font-medium text-slate-300">Secure Access</span>
            </div>
          </div>

          {adminError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-start space-x-3 shadow-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">{adminError}</div>
            </div>
          )}

          {/* Minimal Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                Email
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@urbaneye.local"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/40 border border-slate-800/80 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-black/40 border border-slate-800/80 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-300 transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 relative group/btn overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 transition-all duration-300 border border-cyan-400/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-950/50 hover:shadow-cyan-900/30"
            >
              {/* Shimmer Sheen Layer */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              
              <div className="px-6 py-3.5 flex items-center justify-center space-x-2.5">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 text-cyan-200 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-white tracking-wider uppercase">
                      Authenticate
                    </span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Clean Minimalist Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors group/back"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover/back:-translate-x-1" />
              <span>Return to Citizen Portal</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
