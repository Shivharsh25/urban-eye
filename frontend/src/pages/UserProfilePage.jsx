import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Shield, Camera, Award, CheckCircle, 
  MapPin, Star, Clock, Zap, TrendingUp, Medal,
  Edit3, Upload, X, Save, Calendar
} from 'lucide-react';
import client from '../api/client';

export default function UserProfilePage() {
  const { user, isAdmin } = useAuth();
  
  // Local state for profile editing with persistence
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Citizen User',
    about: 'Passionate about making our city a better, safer place for everyone. I actively report infrastructure issues in the Downtown and Westend areas.',
    photoUrl: null
  });

  const fileInputRef = useRef(null);
  
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    civicScore: 0,
    rank: 'New Citizen',
    joinDate: 'Oct 2025'
  });
  
  const [recentContributions, setRecentContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync profile data when user changes
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`urban_eye_profile_${user.id}`);
      if (saved) {
        try {
          setProfileData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved profile data", e);
        }
      } else {
        setProfileData({
          name: user.name || 'Citizen User',
          about: 'Passionate about making our city a better, safer place for everyone. I actively report infrastructure issues in the Downtown and Westend areas.',
          photoUrl: null
        });
      }
    }
  }, [user]);

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Oct 2025';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Oct 2025';
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const res = await client.get('/api/stats/user-summary');
        
        let rank = 'New Citizen';
        const score = res.data.trustScore || 0;
        if (score > 80) rank = 'Bronze Contributor';
        if (score > 90) rank = 'Silver Contributor';
        if (score > 95) rank = 'Gold Contributor';

        setUserStats({
          totalReports: res.data.totalReports || 0,
          resolvedReports: res.data.resolvedReports || 0,
          civicScore: score,
          rank: rank,
          joinDate: formatJoinDate(user?.createdAt)
        });
        
        if (res.data.recentContributions) {
          setRecentContributions(res.data.recentContributions);
        }
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const achievements = [
    { id: 1, name: 'First Report', icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 2, name: 'Pothole Patrol', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 3, name: 'Local Hero', icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    localStorage.setItem(`urban_eye_profile_${user?.id}`, JSON.stringify(profileData));
  };

  return (
    <div className="min-h-screen bg-[#05080f] p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[200px] right-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <span>My Profile</span>
            </h1>
            <p className="text-slate-400 mt-2">View your civic impact and community standing.</p>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors border border-slate-700"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Identity & Badges */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Identity Card */}
            <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center relative overflow-hidden group">
              {/* Premium Glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Avatar Section */}
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 p-1 shadow-[0_0_30px_rgba(6,182,212,0.3)] relative">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
                     {profileData.photoUrl ? (
                       <img src={profileData.photoUrl} alt="Profile" className="w-full h-full object-cover relative z-10" />
                     ) : (
                       <>
                         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.2]"></div>
                         <span className="text-5xl font-black text-white relative z-10">{profileData.name.charAt(0)}</span>
                       </>
                     )}
                  </div>
                  {/* Status Indicator (Only show if not editing) */}
                  {!isEditing && (
                    <div className="absolute bottom-1 right-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
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
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Name & Email */}
              <div className="w-full">
                {isEditing ? (
                  <div className="space-y-3 w-full">
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-2 text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                      placeholder="Your Name"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{profileData.name}</h2>
                    <p className="text-sm text-slate-400 flex items-center justify-center mt-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                      {user?.email || 'user@example.com'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center justify-center mt-1 font-mono uppercase tracking-widest">
                      <Calendar className="w-3 h-3 mr-1.5 text-slate-400" />
                      Member since {userStats.joinDate}
                    </p>
                  </>
                )}
              </div>

              {/* About Section */}
              <div className="mt-6 w-full pt-6 border-t border-slate-800/60">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-left">About Me</h3>
                {isEditing ? (
                  <textarea 
                    value={profileData.about}
                    onChange={(e) => setProfileData({...profileData, about: e.target.value})}
                    rows="3"
                    className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-cyan-500 resize-none text-left"
                    placeholder="Tell the community about yourself..."
                  />
                ) : (
                  <p className="text-sm text-slate-300 leading-relaxed text-left italic">
                    "{profileData.about}"
                  </p>
                )}
              </div>

              {/* Save/Cancel Buttons (Only in Edit Mode) */}
              {isEditing && (
                <div className="mt-6 w-full flex space-x-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Role Indicator (Only in View Mode) */}
              {!isEditing && (
                <div className="mt-6 w-full pt-6 border-t border-slate-800/60 flex flex-col items-center space-y-3">
                  {isAdmin ? (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Shield className="w-4 h-4 mr-2" />
                      System Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verified Citizen
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Achievements Card */}
            <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center space-x-2">
                <Medal className="w-4 h-4 text-amber-400" />
                <span>Earned Badges</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center space-y-2 group cursor-help">
                    <div className={`w-14 h-14 rounded-2xl ${badge.bg} border border-slate-700/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <badge.icon className={`w-6 h-6 ${badge.color}`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 text-center leading-tight uppercase">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Impact & History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Civic Impact Stats */}
            <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>Civic Impact</span>
                </h3>
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300">{userStats.rank}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Total Reports */}
                <div className="p-5 rounded-2xl bg-black/40 border border-slate-800/50 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Camera className="w-24 h-24 text-white" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Total Reports</p>
                  <div className="flex items-end space-x-2 relative z-10">
                    <span className="text-4xl font-black text-white">{userStats.totalReports}</span>
                  </div>
                </div>

                {/* Resolved Reports */}
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckCircle className="w-24 h-24 text-emerald-500" />
                  </div>
                  <p className="text-emerald-500/70 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Resolved</p>
                  <div className="flex items-end space-x-2 relative z-10">
                    <span className="text-4xl font-black text-emerald-400">{userStats.resolvedReports}</span>
                  </div>
                </div>

                {/* Civic Score */}
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 col-span-2 md:col-span-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Star className="w-24 h-24 text-amber-500" />
                  </div>
                  <p className="text-amber-500/80 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">Civic Score</p>
                  <div className="flex items-end space-x-1.5 relative z-10">
                    <span className="text-4xl font-black text-amber-400">{userStats.civicScore}</span>
                    <span className="text-xs text-amber-500/60 font-bold mb-1.5 uppercase tracking-widest">PTS</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 uppercase tracking-widest">Trust Score</span>
                  <span className="text-cyan-400">{userStats.civicScore} / 100 PTS</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] relative transition-all duration-1000"
                    style={{ width: `${Math.min(userStats.civicScore, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-30"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Contributions */}
            <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                <span>Recent Contributions</span>
                <span className="text-xs font-semibold text-cyan-400 cursor-pointer hover:text-cyan-300">View All</span>
              </h3>
              
              <div className="space-y-4">
                {recentContributions.length === 0 ? (
                  <div className="text-center p-6 bg-black/40 rounded-2xl border border-slate-800">
                    <p className="text-slate-500 text-sm">No recent contributions found. Start reporting issues in your city!</p>
                  </div>
                ) : (
                  recentContributions.map(item => (
                    <div key={item.id || item._id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 capitalize">{item.type.replace('_', ' ')}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">{item.address || 'Unknown Location'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {item.status}
                        </span>
                        <p className="text-[10px] text-slate-500 flex items-center justify-end font-mono">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
