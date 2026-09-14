import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Shield, Camera, Award, CheckCircle, 
  MapPin, Star, Clock, Zap, TrendingUp, Medal,
  Edit3, Upload, X, Save, Calendar, Phone, Bell, 
  ExternalLink, Download, Sparkles, AlertTriangle, 
  Trash2, Droplets, CheckCircle2, ChevronRight,
  FileText, LogOut, Check, SlidersHorizontal, Compass
} from 'lucide-react';
import client from '../api/client';
import DetectionModal from '../components/DetectionModal';
import { generateReportPDF } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage() {
  const { user, isAdmin, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'Citizen User',
    phone: '',
    neighborhood: 'Knowledge Park III, Greater Noida',
    about: 'Dedicated to community safety and municipal infrastructure maintenance. Actively identifying potholes, faulty lights, and drainage hazards.',
    photoUrl: null
  });

  // User notification & privacy preferences
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('urban_eye_preferences');
      return saved ? JSON.parse(saved) : {
        emailUpdates: true,
        smsAlerts: true,
        locationAutoTag: true,
        communityUpvotes: true
      };
    } catch {
      return {
        emailUpdates: true,
        smsAlerts: true,
        locationAutoTag: true,
        communityUpvotes: true
      };
    }
  });

  const fileInputRef = useRef(null);
  
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    civicScore: 85,
    rank: 'Active Citizen',
    joinDate: 'Oct 2025'
  });
  
  const [contributions, setContributions] = useState([]);
  const [contributionFilter, setContributionFilter] = useState('ALL'); // ALL, RESOLVED, IN_PROGRESS, REPORTED
  const [loading, setLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);

  // Sync profile data from user state / storage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`urban_eye_profile_${user.id || user._id}`);
      let localData = {};
      if (saved) {
        try {
          localData = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved profile data", e);
        }
      }
      
      setProfileData({
        name: user.name || localData.name || 'Citizen User',
        phone: user.phone || localData.phone || '',
        neighborhood: user.neighborhood || localData.neighborhood || 'Knowledge Park III, Greater Noida',
        about: user.bio || localData.about || 'Dedicated to community safety and municipal infrastructure maintenance. Actively identifying potholes, faulty lights, and drainage hazards.',
        photoUrl: user.photoUrl || localData.photoUrl || null
      });
    }
  }, [user]);

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Oct 2025';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    } catch {
      return 'Oct 2025';
    }
  };

  // Fetch stats and user's contributions
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [statsRes, detectionsRes] = await Promise.all([
          client.get('/api/stats/user-summary').catch(() => ({ data: {} })),
          client.get('/api/detections').catch(() => ({ data: { detections: [] } }))
        ]);
        
        const allUserReports = detectionsRes.data.detections || [];
        setContributions(allUserReports);

        const total = statsRes.data?.totalReports ?? allUserReports.length;
        const resolved = statsRes.data?.resolvedReports ?? allUserReports.filter(d => (d.status || '').toLowerCase() === 'resolved').length;
        const score = statsRes.data?.trustScore || (80 + resolved * 2);

        let rank = 'New Citizen';
        if (score >= 95) rank = 'Platinum Ambassador';
        else if (score >= 90) rank = 'Gold Guardian';
        else if (score >= 80) rank = 'Silver Sentinel';
        else rank = 'Bronze Contributor';

        setUserStats({
          totalReports: total,
          resolvedReports: resolved,
          civicScore: Math.min(score, 100),
          rank: rank,
          joinDate: formatJoinDate(user?.createdAt)
        });
      } catch (err) {
        console.error('Failed to fetch user profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile updates to backend and local storage
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // 1. Save to backend API
      const res = await client.patch('/api/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        bio: profileData.about,
        neighborhood: profileData.neighborhood,
        photoUrl: profileData.photoUrl
      }).catch(err => {
        console.warn('Backend profile update failed, persisting locally:', err.message);
        return { data: { user: profileData } };
      });

      // 2. Update AuthContext
      if (updateUser && res.data?.user) {
        updateUser(res.data.user);
      }

      // 3. Save to localStorage
      if (user?.id) {
        localStorage.setItem(`urban_eye_profile_${user.id}`, JSON.stringify(profileData));
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle preferences
  const handleTogglePreference = (key) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('urban_eye_preferences', JSON.stringify(next));
      return next;
    });
  };

  // Export full civic record as JSON
  const handleExportCivicRecord = () => {
    const exportData = {
      user: {
        id: user?.id,
        name: profileData.name,
        email: user?.email,
        phone: profileData.phone,
        neighborhood: profileData.neighborhood,
        joined: userStats.joinDate,
        civicScore: userStats.civicScore,
        rank: userStats.rank
      },
      stats: {
        totalReports: userStats.totalReports,
        resolvedReports: userStats.resolvedReports,
        resolutionRate: userStats.totalReports > 0 ? Math.round((userStats.resolvedReports / userStats.totalReports) * 100) : 100
      },
      reports: contributions.map(c => ({
        id: c.id || c._id,
        type: c.type,
        status: c.status,
        severity: c.severity,
        address: c.address,
        createdAt: c.createdAt
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UrbanEye_Civic_Portfolio_${profileData.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Civic tier perks & thresholds
  const tierInfo = useMemo(() => {
    const score = userStats.civicScore;
    if (score >= 95) {
      return {
        name: 'Platinum Ambassador',
        color: 'from-cyan-300 via-sky-400 to-indigo-500',
        textGradient: 'from-cyan-400 to-blue-400',
        threshold: 95,
        next: 100,
        perk: 'Direct municipal department head escalation priority'
      };
    }
    if (score >= 90) {
      return {
        name: 'Gold Guardian',
        color: 'from-amber-300 via-amber-400 to-orange-500',
        textGradient: 'from-amber-400 to-orange-400',
        threshold: 90,
        next: 95,
        perk: 'Priority dispatch & verified reporter badge'
      };
    }
    if (score >= 80) {
      return {
        name: 'Silver Sentinel',
        color: 'from-slate-200 via-slate-300 to-slate-400',
        textGradient: 'from-slate-200 to-slate-400',
        threshold: 80,
        next: 90,
        perk: 'Expedited AI incident triage and auto-routing'
      };
    }
    return {
      name: 'Bronze Contributor',
      color: 'from-orange-400 to-amber-600',
      textGradient: 'from-orange-400 to-amber-500',
      threshold: 0,
      next: 80,
      perk: 'Standard community reporting and live GPS dispatch'
    };
  }, [userStats.civicScore]);

  // Civic Achievements definition with live progress
  const achievements = [
    { 
      id: 1, 
      name: 'First Responder', 
      desc: 'Submit your first verified incident report',
      icon: Camera, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      unlocked: userStats.totalReports >= 1,
      progress: `${Math.min(userStats.totalReports, 1)}/1`
    },
    { 
      id: 2, 
      name: 'Pothole Hunter', 
      desc: 'Report 3 or more road surface hazards',
      icon: AlertTriangle, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      unlocked: contributions.filter(c => (c.type || '').includes('pothole') || (c.type || '').includes('road')).length >= 3,
      progress: `${Math.min(contributions.filter(c => (c.type || '').includes('pothole') || (c.type || '').includes('road')).length, 3)}/3`
    },
    { 
      id: 3, 
      name: 'Waste Buster', 
      desc: 'Report illegal dumping or uncollected garbage',
      icon: Trash2, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      unlocked: contributions.some(c => (c.type || '').includes('garbage') || (c.type || '').includes('waste')),
      progress: contributions.some(c => (c.type || '').includes('garbage') || (c.type || '').includes('waste')) ? 'Unlocked' : '0/1'
    },
    { 
      id: 4, 
      name: 'Aqua Sentinel', 
      desc: 'Report water main breaks or sewage leaks',
      icon: Droplets, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      unlocked: contributions.some(c => (c.type || '').includes('water') || (c.type || '').includes('leak')),
      progress: contributions.some(c => (c.type || '').includes('water') || (c.type || '').includes('leak')) ? 'Unlocked' : '0/1'
    },
    { 
      id: 5, 
      name: 'Night Watch', 
      desc: 'Report faulty streetlights to improve safety',
      icon: Zap, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      unlocked: contributions.some(c => (c.type || '').includes('light') || (c.type || '').includes('lamp')),
      progress: contributions.some(c => (c.type || '').includes('light') || (c.type || '').includes('lamp')) ? 'Unlocked' : '0/1'
    },
    { 
      id: 6, 
      name: 'Civic Pillar', 
      desc: 'Reach a civic trust score of 90 or higher',
      icon: Star, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      unlocked: userStats.civicScore >= 90,
      progress: `${userStats.civicScore}/90 pts`
    },
  ];

  // Filtered contributions list
  const filteredContributions = useMemo(() => {
    if (contributionFilter === 'ALL') return contributions;
    if (contributionFilter === 'RESOLVED') return contributions.filter(c => (c.status || '').toLowerCase() === 'resolved');
    if (contributionFilter === 'IN_PROGRESS') return contributions.filter(c => (c.status || '').toLowerCase() === 'in_progress' || (c.status || '').toLowerCase() === 'assigned');
    if (contributionFilter === 'REPORTED') return contributions.filter(c => (c.status || '').toLowerCase() === 'reported' || (c.status || '').toLowerCase() === 'new');
    return contributions;
  }, [contributions, contributionFilter]);

  const resolutionRate = userStats.totalReports > 0 ? Math.round((userStats.resolvedReports / userStats.totalReports) * 100) : 100;

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12 min-w-0 overflow-x-hidden font-sans">
      
      {/* Success Notification Toast */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500/90 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in border border-emerald-400/50">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">Profile updated successfully!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/70 w-full min-w-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">Citizen Profile</h1>
              <p className="text-xs sm:text-sm text-slate-400">Manage identity, track civic score, and view dispatch history</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all active:scale-95 shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}

          <button
            onClick={handleExportCivicRecord}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95 shadow-sm"
            title="Download your full civic portfolio in JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Record</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Identity Column + Right Analytics/History Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
        
        {/* Left Column: Identity, Tier & Badges */}
        <div className="lg:col-span-1 space-y-6 w-full min-w-0">
          
          {/* Identity Card */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/50 flex flex-col items-center text-center relative overflow-hidden group w-full min-w-0">
            {/* Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60"></div>
            
            {/* Avatar Section */}
            <div className="relative mb-4 mt-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 p-1 shadow-[0_0_25px_rgba(6,182,212,0.25)] relative">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
                   {profileData.photoUrl ? (
                     <img src={profileData.photoUrl} alt="Profile" className="w-full h-full object-cover relative z-10" />
                   ) : (
                     <>
                       <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                       <span className="text-3xl sm:text-4xl font-black text-white relative z-10">
                         {profileData.name?.charAt(0) || 'C'}
                       </span>
                     </>
                   )}
                </div>
                {/* Active Indicator beacon */}
                {!isEditing && (
                  <div className="absolute bottom-0 right-1 w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                  </div>
                )}
              </div>

              {/* Upload Photo Button (Only visible in Edit Mode) */}
              {isEditing && (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handlePhotoUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-colors"
                    title="Upload new photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Name & Basic Details */}
            <div className="w-full min-w-0">
              {isEditing ? (
                <div className="space-y-3 w-full text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone</label>
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Municipal Ward / Neighborhood</label>
                    <input 
                      type="text" 
                      value={profileData.neighborhood}
                      onChange={(e) => setProfileData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="e.g. Sector 20 / Greater Noida"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{profileData.name}</h2>
                  
                  <div className="flex flex-col items-center gap-1 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 truncate max-w-full">
                      <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{user?.email || 'citizen@urbaneye.local'}</span>
                    </span>

                    {profileData.phone && (
                      <span className="flex items-center gap-1.5 truncate max-w-full">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono">{profileData.phone}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1.5 text-slate-300 mt-0.5 truncate max-w-full">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{profileData.neighborhood}</span>
                    </span>

                    <span className="flex items-center gap-1.5 text-slate-500 mt-1 font-mono text-[11px] uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                      Active since {userStats.joinDate}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* About / Civic Statement */}
            <div className="mt-5 w-full pt-4 border-t border-slate-800/70 text-left">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Civic Statement</h3>
              {isEditing ? (
                <textarea 
                  value={profileData.about}
                  onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                  rows="3"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                  placeholder="Share your civic mission with the community..."
                />
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{profileData.about}"
                </p>
              )}
            </div>

            {/* Role & Verification Badge */}
            {!isEditing && (
              <div className="mt-5 w-full pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">System Status:</span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    <Shield className="w-3.5 h-3.5" />
                    Admin Command
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Citizen
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Civic Tier Status Card */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/50 w-full min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Civic Tier Rank</span>
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300`}>
                {tierInfo.name}
              </span>
            </div>

            {/* Score circle & points */}
            <div className="flex items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-lg">
                <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${tierInfo.textGradient}`}>
                  {userStats.civicScore}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white">{tierInfo.name}</p>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{tierInfo.perk}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/70">
              <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1.5">
                <span>Tier Milestone</span>
                <span className="text-amber-400 font-bold">{Math.max(0, tierInfo.next - userStats.civicScore)} pts to Level Up</span>
              </div>
              <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${tierInfo.color} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(100, Math.max(10, (userStats.civicScore / tierInfo.next) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Citizen Preferences Card */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/50 w-full min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Citizen Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Email Report Updates</span>
                  <span className="text-[10px] text-slate-500">Alerts when city resolves issues</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('emailUpdates')}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${preferences.emailUpdates ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.emailUpdates ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Critical SMS Alerts</span>
                  <span className="text-[10px] text-slate-500">High-priority road & flood hazard alerts</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('smsAlerts')}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${preferences.smsAlerts ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.smsAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Location Auto-Tag</span>
                  <span className="text-[10px] text-slate-500">Auto-fill street name on photo upload</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePreference('locationAutoTag')}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${preferences.locationAutoTag ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.locationAutoTag ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Statistics, Badges & Contributions */}
        <div className="lg:col-span-2 space-y-6 w-full min-w-0">
          
          {/* 4-Stat Civic Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
            <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 min-w-0 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Total Reports</span>
                <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{userStats.totalReports}</p>
              <p className="text-[10px] text-slate-500 mt-1 truncate">Submitted by you</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 min-w-0 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">{userStats.resolvedReports}</p>
              <p className="text-[10px] text-emerald-500/80 mt-1 truncate">{resolutionRate}% fix rate</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 min-w-0 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Trust Score</span>
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">{userStats.civicScore}</p>
              <p className="text-[10px] text-amber-500/80 mt-1 truncate">Reliability rating</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 min-w-0 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">Endorsements</span>
                <ThumbsUp className="w-4 h-4 text-sky-400 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-sky-400">
                {contributions.reduce((sum, c) => sum + (c.reportCount || 1), 0)}
              </p>
              <p className="text-[10px] text-sky-500/80 mt-1 truncate">Community confirmations</p>
            </div>
          </div>

          {/* Earned Badges & Achievements Grid */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/50 w-full min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-400" />
                <span>Civic Achievements & Badges</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full min-w-0">
              {achievements.map(badge => (
                <div 
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    badge.unlocked 
                      ? `${badge.bg} ${badge.border} shadow-md` 
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${badge.unlocked ? badge.bg : 'bg-slate-800'} border ${badge.border}`}>
                      <badge.icon className={`w-4 h-4 ${badge.unlocked ? badge.color : 'text-slate-500'}`} />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      badge.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {badge.unlocked ? 'Unlocked' : badge.progress}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Contributions History Hub */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/50 w-full min-w-0">
            
            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800/70 w-full min-w-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>My Reported Incidents</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Track resolution status and download official municipal PDFs</p>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full no-scrollbar shrink-0">
                {['ALL', 'RESOLVED', 'IN_PROGRESS', 'REPORTED'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setContributionFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      contributionFilter === tab 
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab === 'IN_PROGRESS' ? 'Active' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* List of reports */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400">Loading civic history...</p>
              </div>
            ) : filteredContributions.length > 0 ? (
              <div className="space-y-3 w-full min-w-0">
                {filteredContributions.slice(0, 6).map(item => {
                  const imgUrl = item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `https://urban-eye-wi2j.onrender.com${item.imageUrl}`) : null;
                  const isResolved = (item.status || '').toLowerCase() === 'resolved';
                  const isInProgress = (item.status || '').toLowerCase() === 'in_progress' || (item.status || '').toLowerCase() === 'assigned';

                  return (
                    <div
                      key={item.id || item._id}
                      className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full min-w-0 overflow-hidden"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                        {/* Thumbnail */}
                        {imgUrl ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 shadow-md">
                            <img src={imgUrl} alt={item.type} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-cyan-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-white capitalize truncate max-w-[170px] sm:max-w-none">
                              {item.type?.replace('_', ' ') || 'Incident'}
                            </h4>
                            
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                              isResolved 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : isInProgress 
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                            }`}>
                              {item.status || 'Reported'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 truncate">
                            {item.address || `${item.lat}, ${item.lng}`}
                          </p>

                          <div className="flex items-center gap-3 mt-1 text-[10px] sm:text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="truncate">{item.assignedDepartment || 'Municipal Ops'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-t-0">
                        <button
                          type="button"
                          onClick={() => generateReportPDF(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                          title="Download formal dispatch PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDetection(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-slate-800/60 border-dashed rounded-2xl bg-slate-950/40">
                <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No incident reports under this filter.</p>
                <p className="text-xs text-slate-500 mt-1">Found a road hazard, streetlight outage, or water leak in your neighborhood?</p>
                <button
                  onClick={() => navigate('/report')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                  Report an Issue
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Navigation Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full min-w-0">
            <button
              onClick={() => navigate('/map')}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Explore Live Community Map</h4>
                  <p className="text-[11px] text-slate-400">View real-time pins and municipal response teams</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all shrink-0" />
            </button>

            <button
              onClick={() => navigate('/report')}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Submit New Road Hazard</h4>
                  <p className="text-[11px] text-slate-400">Instant AI triage, geolocation, and dispatch</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all shrink-0" />
            </button>
          </div>

        </div>

      </div>

      {/* Detection Inspection Modal */}
      {selectedDetection && (
        <DetectionModal 
          detection={selectedDetection} 
          onClose={() => setSelectedDetection(null)}
          onStatusUpdated={(updated) => {
            setContributions(prev => prev.map(c => (c.id === updated.id || c._id === updated.id ? updated : c)));
            setSelectedDetection(updated);
          }}
        />
      )}

    </div>
  );
}
