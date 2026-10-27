import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertTriangle, Fingerprint, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import WatermarkBackground from '../components/WatermarkBackground';

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
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[#F6EBE8] font-sans selection:bg-[#302B69] selection:text-white">
      <WatermarkBackground />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Main Pure White Card */}
        <div className="w-full bg-white border border-[#E8E2E5] rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-7">
            
            {/* Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-[#302B69] shadow-xs flex items-center justify-center mb-4 text-white">
              <Shield className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#191636] mb-1">
              Command Center
            </h1>

            <div className="flex items-center space-x-1.5 text-xs text-[#57536E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#302B69]"></span>
              <span className="font-semibold uppercase tracking-wider text-[11px] text-[#302B69]">Authorized Municipal Access</span>
            </div>
          </div>

          {adminError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{adminError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#57536E] mb-1.5 uppercase tracking-wider">
                ADMIN EMAIL
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C87A6] group-focus-within/input:text-[#302B69] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@urbaneye.local"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs sm:text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#57536E] mb-1.5 uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C87A6] group-focus-within/input:text-[#302B69] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#E8E2E5] text-[#191636] text-xs sm:text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C87A6] hover:text-[#191636] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#302B69] hover:bg-[#242052] text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span className="uppercase tracking-wider">
                    Authenticate
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Minimalist Footer */}
          <div className="mt-7 pt-5 border-t border-[#E8E2E5] text-center">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#302B69] hover:text-[#242052] transition-colors cursor-pointer"
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
