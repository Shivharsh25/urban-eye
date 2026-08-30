import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import { 
  Eye, 
  LayoutDashboard, 
  Camera, 
  FileText, 
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radio,
  Bell,
  Map,
  Settings,
  HelpCircle,
  Activity
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [socketConnected, setSocketConnected] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const s = getSocket();
    setSocketConnected(s.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sticky top-0 h-screen border-r border-slate-800/80 glass-panel flex flex-col transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-24 relative overflow-hidden`}>
        {/* Decorative background glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <Link to={isAdmin ? "/admin" : "/dashboard"} className={`flex items-center space-x-4 group ${isCollapsed ? 'justify-center' : ''} relative z-10 w-full`}>
          <Logo size="md" subtitle="Active Watch" showText={!isCollapsed} />
        </Link>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-slate-800 text-slate-300 rounded-full p-1 shadow-lg border border-slate-700 hover:text-cyan-400 hover:border-cyan-500 transition-colors z-50 hidden sm:block"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {user && (
          <>
            {isAdmin ? (
              <>
                <NavItem to="/admin" icon={LayoutDashboard} label="City Dashboard" isActive={isActive('/admin')} isCollapsed={isCollapsed} />
                <NavItem to="/report" icon={Camera} label="Report Issue" isActive={isActive('/report')} isCollapsed={isCollapsed} />
              </>
            ) : (
              <>
                {!isCollapsed && <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-4 mb-2 mt-2">Core Access</div>}
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={isActive('/dashboard')} isCollapsed={isCollapsed} />
                <NavItem to="/report" icon={Camera} label="New Report" isActive={isActive('/report')} isCollapsed={isCollapsed} />
                <NavItem to="/my-reports" icon={FileText} label="My Tracking" isActive={isActive('/my-reports')} isCollapsed={isCollapsed} />
                
                {!isCollapsed && <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-4 mb-2 mt-6">City Network</div>}
                <NavItem to="/map" icon={Map} label="Live Map" isActive={isActive('/map')} isCollapsed={isCollapsed} />
                <NavItem to="/alerts" icon={Bell} label="Community Alerts" isActive={isActive('/alerts')} isCollapsed={isCollapsed} />
                <NavItem to="/activity" icon={Activity} label="City Activity" isActive={isActive('/activity')} isCollapsed={isCollapsed} />

                <div className="pt-4 mt-4 border-t border-slate-800/50">
                  {!isCollapsed && <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-4 mb-2">Account</div>}
                  <NavItem to="/profile" icon={UserCircle} label="My Profile" isActive={isActive('/profile')} isCollapsed={isCollapsed} />
                  <NavItem to="/settings" icon={Settings} label="Settings" isActive={isActive('/settings')} isCollapsed={isCollapsed} />
                  <NavItem to="/support" icon={HelpCircle} label="Help & Support" isActive={isActive('/support')} isCollapsed={isCollapsed} />
                </div>
              </>
            )}
          </>
        )}
      </nav>

      {/* Bottom Status & Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
        
        {/* Live Socket Status */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 mb-4'} rounded-xl bg-slate-950/50 border border-slate-800 p-2`}>
          <span className="relative flex h-3 w-3 shrink-0">
            {socketConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${socketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          {!isCollapsed && (
             <span className={`text-[10px] font-mono tracking-widest ${socketConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
               {socketConnected ? 'LIVE FEED' : 'OFFLINE'}
             </span>
          )}
        </div>

        {user && (
          <div className={`flex ${isCollapsed ? 'flex-col items-center space-y-3' : 'items-center justify-between mt-4'}`}>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden pr-2">
                <span className="text-sm font-bold text-slate-200 truncate">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-mono truncate">{isAdmin ? 'ADMIN' : 'CITIZEN'}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className={`flex items-center justify-center p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all shrink-0`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label, isActive, isCollapsed }) {
  return (
    <Link
      to={to}
      title={isCollapsed ? label : undefined}
      className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 rounded-xl transition-all group relative overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border border-cyan-500/30 text-cyan-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
      )}
      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'}`} />
      {!isCollapsed && (
        <span className="text-sm font-semibold tracking-wide truncate">{label}</span>
      )}
    </Link>
  );
}
