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
import UserMenuDropdown from './UserMenuDropdown';

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
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8E2E5] shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <Link to={isAdmin ? "/admin" : "/report"} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#302B69] flex items-center justify-center shadow-sm group-hover:bg-[#242052] transition-colors">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-[#191636]">
                    Urban EYE
                  </span>
                </div>
                <p className="text-[11px] text-[#57536E] font-medium">
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/admin')
                        ? 'bg-[#302B69] text-white shadow-sm'
                        : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>City Dashboard</span>
                  </Link>

                  <Link
                    to="/report"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/report')
                        ? 'bg-[#302B69] text-white shadow-sm'
                        : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC]'
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-[#302B69] text-white shadow-sm'
                        : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/report"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/report')
                        ? 'bg-[#302B69] text-white shadow-sm'
                        : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC]'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>New Report</span>
                  </Link>

                  <Link
                    to="/my-reports"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/my-reports')
                        ? 'bg-[#302B69] text-white shadow-sm'
                        : 'text-[#57536E] hover:text-[#191636] hover:bg-[#F6F6FC]'
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
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F6F6FC] border border-[#E8E2E5] text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? 'bg-[#302B69]' : 'bg-[#8C87A6]'}`}></span>
              </span>
              <span className="text-[#191636] font-semibold text-[11px]">
                {socketConnected ? 'LIVE FEED' : 'OFFLINE'}
              </span>
            </div>

            {/* Tap option avatar dropdown matching screenshot */}
            <UserMenuDropdown />
          </div>

        </div>
      </div>
    </header>
  );
}
