import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import {
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  BadgeAlert,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export default function DeptAdminApplyPage() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    password: '',
    requestedDepartmentId: '',
    requestedDepartmentName: '',
    officialDesignation: '',
    verificationNotes: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);
  const [error, setError] = useState(null);

  // Status check tab
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' | 'status'
  const [statusEmail, setStatusEmail] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setLoadingDepts(true);
        const res = await client.get('/api/admin-requests/departments');
        setDepartments(res.data.departments || []);
      } catch (err) {
        console.error('Failed to load departments:', err);
        setError('Could not load active departments list.');
      } finally {
        setLoadingDepts(false);
      }
    }
    fetchDepartments();
  }, []);

  const handleDeptSelect = (deptId) => {
    const selected = departments.find(d => d._id === deptId);
    setFormData(prev => ({
      ...prev,
      requestedDepartmentId: deptId,
      requestedDepartmentName: selected ? selected.name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.requestedDepartmentId) {
      setError('Please select a target municipal department.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await client.post('/api/admin-requests/apply', formData);
      setSubmitted(true);
      setApplicationResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!statusEmail) return;
    setStatusError(null);
    setStatusLoading(true);
    setStatusResult(null);

    try {
      const res = await client.get(`/api/admin-requests/status/${encodeURIComponent(statusEmail)}`);
      setStatusResult(res.data);
    } catch (err) {
      setStatusError(err.response?.data?.error || 'No application record found for this email.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06171B] text-slate-100 flex flex-col justify-between selection:bg-[#00897B] selection:text-white relative overflow-hidden">
      {/* Background Cyber-Civic Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#00897B]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-[#005C66]/15 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00394015_1px,transparent_1px),linear-gradient(to_bottom,#00394015_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-teal-900/40 backdrop-blur-md bg-[#06171B]/80 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005C66] to-[#00897B] flex items-center justify-center shadow-lg shadow-teal-950/50 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-base font-black tracking-wider uppercase text-white block">Urban EYE</span>
            <span className="text-[10px] text-teal-400 font-semibold tracking-widest uppercase block">Officer Access Hub</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            to="/admin-login"
            className="text-xs font-semibold text-teal-300 hover:text-white px-3.5 py-2 rounded-lg bg-teal-950/60 border border-teal-800/50 hover:bg-teal-900/40 transition-colors"
          >
            Admin Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === 'apply'
                ? 'bg-[#00897B] text-white shadow-lg shadow-teal-900/40'
                : 'bg-teal-950/40 text-slate-400 hover:text-slate-200 border border-teal-900/40'
            }`}
          >
            New Officer Application
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === 'status'
                ? 'bg-[#00897B] text-white shadow-lg shadow-teal-900/40'
                : 'bg-teal-950/40 text-slate-400 hover:text-slate-200 border border-teal-900/40'
            }`}
          >
            Check Application Status
          </button>
        </div>

        {activeTab === 'apply' ? (
          submitted ? (
            /* Success confirmation card */
            <div className="bg-[#092227]/90 border border-teal-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center max-w-xl mx-auto">
              <div className="w-20 h-20 bg-teal-500/20 border border-teal-400/40 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-300 animate-pulse">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Application Submitted for Vetting</h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Thank you, <span className="text-teal-300 font-semibold">{formData.applicantName}</span>. Your request to represent the{' '}
                <span className="text-teal-300 font-semibold">{formData.requestedDepartmentName}</span> department has been securely queued.
              </p>

              <div className="bg-[#06171B] border border-teal-900/70 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Application ID</span>
                  <span className="font-mono text-teal-300 font-semibold">{applicationResult?.requestId || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Target Department</span>
                  <span className="text-white font-medium">{formData.requestedDepartmentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-950">
                  <span className="text-slate-400">Official Email</span>
                  <span className="text-white font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Initial Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PENDING SUPER ADMIN APPROVAL
                  </span>
                </div>
              </div>

              <div className="bg-teal-950/60 border border-teal-800/40 rounded-xl p-3.5 mb-8 text-xs text-teal-200/90 text-left flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <p>
                  As soon as the Super Administrator approves your credentials, your account will be activated and you can sign in to the Department Command Center using your email and password.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      applicantName: '',
                      email: '',
                      phone: '',
                      password: '',
                      requestedDepartmentId: '',
                      requestedDepartmentName: '',
                      officialDesignation: '',
                      verificationNotes: ''
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/60"
                >
                  Submit Another
                </button>
                <Link
                  to="/admin-login"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00897B] hover:bg-[#00796B] shadow-lg shadow-teal-950/40"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Application Form Card */
            <div className="bg-[#092227]/80 border border-teal-800/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              
              {/* Header Banner */}
              <div className="mb-8 border-b border-teal-900/60 pb-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Municipal Registration</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Apply for Department Administrator Role
                </h1>
                <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  Municipal officers and department directors can request access to their department's dedicated Urban EYE resolution portal. Every request undergoes mandatory verification by the Super Administrator.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex items-start space-x-3 text-rose-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Target Department Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-2">
                    1. Select Municipal Department <span className="text-rose-400">*</span>
                  </label>
                  {loadingDepts ? (
                    <div className="text-xs text-slate-400 py-3">Loading active municipal departments...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {departments.map((dept) => {
                        const isSelected = formData.requestedDepartmentId === dept._id;
                        return (
                          <div
                            key={dept._id}
                            onClick={() => handleDeptSelect(dept._id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#005C66]/50 border-teal-400 shadow-lg shadow-teal-950/40 ring-1 ring-teal-400'
                                : 'bg-[#06171B]/60 border-teal-900/60 hover:border-teal-700/80 hover:bg-[#06171B]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-white">{dept.name}</span>
                              <Building2 className={`w-4 h-4 ${isSelected ? 'text-teal-300' : 'text-slate-500'}`} />
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{dept.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {(dept.categories || []).slice(0, 3).map((cat, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-900">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Personal & Contact Details */}
                <div className="pt-4 border-t border-teal-900/60">
                  <span className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-4">
                    2. Officer Credentials & Contact
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Official Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={formData.applicantName}
                          onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                          placeholder="e.g. Inspector Ramesh Sharma"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06171B] border border-teal-900/70 text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Designation / Title *</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={formData.officialDesignation}
                          onChange={(e) => setFormData({ ...formData, officialDesignation: e.target.value })}
                          placeholder="e.g. Executive Engineer, Road Division 4"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06171B] border border-teal-900/70 text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Work Email *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. ramesh.sharma@noidaauthority.in"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06171B] border border-teal-900/70 text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06171B] border border-teal-900/70 text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Set Password for Future Login * (Min 8 chars, 1 uppercase, 1 special character)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#06171B] border border-teal-900/70 text-white text-xs focus:outline-none focus:border-teal-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Verification Details */}
                <div className="pt-4 border-t border-teal-900/60">
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
                    3. Official Verification Notes & Jurisdiction
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Provide municipal employee ID, office location, jurisdiction ward, or any authorization reference for fast verification by the Super Administrator.
                  </p>
                  <textarea
                    rows={3}
                    value={formData.verificationNotes}
                    onChange={(e) => setFormData({ ...formData, verificationNotes: e.target.value })}
                    placeholder="e.g. Employee ID: UP-PWD-84920, Sector 62 Office, Noida Authority."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#06171B] border border-teal-900/70 text-white text-xs focus:outline-none focus:border-teal-400 resize-none"
                  />
                </div>

                {/* Notice Callout */}
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/30 flex items-start space-x-3 text-xs text-amber-200">
                  <BadgeAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Security Notice: </span>
                    Submitting this form does not immediately grant administrator access. Your application will be held in PENDING status until verified and approved by the Super Administrator.
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-4">
                  <Link
                    to="/admin-login"
                    className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting || loadingDepts}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#005C66] to-[#00897B] hover:from-[#004e57] hover:to-[#00796B] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-teal-950/50 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Application for Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          /* Check Application Status Tab */
          <div className="bg-[#092227]/80 border border-teal-800/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-2">Check Application Status</h2>
            <p className="text-xs text-slate-300 mb-6">
              Enter the official email you used when submitting your Department Administrator request.
            </p>

            {statusError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleCheckStatus} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={statusEmail}
                    onChange={(e) => setStatusEmail(e.target.value)}
                    placeholder="e.g. officer@department.gov"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06171B] border border-teal-900/70 text-white text-xs focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={statusLoading}
                className="w-full py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {statusLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Check Application Status</span>
                  </>
                )}
              </button>
            </form>

            {statusResult && (
              <div className="bg-[#06171B] border border-teal-900/80 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="text-white font-semibold">{statusResult.applicantName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-teal-300 font-semibold">{statusResult.requestedDepartmentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Application Date:</span>
                  <span className="text-slate-300">{new Date(statusResult.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-teal-950">
                  <span className="text-slate-400">Status:</span>
                  {statusResult.status === 'approved' ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      APPROVED & ACTIVATED
                    </span>
                  ) : statusResult.status === 'rejected' ? (
                    <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      REJECTED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      PENDING REVIEW
                    </span>
                  )}
                </div>

                {statusResult.status === 'approved' && (
                  <div className="mt-4 pt-3 border-t border-teal-900/60">
                    <p className="text-teal-200 text-xs mb-3">
                      Your application has been approved! You can now log in using your email and password.
                    </p>
                    <Link
                      to="/admin-login"
                      className="block text-center w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                    >
                      Go to Sign In &rarr;
                    </Link>
                  </div>
                )}

                {statusResult.status === 'rejected' && statusResult.rejectionReason && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-[11px]">
                    <span className="font-semibold">Reason for rejection:</span> {statusResult.rejectionReason}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-teal-950 py-4 px-6 text-center text-xs text-slate-500">
        Urban EYE &copy; 2026. Municipal Officer Governance & Issue Dispatch.
      </footer>
    </div>
  );
}

