import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertTriangle, Fingerprint } from 'lucide-react';

export default function AdminLoginPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#05080f]">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/0 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* ============================== */}
        {/* ADMIN LOGIN PORTAL             */}
        {/* ============================== */}
        <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-indigo-500/20 rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 rounded-2xl border border-indigo-500/30 animate-pulse"></div>
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black tracking-widest uppercase text-white mb-1">Command Center</h2>
            <div className="flex items-center space-x-2 text-indigo-400 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>SECURE ACCESS ONLY</span>
            </div>
          </div>

          {adminError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-300">{adminError}</div>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                Admin Identifier
              </label>
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 border border-slate-800 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                Secure Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 border border-slate-800 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 relative group/btn overflow-hidden rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors border border-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              <div className="px-6 py-4 flex items-center justify-center space-x-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 text-white" />
                    <span className="text-sm font-bold text-white uppercase tracking-widest">Authenticate</span>
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-600 text-[9px] font-mono uppercase tracking-widest mb-4">
              Unauthorized access is strictly prohibited
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="text-indigo-400/60 hover:text-indigo-300 text-xs font-semibold"
            >
              ← Return to Citizen Portal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
