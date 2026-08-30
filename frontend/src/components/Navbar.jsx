import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import { 
  Eye, 
  Shield, 
  User, 
  LogOut, 
  MapPin, 
  LayoutDashboard, 
  Camera, 
  FileText, 
  Radio, 
  Bell
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [socketConnected, setSocketConnected] = useState(false);

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
    <header className="sticky top-0 z-50 glass-panel border-b border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <Link to={isAdmin ? "/admin" : "/report"} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                <Eye className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">
                    Urban EYE
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  City Infrastructure Tracker
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-2">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      isActive('/admin')
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>City Dashboard</span>
                  </Link>

                  <Link
                    to="/report"
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      isActive('/report')
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Report Issue</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/report"
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      isActive('/report')
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>New Report</span>
                  </Link>

                  <Link
                    to="/my-reports"
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      isActive('/my-reports')
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>My Tracking</span>
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right Side: Socket Status, User Info, Logout */}
          <div className="flex items-center space-x-4">
            
            {/* Live Socket Status Beacon */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                {socketConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className={socketConnected ? 'text-emerald-400' : 'text-rose-400'}>
                {socketConnected ? 'LIVE FEED' : 'OFFLINE'}
              </span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="hidden sm:flex flex-col items-end hover:bg-stone-800/50 p-2 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-semibold text-stone-200">{user.name}</span>
                    {isAdmin ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        CITIZEN
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">{user.email}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-150 font-medium text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-200 hover:text-white bg-stone-800/70 hover:bg-stone-700/80 border border-stone-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 shadow-md shadow-amber-500/20 transition-all"
                >
                  Citizen Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
