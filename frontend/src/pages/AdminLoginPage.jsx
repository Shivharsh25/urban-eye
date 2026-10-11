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
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative bg-white font-sans selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Main Clean Bento Card */}
        <div className="w-full bento-card p-8 sm:p-10 shadow-sm relative">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 shadow-2xs">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
              Admin Portal
            </h1>

            <p className="text-xs text-slate-500 max-w-xs">
              Sign in with your official municipal operations credentials.
            </p>
          </div>

          {adminError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold text-rose-700">{adminError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@urbaneye.local"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Clean Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Citizen Portal</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
